// Import the monster model from the relative path
const monsterModel = require('../models/monsterModel')

// Asynchronously defines a function to get a random monster
async function getRandomMonster(req, res) {
    try {
        console.log("In get random monster")
        // Generate a random monster ID between 1 and 10
        const monsterId = Math.floor(Math.random() * 10) + 1

        // Await the retrieval of the monster from the model using the generated monster ID
        const randomMonster = await monsterModel.getSpecifiedMonster(monsterId)

        // TODO: Implement user level from request, defaulting to 1 if not provided
        const userLevel = req.query.userLevel || 1; // Assuming user level is passed as a query parameter

        // Scale monster stats based on user level
        if (randomMonster && randomMonster.length > 0) {
            const scaledMonster = {
                ...randomMonster[0],
                attack: randomMonster[0].attack * userLevel,
                defense: randomMonster[0].defense * userLevel
            };

            // Respond with the scaled monster in JSON format
            res.json(scaledMonster);
        } else {
            // Else send a 404
            res.status(404).json({ error: 'Monster not found' })
        }

    } catch (err) {
        // Log the caught error
        console.error(err);

        // Respond with a 500 status code and an error message in JSON format
        res.status(500).json({
            error: 'Internal Server Error',
            description: err.message // Changed 'e' to 'err.message' for correct error messaging
        });
    }
}

// Export the functions for external use
module.exports = {
    getRandomMonster
}
