/**
 * @file questController.js
 * @author Tad Decker
 * @date 11/1/2023
 */

const questModel = require('../models/questModel')
const locationModel = require('../models/locationModel')
const characterModel = require('../models/characterModel')
const monsterModel = require('../models/monsterModel')
const { questStatus, userStatus } = require('../types')


/**
 * Generates a random ID using the current date and a random number 0-10000.
 * @deprecated
 * @returns {String} random ID
 */
function generateId() {
    const now = Date.now()
    const rand = Math.floor(Math.random() * 10000)
    return `${now}-${rand}`
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

        if (user.status !== userStatus.NOT_IN_QUEST) {
            res.status(403).send('User is already in quest! Cannot start a new quest until current is finished.')
            return
        }

        // Delete past quest options
        questModel.deleteCharacterQuests(userId, questStatus.NOT_ACTIVE) // FIXME Why is this not working???
        // res.send('Success?')
        // return

        const locations = await locationModel.getLocations()
        const numLocations = locations.length

        // A 'for' loop to create a list of i number of quests
        const quests = []        
        for (let i = 0; i < numQuests; i++) {
            // For now, have only 4 locations.
            const location1 = locations.at(Math.floor(Math.random() * numLocations))
            const location2 = locations.at(Math.floor(Math.random() * numLocations))
            const location3 = locations.at(Math.floor(Math.random() * numLocations))
            const location4 = locations.at(Math.floor(Math.random() * numLocations))

            // console.log(location2.id)

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
                        locationId: location1.id,
                        monsters: [],
                        neighbors: [location2.id, location3.id]
                    },
                    {
                        name: location2.name,
                        locationId: location2.id,
                        monsters: [],
                        neighbors: [location4.id]
                    },
                    {
                        name: location3.name,
                        locationId: location2.id,
                        monsters: [],
                        neighbors: [location4.id]
                    },
                    {
                        name: location4.name,
                        locationId: location2.id,
                        monsters: [],
                        neighbors: []
                    }
                ]
            }

            // For each location, insert a random monster FIXME: Not doing exactly what it should. Race condition??
            quest.locations.forEach(async (location) => {
                const monsterId = Math.floor(Math.random() * 10) + 1

                // Await the retrieval of the monster from the model using the generated monster ID
                const randomMonster = await monsterModel.getSpecifiedMonster(monsterId)
                location.monsters = [ ...location.monsters, ...randomMonster ]
            })

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
        if (user.status !== userStatus.NOT_IN_QUEST) {
            res.status(403).send('User is already in quest! Cannot start a new quest until current is finished.')
            return
        }

        // Check if quest exists by finding it
        const foundQuests = questModel.getQuest(questId)

        // If quest not found, return 404
        if (foundQuests.length == 0) {
            res.status(404).send('Character not found')
            return
        }
        const quest = foundQuests[0]
        console.log(quest)

        // Quest MUST be already associated with user
        if (quest.userId !== userId) {
            res.status(403).send('Character does not own quest!')
            return
        }

        // Change the chosen quest status to ACTIVE
        questModel.updateStatus(questId, questStatus.ACTIVE)

        // Delete all the quests that weren't chosen
        questModel.deleteCharacterQuests(userId, questStatus.IN_ACTIVE)

        // Update character status to IN_QUEST
        characterModel.updateStatus(userId, userStatus.IN_QUEST)

        res.json(quest)

    } catch (e) {
        res.status(500).json({
            error: 'Internal Server Error',
            description: e
        })
        throw (e)
    }
}

module.exports = {
    requestQuests,
    acceptQuest
}
