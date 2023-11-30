const character = require('../models/characterModel')
const { conditions, userStatus } = require('../types')
const json = require('../../assets/items.json')
const itemModel = require('../models/itemModel')
const questModel = require('../models/questModel')

/**
 * @deprecated Replace with sign in call
 * @param {Object} req 
 * @param {Object} res 
 */
function newCharacter(req, res) {
    try {
        let userClassId
        if (req.body.classId && req.body.classId < 4 && req.body.classId > 0) {
            userClassId = req.body.classId
        } else {
            userClassId = Math.floor(Math.random() * 3) + 1
        }
        let weapons = []
            switch (userClassId) {
                case 1:
                    weapons.push({weaponId: 1})
                    break
                case 2:
                    weapons.push({weaponId: 2})
                    break
                case 3:
                    weapons.push({weaponId: 3})
                    break
                default:
            }
        let items = []
        switch (userClassId) {
            case 1:
                items.push({itemId: 1})
                break
            case 2:
                items.push({itemId: 2})
                break
            case 3:
                items.push({itemId: 1})
                break
            default:
        }
        let armor = []
        switch (userClassId) {
            case 1:
                armor.push({armorId: 1})
                break
            case 2:
                armor.push({armorId: 2})
                break
            case 3:
                armor.push({armorId: 3})
                break
            default:
        }

        const newCharacter = {
            name: req.body.name,
            classId: userClassId,
            status: {
                status: userStatus.NOT_IN_QUEST,
                eventId: null,
                locationId: null
            },
            condition: conditions.NORMAL,
            level: 1,
            hp: 30,
            mana: 20,
            weapons,
            items,
            armor,
            gold: 10
        }

        character.createCharacter(newCharacter)

        res.send("success")

    } catch (e) {
        console.error(e)
        res.status(500).send('Internal error')
    }
}
 
async function getCharacterInventory(req, res) {
    try {
        const username = req.query.username
        console.log(username)
 
        // Require a user ID
        if (!username) {
            res.status(400).send('User ID is a required field')
            return
        }
 
        const characters = await character.getCharacterWithUsername(username)
 
        // Return 404 if no user found
        if (characters.length === 0) {
            res.status(404).send('No character found with that username')
            return
        }
 
        const found = characters.at(0)

        const inventory = { 
            weapons: found.weapons,
            items: found.items,
            armor: found.armor
        }
 
        res.json(inventory)
    } catch (e) {
        console.error(e)
        res.status(500).send('Error getting character')
    }
}

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

async function buyItem(req, res) {
    try {
        const username = req.body.username
        const itemId = req.body.itemId
        const test = json.items.find((item) => item.id === itemId)
        console.log(test)
        const test2 = await itemModel.getItem(itemId)
        if (test2.length === 0) {
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

/**
 * @description Sign up
 * @param {Object} req 
 * @param {Object} res 
 */
async function signup(req, res) {
    try {
        const username = req.body.username
        const password = req.body.password

        // Require a username and password
        if (!username || !password) {
            res.status(400).send('Username and password are required fields')
            return
        }

        // Check if username is already taken
        // const characters = await character.getCharacterWithUsername(username)

        if (characters.length > 0) {
            res.status(400).send('Username already taken')
            return
        }

        // Create a new character
        const newCharacter = new characterModel({
            username,
            password
        })

        newCharacter.save()
        .then(() => res.json('Character added!'))
        .catch(err => res.status(400).json('Error: ' + err))

        // await character.createCharacter(newCharacter)

        res.send('success')
    } catch (e) {
        console.error(e)
        res.status(500).send('Error creating character')
    }
}

async function getCharacter(req, res) {
    try {
        const username = req.query.username
        console.log(username)

        // Require a user ID
        if (!username) {
            res.status(400).send('User ID is a required field')
            return
        }

        const characters = await character.getCharacterWithUsername(username)

        // Return 404 if no user found
        if (characters.length === 0) {
            res.status(404).send('No character found with that username')
            return
        }

        // Return the character WITHOUT the hashed password
        const found = characters.at(0)

        const json = {
            username: found.username,
            userId: found.userId,
            name: found.name,
            classId: found.classId,
            status: found.status,
            condition: found.condition,
            level: found.level,
            mana: found.mana,
            hp: found.hp,
            armor: found.armor,
            items: found.items,
            weapons: found.weapons,
            gold: found.gold
        }

        res.json(json)
    } catch (e) {
        console.error(e)
        res.status(500).send('Error getting character')
    }
}

/**
 * Returns the status objects along with the users hp, level, gold, condition, class, and mana.
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
async function getCharacterStatus(req, res) {
    try {
        const username = req.query.username
        console.log(username)

        // Require a user ID
        if (!username) {
            res.status(400).send('User ID is a required field')
            return
        }

        const characters = await character.getCharacterWithUsername(username)

        // Return 404 if no user found
        if (characters.length === 0) {
            res.status(404).send('No character found with that username')
            return
        }

        // Return the character WITHOUT the hashed password
        const user = characters.at(0)

        // TODO: Retrieve class associated with classId and return the class information
        const result = {
            status: user.status,
            name: user.name,
            userId: user.userId,
            classId: user.classId,
            condition: user.condition,
            level: user.level,
            mana: user.mana,
            hp: user.hp,
            attack: user.attack,
            defense: user.defense
        }
        if (user.status.userStatus === userStatus.IN_COMBAT) {
            const quest = await questModel.getQuest(user.status.questId)
            console.log(quest)
            const location = quest.locations.find((location) => location.locationId === user.status.locationId)
            console.log('location:', location)
            res.json({
                ...result,
                monstersInCombat: [location.monsters] // TODO: populate this field!
            })
        }
        else {
            res.json(result)
        }
        
    } catch (e) {
        console.error(e)
        res.status(500).send('Error getting character')
    }
}

module.exports = {
    newCharacter,
    getCharacterInventory,
    getStore,
    buyItem,
    getCharacter,
    getCharacterStatus,
    signup,
}
