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


email = email.trim().toLowerCase();

const emailRegex = /\S+@\S+\.\S+/;


if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email invalide' });
}

connection.query('SELECT idUser, email, password FROM USER WHERE email = ?', [email], async (error, results) => {
    if (error) {
    return res.status(500).json({ message: 'Erreur de serveur' });
    }
    if (results.length === 0) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const hashedPassword = results[0].password;
    const isMatchingPassword = await bcrypt.compare(password, hashedPassword);

    if (!isMatchingPassword) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    const userId = results[0].idUser;
    const email = results[0].email;

    const token = jwt.sign({ userId,email }, secretKey, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });

    connection.query(
    'UPDATE USER SET token = ? WHERE idUSER = ?',
    [token, userId],
    (updateError) => {
        if (updateError) {
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du token' });
        }
        

        res.json({ email, userId });
    }
    );
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

/* ----------------------------------------------------------
      Démarrage du serveur
---------------------------------------------------------- */

app.listen(5000, () => {    
    console.log("Serveur à l'écoute sur le port 5000")
})