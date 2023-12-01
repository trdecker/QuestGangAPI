const character = require("../models/characterModel");
const { conditions, userStatus } = require("../types");
const json = require("../../assets/items.json");
const itemModel = require("../models/itemModel");

async function addItemToInventory(req, res) {
    try {
      const { characterId, itemId } = req.body;
  
      // Fetch item details from the item database/model.
      const item = await itemModel.getItem(itemId);
      if (!item) {
        console.log("Item not found");
        return res.status(404).send("Item not found");
      }
  
      // Fetch the character from the database
      let characterbro = await character.getCharacter(characterId);
      if (!characterbro) {
        console.log("Character not found");
        return res.status(404).send("Character not found");
      }
      console.log("Json:")
      console.log(characterbro); // To check the structure of characterbro
      console.log("CharacterItems:")
      console.log(characterbro[0].items); // To check the state of items
      
      // Add the item to the character's inventory
      characterbro.items.push(item);
  
      // Update the character in the database
      await characterbro.findOneAndUpdate(
        { userId: userId },
                { $set: { status: characterStatus } }, 
                { new: true }
            );
  
      res.json(characterbro); // Sending the updated character as a response
    } catch (e) {
      console.error(e);
      res.status(500).send("Error adding item to inventory");
    }
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
