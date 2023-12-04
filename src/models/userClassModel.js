// Import the mongoose library for interacting with MongoDB
const mongoose = require('mongoose');

// Define a schema for the user class model using the mongoose.Schema
const userClassSchema = new mongoose.Schema({
    className: String, // Name of the class (e.g., "Barbarian")
    classSymbol: String, // Symbol representing the class (e.g., "BARBARIAN")
    classId: Number // Unique identifier for the class (e.g., 3)
});

/*
Example of a user class document:
{
    className: "Barbarian",
    classSymbol: "BARBARIAN",
    classId: 3
}
*/

// Create a mongoose model named 'userClass' with the defined schema and specify the collection name 'Classes'
const userClass = mongoose.model('userClass', userClassSchema, 'Classes');

/**
 * Return a class given a classId. Range is 1-3 INCLUSIVE
 * @param {Number} classId - The unique identifier for the class to retrieve
 * @returns {Promise<Array>} - A promise that resolves to an array of matching user class documents
 */
async function getUserClass(classId) {
    // Define a query object to search for a class with the given classId
    const query = { classId: classId };

    // Log the query to the console
    console.log(query);

    // Perform an asynchronous search in the database using the defined query
    const res = await userClass.find(query);

    // Log the result to the console
    console.log('res', res);

    // Return the result of the query
    return res;
}

// Export the getUserClass function for external use
module.exports = {
    getUserClass
};
