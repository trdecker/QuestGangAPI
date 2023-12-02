const characterModel = require('../models/characterModel')
const bcrypt = require('bcrypt')
const { conditions, userStatus } = require('../types')
const json = require('../../assets/items.json')
const itemModel = require('../models/itemModel')
const characterController = require('../controllers/characterController');
const jwt = require('jsonwebtoken');


const { config } = require('dotenv');





/**
 * // 
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

        req.body.createCharacter(newCharacter)


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

async function login(req, res){
    try{
        const username = req.body.username
        const password = req.body.password

        // Require a username and password
        if (!username || !password) {
            res.status(400).send('Username and password are required fields')
            return
        }

        // Check if username is already taken
        const characters = await characterModel.getCharacterWithUsername(username)

        if (characters.length == 0) {
            res.status(400).send('Username not found')
            return
        }

        const found = characters.at(0)

        const match = await bcrypt.compare(password, found.password)

        const payload = {
            userId: found.userId,
            username: found.username
        }


        if (match) {
            const token = jwt.sign(payload, process.env.KEY, {expiresIn: '3h'})
            res.json({
                username,
                userId: found.userId,
                token
            })
        } else {
            res.status(400).send('Incorrect password')
        }
    } catch (e) {
        console.error(e)
        res.status(500).send('Error logging in')
    }
}

/**
 * @description Get the details about a character
 * @param {Object} req 
 * @param {Object} res 
 */
async function signup(req, res) {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        const username = req.body.username
        const password = hashedPassword

        // Require a username and password
        if (!username || !password) {
            res.status(400).send('Username and password are required fields')
            return
        }

        // Check if username is already taken
        // const characters = await character.getCharacterWithUsername(username)

        // if (characters.length > 0) {
        //     res.status(400).send('Username already taken')
        //     return
        // }

        // Create a new character
        const newCharacter = {
            username: username,
            password: password
            //TODO add weapons, items, armor

        }
        const character = await characterModel.createCharacter(newCharacter)
        // characterController.newCharacter(character)

        character.save()
        .then(() => res.json('Character added!').send('success'))
        .catch(err => res.status(400).json('Error: ' + err))


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
        const found = characters.at(0)

        // TODO: If in combat, display the monsters you are fighting
        // TODO: Retrieve class associated with classId and return the class information
        if (found.status.userStatus === userStatus.IN_COMBAT) {
            // const quest = questModel.get
            res.json({
                status: found.status,
                name: found.name,
                userId: found.userId,
                classId: found.classId,
                condition: found.condition,
                level: found.level,
                mana: found.mana,
                hp: found.hp,
                monstersInCombat: []
            })
        }
        else {
            res.json({
                status: found.status,
                name: found.name,
                userId: found.userId,
                classId: found.classId,
                condition: found.condition,
                level: found.level,
                mana: found.mana,
                hp: found.hp
            })
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
    login
}
