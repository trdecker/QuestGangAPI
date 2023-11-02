/**
 * @file questController.js
 * @author Tad Decker
 * @date 11/1/2023
 */

const questModel = require('../models/questModel')
const locationModel = require('../models/locationModel')
const questStatus = require('../types')

/**
 * Generates a random ID using the current date and a random number 0-10000.
 * @returns {String} random ID
 */
function generateId() {
    const now = Date.now()
    const rand = Math.floor(Math.random() * 10000)
    return `${now}-${rand}`
  }

  /**
   * SUPER basic function to get reward amount. TODO: Improve
   * @param {Number} userLevel 
   * @returns {Number} reward GP
   */
function rewardGp(userLevel) {
    return userLevel * 10
}

async function requestQuests(req, res) {
    try {
        const userId = req.query.userId
        const userLevel = req.query.userLevel
        const numQuests = req.query.numQuests ?? 3

        // TODO: Make sure this doesn't delete something important
        // questModel.deleteMany({ userId: userId, status: questStatus.NOT_ACTIVE })

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

            const quest = {
                name: `Quest ${i}`,
                userId: userId,
                status: questStatus.NOT_ACTIVE,
                difficultyLvl: i, // FIXME
                rewardGp: rewardGp(userLevel), // FIXME: Pass in user level to get scaled rewards. For now placeholder value of 1
                questId: generateId(),
                locations: [
                    {
                        name: location1.name,
                        locationId: location1.locationId,
                        neighbors: [location2.locationId, location3.locationId]
                    },
                    {
                        name: location2.name,
                        locationId: location2.locationId,
                        neighbors: [location4.locationId]
                    },
                    {
                        name: location3.name,
                        locationId: location2.locationId,
                        neighbors: [location4.locationId]
                    },
                    {
                        name: location4.name,
                        locationId: location2.locationId,
                        neighbors: []
                    }
                ]
            }
            const newQuest = new quest(quest)
            newQuest.save()
            quests.push(quest)
        }

        const json = {
            quests: quests
        }

        res.json(json)

    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'Internal Server Error', 
            description: e
        })
    }
}

module.exports = {
    requestQuests
}
