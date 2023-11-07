/**
 * @file characterModel.js
 * @date 11/4/2023
 */

const mongoose = require('mongoose')
const { userStatus } = require('../types')

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

/**
 * @param {Object} character 
 * @returns 
 */
function createCharacter(character) {
    const newCharacter = new characterModel(character)
    return newCharacter.save()
}

/**
 * @param {String} userId 
 * @returns {Object} The new character created
 */
async function getCharacter(userId) {
    try {
        const newCharacter = await characterModel.find({ userId: userId }).exec()
        return newCharacter
    } catch (e) {
        console.error('Error while getting character')
        throw (e)
    }
}

async function updateStatus(userId, characterStatus) {
    try {
        await characterModel.findOneAndUpdate(
                { userId: userId },
                { $set: { status: characterStatus } }, 
                { new: true }
            )
    } catch (e) {
        console.error('Error updating character status')
        throw (e)
    }
}

module.exports = {
    createCharacter,
    getCharacter,
    updateStatus
}
