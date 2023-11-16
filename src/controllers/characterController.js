const character = require('../models/characterModel')
const { conditions, userStatus } = require('../types')

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
            armor
        }

        character.createCharacter(newCharacter)

        res.send("success")

    } catch (e) {
        console.error(e)
        res.status(500).send('Internal error')
    }
}

<<<<<<< HEAD
function signup(req, res) {
    try {
        console.log('body: ', req.body)
        character.
        res.send('Sign up success')
    } catch (e) {
        console.error(e)
        res.status(500).send('Sign up fail')
    }
}


module.exports = {
    newCharacter,
    signup
=======
/**
 * @description Get the details about a character
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
        if (characters.length == 0) {
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
            weapons: found.weapons
        }

        res.json(json)
    } catch (e) {
        console.error(e)
        res.status(500).send('Error getting character')
    }
}

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
        if (characters.length == 0) {
            res.status(404).send('No character found with that username')
            return
        }

        // Return the character WITHOUT the hashed password
        const found = characters.at(0)

        res.json(found.status)
    } catch (e) {
        console.error(e)
        res.status(500).send('Error getting character')
    }
}

module.exports = {
    newCharacter,
    getCharacter,
    getCharacterStatus
>>>>>>> cbb3e32345a2756b34b31124b5bb80ca961574c5
}
