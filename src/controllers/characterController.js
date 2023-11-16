const character = require('../models/characterModel')
const { conditions, userStatus } = require('../types')

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
            status: userStatus.NOT_IN_QUEST,
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
    }
}

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
}
