/**
 * @file questController.js
 * @author Tad Decker
 * @date 11/1/2023
 */

const questModel = require('../models/questModel')
const locationModel = require('../models/locationModel')
const characterModel = require('../models/characterModel')
const monsterModel = require('../models/monsterModel')
const { userActions, questStatus, userStatus } = require('../types')

/**
 * Generates a random ID using the current date and a random number 0-10000
 * @returns {String} random ID
 */
function generateId() {
    const now = Date.now()
    const rand = Math.floor(Math.random() * 10000)
    return `${now}${rand}`
}

  /**
   * SUPER basic function to get reward amount. TODO: Improve
   * @deprecated
   * @param {Number} userLevel 
   * @returns {Number} reward GP
   */
function rewardGp(userLevel) {
    return userLevel * 10
}

/**
 * @description sends a list of quests to the user. Saves those quests in
 * "quests" with status NOT_ACTIVE. If the user DOES NOT have the status "NOT_IN_QUEST",
 * then do nothing (they can't start a new quest if they're already in one!)
 * @param {Object} req 
 * @param {Object} res 
 */
async function requestQuests(req, res) {
    try {
        const userId = req.query.userId ?? null
        const userLevel = req.query.userLevel ?? '1'
        const numQuests = req.query.numQuests ?? 3

        // Must send user ID
        if (!userId) {
            res.status(400).send('User ID required')
            return
        }

        // Get the current user
        const user = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (!user) {
            res.status(404).send('Character not found')
            return
        }

        if (user.status.userStatus === userStatus.DEAD) {
            res.status(403).send('User is DEAD. Create a new character to start over!')
            return
        }

        if (user.status.userStatus !== userStatus.NOT_IN_QUEST) {
            res.status(403).send('User is already in quest! Cannot start a new quest until current is finished.')
            return
        }

        // Delete past quest options
        questModel.deleteCharacterQuests(userId, questStatus.NOT_ACTIVE)

        const locations = await locationModel.getLocations()
        const numLocations = locations.length
        const LOCATIONS_IN_QUEST = 4

        // A 'for' loop to create a list of i number of quests
        const quests = []        
        for (let i = 0; i < numQuests; i++) {
            // For now, have only 4 locations.
            const location1 = locations.at(Math.floor(Math.random() * numLocations))
            const location2 = locations.at(Math.floor(Math.random() * numLocations))
            const location3 = locations.at(Math.floor(Math.random() * numLocations))
            const location4 = locations.at(Math.floor(Math.random() * numLocations))

            location1.id = generateId()
            location2.id = generateId()
            location3.id = generateId()
            location4.id = generateId()

            // Create arry of random monsters
            const monsters = []
            for (let i = 0; i < LOCATIONS_IN_QUEST-1; i++) {
                const monsterId = Math.floor(Math.random() * 10) + 1
                const monster = await monsterModel.getSpecifiedMonster(monsterId)
                monster.boss = false
                const monsterToAdd = {
                    monsterName: monster.monsterName,
                    boss: false,
                    level: monster.level,
                    attack: monster.attack,
                    defense: monster.defense,
                    hp: 10,
                    condition: monster.condition,
                    symbol: monster.symbol,
                    id: i.toString()
                }
                monsters.push(monsterToAdd)
            }

            // Get boss monster
            const monsterId = Math.floor(Math.random() * 10) + 1
            const boss = await monsterModel.getSpecifiedMonster(monsterId)
            const bossMonster = {
                monsterName: boss.monsterName,
                boss: true,
                level: boss.level,
                attack: boss.attack,
                defense: boss.defense,
                hp: 40,
                condition: boss.condition,
                symbol: boss.symbol,
                id: "99"
            }

            const quest = {
                name: `Quest ${i}`,
                userId: userId,
                status: questStatus.NOT_ACTIVE,
                difficultyLvl: i, // FIXME
                rewardGp: 100, // FIXME: Pass in user level to get scaled rewards. For now placeholder value of 1
                questId: generateId(),
                locations: [
                    {
                        name: location1.name,
                        locationId: "1",
                        monsters: [],
                        neighbors: ["2", "3"]
                    },
                    {
                        name: location2.name,
                        locationId: "2",
                        monsters: [monsters.at(1)],
                        neighbors: ["4"]
                    },
                    {
                        name: location3.name,
                        locationId: "3",
                        monsters: [monsters.at(2)],
                        neighbors: ["4"]
                    },
                    {
                        name: location4.name,
                        locationId: "4",
                        monsters: [bossMonster],
                        neighbors: []
                    }
                ]
            }

            await questModel.saveQuest(quest)
            quests.push(quest)
        }

        const json = {
            quests: quests
        }

        res.json(json)

    } catch (e) {
        console.error(e)
        res.status(500).json({ 
            error: 'Internal Server Error', 
            description: e
        })
    }
}

