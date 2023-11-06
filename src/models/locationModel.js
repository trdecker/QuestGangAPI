const mongoose = require('mongoose')
// const conditions = require('../types')

const locationSchema = new mongoose.Schema({
    name: String,
    questId: String
})

const location = mongoose.model('location', locationSchema, 'locations')

async function getLocations() {
    const locations = await location.find()
    return locations
}

module.exports = {
    getLocations
}