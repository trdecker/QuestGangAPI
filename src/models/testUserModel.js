const mongoose = require('mongoose');

const testUser = new mongoose.Schema({
    username: String,
    password: String,
});

const testUserModel = mongoose.model('testUser', testUser);

function createUser(user) {
    const newUser = new testUserModel(user);
    return newUser.save();
}

module.exports = {
    createUser,
    testUserModel
};