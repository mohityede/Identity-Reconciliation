-- create contact table
CREATE TABLE Contact (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    phoneNumber VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    linkedId INT NULL,
    linkPrecedence ENUM('primary', 'secondary') NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (linkedId) REFERENCES Contact(id)
);

-- find user whow has both phoneNumver and email;
SELECT * FROM Contact
WHERE email=? AND phoneNumber=?;

-- find all user who has give email or phoneNumber common
SELECT * FROM Contact
WHERE email=? OR phoneNumber=?
ORDER BY createdAt ASC;

-- Insert new primary phone and email
INSERT INTO Contact(phoneNumber,email) VALUES (?,?);

-- update linkedId and linkPrecidence of secondary contacts
UPDATE Contact SET linkedId=?, linkPrecedence=? WHERE id=?;

-- Insert new secondary contact
INSERT INTO Contact(phoneNumber,email,linkedId,linkPrecedence) VALUES(?,?,?,?);