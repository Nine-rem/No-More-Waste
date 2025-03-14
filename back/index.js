/* ----------------------------------------------------------
Définition des constantes 
---------------------------------------------------------- */

require('dotenv').config();
// const DOMAIN = "http://localhost:5173"
const DOMAIN = "https://www.nomorewaste.site";
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
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
//middleware
// app.use(express.json());
app.use(cors({
  credentials: true,
  origin: DOMAIN
}))
//console.log("Domain .env:   ",process.env.DOMAIN);
//console.log("Domain const:  ",DOMAIN)
//console.log("secret key:    ",process.env.SECRET_KEY);
//console.log("Stripe Secret: ", process.env.STRIPE_SECRET_KEY);
//console.log("Webhook secret:",process.env.STRIPE_WEBHOOK_SECRET);

 
app.use(cookieParser());
app.use("/api/uploads",express.static(__dirname + '/uploads'));

/* ----------------------------------------------------------
      Gestion des utilisateurs
---------------------------------------------------------- */

// Chiffrage du mot de passe
const bcrypt = require('bcryptjs');
const { error } = require('console');

// Inscription
//inscription de l'utilisateur
app.post("/api/register", express.json(), async (req, res) => {
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
        //console.log("Nom: ",lastname);
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


app.post('/api/login',express.json(), async (req, res) => {
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

app.get('/api/account', express.json(), async (req, res) => {
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

app.post('/api/logout', express.json(), (req, res) => {
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

// Route pour récupérer les informations d'un utilisateur par ID
app.get('/api/users/:id',express.json(), (req, res) => {
    const userId = req.params.id;
    const query = `
        SELECT 
            idUser,
            email,
            firstname,
            lastname,
            address,
            city,
            postalCode,
            country,
            phoneNumber,
            DATE_FORMAT(birthdate, '%Y-%m-%d') as birthdate,
            isBanned,
            isAdmin,
            isMerchant,
            isVolunteer
        FROM USER 
        WHERE idUser = ?
    `;
    
    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des informations utilisateur:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des informations utilisateur' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(results[0]); // Retourne les informations de l'utilisateur
    });
})
app.put('/api/users/:id',express.json(), (req, res) => {
    const userId = req.params.id;
    const { firstname, lastname, birthdate, address, city, postalCode, phoneNumber, email } = req.body;
    const errors = {};

    // Validation des données
    if (!firstname || firstname.trim() === "") {
        errors.firstname = 'Le prénom est requis.';
    }
    if (!lastname || lastname.trim() === "") {
        errors.lastname = 'Le nom est requis.';
    }
    if (!birthdate || birthdate.trim() === "") {
        errors.birthdate = 'La date de naissance est requise.';
    }
    if (!address || address.trim() === "") {
        errors.address = 'L\'adresse est requise.';
    }
    if (!city || city.trim() === "") {
        errors.city = 'La ville est requise.';
    }
    if (!postalCode || postalCode.trim() === "") {
        errors.postalCode = 'Le code postal est requis.';
    }
    if (!phoneNumber || phoneNumber.trim() === "") {
        errors.phoneNumber = 'Le numéro de téléphone est requis.';
    }
    if (!email || email.trim() === "") {
        errors.email = 'L\'email est requis.';
    }

    // Si des erreurs existent, les renvoyer
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
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
    const checkEmailQuery = 'SELECT idUser FROM USER WHERE email = ? AND idUser != ?';
    connection.query(checkEmailQuery, [cleanEmail, userId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'email :', err);
            return res.status(500).json({ error: 'Erreur de serveur lors de la vérification de l\'email.' });
        }

        if (results.length > 0) {
            errors.email = 'Cet email est déjà utilisé par un autre utilisateur.';
            return res.status(400).json({ errors });
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
                return res.status(500).json({ error: 'Erreur de serveur lors de la mise à jour de l\'utilisateur.' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Utilisateur non trouvé.' });
            }

            res.json({ message: 'Utilisateur mis à jour avec succès.' });
        });
    });
});


/* ----------------------------------------------------------
        Calendrier
---------------------------------------------------------- */
// Récupération des créneaux horaires

app.get('/api/timeslots',express.json(), (req, res) => {
    const { date, idService } = req.query;
    const query = 'SELECT * FROM timeslot WHERE date = ? AND idService = ? AND reserved = FALSE';
    connection.query(query, [date, idService], (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });


  app.get('/api/spots', express.json(), (req, res) => {
    const { month, year, idService } = req.query;
    const query = `
      SELECT date, COUNT(*) as spots
      FROM timeslot
      WHERE MONTH(date) = ? AND YEAR(date) = ? AND idService = ? AND reserved = FALSE
      GROUP BY date
    `;
    connection.query(query, [month, year, idService], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des disponibilités:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des disponibilités' });
        }

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
app.post('/api/users/:userId/timeslots/:idTimeslot/reserve', express.json(), (req, res) => {
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

app.get('/api/merchant/:idUser/bookings', express.json(), (req, res) => {
    const userId = req.params.idUser;
    const query = `
        SELECT r.idReservation, s.name AS serviceName, t.date, t.time
        FROM reserved r
        JOIN timeslot t ON r.idTimeslot = t.idTimeslot
        JOIN SERVICE s ON t.idService = s.idService
        WHERE r.idUser = ?
    `;

    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des réservations:', error);
            return res.status(500).json({ message: 'Erreur de serveur' });
        }

        res.json(results);
    });
}
);
/*----------------------------------------------------

  Services
---------------------------------------------------------- */
// Route pour récupérer la liste des services
app.get('/api/services', express.json(), (req, res) => {
  const query = 'SELECT idService, description, name FROM SERVICE';

  connection.query(query, (error, results) => {
      if (error) {
          console.error('Erreur lors de la récupération des services:', error);
          return res.status(500).json({ message: 'Erreur de serveur' });
      }

      res.json(results);
  });
});

app.post('/api/volunteer/apply', express.json(), (req, res) => {
    const { idUser, idService } = req.body;

    const insertApplicationQuery = `
        INSERT INTO volunteer_application (idUser, idService)
        VALUES (?, ?)
    `;
    connection.query(insertApplicationQuery, [idUser, idService], (error, results) => {
        if (error) {
            console.error('Erreur lors de la soumission de la candidature:', error);
            return res.status(500).json({ error: 'Erreur lors de la soumission de la candidature' });
        }
        res.json({ message: 'Candidature soumise avec succès' });
    });
});
app.get('/api/volunteer/:idUser/services', express.json(),(req, res) => {
    const userId = req.params.idUser;

    const query = `
        SELECT s.idService, s.name, s.description 
        FROM SERVICE s
        JOIN propose p ON s.idService = p.idService
        WHERE p.idUser = ?
    `;

    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des services :', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des services' });
        }

        res.json(results);
    });
});

/*- ----------------------------------------------------
    
      Créneaux horaires
---------------------------------------------------------- */


app.post('/api/services/:idService/slots', express.json(), (req, res) => {
    const serviceId = req.params.idService;
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({ error: 'Aucun créneau horaire fourni.' });
    }

    const query = `
        INSERT INTO timeslot (date, time, idService) 
        VALUES (?, ?, ?)
    `;

    const insertPromises = slots.map(slot => {
        const { date, time } = slot;
        if (!date) {
            console.error('Date invalide pour le créneau horaire:', slot);
            return Promise.reject(new Error(`Date invalide pour le jour : ${date}`));
        }
        return new Promise((resolve, reject) => {
            connection.query(query, [date, time, serviceId], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    });

    Promise.all(insertPromises)
        .then(() => {
            res.json({ message: 'Créneaux horaires ajoutés avec succès !' });
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout des créneaux horaires :', error);
            res.status(500).json({ error: 'Erreur lors de l\'ajout des créneaux horaires.' });
        });
});

app.get('/api/services/:idService/slots', (req, res) => {
    const serviceId = req.params.idService;

    const query = `SELECT * FROM timeslot WHERE idService = ? ORDER BY date, time`;

    connection.query(query, [serviceId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des créneaux horaires :', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des créneaux horaires.' });
        }

        res.json(results);
    });
});

app.put('/api/services/:idService/slots', express.json(), (req, res) => {
    const serviceId = req.params.idService;
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({ error: 'Aucun créneau horaire fourni.' });
    }

    const updatePromises = slots.map(slot => {
        const { idTimeslot, date, time } = slot;
        const formattedDate = date.split('T')[0]; // Extraire la partie 'YYYY-MM-DD' uniquement

        return new Promise((resolve, reject) => {
            const query = `
                UPDATE timeslot
                SET date = ?, time = ?
                WHERE idTimeslot = ? AND idService = ?
            `;
            connection.query(query, [formattedDate, time, idTimeslot, serviceId], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    });

    Promise.all(updatePromises)
        .then(() => {
            res.json({ message: 'Créneaux horaires mis à jour avec succès !' });
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour des créneaux horaires :', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour des créneaux horaires.' });
        });
});

app.delete('/api/services/slots/:idTimeslot', (req, res) => {
    const idTimeslot = req.params.idTimeslot;

    const query = `DELETE FROM timeslot WHERE idTimeslot = ?`;

    connection.query(query, [idTimeslot], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression du créneau horaire :', error);
            return res.status(500).json({ error: 'Erreur lors de la suppression du créneau horaire.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Créneau horaire non trouvé.' });
        }

        res.json({ message: 'Créneau horaire supprimé avec succès !' });
    });
});



