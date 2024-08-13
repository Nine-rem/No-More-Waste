/* ----------------------------------------------------------
Définition des constantes 
---------------------------------------------------------- */


const DOMAIN = 'http://localhost:5173';
const express = require('express')
const app = express()
const connection = require('./db-connection.js');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const secretKey = "pa2024";
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const { format } = require('date-fns');
//middleware
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: DOMAIN
}))
app.use(express.json())
 
app.use(cookieParser());
app.use("/uploads",express.static(__dirname + '/uploads'));

/* ----------------------------------------------------------
      Gestion des utilisateurs
---------------------------------------------------------- */

// Chiffrage du mot de passe
const bcrypt = require('bcryptjs');
const { error } = require('console');

// Inscription
//inscription de l'utilisateur
app.post("/register", async (req, res) => {
    let {
        lastname:lastname,
        firstname:firstname
    } = req.body;
    const {
        birthdate:birth,
        address,
        postalCode,
        city,
        email,
        password,
        confirmPassword,
        phoneNumber,
    } = req.body;

    const saltRounds = 10;
    let errorArray = {};

    if (confirmPassword !== password) {
        errorArray.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    try {
        const [results] = await connection.promise().query('SELECT email FROM USER WHERE email= ?', [email]);
        if (results.length > 0) {
        errorArray.email = 'Compte déjà existant';
        }
        const postalCodeRegex = /^[0-9]{5}$/;
        if (!postalCodeRegex.test(postalCode)) {
        errorArray.postalCode = 'Code postal invalide';
        }
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
        errorArray.email = 'Email invalide';
        }
        
        const regexPhone = /^\+?\d{1,4}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
        if (!regexPhone.test(phoneNumber)) {
        errorArray.phoneNumber = 'Numéro de téléphone invalide';
        }

        const regexname = /^[a-zA-ZÀ-ÿ\s]{2,40}$/;
       lastname =lastname.trim().toUpperCase();
       firstname =firstname.trim().toLowerCase();
       firstname =firstname.charAt(0).toUpperCase() +firstname.slice(1);
        if (!regexname.test(lastname)) {
        errorArray.lastname = 'Nom invalide';
        }
        if (!regexname.test(firstname)) {
        errorArray.firstname = 'Prénom invalide';
        }
        
        const date = new Date();
        const currentYear = date.getFullYear();
        const birthdate = new Date(birth);
        const birthYear = birthdate.getFullYear();
        if (currentYear - birthYear > 99 || currentYear - birthYear < 6) {
        errorArray.birthdate = 'Date de naissance invalide';
        }
        
        const regexPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!regexPassword.test(password)) {
        errorArray.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
        }

        if (Object.keys(errorArray).length > 0) {
        return res.status(400).json({ message: 'Validation errors', errors: errorArray });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const query = 'INSERT INTO USER(lastname,firstname,birthdate,address,postalCode,city,email,password,phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [lastname,firstname,birthdate, address, postalCode, city, email, hashedPassword, phoneNumber];

        const [insertResult] = await connection.promise().execute(query, values);
        res.json({ message: 'Inscrit!', userId: insertResult.insertId });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Un erreur est survenue.', error: error.message });
    }
});

//connexion de l'utilisateur


app.post('/login', async (req, res) => {
  let { email, password } = req.body;

  // Nettoyage et validation de l'email
  email = email.trim().toLowerCase();
  const emailRegex = /\S+@\S+\.\S+/;

  if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email invalide' });
  }

  connection.query('SELECT idUser, email, password, isBanned FROM USER WHERE email = ?', [email], async (error, results) => {
      if (error) {
          return res.status(500).json({ message: 'Erreur de serveur' });
      }

      if (results.length === 0) {
          return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      const { idUser, password: hashedPassword, isBanned } = results[0];

      // Vérification du mot de passe
      const isMatchingPassword = await bcrypt.compare(password, hashedPassword);
      if (!isMatchingPassword) {
          return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Vérification si l'utilisateur est banni
      if (isBanned) {
          return res.status(403).json({ message: 'Impossible de se connecter, veuillez contacter le service client' });
      }

      // Génération du token JWT
      const token = jwt.sign({ userId: idUser, email }, secretKey, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });

      // Mise à jour du token dans la base de données
      connection.query('UPDATE USER SET token = ? WHERE idUser = ?', [token, idUser], (updateError) => {
          if (updateError) {
              return res.status(500).json({ message: 'Erreur lors de la mise à jour du token' });
          }

          res.json({ email, userId: idUser });
      });
  });
});

