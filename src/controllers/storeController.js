const character = require('../models/characterModel')
const { conditions, userStatus } = require('../types')
const json = require('../../assets/items.json')
const itemModel = require('../models/itemModel')

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

async function sellItem(req, res) {
    try {
        const sellingItem = req.query.itemId
        const username = req.body.username
        const character = req.body.character
        if (!character || !character.items) {
            res.status(400).send('Invalid character or character items');
            return;
        }
        else if (character.items.find((item) => item.itemId == sellingItem) == undefined) {
            res.status(400).send('Item not in inventory')
            return
        }
        else {
            const sellPrice = json.items.find((item) => item.id == sellingItem).price
        }
    } catch (e) {
        console.error(e)
        res.status(500).send('Error selling item')
    }
}

async function buyItem(req, res) {
    try {
        const username = req.body.username
        const itemId = req.body.itemId
        const test = json.items.find((item) => item.id == itemId)
        console.log(test)
        const test2 = await itemModel.getItem(itemId)
        if (test2.length == 0) {
            res.status(404).send('No item found with that id')
            return
        }
        console.log(test2)
        // const price = item.price
        // const character = await character.getCharacterWithUsername(username)
        // const gold = character.gold
        // if (gold < price) {
        //     res.status(400).send('Not enough gold')
        //     return
        // }
        // character.gold = gold - price
        // character.items.push({itemId: itemId})
        // character.save()
        res.send("success")
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