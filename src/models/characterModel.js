/**
 * @file characterModel.js
 * @date 11/4/2023
 */

const mongoose = require('mongoose')
const quest = require('./questModel')
const tempClassID = Math.floor(Math.random() * 3) + 1
const now = Date.now()
const rand = Math.floor(Math.random() * 10000)
const userId = now.toString() + rand.toString()
const itemSchema = require('./itemModel').itemSchema
const itemModel = require("../models/itemModel");

const characterSchema = new mongoose.Schema({
    username: String,
    password: String, // TODO: HASH THIS
    name: {type: String, default: "testUser"},
    userId: {type: String, default: userId},
    classId:{type: Number, default: tempClassID},
    gold: {type: Number, default: 10},
    status: {
        userStatus: {type: String, default: "NOT_IN_QUEST"},
        choices: {type: [String], default: []}, // Include ONLY for when status is IN_QUEST
        actions: {type: [String], default: []}, // Include ONLY for when status is IN_COMBAT
        questId: {type: String, default: ""},
        locationId: {type: String, default: ""}
    },
    condition: {type: String, default: ""},
    level: {type: Number, default: 1},
    mana: {type: Number, default: 20},
    hp: {type: Number, default: 30},
    armor: [{
        id: {type: Number, default: 998},
        name: {type: String, default: "Ye Olde KFC Bucket"},
        type: {type: String, default: "armor"},
        defense: {type: Number, default: 2},
        sellPrice: {type: Number, default: 1},
        description: {type: String, default: "A bucket from the KFC in the town of Ye Olde."}
    }],
    items: [itemSchema],
    weapons: [{
        id: {type: Number, default: 999},
        name: {type: String, default: "Used Shovel"},
        type: {type: String, default: "weapon"},
        damage: {type: Number, default: 4},
        sellPrice: {type: Number, default: 1},
        description: {type: String, default: "A used shovel. It's not very effective."}
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
        const character = await characterModel.findOne({ userId: userId }).exec();
        return character;
        
    } catch (e) {
        console.error('Error while getting character');
        throw (e);
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

async function addItemToInventory(itemId, characterId) {
    try {
        // Fetch item details from the item database/model.
        const item = await itemModel.getItem(itemId);
        if (!item) {
            throw new Error("Item not found");
        }

        // Use findOneAndUpdate on the character model
        const updatedCharacter = await characterModel.findOneAndUpdate(
            { userId: characterId },
            { $push: { items: item } },
            { new: true }
        );

        if (!updatedCharacter) {
            throw new Error("Character not found");
        }

        console.log('Item added successfully', updatedCharacter);
        return updatedCharacter; // Returning the updated character
    } catch (e) {
        console.error(e);
        throw new Error("Error adding item to inventory");
    }
}

async function removeItemFromInventory(itemId, characterId) {
    try {
        // Check if the item exists in the item database/model.
        const item = await itemModel.getItem(itemId);
        if (!item) {
            throw new Error("Item not found");
        }

        // Use findOneAndUpdate to remove the item from the character's inventory
        const updatedCharacter = await characterModel.findOneAndUpdate(
            { userId: characterId },
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        if (!updatedCharacter) {
            throw new Error("Character not found");
        }

        console.log('Item removed successfully', updatedCharacter);
        return updatedCharacter; // Returning the updated character
    } catch (e) {
        console.error(e);
        throw new Error("Error removing item from inventory");
    }
}



  
module.exports = {
    createCharacter,
    getCharacter,
    updateStatus,
    getCharacterWithUsername,
    updateStatus,
    updateCharacterStats,
    characterModel,
    addItemToInventory,
    removeItemFromInventory,
}