// Route pour récupérer les créneaux horaires disponibles pour un service à une date donnée
app.get('/api/services/timeslots', express.json(),(req, res) => {
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
app.post('/api/users/reserve', express.json(), (req, res) => {
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



app.post('/api/products', upload.array('images'), express.json(),(req, res) => {
    const { name, reference, stock, description, category, brand, expiryDate } = req.body;
    const altDescriptions = req.body.altDescriptions ? [].concat(req.body.altDescriptions) : [];
    const errors = {};
    const token = req.cookies.token;   

    if (!token) {
        return res.status(401).json({ message: 'Non authentifié' });
    }
    const decoded = jwt.verify(token, secretKey);
    const idUser = decoded.userId;

    // Validation de la référence (uniquement des chiffres)
    if (!/^\d+$/.test(reference)) {
        errors.reference = 'La référence doit contenir uniquement des chiffres.';
    }

    // Vérification pour les produits alimentaires (date de péremption obligatoire)
    if (category === 'alimentaire' && !expiryDate) {
        errors.expiryDate = 'La date de péremption est requise pour les produits alimentaires.';
    }

    // Vérification des champs obligatoires
    if (!name) errors.name = 'Le nom du produit est requis.';
    if (!stock) errors.stock = 'Le stock est requis.';
    if (!category) errors.category = 'La catégorie est requise.';
    
    // Si des erreurs existent, renvoyez-les au frontend
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    // Log de la valeur de brand pour vérification
    //console.log("Brand:", brand);

    const query = `
        INSERT INTO PRODUCT (name, reference, stock, description, category, brand, expiryDate, idUser)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [name, reference, stock, description, category, brand, category === 'alimentaire' ? expiryDate : null, idUser], (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'ajout du produit :', error);
            return res.status(500).json({ error: 'Erreur de serveur' });
        }

        const idProduct = results.insertId;

        if (req.files && req.files.length > 0) {
            const insertPhotoQuery = `
                INSERT INTO PHOTO (idProduct, path, description, temporary)
                VALUES (?, ?, ?, ?)
            `;

            const photoInserts = req.files.map((file, index) => {
                return new Promise((resolve, reject) => {
                    connection.query(insertPhotoQuery, [idProduct, file.filename, altDescriptions[index] || '', false], (err) => {
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
                    res.json({ message: 'Produit ajouté avec succès, y compris les photos.' });
                })
                .catch(err => {
                    console.error('Erreur lors de l\'ajout des photos :', err);
                    res.status(500).json({ error: 'Erreur lors de l\'ajout des photos' });
                });
        } else {
            res.json({ message: 'Produit ajouté avec succès.' });
        }
    });
});

// API: Récupérer les détails d'un produit spécifique
app.get('/api/products/:idProduct', (req, res) => {
    const idProduct = req.params.idProduct;
  
    const query = `
        SELECT p.*, ph.idPhoto, ph.path AS photoPath
        FROM PRODUCT p
        LEFT JOIN PHOTO ph ON p.idProduct = ph.idProduct
        WHERE p.idProduct = ?
    `;
  
    connection.query(query, [idProduct], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération du produit', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
        }
  
        if (results.length === 0) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
  
        const product = {
            idProduct: results[0].idProduct,
            name: results[0].name,
            reference: results[0].reference,
            stock: results[0].stock,
            brand: results[0].brand,
            description: results[0].description,
            category: results[0].category,
            photos: results.map(row => ({
                idPhoto: row.idPhoto,
                fullPath: `${req.protocol}://${req.get('host')}/api/uploads/${row.photoPath}`
            }))
        };
  
        res.json(product);
    });
  });
  


