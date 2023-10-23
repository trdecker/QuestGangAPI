const userClassModel = require('../models/userClassModel')

async function getRandomClass(req, res) {
    try {
        const classId = Math.floor(Math.random() * 4)
        const randomClass = await userClassModel.getUserClass()
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error', 
            description: e
        })
    }
    res.json(users)
}

module.exports = {
    getRandomClass
}
