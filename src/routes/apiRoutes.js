const express = require('express')
const router = express.Router()
const userClassController = require('../controllers/userClassController')
const chracterController = require('../controllers/characterController')
const questController = require('../controllers/questingController')

// router.get('/health', )
// router.get('')
router.get('/userClasses/random', userClassController.getRandomUserClass)
router.get('/userClasses', userClassController.getUserClass)
router.get('/')
router.put('/questing/completeQuest', questController.completeQuest)
router.post('/questing', questController.sendRandomQuest)
router.post('/monster/random', monsterController.getRandomMonster)

router.post('/character', chracterController.createCharacter)

module.exports = router