/**
 * @description Accept a quest.
 * Required queries: userId, questId
 * @param {Object} req 
 * @param {Object} res 
 */
async function acceptQuest(req, res) {
    try {
        const userId = req.query.userId ?? null
        const questId = req.query.questId ?? null

        if (!userId) {
            res.status(400).send('User ID required')
            return
        }

        if (!req.query?.questId) {
            res.status(404).send('Quest ID rquired')
            return
        }

        // Get the current user
        const user = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (!user) {
            res.status(404).send('Character not found')
            return
        }

        // If the user is already in a quest, don't let them get a new one!
        if (user.status.userStatus !== userStatus.NOT_IN_QUEST) {
            res.status(403).send('User is already in quest! Cannot start a new quest until current is finished.')
            return
        }

        // Check if quest exists by finding it
        const quest = await questModel.getQuest(questId)

        // If quest not found, return 404
        if (!quest) {
            res.status(404).send('Quest not found')
            return
        }

        // Quest MUST be already associated with user
        if (quest.userId !== userId) {
            res.status(403).send('Character does not own quest!')
            return
        }

        // If quest isn't NOT active, don't allow to begin again.
        if (quest.status !== questStatus.NOT_ACTIVE) {
            res.status(403).send('Quest is not availble to begin.')
            return
        }

        // Change the chosen quest status to ACTIVE
        quest.status = questStatus.ACTIVE
        questModel.updateStatus(questId, quest.status)

        // Delete all the quests that weren't chosen
        questModel.deleteCharacterQuests(userId, questStatus.NOT_ACTIVE)

        // If the first quest has a monster, put the player into combat!
        if (quest.locations[0].monsters.length > 0) {
            quest.status.userStatus = userStatus.IN_COMBAT
            characterModel.updateStatus(userId, user.status)

            res.json({
                monsters: quest.locations[0].monsters[0],
                userStatus: user.status
            })
        }
        // Else, return the choices they can make and update character to IN_QUEST
        else {        
            const status = {
                userStatus: userStatus.IN_QUEST,
                choices: quest.locations[0].neighbors,
                questId,
                locationId: quest.locations[0].locationId
            }
            characterModel.updateStatus(userId, status)

            res.json(status)
        }
    } catch (e) {
        res.status(500).json({
            error: 'Internal Server Error',
            description: e
        })
    }
}

/**
 * @description Leave a quest the user is in
 * @param {Object} req 
 * @param {Object} res 
 */
async function leaveQuest(req, res) {
    try {
        const userId = req.query.userId
        const questId = req.query.questId

        // If no userId, send error
        if (!userId) {
            res.status(400).send('User ID required')
            return
        }

        // Get the current user
        const user = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (!user) {
            res.status(404).send('Character not found')
            return
        }

        // If the user is in combat, don't let them leave!
        if (user.status.userStatus === userStatus.IN_COMBAT) {
            res.status(403).send('User is in combat! You must attempt to "run" from the combat before leaving the quest.')
            return
        }

        // If the user is NOT in a quest, they don't have a quest to leave.
        if (user.status.userStatus === userStatus.NOT_IN_QUEST) {
            res.status(403).send('The user isn\'t in a quest to leave.')
            return
        }

        const newStatus = {
            userStatus: "NOT_IN_QUEST"
        }

        // Update the user to NOT_IN_QUEST
        await characterModel.updateStatus(userId, newStatus)

        // Update the quest to INCOMPLETE
        await questModel.updateStatus(questId, questStatus.TERMINATED)

        res.send('You have left the quest.')
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: 'Internal Server Error',
            description: e
        })
    }
}