app.get('/account', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
    return res.status(401).json({ message: 'Non authentifié' });
    }

    jwt.verify(token, secretKey, (error, decoded) => {
    if (error) {
        return res.status(401).json({ message: 'Non authentifié' });
    }

    const userId = decoded.userId;
    connection.query(
        'SELECT * FROM USER WHERE idUser = ?',
        [userId],
        (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Erreur de serveur' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Non authentifié' });
        }

        const email = results[0].email;
        const firstname = results[0].firstname;
        const lastname = results[0].lastname;
        const isAdmin = results[0].isAdmin;
        const isMerchant = results[0].isMerchant;
        const isVolunteer = results[0].isVolunteer;
        res.json({ email,firstname,lastname, isAdmin, isMerchant, isVolunteer });
        }
    );
    });
});

app.post('/logout', (req, res) => {
    res.clearCookie('token').json({ message: 'Déconnecté' });
}
);
app.get('/mdp', (req, res) => {
    bcrypt.hash('a', 10).then((hash) => {
      res.json({ hash });
    });
  });
  app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT firstname, lastname, DATE_FORMAT(birthdate, "%Y-%m-%d") as birthdate, address, city, postalCode, phoneNumber, email FROM USER WHERE idUSer = ?';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération de l\'utilisateur :', err);
            return res.status(500).json({ error: 'Erreur de serveur' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json(results[0]);
    });
});

app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { firstname, lastname, birthdate, address, city, postalCode, phoneNumber, email } = req.body;

  // Validation des données
  if (!firstname || !lastname || !birthdate || !address || !city || !postalCode || !phoneNumber || !email) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  // Nettoyage des données
  const cleanFirstname = firstname.trim();
  const cleanLastname = lastname.trim();
  const cleanBirthdate = birthdate.trim();
  const cleanAddress = address.trim();
  const cleanCity = city.trim();
  const cleanPostalCode = postalCode.trim();
  const cleanPhoneNumber = phoneNumber.trim();
  const cleanEmail = email.trim().toLowerCase();

  // Vérification de l'unicité de l'email
  const checkEmailQuery = 'SELECT idUSer FROM USER WHERE email = ? AND idUser != ?';
  connection.query(checkEmailQuery, [cleanEmail, userId], (err, results) => {
      if (err) {
          console.error('Erreur lors de la vérification de l\'email :', err);
          return res.status(500).json({ error: 'Erreur de serveur' });
      }

      if (results.length > 0) {
          return res.status(400).json({ error: 'Cet email est déjà utilisé par un autre utilisateur.' });
      }

      // Mise à jour de l'utilisateur
      const updateUserQuery = `
          UPDATE USER 
          SET firstname = ?, lastname = ?, birthdate = ?, address = ?, city = ?, postalCode = ?, phoneNumber = ?, email = ?
          WHERE idUser = ?
      `;

      connection.query(updateUserQuery, [cleanFirstname, cleanLastname, cleanBirthdate, cleanAddress, cleanCity, cleanPostalCode, cleanPhoneNumber, cleanEmail, userId], (err, results) => {
          if (err) {
              console.error('Erreur lors de la mise à jour de l\'utilisateur :', err);
              return res.status(500).json({ error: 'Erreur de serveur' });
          }

          if (results.affectedRows === 0) {
              return res.status(404).json({ error: 'Utilisateur non trouvé' });
          }

          res.json({ message: 'Utilisateur mis à jour avec succès' });
      });
  });
});

