const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', 
  user: 'nmw',      
  password: 'nmw2024',  
  database: 'nmw' 
});

connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion : ' + err.stack);
    return;
  }
  console.log('Connecté à la base de données');
});

module.exports = connection;