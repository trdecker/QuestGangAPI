const express = require('express')
const router = express.Router()
const userClassController = require('../controllers/userClassController')
const chracterController = require('../controllers/characterController')

// router.get('/health', )
// router.get('')
router.get('/userClasses/random', userClassController.getRandomUserClass)
router.get('/userClasses', userClassController.getUserClass)
router.get('/')

router.post('/character', chracterController.createCharacter)

module.exports = router