app.get('/api/users/:idUser/products', express.json(),(req, res) => {
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
                  brand: row.brand,
                  description: row.description,
                  category: row.category,
                  photos: []
              };
          }

          if (row.photoPath) {
              products[row.idProduct].photos.push({
                  idPhoto: row.idPhoto,
                  fullPath: `${req.protocol}://${req.get('host')}/api/uploads/${row.photoPath}`
              });
          }
      });

      res.json(Object.values(products));
  });
});

app.get('/api/users/:userId/products/:idProduct', express.json(),(req, res) => {
  const { userId, idProduct } = req.params;

  const productQuery = `
      SELECT p.idProduct, p.name, p.reference, p.stock, p.description, ph.idPhoto, ph.path, ph.description as photoDescription, p.brand
      FROM PRODUCT p
      LEFT JOIN PHOTO ph ON p.idProduct = ph.idProduct
      WHERE p.idProduct = ? AND p.idUser = ?
  `;

  connection.query(productQuery, [idProduct, userId], (err, results) => {
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
          description: results[0].description,
          brand: results[0].brand
      };
    

      res.json(product);
  });
});

app.get('/api/products/:idProduct/photos', express.json(),(req, res) => {
  const { idProduct } = req.params;
  
  const getPhotosQuery = `
      SELECT idPhoto, path, description
      FROM PHOTO
      WHERE idProduct = ?
  `;

  connection.query(getPhotosQuery, [idProduct], (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération des photos:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
      }

      const photos = results.map(photo => ({
          idPhoto: photo.idPhoto,
          fullPath: `${req.protocol}://${req.get('host')}/api/uploads/${photo.path}`,
          description: photo.description
      }));

      res.json(photos);
  });
});


