const character = require("../models/characterModel");
const { conditions, userStatus } = require("../types");
const json = require("../../assets/items.json");
const itemModel = require("../models/itemModel");

async function addItemtoInventory(req, res) {
  //assume character is verified
  try {
    const username = req.body.username;
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

async function removeItemfromInventory(req, res) {
  //assume character is verified
  try {
    const username = req.body.username;
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
  addItemtoInventory,
  removeItemfromInventory,
};
