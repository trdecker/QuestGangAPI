const testUser = require('../models/testUserModel');
const bcrypt = require('bcrypt');
const {conditions, userStatus} = require('../types');

async function testSignup(req, res) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newUser = {
            username: req.body.username,
            password: hashedPassword
        };
        const user = await testUser.createUser(newUser);
        res.status(200).send(user);
    } catch (err) {
        res.status(500).send(err);
    }
}

module.exports = {  
    testSignup
};