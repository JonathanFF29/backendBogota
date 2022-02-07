-- creating the database
CREATE DATABASE TestDatabase;

-- using the database 
use TestDatabase;

-- creating user table
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    date DATETIME NOT NULL,
    name VARCHAR(50),
    description VARCHAR(1000),
    url VARCHAR(255),
    gender  VARCHAR(15),
    birthdate DATETIME,
    picture VARCHAR(255),
    country VARCHAR(50),
    city VARCHAR(50),
    profession VARCHAR(50),
    isActive BOOL DEFAULT 0,
    isFacebook BOOL DEFAULT 0,
    isGoogle BOOL DEFAULT 0,
);

-- crating user_role table
CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    description VARCHAR(255)
);

-- creating tag table
CREATE TABLE tag (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    imagePath VARCHAR(250) NOT NULL
);

-- creareting user_tag intermediate table
CREATE TABLE user_role (
    user_id INT NOT NULL,
    role_id INT NOT NULL,

    CONSTRAINT FK_user_role_user_id FOREIGN KEY (user_id) REFERENCES user(id),
    CONSTRAINT FK_user_role_role_id FOREIGN KEY (role_id) REFERENCES role(id),
    PRIMARY KEY (user_id, role_id);
);

-- creareting user_tag intermediate table
CREATE TABLE user_tag (
    user_id INT NOT NULL,
    tag_id INT NOT NULL,

    CONSTRAINT FK_user_tag_user_id FOREIGN KEY (user_id) REFERENCES user(id),
    CONSTRAINT FK_user_tag_tag_id FOREIGN KEY (tag_id) REFERENCES tag(id),
    PRIMARY KEY (user_id, tag_id)
);

-- creating category table
CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    imagePath VARCHAR(255),
    colorlessImagePath VARCHAR(255)
);

-- creating subcategory table
CREATE TABLE subcategory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    imagePath VARCHAR(255),

    CONSTRAINT FK_subcategory_category_id FOREIGN KEY (category_id) REFERENCES category(id)
);

-- creating 3d models tag table
CREATE TABLE modelTag (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- creating model3d table
CREATE TABLE model3d (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(1000),
    creatorId INT, 
    sketchfabCode VARCHAR(1500),
    modelPath VARCHAR(255),
    colliderPath VARCHAR(255),
    shadowPath VARCHAR(255),
    textureAPath VARCHAR(255),
    textureBCPath VARCHAR(255),
    textureNPath VARCHAR(255),
    textureRPath VARCHAR(255),
    zipPath VARCHAR(255),
    imagePath1 VARCHAR(255),
    imagePath2 VARCHAR(255),
    imagePath3 VARCHAR(255),
    price DECIMAL(19,4),
    likes INT DEFAULT 0,
    saved INT DEFAULT 0,
    shared INT DEFAULT 0,
    toCart INT DEFAULT 0,
    category_id INT,
    subcategory_id INT,
    addedBy INT,
    dateOfAdition DATETIME NOT NULL,

    CONSTRAINT FK_model3d_creatorId FOREIGN KEY (creatorId) REFERENCES user(id),
    CONSTRAINT FK_model3d_category_id FOREIGN KEY (category_id) REFERENCES category(id),
    CONSTRAINT FK_model3d_subcategory_id FOREIGN KEY (subcategory_id) REFERENCES subcategory(id),
    CONSTRAINT FK_model3d_addedBy FOREIGN KEY (addedBy) REFERENCES user(id)
);

CREATE TABLE model3d_like (
    model3dId INT NOT NULL,
    userId INT NOT NULL,
    date DATETIME NOT NULL,

    CONSTRAINT FK__model3d_like__model3dId FOREIGN KEY (model3dId) REFERENCES model3d(id),
    CONSTRAINT FK__model3d_like__userId FOREIGN KEY (userId) REFERENCES user(id),
    PRIMARY KEY (model3dId, userId)
);

CREATE TABLE model3d_favorite (
    model3dId INT NOT NULL,
    userId INT NOT NULL,
    date DATETIME NOT NULL,

    CONSTRAINT FK__model3d_favorite__model3dId FOREIGN KEY (model3dId) REFERENCES model3d(id),
    CONSTRAINT FK__model3d_favorite__userId FOREIGN KEY (userId) REFERENCES user(id),
    PRIMARY KEY (model3dId, userId)
);

CREATE TABLE purchasedModels (
    model3dId INT NOT NULL,
    userId INT NOT NULL,
    date DATETIME NOT NULL,

    CONSTRAINT FK__purchasedModels__model3dId FOREIGN KEY (model3dId) REFERENCES model3d(id),
    CONSTRAINT FK__purchasedModels__userId FOREIGN KEY (userId) REFERENCES user(id),
    PRIMARY KEY (model3dId, userId)
);

-- creareting model3d_tag intermediate table
CREATE TABLE model3d_tag (
    model_id INT NOT NULL,
    tag_id INT NOT NULL,

    CONSTRAINT FK_model3d_tag_model_id FOREIGN KEY (model_id) REFERENCES model3d(id),
    CONSTRAINT FK_model3d_tag_tag_id FOREIGN KEY (tag_id) REFERENCES modelTag(id),
    PRIMARY KEY (model_id, tag_id)
);

-- creating model3dFormat
CREATE TABLE modelFormat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    format VARCHAR(10) UNIQUE
);

