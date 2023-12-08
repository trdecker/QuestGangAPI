const { conditions, userStatus } = require('../types')
const json = require('../../assets/items.json')
const itemModel = require('../models/itemModel')
const characterSetup = require('../models/characterModel')

/**
 * @deprecated Replace with sign in call
 * @param {Object} req 
 * @param {Object} res 
 */

async function getStore(req, res) {
    try {

        const items = json.items
        const store = []
        for (let i = 0; i < 3; i++) {
            store.push(items.at(Math.floor(Math.random() * items.length)))
        }
           
    
        res.json(store)
    } catch (e) {
        console.error(e)
        res.status(500).send('Error getting store')
    }
}

// 'sellItem' used to handle item selling requests.
async function sellItem(req, res) {
    try {
        const userID = req.body.userId
        const itemId = req.body.itemId
        const item2sell = await itemModel.getItem(itemId)
        if (item2sell.length == 0) {
            res.status(404).send('No item found with that id')
            return
        }
        const character = await characterSetup.getCharacter(userID)
        if (character.items.length == 0) {
            res.status(400).send('No items to sell')
            return
        }
        const itemIndex = character.items.findIndex((item) => item.id == itemId)
        if (itemIndex == -1) {
            res.status(400).send('Item not found in inventory')
            return
        }
        character.items.splice(itemIndex, 1)
        character.gold += item2sell[0].sellPriceInGold
        const updatedCharacter = await characterSetup.characterModel.findOneAndUpdate(
            { userId: userID },
            { $set: { gold: character.gold, items: character.items } },
            { new: true }
        );
        res.send(updatedCharacter)
    } catch (e) {
        console.error(e)
        res.status(500).send('Error selling item')
    }
}



async function buyItem(req, res) {
    try {
        const userID = req.body.userId
        const itemId = req.body.itemId
        const test = json.items.find((item) => item.id == itemId)
        const item2buy = await itemModel.getItem(itemId)
        if (item2buy.length == 0) {
            res.status(404).send('No item found with that id')
            return
        }
        const character = await characterSetup.getCharacter(userID)
        if (character.gold < item2buy[0].sellPriceInGold) {
            res.status(400).send('Not enough gold')
            return
        }
        await characterSetup.addItemToInventory(itemId, userID)
        character.gold -= item2buy[0].sellPriceInGold
        console.log(character.gold)
        const updatedCharacter = await characterSetup.characterModel.findOneAndUpdate(
            { userId: userID },
            { $set: { gold: character.gold } },
            { new: true }
        );
        res.send(updatedCharacter)
    } catch (e) {
        console.error(e)
        res.status(500).send('Error buying item')
    }
}

module.exports = {
    getStore,
    buyItem,
    sellItem,
}