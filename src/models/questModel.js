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
        neighbors: [{ type: String }]
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
 * Delete every quest associated with a userId and questStatus
 * @param {String} userId 
 * @param {String} questStatus 
 */
async function deleteUserQuests(userId, questStatus) {
    console.log('userId: ', userId)
    console.log('status: ', questStatus)
    try {
        await questModel.deleteMany()
    } catch (e) {
        console.error('Error in deleting quests')
        throw (e)
    }
}

module.exports = {
    saveQuest,
    deleteUserQuests
}