const character = require("../models/characterModel");
const { conditions, userStatus } = require("../types");
const json = require("../../assets/items.json");
const itemModel = require("../models/itemModel");

async function addItemToInventory(req, res) {
    try {
      // Extracting characterId and itemId from the request's body.
      const { characterId, itemId } = req.body;
  
      // Fetching item details from the item database/model.
      const item = await itemModel.getItem(itemId);
      if (!item) {
        res.status(404).send("No item found with that id");
        return;
      }
  
      // Fetching the character from the character database/model.
      const character = await characterModel.findById(characterId);
      if (!character) {
        res.status(404).send("Character not found");
        return;
      }
  
      // Adding the complete item data to the character's inventory.
      character.items.push(item);
  
      // Saving the updated character in the MongoDB.
      await character.save();
  
      // Sending back the updated character data as a JSON response.
      res.json(character);
    } catch (e) {
      // Catching and logging any errors that occur during the process.
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

module.exports = {
  addItemToInventory,
  removeItemfromInventory,
};
