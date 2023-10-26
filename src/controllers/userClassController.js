const userClassModel = require('../models/userClassModel')

async function getRandomUserClass(req, res) {
    try {
        console.log("In get random class")
        const classId = Math.floor(Math.random() * 3) + 1
        const randomUserClass = await userClassModel.getUserClass(classId)
        console.log("Class: " + randomUserClass)
        res.json(randomUserClass)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'Internal Server Error', 
            description: e
        })
    }
}

async function getUserClass(req, res) {
    try {
        const classId = req.query.classId ?? Math.floor(Math.random() *3) + 1
        const userClass = await userClassModel.getUserClass(classId)
        res.json(userClass)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'Internal Server Error',
            description: e
        })
    }
}

module.exports = {
    getRandomUserClass,
    getUserClass
}
