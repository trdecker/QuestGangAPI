const express = require('express')
const router = express.Router()
const userClassController = require('../controllers/userClassController')

// router.get('/health', )
// router.get('')
router.get('/userClasses/random', userClassController.getRandomClass)
router.get('/')

module.exports = router
