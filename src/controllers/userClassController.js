// Import the user class model from the relative path
const userClassModel = require('../models/userClassModel');

// Asynchronously defines a function to get a random user class
async function getRandomUserClass(req, res) {
    try {
        // Log a message indicating the start of the function execution
        console.log("In get random class");

        // Generate a random class ID between 1 and 3
        const classId = Math.floor(Math.random() * 3) + 1;

        // Await the retrieval of the user class from the model using the generated class ID
        const randomUserClass = await userClassModel.getUserClass(classId);

        // Log the retrieved class
        console.log("Class: " + randomUserClass);

        // Respond with the retrieved class in JSON format
        res.json(randomUserClass);
    } catch (e) {
        // Log the caught error
        console.error(e);

        // Respond with a 500 status code and an error message in JSON format
        res.status(500).json({
            error: 'Internal Server Error',
            description: e
        });
    }
}

// Asynchronously defines a function to get a user class by ID
async function getUserClass(req, res) {
    try {
        // Get the class ID from the request query, or generate a random one if not provided
        const classId = req.query.classId ?? Math.floor(Math.random() * 3) + 1;

        // Await the retrieval of the user class from the model using the class ID
        const userClass = await userClassModel.getUserClass(classId);

        // Respond with the retrieved class in JSON format
        res.json(userClass);
    } catch (e) {
        // Log the caught error
        console.error(e);

        // Respond with a 500 status code and an error message in JSON format
        res.status(500).json({
            error: 'Internal Server Error',
            description: e
        });
    }
}

// Export the functions for external use
module.exports = {
    getRandomUserClass,
    getUserClass
};
