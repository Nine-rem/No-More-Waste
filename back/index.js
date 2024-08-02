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
        lastName:lastName,
        firstName:firstName
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

        const regexName = /^[a-zA-ZÀ-ÿ\s]{2,40}$/;
       lastName =lastName.trim().toUpperCase();
       firstName =firstName.trim().toLowerCase();
       firstName =firstName.charAt(0).toUpperCase() +firstName.slice(1);
        if (!regexName.test(lastName)) {
        errorArray.lastName = 'Nom invalide';
        }
        if (!regexName.test(firstName)) {
        errorArray.firstName = 'Prénom invalide';
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
        
        const query = 'INSERT INTO USER(lastName,firstName,birthdate,address,postalCode,city,email,password,phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [lastName,firstName,birthdate, address, postalCode, city, email, hashedPassword, phoneNumber];

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



/* ----------------------------------------------------------
      Démarrage du serveur
---------------------------------------------------------- */

app.listen(5000, () => {    
    console.log("Serveur à l'écoute sur le port 5000")
})