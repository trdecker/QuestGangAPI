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
const testUserController = require('../controllers/testUserController')
const storeController = require('../controllers/storeController')
//const authMiddleware = require('../middlewares/authMiddleware')
const inventoryController = require('../controllers/inventoryController')

router.get('/userClasses/random', userClassController.getRandomUserClass)
router.get('/userClasses', userClassController.getUserClass)
router.get('/', (req, res) => {
    res.send('Hello world!')
})
router.get('/monster/random', monsterController.getRandomMonster)
// router.get('/monster', monsterController.getMonster)

// router.get('/character', characterController.getCharacter)
router.get('/characters/inventory', characterController.getCharacterInventory)
router.get('/store', storeController.getStore)



// ##### Quest routes #####

// Returns a list of Quests for the user to choose from. These are added to the database Quests, with the status "NOT_ACTIVE".
router.put('/quests/request', questController.requestQuests)
// Choose a quest to begin. Pass the questId as a query. Quest is marked as "ACTIVE", TODO: and the rest are discarded.
router.put('/quests/accept', questController.acceptQuest)
// Leave a quest prematurely. Rewards for doing the quest are NOT attained.
router.put('/quests/leave', questController.leaveQuest)

// router.post('/character', characterController.createCharacter)
router.put('/inventory/addItem', inventoryController.addItemToInventory) // general usage
router.put('/inventory/removeItem', inventoryController.removeItemfromInventory) //general usage
router.put('/store/buy', storeController.buyItem)
router.put('/store/sell', storeController.sellItem)

router.put('/quest/action', questController.doAction) // For use in combat
router.put('/quest/choice', questController.makeChoice) // For use while in quest

router.post('/character', characterController.newCharacter)
router.post('/character/signup', characterController.signup)
router.get('/character', characterController.getCharacter)
router.get('/character/status', characterController.getCharacterStatus)

router.post('/testUser/signup', testUserController.testSignup)

module.exports = router
