const mongoose = require('mongoose')

const monsterSchema = new mongoose.Schema({
    monsterName: String,
    level: Number,
    attack: Number,
    defense: Number,
    specialFeature: String,
    symbol: String,
    monsterID: Number,
    condition: String
})

const monsterModel = mongoose.model('monster', monsterSchema, 'monsters')

async function getSpecifiedMonster(monsterId) {
    try {
        const newMonster = await monsterModel.find({ monsterId: monsterId })
        return newMonster
    } catch (e) {
        console.error('Error while getting monster')
        throw (e)
    }
}

module.exports = {
    getSpecifiedMonster
}
