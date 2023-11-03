const mongoose = require('mongoose')

const monsterSchema = new mongoose.Schema({
    monster_name: String,
    level: Number,
    attack: Number,
    defense: Number,
    special_feature: String,
    symbol: String,
    monsterID: Number,
    condition: String
})

const monsterClass = mongoose.model('monsterSchema', monsterSchema, 'Monsters')

async function getSpecifiedMonster(monsterId) {
    // Define a query object to search for a class with the given classId
    const query = { classId: monsterId };

    // Log the query to the console
    console.log(query);

    // Perform an asynchronous search in the database using the defined query
    const res = await monsterClass.find(query);

    // Log the result to the console
    console.log('res', res);

    // Return the result of the query
    return res;
}

module.exports = {
    getSpecifiedMonster
}
