const userClassModel = require('../models/userClassModel')

async function getRandomClass(req, res) {
    try {
        console.log("In get random class")
        const classId = Math.floor(Math.random() * 3) + 1
        const randomClass = await userClassModel.getUserClass(classId)
        console.log("Class: " + randomClass)
        res.json(randomClass)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'Internal Server Error', 
            description: e
        })
    }
}

module.exports = {
    getRandomClass
}