/**
 * @description Make a choice. Right now just to change locations. Can ONLY be done when IN_QUEST and not IN_COMBAT!
 * @param {Object} req 
 * @param {Object} res 
 */
async function makeChoice(req, res) {
    try {
        const userId = req.body.userId
        const choice = req.body.choice

        if (!userId) {
            res.status(400).send('User ID required')
            return
        }

        if (!choice) {
            res.status(400).send('Choice required')
            return
        }

        // Get the current user
        const user = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (!user) {
            res.status(404).send('Character not found')
            return
        }

        console.log(user)

        const questId = user.status.questId
        const choices = user.status.choices

        console.log(questId)

        // Check if quest exists by finding it
        const quest = await questModel.getQuest(questId)

        console.log(quest)

        if (!quest) {
            res.status(404).send('Quest not found')
            return
        }

        // The user MUST be IN_QUEST!
        if (user.status.userStatus === userStatus.NOT_IN_QUEST) {
            res.status(403).send('Not in a quest, no choice to make!')
            return
        }

        locations = quest.locations
        chosenLocation = locations.find(loc => loc.locationId === choice)
        user.status.locationId = choice

        if (user.status.userStatus === userStatus.IN_COMBAT) {
            res.status(403).json({
                message: "In combat, must do an action!",
                status: user.status,
                monsters: chosenLocation.monsters
            })
            return
        }

        if (user.status.userStatus === userStatus.DEAD) {
            res.status(403).send('Character is dead. Make a new character to play again.')
            return
        }

        // Check if choice is valid
        if (!choices.includes(choice)) {
            res.status(403).json({
                message: 'That is not a valid choice!',
                validChoices: choices
            })
            return
        }

        if (chosenLocation.monsters.length > 0) {
            
            user.status.userStatus = userStatus.IN_COMBAT
            user.status.choices = []
            user.status.actions = ["attack", "run"]
        }
        else if (chosenLocation.neighbors)  {
            user.status.choices = chosenLocation.neighbors
        }
        else user.status.choices = []

        await characterModel.updateStatus(userId, user.status)

        res.json({
            status: user.status,
            monsters: chosenLocation.monsters
        })
    } catch (e) {
        console.error(e)
        res.status(500).send('Error making choice')
    }
}

/**
 * @description ONLY for use while in combat.
 * @param {Object} req 
 * @param {Object} res 
 */