app.patch('/users/:id/ban', (req, res) => {
  const userId = req.params.id;

  // Vérifier si l'utilisateur existe
  const checkUserQuery = 'SELECT isBanned FROM USER WHERE idUSer = ?';
  connection.query(checkUserQuery, [userId], (err, results) => {
      if (err) {
          console.error('Erreur lors de la vérification de l\'utilisateur :', err);
          return res.status(500).json({ error: 'Erreur de serveur' });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Inverser l'état de isBanned
      const isBanned = results[0].isBanned;
      const newBanStatus = !isBanned;
      const updateBanStatusQuery = 'UPDATE USER SET isBanned = ? WHERE idUser = ?';

      connection.query(updateBanStatusQuery, [newBanStatus, userId], (err, updateResults) => {
          if (err) {
              console.error('Erreur lors de la mise à jour du statut de bannissement :', err);
              return res.status(500).json({ error: 'Erreur de serveur' });
          }

          if (updateResults.affectedRows === 0) {
              return res.status(404).json({ error: 'Impossible de mettre à jour le statut de bannissement' });
          }

          res.json({ message: 'Statut de bannissement mis à jour', isBanned: newBanStatus });
      });
  });
});

/* ----------------------------------------------------------
        Calendrier
---------------------------------------------------------- */
// Récupération des créneaux horaires

app.get('/timeslots', (req, res) => {
    const { date, idService } = req.query;
    const query = 'SELECT * FROM timeslot WHERE date = ? AND idService = ? AND reserved = FALSE';
    connection.query(query, [date, idService], (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });


app.get('/spots', (req, res) => {
    const { month, year, idService } = req.query;
    const query = `
      SELECT date, COUNT(*) as spots
      FROM timeslot
      WHERE MONTH(date) = ? AND YEAR(date) = ? AND idService = ? AND reserved = FALSE
      GROUP BY date
    `;
    connection.query(query, [month, year, idService], (error, results) => {
      if (error) throw error;
      const spots = results.reduce((acc, row) => {
        const dateString = format(new Date(row.date), 'yyyy-MM-dd');
        acc[dateString] = row.spots;
        return acc;
      }, {});
      res.json(spots);
    });
  });

  /*----------------------------------------------------------

    Réserver un créneau horaire
---------------------------------------------------------- */
app.post('/reservations', (req, res) => {
    const { token } = req.cookies; // Récupération du token depuis les cookies

    if (!token) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
  
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return res.status(401).json({ message: 'Token invalide' });
      }
    const idUser = decoded.userId;
    const {idTimeslot } = req.body;
  
    console.log('Received idUser:', idUser);  // Ajouter un console.log pour vérifier
    console.log('Received idTimeslot:', idTimeslot);  // Ajouter un console.log pour vérifier
    
    if (!idUser || !idTimeslot) {
      return res.status(400).send({ error: 'idUser and idTimeslot are required' });
    }
  
    // Mise à jour de la disponibilité pour marquer le créneau comme réservé
    const updateQuery = 'UPDATE timeslot SET reserved = TRUE WHERE idTimeslot = ?';
    connection.query(updateQuery, [idTimeslot], (err, result) => {
      if (err) {
        console.error('Error updating availability:', err);
        return res.status(500).send(err);
      }
  
      // Ajout de l'entrée de réservation
      const insertQuery = 'INSERT INTO reserved (idUser, idTimeslot) VALUES (?, ?)';
      connection.query(insertQuery, [idUser, idTimeslot], (err, result) => {
        if (err) {
          console.error('Error inserting reservation:', err);
          return res.status(500).send(err);
        }
        res.status(200).send({ message: 'Reservation successful!' });
    });
});
});
});
/*----------------------------------------------------

  Services
---------------------------------------------------------- */
app.get('/services', (req, res) => {
    const query = 'SELECT * FROM SERVICE';
    connection.query(query, (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });


  /*----------------------------------------------------

  Produits

---------------------------------------------------------- */


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', upload.single('image'), (req, res) => {
  const photoId = `${Date.now()}-${req.file.originalname}`;
  res.status(200).send({ photoId, path: `/uploads/${photoId}` });
});

