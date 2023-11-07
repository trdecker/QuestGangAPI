/**
 * @file apiRoutes.js
 * @authors Tad Decker, Indy Brown, Gavin Hart, Mo Ray (Tech Titans)
 * @Date 11/1/2023
 * 
 * The routes that API calls will follow when called by a user.
 */

const express = require('express')
const router = express.Router()
const userClassController = require('../controllers/userClassController')
const monsterController = require('../controllers/monsterController')
const characterController = require('../controllers/characterController')
const questController = require('../controllers/questController')

// router.get('/health', )
// router.get('')
router.get('/userClasses/random', userClassController.getRandomUserClass)
router.get('/userClasses', userClassController.getUserClass)
router.get('/')
router.get('/monster/random', monsterController.getRandomMonster)

// ##### Quest routes #####

// Returns a list of Quests for the user to choose from. These are added to the database Quests, with the status "NOT_ACTIVE".
router.put('/quests/request', questController.requestQuests)
// Choose a quest to begin. Pass the questId as a query. Quest is marked as "ACTIVE", TODO: and the rest are discarded.
router.put('/quests/accept', questController.acceptQuest)
// Returns status of quest.
router.get('/quests/status')
// Leave a quest prematurely. Rewards for doing the quest are NOT attained.
router.put('/quests/leave')

// router.post('/character', characterController.createCharacter)

module.exports = router
