const mongoose = require('mongoose')

const monsterSchema = new mongoose.Schema({
    monster_name: String,
    level: Number,
    attack: Number,
    defense: Number,
    special_feature: String,
    symbol: String
})

const monsterClass = mongoose.model('monsterSchema', monsterSchema, 'Monsters')

module.exports = {
    getUserClass
}
