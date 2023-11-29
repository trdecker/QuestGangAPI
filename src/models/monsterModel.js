const mongoose = require('mongoose')

const monsterSchema = new mongoose.Schema({
    monsterName: String,
    level: Number,
    attack: Number,
    defense: Number,
    specialFeature: String,
    symbol: String,
    monsterID: Number,
    condition: String,
    boss: Boolean
})

const monsterModel = mongoose.model('monster', monsterSchema, 'monsters')

async function getSpecifiedMonster(monsterId) {
    try {
        const result = await monsterModel.find({ monsterId: monsterId })
        if (result.length === 0)
            return null
        else return result[0]
    } catch (e) {
        console.error('Error while getting monster')
        throw (e)
    }
}

module.exports = {
    getSpecifiedMonster
}