-- creareting model3d_format intermediate table
CREATE TABLE model3d_format (
    modelId INT NOT NULL,
    formatId INT NOT NULL,

    CONSTRAINT FK__model3d_format__modelId FOREIGN KEY (modelId) REFERENCES model3d(id),
    CONSTRAINT FK__model3d_format__formatId FOREIGN KEY (formatId) REFERENCES modelFormat(id),
    PRIMARY KEY (modelId, formatId)
);

-- to show all tables
SHOW TABLES;

-- to describe the table
describe user;

-- to alter tables
ALTER TABLE `table name` MODIFY COLUMN `column name` VARCHAR("length");
ALTER TABLE subcategory DROP INDEX name;

-- add field to table
ALTER TABLE user ADD isActive BOOL DEFAULT 0 NOt NULL;
ALTER TABLE user ADD isFacebook BOOL DEFAULT 0;
ALTER TABLE user ADD isGoogle BOOL DEFAULT 0;

ALTER TABLE user ADD description VARCHAR(1000);
ALTER TABLE model3d ADD creatorId INT;
ALTER TABLE model3d ADD CONSTRAINT FK_model3d_creatorId FOREIGN KEY (creatorId) REFERENCES user(id);
ALTER TABLE model3d ADD reference VARCHAR(50) NOT NULL UNIQUE;
ALTER TABLE model3d ADD modelPath VARCHAR(255);
ALTER TABLE model3d ADD colliderPath VARCHAR(255);
ALTER TABLE model3d ADD shadowPath VARCHAR(255);
ALTER TABLE model3d ADD textureAPath VARCHAR(255);
ALTER TABLE model3d ADD textureBCPath VARCHAR(255);
ALTER TABLE model3d ADD textureNPath VARCHAR(255);
ALTER TABLE model3d ADD textureRPath VARCHAR(255);
ALTER TABLE model3d ADD zipPath VARCHAR(255);

ALTER TABLE model3d ADD addedBy INT;
ALTER TABLE model3d ADD CONSTRAINT FK_model3d_addedBy FOREIGN KEY (addedBy) REFERENCES user(id);
ALTER TABLE model3d ADD dateOfAdition DATETIME NOT NULL;

ALTER TABLE user_tag ADD PRIMARY KEY (user_id, tag_id);
ALTER TABLE user_role ADD PRIMARY KEY (user_id, role_id);

ALTER TABLE category ADD colorlessImagePath VARCHAR(255);

ALTER TABLE user ADD url VARCHAR(255);

