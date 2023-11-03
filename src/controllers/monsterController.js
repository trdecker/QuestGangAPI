// Import the monster model from the relative path
const monsterModel = require('../models/monsterModel');

// Asynchronously defines a function to get a random monster
async function getRandomMonster(req, res) {
    try {
        console.log("In get random monster");
        // Generate a random monster ID between 1 and 10
        const monsterId = Math.floor(Math.random() * 10) + 1;
        console.log(monsterId);

        // Await the retrieval of the monster from the model using the generated monster ID
        const randomMonster = await monsterModel.getSpecifiedMonster(monsterId);
        console.log("Monster: " + randomMonster);

        // Respond with the retrieved monster in JSON format
        res.json(randomMonster);
    } catch (err) {
        // Log the caught error
        console.error(err);

        // Respond with a 500 status code and an error message in JSON format
        res.status(500).json({
            error: 'Internal Server Error',
            description: e
        });
    }
}

// Export the functions for external use
module.exports = {
    getRandomMonster,
};
