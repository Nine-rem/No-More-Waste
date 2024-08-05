
DROP TABLE IF EXISTS propose;
DROP TABLE IF EXISTS subscribe;
DROP TABLE IF EXISTS belongs;
DROP TABLE IF EXISTS addProduct;
DROP TABLE IF EXISTS possesses;
DROP TABLE IF EXISTS SERVICE;
DROP TABLE IF EXISTS SUBSCRIPTION;
DROP TABLE IF EXISTS USER;
DROP TABLE IF EXISTS CATEGORY;
DROP TABLE IF EXISTS PRODUCT;
DROP TABLE IF EXISTS PHOTO;
DROP TABLE IF EXISTS timeslot;
DROP TABLE IF EXISTS reserved;

-- Table: PHOTO
CREATE TABLE PHOTO (
    idPhoto INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    path VARCHAR(255)
);

-- Table: PRODUCT
CREATE TABLE PRODUCT (
    idProduct INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    reference VARCHAR(255)
);

-- Table: CATEGORY
CREATE TABLE CATEGORY (
    idCategory INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

-- Table: USER
CREATE TABLE USER (
    idUser INTEGER AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(255),
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(255),
    postalCode VARCHAR(255),
    country VARCHAR(255),
    phoneNumber VARCHAR(255),
    birthdate DATE,
    isAdmin BOOLEAN,
    isMerchant BOOLEAN,
    isVolunteer BOOLEAN,
    token TEXT
);

-- Table: SUBSCRIPTION
CREATE TABLE SUBSCRIPTION (
    idSubscription INTEGER AUTO_INCREMENT PRIMARY KEY,
    price DECIMAL(10, 2),
    type VARCHAR(255)
);

-- Table: SERVICE
CREATE TABLE SERVICE (
    idService INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);
-- Table: possesses (Many-to-Many relationship between PHOTO and PRODUCT)
CREATE TABLE possesses (
    idPhoto INTEGER,
    idProduct INTEGER,
    PRIMARY KEY (idPhoto, idProduct),
    FOREIGN KEY (idPhoto) REFERENCES PHOTO(idPhoto),
    FOREIGN KEY (idProduct) REFERENCES PRODUCT(idProduct)
);

-- Table: add (Many-to-Many relationship between PRODUCT and USER)
CREATE TABLE addProduct (
    idProduct INTEGER,
    idUser INTEGER,
    PRIMARY KEY (idProduct, idUser),
    FOREIGN KEY (idProduct) REFERENCES PRODUCT(idProduct),
    FOREIGN KEY (idUser) REFERENCES USER(idUser)
);

-- Table: belongs (Many-to-Many relationship between PRODUCT and CATEGORY)
CREATE TABLE belongs (
    idProduct INTEGER,
    idCategory INTEGER,
    PRIMARY KEY (idProduct, idCategory),
    FOREIGN KEY (idProduct) REFERENCES PRODUCT(idProduct),
    FOREIGN KEY (idCategory) REFERENCES CATEGORY(idCategory)
);

-- Table: subscribe (Many-to-Many relationship between USER and SUBSCRIPTION)
CREATE TABLE subscribe (
    idSubscription INTEGER,
    idUser INTEGER,
    isSubscribed BOOLEAN,
    PRIMARY KEY (idSubscription, idUser),
    FOREIGN KEY (idSubscription) REFERENCES SUBSCRIPTION(idSubscription),
    FOREIGN KEY (idUser) REFERENCES USER(idUser)
);

-- Table: propose (Many-to-Many relationship between USER and SERVICE)
CREATE TABLE propose (
    idUser INTEGER,
    idService INTEGER,
    PRIMARY KEY (idUser, idService),
    FOREIGN KEY (idUser) REFERENCES USER(idUser),
    FOREIGN KEY (idService) REFERENCES SERVICE(idService)
);

CREATE TABLE timeslot (
    idTimeslot INTEGER AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    idService INTEGER,
    reserved BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (idService) REFERENCES SERVICE(idService)
);
CREATE TABLE reserved (
    idReservation INTEGER AUTO_INCREMENT PRIMARY KEY,
    idUser INTEGER,
    idTimeslot INTEGER,
    FOREIGN KEY (idUser) REFERENCES USER(idUser),
    FOREIGN KEY (idTimeslot) REFERENCES AVAILABILITY(idTimeslot)
);

INSERT INTO timeslot (date, time, idService, reserved) VALUES 
('2024-08-01', '09:00:00', 1, FALSE),
('2024-08-01', '10:00:00', 1, FALSE),
('2024-08-02', '11:00:00', 2, FALSE),
('2024-08-02', '14:00:00', 2, FALSE);


INSERT INTO USER(email, password, firstname, lastname, address, city, postalCode, country, phoneNumber, birthdate, isAdmin, isMerchant, isVolunteer) VALUES
 ('a@a.com', '$2a$10$32tE9S9o16vHEBpG23ntbeAIPmoso8/3uOFcyUiY5R7clcKD5vWsG','Mathis', 'Boussard', '1 rue de la paix', 'Paris', '75000', 'France', '0606060606', '1999-06-06', TRUE,TRUE,TRUE);


INSERT INTO USER(email, password, firstname, lastname, address, city, postalCode, country, phoneNumber, birthdate, isAdmin, isMerchant, isVolunteer) VALUES
 ('merchant@a.com', '$2a$10$32tE9S9o16vHEBpG23ntbeAIPmoso8/3uOFcyUiY5R7clcKD5vWsG','Mathis', 'Boussard', '1 rue de la paix', 'Paris', '75000', 'France', '0606060606', '1999-06-06', FALSE,TRUE,FALSE);


INSERT INTO USER(email, password, firstname, lastname, address, city, postalCode, country, phoneNumber, birthdate, isAdmin, isMerchant, isVolunteer) VALUES
 ('volunteer@a.com', '$2a$10$32tE9S9o16vHEBpG23ntbeAIPmoso8/3uOFcyUiY5R7clcKD5vWsG','Mathis', 'Boussard', '1 rue de la paix', 'Paris', '75000', 'France', '0606060606', '1999-06-06', FALSE,FALSE,TRUE);

 
INSERT INTO USER(email, password, firstname, lastname, address, city, postalCode, country, phoneNumber, birthdate, isAdmin, isMerchant, isVolunteer) VALUES
 ('admin@a.com', '$2a$10$32tE9S9o16vHEBpG23ntbeAIPmoso8/3uOFcyUiY5R7clcKD5vWsG','Mathis', 'Boussard', '1 rue de la paix', 'Paris', '75000', 'France', '0606060606', '1999-06-06', TRUE,FALSE,FALSE);

INSERT INTO SERVICE(name) VALUES('Plombier');

INSERT INTO SERVICE(name) VALUES('Electricien');

INSERT INTO SERVICE(name) VALUES('Jardinier');

INSERT INTO SERVICE(name) VALUES('Chauffeur');

INSERT INTO SERVICE(name) VALUES('Chauffagiste');

INSERT INTO SERVICE(name) VALUES('Serrurier');

INSERT INTO SERVICE(name) VALUES('Paysagiste');

INSERT INTO SERVICE(name) VALUES('Architecte');

INSERT INTO SERVICE(name) VALUES('Déménageur');

