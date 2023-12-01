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
 * Generates a random ID using the current date and a random number 0-10000.
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
        const foundUsers = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (foundUsers.length == 0) {
            res.status(404).send('Character not found')
            return
        }

        // // If the user is already in a quest, don't let them get a new one!
        const user = foundUsers.at(0)

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
                const randomMonster = await monsterModel.getSpecifiedMonster(monsterId)
                const monster = randomMonster[0]
                monster.boss = false
                monsters.push(monster)
            }

            // Get boss monster
            const monsterId = Math.floor(Math.random() * 10) + 1
            const boss = await monsterModel.getSpecifiedMonster(monsterId)
            const bossMonster = boss[0]
            bossMonster.boss = true

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
        const foundUsers = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (foundUsers.length == 0) {
            res.status(404).send('Character not found')
            return
        }
        const user = foundUsers.at(0)

        // If the user is already in a quest, don't let them get a new one!
        if (user.status.userStatus !== userStatus.NOT_IN_QUEST) {
            res.status(403).send('User is already in quest! Cannot start a new quest until current is finished.')
            return
        }

        // Check if quest exists by finding it
        const foundQuests = await questModel.getQuest(questId)

        // If quest not found, return 404
        if (foundQuests.length == 0) {
            res.status(404).send('Quest not found')
            return
        }
        const quest = foundQuests[0]

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

            const json = {
                monsters: quest.locations[0].monsters[0]
            }
            res.json(json)
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

            const json = {
                choices: quest.locations[0].neighbors
            }
            res.json(json)
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
        const foundUsers = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (foundUsers.length == 0) {
            res.status(404).send('Character not found')
            return
        }
        const user = foundUsers.at(0)

        // If the user is in combat, don't let them leave!
        if (user.status.userStatus === userStatus.IN_COMBAT) {
            res.status(403).send('User is already in quest! Cannot start a new quest until current is finished.')
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
        const foundUsers = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (foundUsers.length == 0) {
            res.status(404).send('Character not found')
            return
        }

        const user = foundUsers.at(0)

        // The user MUST be IN_QUEST!
        if (user.status.userStatus === userStatus.NOT_IN_QUEST) {
            res.status(403).send('Not in a quest, no choice to make!')
            return
        }

        if (user.status.userStatus === userStatus.IN_COMBAT) {
            res.status(403).send('In combat, must make an action!')
            return
        }

        if (user.status.userStatus === userStatus.DEAD) {
            res.status(403).send('Character is dead. Make a new character to play again.')
            return
        }

        const questId = user.status.questId
        const choices = user.status.choices

        if (!choices.includes(choice)) {
            res.status(403).json({
                message: 'That is not a valid choice!',
                validChoices: choices
            })
            return
        }

        // Check if quest exists by finding it
        const foundQuests = await questModel.getQuest(questId)

        // If quest not found, return 404
        if (foundQuests.length == 0) {
            res.status(404).send('Quest not found')
            return
        }
        const quest = foundQuests[0]

        locations = quest.locations
        chosenLocation = locations.find(loc => loc.locationId === choice)
        user.status.locationId = choice

        if (chosenLocation.monsters.length > 0) {
            
            user.status.userStatus = userStatus.IN_COMBAT
            user.status.choices = []
            user.status.actions = [
                "attack",
                "run"
            ]
        }
        else if (chosenLocation.neighbors)  {
            user.status.choices = chosenLocation.neighbors
        }
        else user.status.choices = []

        await characterModel.updateStatus(userId, user.status)

        res.json(user.status)
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
        const foundUsers = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (foundUsers.length == 0) {
            res.status(404).send('Character not found')
            return
        }

        const user = foundUsers.at(0)

        // The user MUST be IN_COMBAT!
        if (user.status.userStatus === userStatus.IN_QUEST || user.status.userStatus == userStatus.NOT_IN_QUEST) {
            res.status(403).send('Character is not in combat!')
            return
        }

        if (user.status.userStatus === userStatus.DEAD) {
            res.status(403).send('Character is dead. Make a new character to play again.')
            return
        }

        // Check that action is valid
        const actions = user.status.actions

        if (!actions.includes(action)) {
            res.status(403).json({
                message: 'That is not a valid action!',
                validActions: actions
            })
            return
        }

        if (action == userActions.ATTACK) {
            // Reduce monster's health by 5
            // Check if monster is dead
            // Monster fights back, reduce user's health by 4
            // Check if user is dead
        }
        else if (action == userActions.RUN) {
            // Random number 1-3; 1 is success
            // If success, set userStatus to IN_QUEST
            // Monster fights back, reduce user's health by 4
            // Check if user is dead
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
    doAction,
    generateId
}
