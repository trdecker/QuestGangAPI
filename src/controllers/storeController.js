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

// 'sellItem' used to handle item selling requests.
async function sellItem(req, res) {
    try {
        // Extracting 'itemId' from the request's query parameters.
        const sellingItem = req.query.itemId

        // Extracting 'username' from the request's body.
        const username = req.body.username

        // Extracting 'character' object from the request's body.
        const character = req.body.character

        // Check if 'character' or 'character.items' is not defined or invalid.
        if (!character || !character.items) {
            // Sending a 400 Bad Request response indicating invalid character or items.
            res.status(400).send('Invalid character or character items');
            return;
        }
        // Check if the item to be sold is not found in the character's inventory.
        else if (character.items.find((item) => item.itemId == sellingItem) == undefined) {
            // Sending a 400 Bad Request response indicating the item is not in the inventory.
            res.status(400).send('Item not in inventory')
            return
        }
        else {
            const sellPrice = json.items.find((item) => item.id == sellingItem).sellPriceInGold
            
        }
    } catch (e) {
        // Catching and logging any errors that occur during the process.
        console.error(e)

        // Sending a 500 Internal Server Error response in case of an exception.
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