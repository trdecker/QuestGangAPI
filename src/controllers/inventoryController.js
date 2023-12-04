const characterModel = require("../models/characterModel");
const { conditions, userStatus } = require("../types");
const json = require("../../assets/items.json");
const itemModel = require("../models/itemModel");

async function addItemToInventory(req, res) {
  await characterModel.addItemToInventory(req, res);
}
  
  

async function removeItemfromInventory(req, res) {
  //assume character is verified
  try {
    const itemId = req.body.itemId;
    const test = json.items.find((item) => item.id == itemId);
    console.log(test);
    const test2 = await itemModel.getItem(itemId);
    if (test2.length == 0) {
      res.status(404).send("No item found with that id");
    } else {
      const character = character[0];
      let inventory = character.inventory;
      inventory.push(item);
      await character.updateOne({ inventory: inventory });
      res.json(character);
    }

  } catch (e) {
    console.error(e);
    res.status(500).send("Error adding item to inventory");
  }
}



async function getItem(itemId) {
    const Item = require('../models/itemModel'); // Import the Item model
    try {
        const item = await Item.findOne({ id: itemId }); // Assuming 'id' is the field name in your schema
        return item;
    } catch (e) {
        console.error("Error fetching item:", e);
        throw e; // Rethrow the error to handle it in the calling function
    }
}

/**
 * Updates the inventory of a character in the database.
 * @param {String} characterId - The unique identifier for the character.
 * @param {Array} newInventory - The updated array of items for the character.
 
async function saveCharacterInventory(characterId, newInventory) {
    try {
        await characterModel.findOneAndUpdate(
            { userId: characterId }, // Assumes userId is the unique identifier for characters
            { $set: { items: newInventory } },
            { new: true }
        );
    } catch (e) {
        console.error('Error updating character inventory');
        throw (e);
    }
}*/



module.exports = {
  addItemToInventory,
  removeItemfromInventory,
  getItem,
};
