/**
 * @file characterModel.js
 * @date 11/4/2023
 */

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
    name: String,
    userId: String,
    classId: Number,
    status: String,
    condition: String,
    level: Number,
    mana: Number,
    hp: Number,
    armor: [{
        name: String,
        armorId: Number,
        defense: Number
    }],
    items: [{
        name: String,
        type: String,
        mod: Number
    }],
    weapons: [{
        name: String,
        weaponId: Number,
        damageMod: Number,
        condEffect: String,
        type: String
    }]
})

const characterModel = mongoose.model('character', characterSchema, 'characters')

function createCharacter(character) {
    const newCharacter = new characterModel(character)
    return newCharacter.save()
}

async function getCharacter(userId) {
    try {
        const newCharacter = await characterModel.find({ userId: userId }).exec()
        return newCharacter
    } catch (e) {
        console.error('Error while getting character')
        throw (e)
    }
}

module.exports = {
    createCharacter,
    getCharacter
}