app.post('/api/products', upload.array('images'), (req, res) => {
  const { name, description, price, stock } = req.body;
  const photoIds = req.files.map(file => file.filename);
  const altDescriptions = req.body.altDescriptions ? [].concat(req.body.altDescriptions) : [];

  // Debugging: Print received data
  console.log("Received data:", { name, description, price, stock, photoIds, altDescriptions });

  if (!name || !description || !price || !stock || !Array.isArray(photoIds) || photoIds.length === 0) {
    return res.status(400).send({ error: 'Tous les champs sont requis' });
  }

  const insertProductQuery = 'INSERT INTO PRODUCT (name, reference) VALUES (?, ?)';
  const reference = name.toLowerCase().replace(/\s+/g, '-');

  connection.query(insertProductQuery, [name, reference], (err, productResult) => {
    if (err) {
      console.error('Erreur lors de l\'ajout du produit', err);
      return res.status(500).send({ error: 'Erreur lors de l\'ajout du produit' });
    }

    const productId = productResult.insertId;

    const updatePhotoQuery = 'INSERT INTO PHOTO (path, description) VALUES (?, ?)';
    const insertPossessesQuery = 'INSERT INTO possesses (idPhoto, idProduct) VALUES (?, ?)';

    photoIds.forEach((photoId, index) => {
      const description = altDescriptions[index] || '';

      connection.query(updatePhotoQuery, [photoId, description], (err, photoResult) => {
        if (err) {
          console.error('Erreur lors de l\'ajout de la photo', err);
          return res.status(500).send({ error: 'Erreur lors de l\'ajout de la photo' });
        }

        const idPhoto = photoResult.insertId;

        connection.query(insertPossessesQuery, [idPhoto, productId], (err) => {
          if (err) {
            console.error('Erreur lors de la création de la relation produit-photo', err);
            return res.status(500).send({ error: 'Erreur lors de la création de la relation produit-photo' });
          }
        });
      });
    });

    res.status(200).send({ message: 'Produit ajouté avec succès!' });
  });
});

app.delete('/api/photos/:id', (req, res) => {
  const photoId = req.params.id;

  const getPhotoQuery = 'SELECT path FROM PHOTO WHERE idPhoto = ?';
  const deletePhotoQuery = 'DELETE FROM PHOTO WHERE idPhoto = ?';

  connection.query(getPhotoQuery, [photoId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de la photo', err);
      return res.status(500).send({ error: 'Erreur lors de la récupération de la photo' });
    }

    if (results.length === 0) {
      return res.status(404).send({ error: 'Photo non trouvée' });
    }

    const photoPath = path.join(__dirname, 'uploads', results[0].path);

    fs.unlink(photoPath, (err) => {
      if (err) {
        console.error('Erreur lors de la suppression du fichier', err);
        return res.status(500).send({ error: 'Erreur lors de la suppression du fichier' });
      }

      connection.query(deletePhotoQuery, [photoId], (err) => {
        if (err) {
          console.error('Erreur lors de la suppression de la photo de la base de données', err);
          return res.status(500).send({ error: 'Erreur lors de la suppression de la photo de la base de données' });
        }

        res.status(200).send({ message: 'Photo supprimée avec succès!' });
      });
    });
  });
});

const cron = require('node-cron');

// Tâche planifiée pour nettoyer les photos temporaires toutes les 24 heures
cron.schedule('0 0 * * *', () => {
  const deletePhotoQuery = 'SELECT idPhoto, path FROM PHOTO WHERE temporary = TRUE';

  connection.query(deletePhotoQuery, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des photos temporaires', err);
      return;
    }

    results.forEach(photo => {
      const photoPath = path.join(__dirname, photo.path);

      fs.unlink(photoPath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression du fichier temporaire', err);
          return;
        }

        connection.query('DELETE FROM PHOTO WHERE idPhoto = ?', [photo.idPhoto], (err) => {
          if (err) {
            console.error('Erreur lors de la suppression de la photo temporaire de la base de données', err);
          }
        });
      });
    });
  });
});


/*----------------------------------------------------
  
    Utilisateurs
---------------------------------------------------------- */

app.get('/users', (req, res) => {
    const query = 'SELECT * FROM USER';
    connection.query(query, (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  }
);


app.patch('/users/:id/ban', (req, res) => {
  const userId = req.params.id;
  connection.query('SELECT banned FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
          res.status(500).json({ message: err.message });
          return;
      }
      if (results.length === 0) {
          res.status(404).json({ message: 'User not found' });
          return;
      }

      const newBanStatus = !results[0].banned;
      connection.query('UPDATE users SET banned = ? WHERE id = ?', [newBanStatus, userId], (err) => {
          if (err) {
              res.status(500).json({ message: err.message });
              return;
          }
          res.json({ id: userId, banned: newBanStatus });
      });
  });
});
/* ----------------------------------------------------------
      Démarrage du serveur
---------------------------------------------------------- */

app.listen(5000, () => {    
    console.log("Serveur à l'écoute sur le port 5000")
})