async function doAction(req, res) {
    try {
        const userId = req.body.userId
        const action = req.body.action

        if (!userId) {
            res.status(400).send('User ID required')
            return
        }

        if (!action) {
            res.status(400).send('Action required')
            return
        }

        // Get the current user
        const user = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (!user) {
            res.status(404).send('Character not found')
            return
        }

        const questId = user.status.questId

        // The user MUST be IN_COMBAT!
        if (user.status.userStatus === userStatus.IN_QUEST || user.status.userStatus === userStatus.NOT_IN_QUEST) {
            res.status(403).send('Character is not in combat!')
            return
        }

        if (user.status.userStatus === userStatus.DEAD) {
            res.status(403).send('Character is dead. Make a new character to play again.')
            return
        }

        // Get the quest
        const quest = await questModel.getQuest(questId)

        // If quest not found, return 404
        if (!quest) {
            res.status(404).send('Quest not found')
            return
        }

        // Get location in quest
        const location = quest.locations.find((loc) => loc.locationId === user.status.locationId)
        // Get the monster. For now assume there is only ONE monster per location! TODO: Get monster with monsterId value in body
        const monster = location.monsters.at(0)

        // Check that action is valid
        const actions = user.status.actions

        if (!actions.includes(action)) {
            res.status(403).json({
                message: 'That is not a valid action!',
                validActions: actions,
                character: {
                    status: user.status,
                    name: user.name,
                    userId: user.userId,
                    classId: user.classId,
                    condition: user.condition,
                    level: user.level,
                    mana: user.mana,
                    hp: user.hp
                }
            })
            return
        }

        console.log(user.weapons)

        // TODO: Separate this out into "user's turn" and "monster's turn" for simplity's sake.
        
        // Get the user's equipped weapon FIXME: user.weapons is returning as undefined!
        const weapon = user.weapons ? user.weapons.find((weapon) => weapon.equipped === true) : null
        console.log('equipped weapon:', weapon)
        // Get the user's armor
        const armor = user.armor.find((armor) => armor.equipped === true)
        console.log('armor: ', armor)

        // If a user tries to ATTACK
        if (action === userActions.ATTACK) {
            console.log('in attack')
            // Reduce monster's health by the user's attack and the damageMod of the weapon they're useing
            let monsterDamage = user.attack
            if (weapon)
                monsterDamage += weapon.damageMod // FIXME: Change the name of this value to "attack"
            monster.hp -= monsterDamage
            // Raise to zero if negative
            if (monster.hp < 0)
                monster.hp = 0

            await questModel.editMonsterInLocation(questId, location.locationId, monster.id, monster)     
            console.log('monster editted!')

            // Check if monster is dead
            if (monster.hp === 0) {
                newStatus = {
                    userStatus: userStatus.IN_QUEST,
                    choices: location.neighbors,
                    actions: [],
                    questId,
                    locationId: location.locationId
                }

                await characterModel.updateStatus(userId, newStatus)
                console.log('monster is dead and user has left combat')
                console.log(monster)

                // If the monster was a BOSS, the quest is completed!
                if (monster.boss) {
                    console.log('Killed boss!')

                    // TODO: Give reward for finishing quest

                    // Mark quest as complete and user as not in quest
                    await questModel.updateStatus(questId, questStatus.COMPLETE)
                    newStatus = {
                        userStatus: userStatus.NOT_IN_QUEST
                    }
                    await characterModel.updateStatus(userId, newStatus)
                    res.json({
                        message: `${monster.monsterName} slain!`,
                        character: {
                            status: newStatus,
                            name: user.name,
                            userId: user.userId,
                            classId: user.classId,
                            condition: user.condition,
                            level: user.level,
                            mana: user.mana,
                            hp: user.hp
                        }
                    })

                    return
                }

                // TODO: Give reward for killing a monster

                // For now this assumes there is ONE and ONLY ONE monster.
                res.json({
                    message: `${monster.monsterName} slain!`,
                    character: {
                        status: newStatus,
                        name: user.name,
                        userId: user.userId,
                        classId: user.classId,
                        condition: user.condition,
                        level: user.level,
                        mana: user.mana,
                        hp: user.hp
                    }
                })

                return
            }

            // Monster fights back, reducing user's health TODO: Create function to do this (attackUser)
            let monsterAttack = monster.attack - user.defense
            if (armor)
                monsterAttack -= armor.defense
            // If monster attack is negative, raise to 1 (no attack does no damage)
            if (monsterAttack <= 0)
                monsterAttack = 1
            user.hp -= monsterAttack

            if (user.hp < 0) {
                user.hp = 0
            }

            await characterModel.updateCharacterStats(user)
            console.log('user has taken damage')

            // Check if user is dead. If they are, set userStatus to DEAD
            if (user.hp === 0) {
                user.status = {
                    userStatus: userStatus.DEAD,
                    choices: [],
                    actions: [],
                    questId: questId,
                    locationId: locationId
                }
                await characterModel.updateStatus(userId, user.status)
                await questModel.updateStatus(questId, questStatus.FAILED)
                console.log('user has died')

                res.json({
                    message: `You attacked the ${monster.monsterName}, inflicting ${monsterDamage} damage. The ${monster.monsterName} attacked back, doing ${monsterAttack} damage, and you died. GAME OVER`,
                    locationOfDeath: location.name,
                    killer: monster.monsterName,
                    character: {
                        status: user.status,
                        name: user.name,
                        userId: user.userId,
                        classId: user.classId,
                        condition: user.condition,
                        level: user.level,
                        mana: user.mana,
                        hp: user.hp
                    }
                })
            }
            // Else just update the user of the conditions of the fight.
            else {
                res.json({
                    message: `You attacked the ${monster.monsterName}, inflicting ${monsterDamage} damage. The ${monster.monsterName} attacked back, doing ${monsterAttack} damage.`,
                    status: user.status,
                    monsters: location.monsters,
                    character: {
                        status: user.status,
                        name: user.name,
                        userId: user.userId,
                        classId: user.classId,
                        condition: user.condition,
                        level: user.level,
                        mana: user.mana,
                        hp: user.hp
                    }
                })
            }
        }

        // #### If a user tries to RUN ####
        else if (action === userActions.RUN) {
            // Random number 1-3; 1 is success
            const randomNumber = Math.floor(Math.random() * 3) + 1
            // If success, set userStatus to IN_QUEST
            if (randomNumber === 1) {
                const newStatus = {
                    choices: location.neighbors,
                    locationId: location.locationId,
                    questId: quest.questId,
                    actions: [],
                    userStatus: userStatus.IN_QUEST
                }

                // If the monster was a BOSS, the quest is finished, but marked as terminated (You can't win anymore)
                if (monster.boss) {
                    newStatus = {
                        userStatus: userStatus.NOT_IN_QUEST
                    }
                    await questModel.updateStatus(questId, questStatus.TERMINATED)
                }

                // Update status
                await characterModel.updateStatus(userId, newStatus)
                res.json({
                    message: `Ran away successfully. ${monster.boss ? 'Quest failed: You did not kill the boss!' : ''}`,
                    character: {
                        status: newStatus,
                        name: user.name,
                        userId: user.userId,
                        classId: user.classId,
                        condition: user.condition,
                        level: user.level,
                        mana: user.mana,
                        hp: user.hp
                    }
                })
            }
            // If failure, user is damaged
            else {
                // Monster fights back, reduce user's health by 4
                let monsterAttack = monster.attack
                if (armor)
                    monsterAttack -= armor.defense
                user.hp -= monsterAttack
                // Raise to zero if negative
                user.hp < 0 ? user.hp = 0 : null
                await characterModel.updateCharacterStats(user)

                // Check if user is dead
                if (user.hp === 0) {         
                    user.status = {
                        userStatus: userStatus.DEAD,
                        choices: [],
                        actions: [],
                        questId: questId,
                        locationId: locationId
                    }
                    await characterModel.updateStatus(userId, user.status)
                    await questModel.updateStatus(questId, questStatus.FAILED)
                    console.log('user has died')
                    
                    res.json({
                        message: `You failed to run away, and the ${monster.monsterName} inflicted ${monsterAttack} damage, and you died. GAME OVER`,
                        locationOfDeath: location.name,
                        killer: monster.monsterName,
                        character: {
                            status: user.status,
                            name: user.name,
                            userId: user.userId,
                            classId: user.classId,
                            condition: user.condition,
                            level: user.level,
                            mana: user.mana,
                            hp: user.hp
                        }
                    })
                }
                else {
                    res.json({
                        message: `You failed to run away, and the ${monster.monsterName} inflicted ${monsterAttack} damage.`,
                        status: user.status,
                        character: {
                            status: user.status,
                            name: user.name,
                            userId: user.userId,
                            classId: user.classId,
                            condition: user.condition,
                            level: user.level,
                            mana: user.mana,
                            hp: user.hp
                        }
                    })
                }
            }
        }
    } catch (e) {
        console.error(e)
        res.status(500).send('Error doing action')
    }
}

module.exports = {
    requestQuests,
    acceptQuest,
    leaveQuest,
    makeChoice,
    doAction
}