app.delete('/api/photos/:photoId',express.json(),(req, res) => {
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

app.put('/api/products/:idProduct', upload.array('images'),express.json(), (req, res) => {
    const idProduct = req.params.idProduct;
    const { name, reference, stock, description, category, brand, expiryDate } = req.body;
    const altDescriptions = req.body.altDescriptions ? [].concat(req.body.altDescriptions) : [];
    const errors = {};

    // Validation de la référence (uniquement des chiffres)
    if (!/^\d+$/.test(reference)) {
        errors.reference = 'La référence doit contenir uniquement des chiffres.';
    }

    // Vérification pour les produits alimentaires (date de péremption obligatoire)
    if (category === 'alimentaire' && !expiryDate) {
        errors.expiryDate = 'La date de péremption est requise pour les produits alimentaires.';
    }

    // Vérification des champs obligatoires
    if (!name) errors.name = 'Le nom du produit est requis.';
    if (!stock) errors.stock = 'Le stock est requis.';
    if (!category) errors.category = 'La catégorie est requise.';
    
    // Si des erreurs existent, renvoyez-les au frontend
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    const query = `
        UPDATE PRODUCT 
        SET name = ?, reference = ?, stock = ?, description = ?, category = ?, brand = ?, expiryDate = ?
        WHERE idProduct = ?
    `;

    connection.query(query, [name, reference, stock, description, category, brand, category === 'alimentaire' ? expiryDate : null, idProduct], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du produit :', error);
            return res.status(500).json({ error: 'Erreur de serveur' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        // Gestion des nouvelles photos
        if (req.files && req.files.length > 0) {
            const insertPhotoQuery = `
                INSERT INTO PHOTO (idProduct, path, description, temporary)
                VALUES (?, ?, ?, ?)
            `;

            const photoInserts = req.files.map((file, index) => {
                return new Promise((resolve, reject) => {
                    connection.query(insertPhotoQuery, [idProduct, file.filename, altDescriptions[index] || '', false], (err) => {
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
                    console.error('Erreur lors de l\'ajout des nouvelles photos :', err);
                    res.status(500).json({ error: 'Erreur lors de l\'ajout des nouvelles photos' });
                });
        } else {
            res.json({ message: 'Produit mis à jour avec succès.' });
        }
    });
});


app.delete('/api/products/:idProduct',express.json(), (req, res) => {
    const idProduct = req.params.idProduct;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.userId;
    // Suppression du produit de la base de données
    const deleteProductQuery = `
        DELETE FROM PRODUCT WHERE idProduct = ? AND idUser = ?
    `;

    connection.query(deleteProductQuery, [idProduct, userId], (err, results) => {
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


app.get('/api/products', (req, res) => {
    const query = `
        SELECT p.*, ph.idPhoto, ph.path AS photoPath
        FROM PRODUCT p
        LEFT JOIN PHOTO ph ON p.idProduct = ph.idProduct
    `;
  
    connection.query(query, (err, results) => {
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
                    price: row.price,
                    stock: row.stock,
                    brand: row.brand,
                    description: row.description,
                    category: row.category,
                    photos: []
                };
            }
  
            if (row.photoPath) {
                products[row.idProduct].photos.push({
                    idPhoto: row.idPhoto,
                    fullPath: `${req.protocol}://${req.get('host')}/api/uploads/${row.photoPath}`
                });
            }
        });
  
        res.json(Object.values(products));
    });
  });
  

/*----------------------------------------------------
    
      Services
---------------------------------------------------------- */

app.get('/api/services', express.json(), (req, res) => {
    const query = `
        SELECT *
        FROM 
            SERVICE 
    `;

    connection.query(query, (error, results) => {
        if (error) {
            console.error("Erreur lors de la récupération des services:", error);
            return res.status(500).json({ error: "Erreur lors de la récupération des services" });
        }
        res.json(results);
    });
});




app.get('/api/users/:userId/services', express.json(), (req, res) => {
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
/*----------------------------------------------------

        Bénévoles
---------------------------------------------------------- */

app.patch('/api/volunteer/apply',express.json(), (req, res) => {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, secretKey);
    const idUser= decoded.userId;

    const query = `
        UPDATE USER 
        SET isVolunteer = 1
        WHERE idUser = ?
    `;

    connection.query(query, [idUser], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du statut de bénévole:', error);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut de bénévole' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({ message: 'Le statut de bénévole a été mis à jour avec succès' });
    });
});
app.patch('/api/merchant/apply',express.json(), (req, res) => {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, secretKey);
    const idUser= decoded.userId;

    const query = `
        UPDATE USER 
        SET isMerchant = 1
        WHERE idUser = ?
    `;

    connection.query(query, [idUser], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du statut de bénévole:', error);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut de bénévole' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({ message: 'Le statut de bénévole a été mis à jour avec succès' });
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


app.post('/api/create-subscription', express.json(), async (req, res) => {
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
                success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${DOMAIN}/account?canceled=true`,
                customer: customerId,
                metadata: { userId, idSubscription },
            });
            //console.log(DOMAIN)

            res.json({ url: session.url });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de la session Stripe' });
    }
});




app.post('/api/unsubscribe', express.json(), async (req, res) => {
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


app.get('/api/subscriptions', express.json(), (req, res) => {
    const query = 'SELECT * FROM SUBSCRIPTION';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des abonnements:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des abonnements' });
        }

        res.json(results);
    });
});

app.get('/api/user-subscriptions/:idUser', express.json(),(req, res) => {
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
        //console.log(results);
    });
});


/* ----------------------------------------------------
  
   Admin - Utilisateurs
---------------------------------------------------------- */

app.get('/api/admin/applications', express.json(), (req, res) => {
    const query = `
        SELECT VA.*, U.firstname, U.lastname, S.name AS serviceName 
        FROM volunteer_application VA
        JOIN USER U ON VA.idUser = U.idUser
        JOIN SERVICE S ON VA.idService = S.idService
        WHERE VA.status = 'pending'
    `;
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des candidatures:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des candidatures' });
        }
        res.json(results);
    });
});
app.patch('/api/admin/applications/:id', express.json(), (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
    }

    const updateApplicationQuery = `
        UPDATE volunteer_application 
        SET status = ?
        WHERE idApplication = ?
    `;

    connection.query(updateApplicationQuery, [status, id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour de la candidature:', error);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour de la candidature' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Candidature non trouvée' });
        }

        // Si la candidature est approuvée, insérer les données dans la table propose
        if (status === 'approved') {
            const getUserAndServiceQuery = `
                SELECT idUser, idService 
                FROM volunteer_application 
                WHERE idApplication = ?
            `;
            connection.query(getUserAndServiceQuery, [id], (error, results) => {
                if (error) {
                    console.error('Erreur lors de la récupération de la candidature:', error);
                    return res.status(500).json({ error: 'Erreur lors de la récupération de la candidature' });
                }

                const { idUser, idService } = results[0];
                const insertProposeQuery = `
                    INSERT INTO propose (idUser, idService)
                    VALUES (?, ?)
                `;
                connection.query(insertProposeQuery, [idUser, idService], (error) => {
                    if (error) {
                        console.error('Erreur lors de l\'insertion dans propose:', error);
                        return res.status(500).json({ error: 'Erreur lors de l\'insertion dans propose' });
                    }

                    res.json({ message: 'Statut de la candidature mis à jour avec succès et service ajouté.' });
                });
            });
        } else {
            res.json({ message: 'Statut de la candidature mis à jour avec succès' });
        }
    });
});


app.get('/api/users', express.json(), (req, res) => {
    const query = 'SELECT * FROM USER';
    connection.query(query, (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  }
);


app.patch('/api/users/:id/ban', express.json(), (req, res) => {
  const userId = req.params.id;
//   console.log(userId);
  connection.query('SELECT isBanned FROM USER WHERE idUser = ?', [userId], (err, results) => {
      if (err) {
            // console.error('Erreur lors de la récupération de l\'utilisateur:', err);
          res.status(500).json({ message: err.message });
          return;
      }
      if (results.length === 0) {
          res.status(404).json({ message: 'User not found' });
          return;
      }

      const newBanStatus = !results[0].isBanned;
    //   console.log(newBanStatus);
      connection.query('UPDATE USER SET isBanned = ? WHERE idUser = ?', [newBanStatus, userId], (err) => {
          if (err) {
            //   console.log('Erreur lors de la mise à jour de l\'utilisateur:', err);
              res.status(500).json({ message: err.message });
              return;
          }
          res.json({ id: userId, isBanned: newBanStatus });
      });
  });
});


/*----------------------------------------------------
    
     Admin - Abonnements
     
--------------------------------------------- */





app.post('/api/subscription', express.json(), async (req, res) => {
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




app.put('/api/subscription/:id', express.json(), async (req, res) => {
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

app.delete('/api/subscription/:id', express.json(), (req, res) => {
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




app.get('/api/subscription/:id', express.json(), (req, res) => {
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
// const endpointSecret = "we_1PpGXVGtnpoEQDI2XCub0F2Y";
app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    //console.log('Webhook reçu');

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
     //console.log('Événement Stripe validé:', event.type);
    } catch (err) {
        //console.log('⚠️  Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gestion des différents types d'événements
        switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutSessionCompleted(event.data.object);
            break;
        case 'charge.succeeded':
        case 'payment_intent.succeeded':
        case 'invoice.payment_succeeded':
            //console.log(`Payment succeeded for event type ${event.type}`);
            break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            //console.log(`Subscription event type ${event.type} handled`);
            break;
        default:
            //console.log(`Unhandled event type ${event.type}`);
            break;
        }

    res.status(200).send('Received');
});

async function handleCheckoutSessionCompleted(session) {
    try {
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const userId = await getUserIdFromCustomerId(customerId);

        const query = `
            INSERT INTO subscribed (idUser, idSubscription, stripeSubscriptionId)
            VALUES (?, ?, ?)
        `;
        connection.query(query, [userId, session.metadata.idSubscription, subscriptionId], (error, results) => {
            if (error) {
                console.error('Erreur lors de l\'insertion de l\'abonnement dans la base de données:', error);
                return;
            }
            //console.log('Abonnement ajouté à la base de données pour l\'utilisateur:', userId);
        });
    } catch (error) {
        console.error('Erreur lors du traitement de l\'événement checkout.session.completed:', error);
    }
}

// Fonction pour récupérer l'ID utilisateur en fonction de l'ID du client Stripe
async function getUserIdFromCustomerId(customerId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT idUser FROM USER WHERE stripeCustomerId = ?';
        connection.query(query, [customerId], (error, results) => {
            if (error) {
                return reject(error);
            }
            if (results.length > 0) {
                resolve(results[0].idUser);
            } else {
                reject(new Error('Utilisateur non trouvé pour ce customerId.'));
            }
        });
    });
}

/*----------------------------------------------------

    Admin - Produits
---------------------------------------------------------- */

app.get('/api/admin/products', (req, res) => {
    const query = `
        SELECT p.*, ph.idPhoto, ph.path AS photoPath
        FROM PRODUCT p
        LEFT JOIN PHOTO ph ON p.idProduct = ph.idProduct
    `;
  
    connection.query(query, (err, results) => {
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
                    brand: row.brand,
                    description: row.description,
                    category: row.category,
                    photos: []
                };
            }
  
            if (row.photoPath) {
                products[row.idProduct].photos.push({
                    idPhoto: row.idPhoto,
                    fullPath: `${req.protocol}://${req.get('host')}/api/uploads/${row.photoPath}`
                });
            }
        });
  
        res.json(Object.values(products));
    });
  });
  
app.get('/api/admin/products/:idProduct', (req, res) => {
  const { idProduct } = req.params;

  const productQuery = `
      SELECT p.idProduct, p.name, p.reference, p.stock, p.description, ph.idPhoto, ph.path, ph.description as photoDescription, p.brand
      FROM PRODUCT p
      LEFT JOIN PHOTO ph ON p.idProduct = ph.idProduct
      WHERE p.idProduct = ?
  `;

  connection.query(productQuery, [idProduct], (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération du produit:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: 'Produit non trouvé' });
      }

      const product = {
          idProduct: results[0].idProduct,
          name: results[0].name,
          reference: results[0].reference,
          stock: results[0].stock,
          description: results[0].description,
          brand: results[0].brand,
          photos: results.filter(r => r.idPhoto).map(r => ({
              idPhoto: r.idPhoto,
              fullPath: `${req.protocol}://${req.get('host')}/api/uploads/${r.path}`,
              description: r.photoDescription
          }))
      };

      res.json(product);
  });
});


