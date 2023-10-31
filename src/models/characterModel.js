const mongoose = require('mongoose')
// const conditions = require('../types')

/*
{
"_id":{"$oid":"653ab8ffa4949f0d1e9d9379"},
"userId":"12345",
"armor":[{"name":"Armor of coolness","armorId":{"$numberInt":"123"},"defense":{"$numberInt":"10"}}],
"classId":"1",
"condition":"N",
"hp":{"$numberInt":"30"},
"items":[{"name":"Potion of healing","type":"health","mod":{"$numberInt":"10"}}],
"level":"1",
"mana":{"$numberInt":"20"},
"status":"N","weapons":[{"name":"Dagger of Paralyzing","weaponId":{"$numberInt":"123"},"damageMod":{"$numberInt":"5"},"condEffect":"P","type":"Dagger"}]
}
*/

const characterSchema = new mongoose.Schema({
    className: String,
    userId: Number,
    classSymbol: String,
    classId: Number,
    status: String
})

const character = mongoose.model('character', characterSchema, 'characters')

module.exports = {
    character
}
