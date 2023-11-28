/**
 * @file characterModel.js
 * @date 11/4/2023
 */

const mongoose = require('mongoose')

const characterSchema = new mongoose.Schema({
    username: String,
    password: String, // TODO: HASH THIS
    name: String,
    userId: String,
    classId: Number,
    gold: Number,
    status: {
        userStatus: String,
        choices: [String], // Include ONLY for when status is IN_QUEST
        actions: [String], // Include ONLY for when status is IN_COMBAT
        questId: String,
        locationId: String
    },
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
    }],
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
 * @description find a user using a userId
 * @param {String} userId 
 * @returns {Object} The character found
 */
async function getCharacter(userId) {
    try {
        const character = await characterModel.find({ userId: userId }).exec()
        return character
    } catch (e) {
        console.error('Error while getting character')
        throw (e)
    }
}

/**
 * @description Find a character -- but with a username!
 * @param {String} userId 
 * @returns {Object} The character found
 */
async function getCharacterWithUsername(username) {
    try {
        const character = await characterModel.find({ username: username }).exec()
        return character
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
    updateStatus,
    userStatus,
    getCharacterWithUsername,
    updateStatus,
    characterModel
}
