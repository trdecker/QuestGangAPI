/**
 * @file questModel.js
 * @author Tad Decker
 * @description Model to interact with MongoDB collection "quests".
 * 
 * @date 11/2/2023
 */

const mongoose = require('mongoose')

const questSchema = new mongoose.Schema({
    name: String,
    userId: String,
    questId: String,
    status: String,
    difficultyLvl: Number,
    rewardGp: Number,
    locations: [{
        name: String,
        locationId: String,
        monsters: [{ 
            monsterName: String,
            level: Number,
            attack: Number,
            defense: Number,
            hp: Number,
            specialFeature: String,
            symbol: String,
            id: String,
            boss: Boolean,
            condition: String
        }],
        neighbors: [{ 
            name: String,
            locationId: String
         }]
    }]
})

const questModel = mongoose.model('quest', questSchema, 'quests')

/**
 * @description save a quest to the collection 'quests'
 * @param {JSON} quest 
 * @returns JSON the quest created
 */
function saveQuest(quest) {
    const newQuest = new questModel(quest)
    return newQuest.save()
}

/**
 * Delete every quest associated with a userId and questStatus.
 * @param {String} userId 
 * @param {String} questStatus 
 */
async function deleteCharacterQuests(userId, questStatus) {
    try {
        let query = { userId: userId }
        if (questStatus) {
            query = { ...query, status: questStatus }
        }
        await questModel.deleteMany(query)
    } catch (e) {
        console.error('Error in deleting quests')
        throw (e)
    }
}

/**
 * Find a quest given a questId
 * @param {String} questId 
 * @returns 
 */
async function getQuest(questId) {
    try {
        const quests = await questModel.find({ questId: questId })
        if (quests.length === 0)
            return null
        else return quests[0]
    } catch (e) {
        console.error('Error in accepting quest')
        throw (e)
    }
}

async function editMonsterInLocation(questId, locationId, monsterId, updatedMonsterData) {
    try {
        await questModel.findOneAndUpdate(
            { 
                questId: questId
            },
            {
                $set: {
                    'locations.$[outer].monsters.$[inner]': updatedMonsterData
                }
            },
            { 
                arrayFilters: [
                    { 'outer.locationId': locationId },
                    { 'inner.id': monsterId }
                ],
                new: true
            }
        )
    } catch (e) {
        console.error(`Error in editing monster ${monsterId} in location ${locationId} in quest ${questId}`)
        throw (e)
    }
}

/**
 * Update the status of the user. NOT the same as updateStatus in characterModel.js!
 * @param {String} questId
 * @param {Object} questStatus
 */
async function updateStatus (questId, questStatus) {
    try {
        await questModel.findOneAndUpdate(
            { questId: questId },
            { $set: { status: questStatus } },
            { new: true }
        )
    } catch (e) {
        console.error('Error in accepting quest')
        throw (e)
    }
}

module.exports = {
    saveQuest,
    getQuest,
    deleteCharacterQuests,
    editMonsterInLocation,
    updateStatus
}