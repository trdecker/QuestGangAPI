const mongoose = require('mongoose')
// const conditions = require('../types')

/*
{

}
*/

const questSchema = new mongoose.Schema({
    name: String,
    questId: String
})

const quest = mongoose.model('quest', questSchema, 'quests')

module.exports = {}