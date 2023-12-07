const characterModel = require('../models/characterModel')
const bcrypt = require('bcrypt')
const { conditions, userStatus } = require('../types')
const json = require('../../assets/items.json')
const itemModel = require('../models/itemModel')
const { itemType } = require('../types')
const jwt = require('jsonwebtoken')
const questModel = require('../models/questModel')

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

/**
 * @description Get a character's inventory
 * @param {Object} req 
 * @param {Object} res 
 */
async function getCharacterInventory(req, res) {
    try {
        const username = req.query.username
 
        // Require a user ID
        if (!username) {
            res.status(400).send('User ID is a required field')
            return
        }
 
        const character = await characterModel.getCharacterWithUsername(username)
 
        // Return 404 if no user found
        if (!character) {
            res.status(404).send('No character found with that username')
            return
        }

        res.json({
            weapons: character.weapons,
            items: character.items,
            armor: character.armor
        })
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
        const actualName = req.body.name
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
            name: actualName,
            username: username,
            password: password
            //TODO add weapons, items, armor

        }
        const character = await characterModel.createCharacter(newCharacter)
        // characterController.newCharacter(character)

        character.save()
        .then(() => res.json({
            name : character.name,
            username : character.username,
            password : character.password
        }))
        .catch(err => res.status(400).json('Error: ' + err))


    } catch (e) {
        console.error(e)
        res.status(500).send('Error creating character')
    }
}

/**
 * Get the character. User will pass username as a query
 * @param {Object} req 
 * @param {Object} res 
 */
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

        // Require a user ID
        if (!username) {
            res.status(400).send('Username is a required field')
            return
        }

        const user = await characterModel.getCharacterWithUsername(username)

        // Return 404 if no user found
        if (!user) {
            res.status(404).send('No character found with that username')
            return
        }

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
            defense: user.defense,
            gold: user.gold
        }
        if (user.status.userStatus === userStatus.IN_COMBAT) {
            const quest = await questModel.getQuest(user.status.questId)
            const location = quest.locations.find((location) => location.locationId === user.status.locationId)
            res.json({
                ...result,
                monstersInCombat: []
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

/**
 * @description Equip an item for a user. Can either be a weapon or armor. The already equipped armor or weapon is unequipped
 */
async function equipItem(req, res) {
    try {
        const itemId = req.body?.itemId
        const username = req.body?.username
        const type = req.body?.type

        if (!itemId || !username || ! type) {
            res.status(400).send('itemId, username, and type are all required fields')
            return
        }

        const user = await characterModel.getCharacterWithUsername(username)

        if (!user) {
            res.status(404).send('User not found!')
            return
        }

        if (user.status.userStatus === userStatus.IN_COMBAT) {
            res.status(404).send('User is in combat! Cannot change gear.')
            return
        }

        const items = user.items
        const weapons = user.weapons
        const armor = user.armor

        // Equip a new weapon
        if (type === itemType.WEAPON) {
            // Get the item from the array
            const weapon = weapons.find((item) => item.id === itemId)
            if (!weapon) {
                res.status(404).send('Weapon not found')
                return
            }
            if (weapon.id === itemId) {
                res.status(403).send('Weapon is already equipped')
                return
            }
            // Unequip the equipped weapon
            const equippedWeapon = weapons.find((item) => item.equipped)
            if (equippedWeapon) {
                await characterModel.equipItemInInventory(user.userId, equippedWeapon.id, itemType.WEAPON, false)
            }
            // equip the new weapon
            await characterModel.equipItemInInventory(user.userId, weapon.id, itemType.WEAPON, true)
            // Send response
            res.json({
                message: `${weapon.name} equipped`,
                weapon: weapon
            })
        }
        // Equip new armor
        else if (type === itemType.ARMOR) {
            // Get the armor from the array
            const newArmor = armor.find((item) => item.id === itemId)
            if (!newArmor) {
                res.status(404).send('Armor not found')
                return
            }
            if (newArmor.id === itemId) {
                res.status(403).send('Armor is already equipped')
                return
            }
            // Unequip the equipped armor
            const equippedArmor = armor.find((item) => item.equipped)
            if (equippedArmor) {
                await characterModel.equipItemInInventory(user.userId, equippedArmor.id, itemType.ARMOR, false)
            }
            // equip the new armor
            await characterModel.equipItemInInventory(user.userId, newArmor.id, itemType.ARMOR, true)
            // Send response
            res.json({
                message: `${newArmor.name} equipped`,
                armor: newArmor
            })
        }
        // If type is not weapon or armor, the call is invallid.
        else {
            res.status(400).json({
                message: "Invalid type!",
                allowedTypes: itemType
            })
        }
    } catch (e) {
        console.error(e)
        throw('Error equipping item')
    }
}

module.exports = {
    newCharacter,
    getCharacterInventory,
    getStore,
    buyItem,
    equipItem,
    getCharacter,
    getCharacterStatus,
    signup,
    login
}
