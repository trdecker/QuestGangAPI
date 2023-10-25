const userModel = require('../models/userModel')

function getUsers(req, res) {
    const users = userModel.getUsers()
    res.json(users)
}

module.exports = {
    getUsers
}