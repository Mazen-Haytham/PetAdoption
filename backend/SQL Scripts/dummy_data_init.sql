INSERT INTO Users(Name, Email, Password, Role, Status) --status(Approved, Rejected, Pending)
VALUES 
('Alice Johnson', 'alice.johnson@example.com', 'password111', 'adopter', 'Approved'),
('Michael Brown', 'michael.brown@example.com', 'password222', 'owner', 'Approved'),
('Emily Davis', 'emily.davis@example.com', 'password333', 'adopter', 'Approved'),
('David Wilson', 'david.wilson@example.com', 'password444', 'owner', 'Approved'),
('Sarah Miller', 'sarah.miller@example.com', 'password555', 'adopter', 'Rejected');

INSERT INTO Pets(OwnerId, Name, [Type], Breed, [Location], Age, [Status], CreatedAt) --status(Available, Adopted, Pending)
VALUES 
(1, 'Rocky', 'Dog', 'Bulldog', 'Houston', 5, 'Available', GETDATE()), --adopter
(2, 'Luna', 'Cat', 'Persian', 'San Diego', 1, 'Adopted', GETDATE()), --owner
(3, 'Max', 'Dog', 'German Shepherd', 'Dallas', 3, 'Available', GETDATE()), --adopter
(4, 'Bella', 'Cat', 'Maine Coon', 'San Jose', 2, 'Available', GETDATE()), --owner
(5, 'Coco', 'Bird', 'Parrot', 'Austin', 4, 'Available', GETDATE()); --adopter

INSERT INTO PetPosts(PetId, OwnerId, [Description], HealthStatus, [Status], CreatedAt)
VALUES 
(1, 1, 'Rocky is a strong and loyal bulldog, great with kids and families.', 'Healthy', 'Available', GETDATE()),
(2, 2, 'Luna is a calm Persian cat who has already found a loving home.', 'Healthy', 'Closed', GETDATE()),
(3, 3, 'Max is an energetic German Shepherd, perfect for active owners.', 'Healthy', 'Available', GETDATE()),
(4, 4, 'Bella is a gentle Maine Coon who loves attention and indoor life.', 'Healthy', 'Available', GETDATE()),
(5, 5, 'Coco is a colorful parrot that enjoys interaction and can mimic sounds.', 'Healthy', 'Available', GETDATE());

SELECT * FROM Users;
SELECT * FROM Pets;
SELECT * FROM PetPosts;

UPDATE PetPosts
SET [Status] = 'Adopted' WHERE PetId = 2;