app.put('/api/admin/products/:idProduct', upload.array('images'), (req, res) => {
    const idProduct = req.params.idProduct;
    const { name, reference, stock, description, category, brand, expiryDate } = req.body;
    const altDescriptions = req.body.altDescriptions ? [].concat(req.body.altDescriptions) : [];
    const errors = {};

    if (!/^\d+$/.test(reference)) {
        errors.reference = 'La référence doit contenir uniquement des chiffres.';
    }

    if (category === 'alimentaire' && !expiryDate) {
        errors.expiryDate = 'La date de péremption est requise pour les produits alimentaires.';
    }

    if (!name) errors.name = 'Le nom du produit est requis.';
    if (!stock) errors.stock = 'Le stock est requis.';
    if (!category) errors.category = 'La catégorie est requise.';
    
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    const query = `
        UPDATE PRODUCT 
        SET name = ?, reference = ?, stock = ?, description = ?, category = ?, brand = ?, expiryDate = ?
        WHERE idProduct = ?
    `;

    connection.query(query, [name, reference, stock, description, category, brand, category === 'alimentaire' ? expiryDate : null, idProduct], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du produit :', error);
            return res.status(500).json({ error: 'Erreur de serveur' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        if (req.files && req.files.length > 0) {
            const insertPhotoQuery = `
                INSERT INTO PHOTO (idProduct, path, description, temporary)
                VALUES (?, ?, ?, ?)
            `;

            const photoInserts = req.files.map((file, index) => {
                return new Promise((resolve, reject) => {
                    connection.query(insertPhotoQuery, [idProduct, file.filename, altDescriptions[index] || '', false], (err) => {
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
                    console.error('Erreur lors de l\'ajout des nouvelles photos :', err);
                    res.status(500).json({ error: 'Erreur lors de l\'ajout des nouvelles photos' });
                });
        } else {
            res.json({ message: 'Produit mis à jour avec succès.' });
        }
    });
});

app.delete('/api/admin/products/:idProduct', (req, res) => {
    const idProduct = req.params.idProduct;

    const deleteProductQuery = `
        DELETE FROM PRODUCT WHERE idProduct = ?
    `;

    connection.query(deleteProductQuery, [idProduct], (err, results) => {
        if (err) {
            console.error('Erreur lors de la suppression du produit:', err);
            return res.status(500).json({ message: 'Erreur de serveur' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        res.json({ message: 'Produit supprimé avec succès' });
    });
});


/*----------------------------------------------------

    Admin - Services
---------------------------------------------------------- */

app.get('/api/services/:idService', express.json(), (req, res) => {
    const idService = req.params.idService;
    const query = `SELECT * FROM SERVICE WHERE idService = ?`;

    connection.query(query, [idService], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération du service:', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Service non trouvé' });
        }
        res.json(results[0]);
    });
});

app.post('/api/services', express.json(), (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const query = `INSERT INTO SERVICE (name, description) VALUES (?, ?)`;

    connection.query(query, [name, description], (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'ajout du service:', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(200).json({ message: 'Service ajouté avec succès.' });
    });
});



app.put('/api/services/:idService', express.json(), (req, res) => {
    const idService = req.params.idService;
    //console.log(idService);
    const { name, description } = req.body;
    //console.log(req.body);

    const query = `UPDATE SERVICE SET name = ?, description = ? WHERE idService = ?`;

    connection.query(query, [name, description, idService], (error) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du service:', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ message: 'Service mis à jour avec succès' });
    });
});

app.delete('/api/services/:idService',  express.json(), (req, res) => {
    const idService = req.params.idService;

    const query = `DELETE FROM SERVICE WHERE idService = ?`;

    connection.query(query, [idService], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression du service:', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Service non trouvé' });
        }

        res.json({ message: 'Service supprimé avec succès' });
    });
});



/* ----------------------------------------------------------
      Démarrage du serveur
---------------------------------------------------------- */

app.listen(5000, () => {    
    //console.log("Serveur à l'écoute sur le port 5000")
})