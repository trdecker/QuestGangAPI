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
    attack: { type: Number, default: 1 },
    defense: { type: Number, default: 1 },
    gold: Number,
    status: {
        userStatus: String,
        // Include ONLY for when status is IN_QUEST
        choices: [{ 
            name: String,
            locationId: String
         }],
        // Include ONLY for when status is IN_COMBAT
        actions: [String],
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
        defense: Number,
        equipped: Boolean
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
        type: String,
        equipped: Boolean
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
 * @description find a user using a userId
 * @param {String} userId 
 * @returns {Object} The character found
 */
async function getCharacter(userId) {
    try {
        const characters = await characterModel.find({ userId: userId }).exec()
        if (characters.length === 0)
            return null
        return characters.at(0)
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

/**
 * Update the character status. CharacterStatus object MUST follow the status schema given in characterModel.js!
 * @param {String} userId 
 * @param {Object} characterStatus 
 */
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

/**
 * Update the stats of a character, which include their condition, level, mana, or hp. TODO: Separate levelling up in a different function?
 * @param {Object} user 
 */
async function updateCharacterStats(user) {
    try {
        await characterModel.findOneAndUpdate(
            { userId: user.userId },
            { $set: { 
                condition: user.condition,
                level: user.level,
                mana: user.mana,
                hp: user.hp
             } }, 
            { new: true }
        )
    } catch (e) {
        console.error('Error updating character stats')
        throw (e)
    }
}

/**
 * Update the amoung of gold a user has.
 * @param {String} userId 
 * @param {Number} gold 
 */
async function updateCharacterGold(userId, gold) {
    try {
        await characterModel.findOneAndUpdate(
            { userId: userId },
            { $set: { 
                gold: gold
             } }, 
            { new: true }
        )
    } catch (e) {
        console.error('Error updating gold')
        throw (e)
    }
}

async function levelUpCharacter(user) {
    try {
        user.level = user.level + 1
        user.attack = user.attack + user.level
        user.defense = user.defense + user.level
        user.hp = (10 * user.level) + 20

        await characterModel.findOneAndUpdate(
            { userId: user.userId },
            { $set: { 
                level: user.level,
                attack: user.attack,
                defense: user.defense,
                hp: user.hp 
             } }, 
            { new: true }
        )

        return user
    } catch (e) {
        console.error('Error updating level')
        throw (e)
    }
}

module.exports = {
    createCharacter,
    getCharacter,
    updateStatus,
    getCharacterWithUsername,
    updateStatus,
    updateCharacterStats,
    updateCharacterGold,
    levelUpCharacter,
    characterModel
}
