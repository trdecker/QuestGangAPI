/**
 * @file characterModel.js
 * @date 11/4/2023
 */

const mongoose = require("mongoose")
const tempClassID = Math.floor(Math.random() * 3) + 1
const now = Date.now()
const rand = Math.floor(Math.random() * 10000)
const userId = now.toString() + rand.toString()
const itemSchema = require("./itemModel").itemSchema
const itemModel = require("../models/itemModel")
const { userStatus, itemType } = require('../types')

const characterSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: { type: String, default: "testUser" },
  userId: { type: String, default: userId },
  classId: { type: Number, default: tempClassID },
  attack: { type: Number, default: 1 },
  defense: { type: Number, default: 1 },
  gold: { type: Number, default: 10 },
  status: {
      userStatus: { type: String, default: userStatus.NOT_IN_QUEST},
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
    condition: {type: String, default: ""},
    level: {type: Number, default: 1},
    mana: {type: Number, default: 20},
    hp: {type: Number, default: 30},
    armor: [{
        id: {type: String, default: "998"},
        name: {type: String, default: "Ye Olde KFC Bucket"},
        type: {type: String, default: itemType.ARMOR},
        defense: {type: Number, default: 2},
        sellPrice: {type: Number, default: 1},
        description: {type: String, default: "A bucket from the KFC in the town of Ye Olde."},
        equipped: {type: Boolean, default: true}
    }],
    items: [itemSchema],
    weapons: [{
        id: {type: String, default: "999"},
        name: {type: String, default: "Used Shovel"},
        type: {type: String, default: itemType.WEAPON},
        damage: {type: Number, default: 4},
        sellPrice: {type: Number, default: 1},
        description: {type: String, default: "A used shovel. It's not very effective."},
        equipped: {type: Boolean, default: true}
    }]
})

const characterModel = mongoose.model(
  "character",
  characterSchema,
  "characters"
)

/**
 * @param {Object} character
 * @returns
 */
function createCharacter(character) {
  const newCharacter = new characterModel(character);
  return newCharacter.save();
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
 * @param {String} username
 * @returns {Object} The character found
 */
async function getCharacterWithUsername(username) {
  try {
    const character = await characterModel.findOne({ username: username }).exec()
    return character
  } catch (e) {
    console.error("Error while getting character")
    throw e
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
    );
  } catch (e) {
    console.error("Error updating character status");
    throw e;
  }
}

/**
 * Update the stats of a character, which include their condition, level, mana, or hp.
 * @param {Object} user
 */
async function updateCharacterStats(user) {
  try {
    await characterModel.findOneAndUpdate(
      { userId: user.userId },
      {
        $set: {
          condition: user.condition,
          level: user.level,
          mana: user.mana,
          hp: user.hp,
        },
      },
      { new: true }
    );
  } catch (e) {
    console.error("Error updating character stats");
    throw e;
  }
}

async function addItemToInventory(itemId, characterId) {
    try {
        // Fetch item details from the item database/model.
        const item = await itemModel.getItem(itemId);
        if (!item) {
            throw new Error("Item not found");
        }

        if (item[0].type === 'weapon' || item[0].type === 'armor') {
            item[0].equipped = false; // or true, depending on your default requirement
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

        console.log('Item added successfully');
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

/**
 * @description Equip (or unequip) and item
 * @param {String} userId
 * @param {String} itemId
 * @param {String} type
 * @param {Boolean} equip 
 */
async function equipItemInInventory(userId, itemId, type, equip) {
    try {
        let updateField
        if (type === itemType.WEAPON)
            updateField = 'weapon.$[item].equipped'
        else if (type === itemType.ARMOR)
            updateField = 'armor.$[item].equipped'
        else
            return
        await characterModel.findOneAndUpdate(
            { userId: userId },
            {
                $set: {
                    updateField: equip
                }
            },
            { 
                new: true,
                arrayFilters: [{ 'item.id': itemId }]
            }
        )


    } catch (e) {
        console.error(e)
        throw ('Error equipping item')
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
        console.error(e);
        throw new Error("Error removing item from inventory");
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
        console.error(e);
        throw new Error("Error removing item from inventory");
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
        console.error(e)
        throw new Error("Error removing item from inventory")
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
        console.error(e)
        throw new Error("Error removing item from inventory")
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
    characterModel,
    addItemToInventory,
    removeItemFromInventory,
    equipItemInInventory
}
