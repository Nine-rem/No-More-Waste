/* ----------------------------------------------------------
Définition des constantes 
---------------------------------------------------------- */

require('dotenv').config();
const DOMAIN = process.env.DOMAIN;
const express = require('express')
const app = express()
const connection = require('./db-connection.js');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const { format } = require('date-fns');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
//middleware
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: DOMAIN
}))
app.use(express.json())
console.log(process.env.STRIPE_SECRET_KEY)
 
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
app.post("/api/register", async (req, res) => {
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


app.post('/api/login', async (req, res) => {
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

app.get('/api/account', async (req, res) => {
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
        const idUser = results[0].idUser;
        res.json({ email,firstname,lastname, isAdmin, isMerchant, isVolunteer, idUser });
        }
    );
    });
});

app.post('/api/logout', (req, res) => {
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

app.put('/api/users/:id', (req, res) => {
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

app.patch('/api/users/:id/ban', (req, res) => {
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

app.get('/api/timeslots', (req, res) => {
    const { date, idService } = req.query;
    const query = 'SELECT * FROM timeslot WHERE date = ? AND idService = ? AND reserved = FALSE';
    connection.query(query, [date, idService], (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });


app.get('/api/spots', (req, res) => {
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
app.post('/api/users/:userId/timeslots/:idTimeslot/reserve', (req, res) => {
  const userId = req.params.userId;
  const idTimeslot = req.params.idTimeslot;

  const reserveQuery = 'INSERT INTO reserved (idUser, idTimeslot) VALUES (?, ?)';
  const updateTimeslotQuery = 'UPDATE timeslot SET reserved = TRUE WHERE idTimeslot = ?';

  connection.beginTransaction(error => {
      if (error) return res.status(500).json({ message: 'Erreur de serveur' });

      connection.query(reserveQuery, [userId, idTimeslot], (reserveError, reserveResults) => {
          if (reserveError) {
              return db.rollback(() => {
                  console.error('Erreur lors de la réservation du créneau:', reserveError);
                  return res.status(500).json({ message: 'Erreur lors de la réservation' });
              });
          }

          connection.query(updateTimeslotQuery, [idTimeslot], (updateError, updateResults) => {
              if (updateError) {
                  return db.rollback(() => {
                      console.error('Erreur lors de la mise à jour du créneau:', updateError);
                      return res.status(500).json({ message: 'Erreur lors de la mise à jour du créneau' });
                  });
              }

              connection.commit(commitError => {
                  if (commitError) {
                      return db.rollback(() => {
                          console.error('Erreur lors de la finalisation de la transaction:', commitError);
                          return res.status(500).json({ message: 'Erreur de serveur' });
                      });
                  }

                  res.json({ message: 'Créneau réservé avec succès' });
              });
          });
      });
  });
});

/*----------------------------------------------------

  Services
---------------------------------------------------------- */
// Route pour récupérer la liste des services
app.get('/api/services', (req, res) => {
  const query = 'SELECT idService, name FROM SERVICE';

  connection.query(query, (error, results) => {
      if (error) {
          console.error('Erreur lors de la récupération des services:', error);
          return res.status(500).json({ message: 'Erreur de serveur' });
      }

      res.json(results);
  });
});


// Route pour récupérer les créneaux horaires disponibles pour un service à une date donnée
app.get('/api/services/timeslots', (req, res) => {
  const { date, idService } = req.query;

  if (!date || !idService) {
      return res.status(400).json({ message: 'La date et l\'ID du service sont requis.' });
  }

  const query = `
      SELECT idTimeslot, date, time, reserved 
      FROM timeslot 
      WHERE date = ? AND idService = ? AND reserved = FALSE`;

  connection.query(query, [date, idService], (error, results) => {
      if (error) {
          console.error('Erreur lors de la récupération des créneaux horaires:', error);
          return res.status(500).json({ message: 'Erreur de serveur' });
      }

      res.json(results);
  });
});


// Route pour réserver un créneau horaire
app.post('/api/users/reserve', (req, res) => {
  const { idUser, idTimeslot } = req.body;

  if (!idUser || !idTimeslot) {
      return res.status(400).json({ message: 'L\'ID de l\'utilisateur et l\'ID du créneau sont requis.' });
  }

  const reserveQuery = 'INSERT INTO reserved (idUser, idTimeslot) VALUES (?, ?)';
  const updateTimeslotQuery = 'UPDATE timeslot SET reserved = TRUE WHERE idTimeslot = ?';

  connection.beginTransaction(error => {
      if (error) return res.status(500).json({ message: 'Erreur de serveur' });

      connection.query(reserveQuery, [idUser, idTimeslot], (reserveError, reserveResults) => {
          if (reserveError) {
              return db.rollback(() => {
                  console.error('Erreur lors de la réservation du créneau:', reserveError);
                  return res.status(500).json({ message: 'Erreur lors de la réservation' });
              });
          }

          connection.query(updateTimeslotQuery, [idTimeslot], (updateError, updateResults) => {
              if (updateError) {
                  return db.rollback(() => {
                      console.error('Erreur lors de la mise à jour du créneau:', updateError);
                      return res.status(500).json({ message: 'Erreur lors de la mise à jour du créneau' });
                  });
              }

              connection.commit(commitError => {
                  if (commitError) {
                      return db.rollback(() => {
                          console.error('Erreur lors de la finalisation de la transaction:', commitError);
                          return res.status(500).json({ message: 'Erreur de serveur' });
                      });
                  }

                  res.json({ message: 'Créneau réservé avec succès' });
              });
          });
      });
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
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB
  fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

      if (mimetype && extname) {
          return cb(null, true);
      }
      cb(new Error('Seuls les fichiers images sont autorisés'));
  }
});



app.post('/api/products', upload.array('images'), (req, res) => {
  const { name, reference, stock, description } = req.body;
  const token = req.cookies.token;
  const decoded = jwt.verify(token, secretKey);
  const idUser = decoded.userId;
  const photoIds = req.files.map(file => file.filename);
  const altDescriptions = req.body.altDescriptions ? [].concat(req.body.altDescriptions) : [];

  if (!Array.isArray(photoIds) || photoIds.length === 0, !name, !reference, !stock, !description) {
      return res.status(400).send({ error: ' Tous les champs sont requis' });
  }

  connection.beginTransaction(err => {
      if (err) {
          return res.status(500).send({ error: 'Erreur lors du démarrage de la transaction' });
      }

      const insertProductQuery = `
          INSERT INTO PRODUCT (name, reference, stock, description, idUser)
          VALUES (?, ?, ?, ?, ?)
      `;

      connection.query(insertProductQuery, [name, reference || null, stock || null, description || null, idUser], (err, productResult) => {
          if (err) {
              return connection.rollback(() => {
                  res.status(500).send({ error: 'Erreur lors de l\'ajout du produit' });
              });
          }

          const productId = productResult.insertId;

          const insertPhotoQuery = `
              INSERT INTO PHOTO (name, path, description, idProduct, temporary)
              VALUES (?, ?, ?, ?, ?)
          `;

          const insertPhotos = photoIds.map((photoId, index) => {
              return new Promise((resolve, reject) => {
                  const photoName = req.files[index].originalname;
                  const description = altDescriptions[index] || '';
                  const temporary = false;

                  connection.query(insertPhotoQuery, [photoName, photoId, description, productId, temporary], (err) => {
                      if (err) {
                          return reject(err);
                      }
                      resolve();
                  });
              });
          });

          Promise.all(insertPhotos)
              .then(() => {
                  connection.commit(err => {
                      if (err) {
                          return connection.rollback(() => {
                              res.status(500).send({ error: 'Erreur lors de la validation de la transaction' });
                          });
                      }
                      res.status(200).send({ message: 'Produit ajouté avec succès!' });
                  });
              })
              .catch(err => {
                  connection.rollback(() => {
                      res.status(500).send({ error: 'Erreur lors de l\'ajout des photos' });
                  });
              });
      });
  });
});


app.get('/api/users/:idUser/products', (req, res) => {
  const idUser = req.params.idUser;

  const query = `
      SELECT p.*, ph.idPhoto, ph.path AS photoPath
      FROM PRODUCT p
      LEFT JOIN PHOTO ph ON p.idProduct = ph.idProduct
      WHERE p.idUser = ?
  `;

  connection.query(query, [idUser], (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération des produits', err);
          return res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
      }

      const products = {};

      results.forEach(row => {
          if (!products[row.idProduct]) {
              products[row.idProduct] = {
                  idProduct: row.idProduct,
                  name: row.name,
                  reference: row.reference,
                  stock: row.stock,
                  description: row.description,
                  photos: []
              };
          }

          if (row.photoPath) {
              products[row.idProduct].photos.push({
                  idPhoto: row.idPhoto,
                  fullPath: `${req.protocol}://${req.get('host')}/uploads/${row.photoPath}`
              });
          }
      });

      res.json(Object.values(products));
  });
});

app.get('/api/users/:userId/products/:productId', (req, res) => {
  const { userId, productId } = req.params;

  const productQuery = `
      SELECT p.idProduct, p.name, p.reference, p.stock, p.description, ph.idPhoto, ph.path, ph.description as photoDescription
      FROM PRODUCT p
      LEFT JOIN PHOTO ph ON p.idProduct = ph.idProduct
      WHERE p.idProduct = ? AND p.idUser = ?
  `;

  connection.query(productQuery, [productId, userId], (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération du produit:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: 'Produit non trouvé ou non autorisé' });
      }

      const product = {
          idProduct: results[0].idProduct,
          name: results[0].name,
          reference: results[0].reference,
          stock: results[0].stock,
          description: results[0].description
      };
    

      res.json(product);
  });
});

app.get('/api/products/:productId/photos', (req, res) => {
  const { productId } = req.params;
  
  const getPhotosQuery = `
      SELECT idPhoto, path, description
      FROM PHOTO
      WHERE idProduct = ?
  `;

  connection.query(getPhotosQuery, [productId], (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération des photos:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
      }

      const photos = results.map(photo => ({
          idPhoto: photo.idPhoto,
          fullPath: `${req.protocol}://${req.get('host')}/uploads/${photo.path}`,
          description: photo.description
      }));

      res.json(photos);
  });
});


app.delete('/api/photos/:photoId',(req, res) => {
    const { photoId } = req.params;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.userId;

    // Requête pour obtenir le chemin de la photo et vérifier qu'elle appartient à un produit de l'utilisateur
    const getPhotoQuery = `
        SELECT ph.path, p.idUser
        FROM PHOTO ph
        JOIN PRODUCT p ON ph.idProduct = p.idProduct
        WHERE ph.idPhoto = ? AND p.idUser = ?
    `;

    connection.query(getPhotoQuery, [photoId, userId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération de la photo:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Photo non trouvée ou non autorisée' });
        }

        const photoPath = path.join(__dirname, 'uploads', results[0].path);

        // Suppression du fichier physique
        fs.unlink(photoPath, (err) => {
            if (err) {
                console.error('Erreur lors de la suppression du fichier:', err);
                return res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
            }

            // Suppression de l'entrée de la photo dans la base de données
            const deletePhotoQuery = `
                DELETE FROM PHOTO WHERE idPhoto = ?
            `;

            connection.query(deletePhotoQuery, [photoId], (err) => {
                if (err) {
                    console.error('Erreur lors de la suppression de la photo de la base de données:', err);
                    return res.status(500).json({ error: 'Erreur lors de la suppression de la photo de la base de données' });
                }

                res.json({ message: 'Photo supprimée avec succès' });
            });
        });
    });
});

app.put('/api/products/:productId', upload.array('images'), (req, res) => {
  const productId = req.params.productId;
  const { name, reference, stock, description } = req.body;
  const altDescriptions = req.body.altDescriptions ? [].concat(req.body.altDescriptions) : [];

  console.log("Body:", req.body);
  console.log("Files:", req.files);
  console.log("Params:", req.params);

    // Vérification que tous les champs requis sont présents
  if (!name || !reference || !stock || !description) {
    return res.status(400).send({ error: 'Tous les champs sont requis.' });
    }

  // Vérification de la présence et de la validité des fichiers
  if (!req.files || req.files.length === 0 || req.files.some(file => file.size === 0)) {
      console.error("Aucun fichier valide n'a été téléchargé.");
      return res.status(400).send({ error: 'Aucun fichier valide n\'a été téléchargé.' });
  }

  // Mise à jour des informations du produit
  const query = 'UPDATE PRODUCT SET name = ?, reference = ?, stock = ?, description = ? WHERE idProduct = ?';
  connection.query(query, [name, reference, stock, description, productId], (error, results) => {
      if (error) {
          console.error('Erreur lors de la mise à jour du produit:', error);
          return res.status(500).json({ message: 'Erreur de serveur' });
      }

      if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Produit non trouvé' });
      }

      // Gestion des nouvelles photos
      if (req.files && req.files.length > 0) {
          const insertPhotoQuery = `
              INSERT INTO PHOTO (idProduct, path, description, temporary)
              VALUES (?, ?, ?, ?)
          `;

          const photoInserts = req.files.map((file, index) => {
              return new Promise((resolve, reject) => {
                  // Insertion de la photo si elle n'est pas vide (taille > 0)
                  connection.query(insertPhotoQuery, [productId, file.filename, altDescriptions[index] || '', false], (err) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve();
                      }
                  });
              });
          });

          Promise.all(photoInserts)
              .then(() => {
                  res.json({ message: 'Produit mis à jour avec succès, y compris les nouvelles photos.' });
              })
              .catch(err => {
                  console.error('Erreur lors de l\'ajout des nouvelles photos:', err);
                  res.status(500).json({ message: 'Erreur lors de l\'ajout des nouvelles photos' });
              });
      } else {
          res.json({ message: 'Produit mis à jour avec succès.' });
      }
  });
});



app.delete('/api/products/:productId',(req, res) => {
    const productId = req.params.productId;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.userId;
    // Suppression du produit de la base de données
    const deleteProductQuery = `
        DELETE FROM PRODUCT WHERE idProduct = ? AND idUser = ?
    `;

    connection.query(deleteProductQuery, [productId, userId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la suppression du produit:', err);
            return res.status(500).json({ message: 'Erreur de serveur' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Produit non trouvé ou non autorisé' });
        }

        res.json({ message: 'Produit supprimé avec succès' });
    });
});






/*----------------------------------------------------
    
      Services
---------------------------------------------------------- */

app.get('/api/users/:userId/services', (req, res) => {
  const userId = req.params.userId;

  const query = `
      SELECT SERVICE.name 
      FROM SERVICE 
      JOIN propose ON SERVICE.idService = propose.idService 
      WHERE propose.idUser = ?`;
  connection.query(query, [userId], (error, results) => {
      if (error) {
          console.error('Erreur lors de la récupération des services:', error);
          return res.status(500).json({ message: 'Erreur de serveur' });
      }
      res.json(results);
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

/* ----------------------------------------------------
    Abonnement
---------------------------------------------------------- */
function saveCustomerIdToDatabase(userId, customerId) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE USER SET stripeCustomerId = ? WHERE idUser = ?';

        connection.query(query, [customerId, userId], (error, results) => {
            if (error) {
                return reject(error);
            }

            resolve(results);
        });
    });
}
function getCustomerIdFromDatabase(userId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT stripeCustomerId FROM USER WHERE idUser = ?';

        connection.query(query, [userId], (error, results) => {
            if (error) {
                return reject(error);
            }

            if (results.length > 0 && results[0].stripeCustomerId) {
                resolve(results[0].stripeCustomerId); // Retourne le customerId trouvé
            } else {
                resolve(null); // Retourne null si aucun customerId n'est trouvé
            }
        });
    });
}


app.post('/api/create-subscription', async (req, res) => {
    const { idSubscription } = req.body;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.userId;

    try {
        const getPriceIdQuery = 'SELECT price_id FROM SUBSCRIPTION WHERE idSubscription = ?';
        connection.query(getPriceIdQuery, [idSubscription], async (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Erreur lors de la récupération du price_id' });
            }

            const price_id = results[0].price_id;
            let customerId = await getCustomerIdFromDatabase(userId);

            if (!customerId) {
                const customer = await stripe.customers.create({
                    email: decoded.email,
                });
                customerId = customer.id;
                await saveCustomerIdToDatabase(userId, customerId);
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{ price: price_id, quantity: 1 }],
                mode: 'subscription',
                success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.DOMAIN}/account?canceled=true`,
                customer: customerId,
            });

            res.json({ url: session.url });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de la session Stripe' });
    }
});




app.post('/api/unsubscribe', async (req, res) => {
    const { idSubscription } = req.body;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.userId;

    try {
        // Vérifiez si l'utilisateur est abonné à ce service
        const checkSubscriptionQuery = `
            SELECT stripeSubscriptionId FROM subscribed
            WHERE idUser = ? AND idSubscription = ?
        `;
        connection.query(checkSubscriptionQuery, [userId, idSubscription], async (error, results) => {
            if (error) {
                console.error('Erreur lors de la vérification de l\'abonnement:', error);
                return res.status(500).json({ error: 'Erreur lors de la vérification de l\'abonnement' });
            }

            if (results.length === 0) {
                return res.status(400).json({ error: 'Vous n\'êtes pas abonné à ce service.' });
            }

            const stripeSubscriptionId = results[0].stripeSubscriptionId;

            // Annuler l'abonnement dans Stripe
            await stripe.subscriptions.cancel(stripeSubscriptionId);

            // Supprimer l'abonnement de la base de données
            const deleteSubscriptionQuery = `
                DELETE FROM subscribed 
                WHERE idUser = ? AND idSubscription = ?
            `;
            connection.query(deleteSubscriptionQuery, [userId, idSubscription], (error, results) => {
                if (error) {
                    console.error('Erreur lors de la suppression de l\'abonnement:', error);
                    return res.status(500).json({ error: 'Erreur lors de la suppression de l\'abonnement' });
                }

                res.json({ message: 'Abonnement annulé avec succès.' });
            });
        });
    } catch (error) {
        console.error('Erreur lors de l\'annulation de l\'abonnement:', error.message);
        res.status(500).json({ error: 'Erreur lors de l\'annulation de l\'abonnement' });
    }
});


app.get('/api/subscriptions', (req, res) => {
    const query = 'SELECT * FROM SUBSCRIPTION';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des abonnements:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des abonnements' });
        }

        res.json(results);
    });
});

app.get('/api/user-subscriptions/:idUser', (req, res) => {
    const { idUser } = req.params;

    const query = `
        SELECT idSubscription 
        FROM subscribed
        WHERE idUser = ?
    `;

    connection.query(query, [idUser], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des abonnements de l\'utilisateur:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des abonnements de l\'utilisateur' });
        }

        res.json(results);
        console.log(results);
    });
});


/* ----------------------------------------------------
  
   Admin - Utilisateurs
---------------------------------------------------------- */

app.get('/api/users', (req, res) => {
    const query = 'SELECT * FROM USER';
    connection.query(query, (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  }
);


app.patch('/api/users/:id/ban', (req, res) => {
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


/*----------------------------------------------------
    
     Admin - Abonnements
     
--------------------------------------------- */





app.post('/api/subscription', async (req, res) => {
    const { name, price, description, frequency } = req.body;

    // Valider les données
    if (!name || !price || !frequency) {
        return res.status(400).json({ error: 'Tous les champs requis doivent être remplis.' });
    }

    try {
        // Créer un produit dans Stripe
        const product = await stripe.products.create({
            name: name,
            description: description || '',
        });

        // Créer un prix pour ce produit
        const stripePrice = await stripe.prices.create({
            unit_amount: price * 100, // Prix en centimes
            currency: 'eur',
            recurring: { interval: frequency }, // Intervalle de facturation (month, year)
            product: product.id,
        });

        // Enregistrer l'abonnement dans la base de données
        const query = `
            INSERT INTO SUBSCRIPTION (price, price_id, description, name, frequency)
            VALUES (?, ?, ?, ?, ?)
        `;
        connection.query(query, [price, stripePrice.id, description, name, frequency], (error, results) => {
            if (error) {
                console.error('Erreur lors de l\'ajout de l\'abonnement:', error);
                return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'abonnement' });
            }
            res.json({ message: 'Abonnement créé avec succès', idSubscription: results.insertId });
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'abonnement:', error.message);
        res.status(500).json({ error: 'Erreur lors de la création de l\'abonnement' });
    }
});




app.put('/api/subscription/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, price_id, description, frequency } = req.body;

    // Valider les données
    if (!name || !price || !price_id || !frequency) {
        return res.status(400).json({ error: 'Tous les champs requis doivent être remplis.' });
    }

    try {
        // Mettre à jour l'abonnement dans la base de données
        const query = `
            UPDATE SUBSCRIPTION 
            SET price = ?, price_id = ?, description = ?, name = ?, frequency = ?
            WHERE idSubscription = ?
        `;
        connection.query(query, [price, price_id, description, name, frequency, id], (error, results) => {
            if (error) {
                console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
                return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'abonnement' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Abonnement non trouvé' });
            }

            res.json({ message: 'Abonnement mis à jour avec succès' });
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'abonnement:', error.message);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'abonnement' });
    }
});

app.delete('/api/subscription/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM SUBSCRIPTION WHERE idSubscription = ?';
    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression de l\'abonnement:', error);
            return res.status(500).json({ error: 'Erreur lors de la suppression de l\'abonnement' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Abonnement non trouvé' });
        }

        res.json({ message: 'Abonnement supprimé avec succès' });
    });
});




app.get('/api/subscription/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM SUBSCRIPTION WHERE idSubscription = ?';

    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération de l\'abonnement:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération de l\'abonnement' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Abonnement non trouvé' });
        }

        res.json(results[0]);
    });
});


/*----------------------------------------------------

    Stripe Webhooks
---------------------------------------------------------- */

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;

            // Extraire les informations de la session
            const customerId = session.customer;
            const subscriptionId = session.subscription; // ID de l'abonnement Stripe
            const userId = getUserIdFromCustomerId(customerId); // Votre fonction pour récupérer l'ID utilisateur

            // Mettre à jour la base de données
            const query = `
                INSERT INTO subscribe (idUser, idSubscription, stripeSubscriptionId)
                VALUES (?, ?, ?)
            `;
            connection.query(query, [userId, session.metadata.idSubscription, subscriptionId], (error, results) => {
                if (error) {
                    console.error('Erreur lors de l\'insertion de l\'abonnement dans la base de données:', error);
                    return res.status(500).json({ error: 'Erreur lors de l\'insertion de l\'abonnement dans la base de données' });
                }

                console.log('Abonnement ajouté à la base de données pour l\'utilisateur:', userId);
            });

            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
});

// Fonction pour récupérer l'ID utilisateur en fonction de l'ID du client Stripe
function getUserIdFromCustomerId(customerId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT idUser FROM USER WHERE stripeCustomerId = ?';
        connection.query(query, [customerId], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results[0].idUser);
        });
    });
}

/* ----------------------------------------------------------
      Démarrage du serveur
---------------------------------------------------------- */

app.listen(5000, () => {    
    console.log("Serveur à l'écoute sur le port 5000")
})