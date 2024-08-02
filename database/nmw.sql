
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

