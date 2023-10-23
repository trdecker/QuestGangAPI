const mongoose = require('mongoose')

const userClassSchema = new mongoose.Schema({
    name: String,
    id: Number
})

const userClass = mongoose.model('UserClass', userClassSchema)

function getUserClass(classId) {
    return userClass.find().exec()
}

module.exports = {
    getUserClass
}
