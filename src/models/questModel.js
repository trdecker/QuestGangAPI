const mongoose = require('mongoose')
/*

                name: `Quest ${i}`,
                userId: userId,
                status: questStatus.NOT_ACTIVE,
                difficultyLvl: i, // FIXME
                rewardGp: rewardGp(userLevel), // FIXME: Pass in user level to get scaled rewards. For now placeholder value of 1
                questId: generateId(),
                locations: [
*/

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

function saveQuest(quest) {
    const newQuest = new questModel(quest)
    return newQuest.save()
}

module.exports = {
    saveQuest
}