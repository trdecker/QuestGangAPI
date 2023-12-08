/**
 * @file questController.js
 * @author Tad Decker
 * @date 11/1/2023
 */

const questModel = require('../models/questModel')
const locationModel = require('../models/locationModel')
const characterModel = require('../models/characterModel')
const monsterModel = require('../models/monsterModel')
const { userActions, questStatus, userStatus } = require('../types')

/**
 * Generates a random ID using the current date and a random number 0-10000
 * @returns {String} random ID
 */
function generateId() {
    const now = Date.now()
    const rand = Math.floor(Math.random() * 10000)
    return `${now}${rand}`
}

/**
 * @description sends a list of quests to the user. Saves those quests in
 * "quests" with status NOT_ACTIVE. If the user DOES NOT have the status "NOT_IN_QUEST",
 * then do nothing (they can't start a new quest if they're already in one!)
 * @param {Object} req 
 * @param {Object} res 
 */
async function requestQuests(req, res) {
    try {
        console.log.apply(req)
        const userId = req.body.userId ?? null
        const numQuests = req.body.numQuests ?? 3
        console.log(userId)
        console.log(numQuests)

        // Must send user ID
        if (!userId) {
            res.status(400).send('User ID required')
            return
        }

        // Get the current user
        const user = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (!user) {
            res.status(404).send('Character not found')
            return
        }

        const userLevel = user.level

        // Check if user is dead
        if (user.status.userStatus === userStatus.DEAD) {
            res.status(403).send('User is DEAD. Create a new character to start over!')
            return
        }

        // User MUST NOT be in a quest or combat!
        if (user.status.userStatus !== userStatus.NOT_IN_QUEST) {
            res.status(403).send('User is already in quest! Cannot start a new quest until current is finished.')
            return
        }

        // Delete past quest options
        questModel.deleteCharacterQuests(userId, questStatus.NOT_ACTIVE)

        const locations = await locationModel.getLocations()
        const numLocations = locations.length
        const LOCATIONS_IN_QUEST = 4

        // TODO: Finish this. This will make quests more random and interesting
        // const quests2 = []
        // const numLayers = Math.floor(Math.random() * 5) + 1
        // for (let i = 0; i < numQuests; i++) {
        //     console.log('In generate Quest. Quest number: ', i)
        //     quests2.push(await generateQuest(locations, numLayers))
        // }

        // console.log(quests2)

        const quests = []

        for (let i = 0; i < numQuests; i++) {
            // For now, have only 4 locations.
            const location1 = locations.at(Math.floor(Math.random() * numLocations))
            const location2 = locations.at(Math.floor(Math.random() * numLocations))
            const location3 = locations.at(Math.floor(Math.random() * numLocations))
            const location4 = locations.at(Math.floor(Math.random() * numLocations))

            location1.id = generateId()
            location2.id = generateId()
            location3.id = generateId()
            location4.id = generateId()

            // Create arry of random monsters
            const monsters = []
            for (let i = 0; i < LOCATIONS_IN_QUEST-1; i++) {
                const monsterId = Math.floor(Math.random() * 10) + 1
                const monster = await monsterModel.getSpecifiedMonster(monsterId)
                monster.boss = false
                const monsterToAdd = {
                    monsterName: monster.monsterName,
                    boss: false,
                    level: monster.level,
                    attack: monster.attack,
                    defense: monster.defense,
                    hp: 10,
                    condition: monster.condition,
                    symbol: monster.symbol,
                    id: i.toString()
                }
                monsters.push(monsterToAdd)
            }

            // Get boss monster
            const monsterId = Math.floor(Math.random() * 10) + 1
            const boss = await monsterModel.getSpecifiedMonster(monsterId)
            const bossMonster = {
                monsterName: boss.monsterName,
                boss: true,
                level: boss.level,
                attack: boss.attack,
                defense: boss.defense,
                hp: 40,
                condition: boss.condition,
                symbol: boss.symbol,
                id: "99"
            }

            const quest = {
                name: `Quest ${i}`,
                userId: userId,
                status: questStatus.NOT_ACTIVE,
                difficultyLvl: i, // FIXME
                rewardGp: 100, // FIXME: Pass in user level to get scaled rewards. For now placeholder value of 1
                questId: generateId(),
                locations: [
                    {
                        name: location1.name,
                        locationId: '1',
                        monsters: [],
                        neighbors: [{
                            name: location2.name,
                            locationId: '2'
                        }, 
                        {
                            name: location3.name,
                            locationId: '3'
                        }]
                    },
                    {
                        name: location2.name,
                        locationId: '2',
                        monsters: [monsters.at(1)],
                        neighbors: [{
                            name: location4.name,
                            locationId: '4'
                        }]
                    },
                    {
                        name: location3.name,
                        locationId: '3',
                        monsters: [monsters.at(2)],
                        neighbors: [{
                            name: location4.name,
                            locationId: '4'
                        }]
                    },
                    {
                        name: location4.name,
                        locationId: '4',
                        monsters: [bossMonster],
                        neighbors: []
                    }
                ]
            }

            await questModel.saveQuest(quest)
            quests.push(quest)
        }

        const json = {
            quests: quests
        }

        res.json(json)

    } catch (e) {
        console.error(e)
        res.status(500).json({ 
            error: 'Internal Server Error', 
            description: e
        })
    }
}

function generateQuest(possibleLocations, numLayers) {
    const locations = recGenerateLayer(possibleLocations, numLayers)

    return locations
}

async function recGenerateLayer(possibleLocations, numLayers) {
    console.log(`In recGenerateLayer. Layer number: ${numLayers}`)

    // The number of locations possible in each layer are either 1 for the end (when numLayers is 1) or 1-5.
    let numLocations
    if (numLayers === 1)
        numLocations = 1
    else 
        numLocations = Math.floor(Math.random() * 5) + 1

    // Create the location(s)
    const layerLocations = []

    for (let i = 0; i < numLocations; i++) {
        const randLoc = possibleLocations.at(Math.floor(Math.random() * possibleLocations.length))
        const loc = {
            name: randLoc.name,
            locationId: generateId(),
            monsters: [],
            neighbors: []
        }
        layerLocations.push(loc)
    }

    // If it's the LAST layer, return before creating children
    if (numLayers === 1)
        return layerLocations

    // Get the next layer of locations
    const children = await recGenerateLayer(possibleLocations, numLayers-1)
    console.log('Generating children. Layer number: ', numLayers)
    console.log(layerLocations)

    // For each layerLocation, assign a random number of the children as their neighbors
    layerLocations.forEach((location) => {
        console.log(location.name)
        // Possible amounts are 1 - the amount of children
        const numChildren = Math.floor(Math.random() * children.length) + 1

        // Assign the chhildren to the location.
        for (let i = 0; i < numChildren; i++) {
            // FIXME: Start here in debugging!!!!!!!!
            // Make sure we at least add ONE child TODO: This could be a problem child :)
            const maxAttempts = 10
            let attempts = 0
            let childAdded = false
            do {
                childAdded = false
                const randIndex = Math.floor(Math.random() * children.length)
                const child = children.at(randIndex)

                // Check the child isn't already added. If they aren't, add them!
                if (!location.neighbors.some((loc) => loc.locationId === child.locationId)) {
                    location.neighbors.push(child.locationId)
                    childAdded = true
                }
                else attempts++
    
            } while (!childAdded || attempts < maxAttempts)
        }
    })

    return layerLocations
}

/**
 * @description Accept a quest.
 * Required queries: userId, questId
 * @param {Object} req 
 * @param {Object} res 
 */
async function acceptQuest(req, res) {
    try {
        const userId = req.body.userId ?? null
        const questId = req.body.questId ?? null

        if (!userId) {
            res.status(400).send('User ID required')
            return
        }

        if (!req.body?.questId) {
            res.status(404).send('Quest ID rquired')
            return
        }

        // Get the current user
        const user = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (!user) {
            res.status(404).send('Character not found')
            return
        }

        // If the user is already in a quest, don't let them get a new one!
        if (user.status.userStatus !== userStatus.NOT_IN_QUEST) {
            res.status(403).send('User is already in quest! Cannot start a new quest until current is finished.')
            return
        }

        // Check if quest exists by finding it
        console.log('questId: ', questId)
        const quest = await questModel.getQuest(questId)

        // If quest not found, return 404
        if (!quest) {
            res.status(404).send('Quest: ' + quest +  'not found')
            return
        }

        // Quest MUST be already associated with user
        if (quest.userId !== userId) {
            res.status(403).send('Character does not own quest!')
            return
        }

        // If quest isn't NOT active, don't allow to begin again.
        if (quest.status !== questStatus.NOT_ACTIVE) {
            res.status(403).send('Quest is not availble to begin.')
            return
        }

        // Change the chosen quest status to ACTIVE
        quest.status = questStatus.ACTIVE
        await questModel.updateStatus(questId, quest.status)

        // Delete all the quests that weren't chosen
        await questModel.deleteCharacterQuests(userId, questStatus.NOT_ACTIVE)

        // If the first quest has a monster, put the player into combat!
        if (quest.locations[0].monsters.length > 0) {
            quest.status.userStatus = userStatus.IN_COMBAT
            await characterModel.updateStatus(userId, user.status)

            res.json({
                monsters: quest.locations[0].monsters[0],
                userStatus: user.status
            })
        }
        // Else, return the choices they can make and update character to IN_QUEST
        else {        
            const status = {
                userStatus: userStatus.IN_QUEST,
                choices: quest.locations[0].neighbors,
                questId,
                locationId: quest.locations[0].locationId
            }
            await characterModel.updateStatus(userId, status)

            res.json(status)
        }
    } catch (e) {
        res.status(500).json({
            error: 'Internal Server Error',
            description: e
        })
    }
}

/**
 * @description Leave a quest the user is in. For now, users can only be in ONE quest at a time, so no need to check for questId.
 * @param {Object} req 
 * @param {Object} res 
 */
async function leaveQuest(req, res) {
    try {
        const userId = req.query.userId

        // If no userId, send error
        if (!userId) {
            res.status(400).send('User ID required')
            return
        }

        // Get the current user
        const user = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (!user) {
            res.status(404).send('Character not found')
            return
        }

        // If the user is in combat, don't let them leave!
        if (user.status.userStatus === userStatus.IN_COMBAT) {
            res.status(403).send('User is in combat! You must attempt to "run" from the combat before leaving the quest.')
            return
        }

        // If the user is NOT in a quest, they don't have a quest to leave.
        if (user.status.userStatus === userStatus.NOT_IN_QUEST) {
            res.status(403).send('The user isn\'t in a quest to leave.')
            return
        }

        const newStatus = { userStatus: "NOT_IN_QUEST" }

        const questId = user.status.questId

        // Update the user to NOT_IN_QUEST
        await characterModel.updateStatus(userId, newStatus)

        // Update the quest to INCOMPLETE
        await questModel.updateStatus(questId, questStatus.TERMINATED)

        res.send('You have left the quest.')
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: 'Internal Server Error',
            description: e
        })
    }
}

/**
 * @description Make a choice. Right now just to change locations. Can ONLY be done when IN_QUEST and not IN_COMBAT!
 * @param {Object} req 
 * @param {Object} res 
 */
async function makeChoice(req, res) {
    try {
        const userId = req.body.userId
        const choice = req.body.choice

        if (!userId) {
            res.status(400).send('User ID required')
            return
        }

        if (!choice) {
            res.status(400).send('Choice required')
            return
        }

        // Get the current user
        const user = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (!user) {
            res.status(404).send('Character not found')
            return
        }

        const questId = user.status.questId
        const choices = user.status.choices

        // Check if quest exists by finding it
        const quest = await questModel.getQuest(questId)

        if (!quest) {
            res.status(404).send('Quest not found')
            return
        }

        // The user MUST be IN_QUEST!
        if (user.status.userStatus === userStatus.NOT_IN_QUEST) {
            res.status(403).send('Not in a quest, no choice to make!')
            return
        }

        locations = quest.locations
        chosenLocation = locations.find(loc => loc.locationId === choice)
        user.status.locationId = choice

        if (user.status.userStatus === userStatus.IN_COMBAT) {
            res.status(403).json({
                message: "In combat, must do an action!",
                status: user.status,
                monsters: chosenLocation.monsters
            })
            return
        }

        if (user.status.userStatus === userStatus.DEAD) {
            res.status(403).send('Character is dead. Make a new character to play again.')
            return
        }

        // Check if choice is valid
        if (!choices.some((validChoice) => validChoice.locationId === choice)) {
            res.status(403).json({
                message: 'That is not a valid choice!',
                validChoices: choices
            })
            return
        }

        if (chosenLocation.monsters.length > 0) {
            
            user.status.userStatus = userStatus.IN_COMBAT
            user.status.choices = []
            user.status.actions = ["attack", "run"]
        }
        else if (chosenLocation.neighbors)  {
            user.status.choices = chosenLocation.neighbors
        }
        else user.status.choices = []

        await characterModel.updateStatus(userId, user.status)

        res.json({
            status: user.status,
            monsters: chosenLocation.monsters
        })
    } catch (e) {
        console.error(e)
        res.status(500).send('Error making choice')
    }
}

/**
 * @description ONLY for use while in combat.
 * @param {Object} req 
 * @param {Object} res 
 */
async function doAction(req, res) {
    try {
        const userId = req.body.userId
        const action = req.body.action

        if (!userId || !action) {
            res.status(400).send('User ID and action are required')
            return
        }

        // Get the current user
        const user = await characterModel.getCharacter(userId)

        // If the user doesn't exist, send a 404
        if (!user) {
            res.status(404).send('Character not found')
            return
        }

        const status = user.status
        const questId = status.questId

        // Check if user is dead
        if (status.userStatus === userStatus.DEAD) {
            res.status(403).send('Character is dead. Make a new character to play again.')
            return
        }

        // The user MUST be IN_COMBAT!
        if (status.userStatus !== userStatus.IN_COMBAT) {
            res.status(403).send('Character is not in combat!')
            return
        }

        // Get the quest
        const quest = await questModel.getQuest(questId)

        // If quest not found, return 404
        if (!quest) {
            res.status(404).send('Quest not found')
            return
        }

        // Get location in quest
        const location = quest.locations.find((loc) => loc.locationId === status.locationId)
        // Get the monster. For now assume there is only ONE monster per location! TODO: Get monster with monsterId value in body
        const monster = location.monsters.at(0)

        // ##### USER TURN #####
        const validActions = status.actions
    
        // Check if action is valid
        if (!validActions.includes(action)) {
            res.status(400).json({
                message: 'That is not a valid action!',
                validActions: validActions,
                character: {
                    status: status,
                    name: user.name,
                    userId: user.userId,
                    classId: user.classId,
                    condition: user.condition,
                    level: user.level,
                    mana: user.mana,
                    hp: user.hp
                },
                monsters: location.monsters
            })
            return
        }
        
        // Get the user's equipped weapon and armor FIXME: user.weapons is returning as undefined!
        const weapon = user.weapons ? user.weapons.find((weapon) => weapon.equipped === true) : null
        const armor = user.armor.find((armor) => armor.equipped === true)

        let userAttack = 5  // temp set to 1 because line below was returnin NaN

        // If a user tries to ATTACK
        if (action === userActions.ATTACK) {
            console.log("User attack: ", userAttack)
            console.log("Weapon: ", weapon)
            // Reduce monster's health by the user's attack and the damageMod of the weapon they're useing
            // userAttack = weapon ? user.attack += weapon.damage : user.attack
            // Damage monster. Raise to zero if negative
            monster.hp -= userAttack
            // Raise to zero if negative
            monster.hp < 0 ? monster.hp = 0 : null

            await questModel.editMonsterInLocation(questId, location.locationId, monster.id, monster)     
        }

        // #### If a user tries to RUN ####
        if (action === userActions.RUN) {
            // Random number 1-3; 1 is success
            const randomNumber = Math.floor(Math.random() * 3) + 1
            // If success, set userStatus to IN_QUEST
            if (randomNumber === 1) {
                let newStatus = {
                    choices: location.neighbors,
                    locationId: location.locationId,
                    questId: quest.questId,
                    actions: [],
                    userStatus: userStatus.IN_QUEST
                }

                // If the monster was a BOSS, the quest is finished, but marked as terminated (You can't win anymore)
                if (monster.boss) {
                    newStatus = { userStatus: userStatus.NOT_IN_QUEST }
                    await questModel.updateStatus(questId, questStatus.TERMINATED)
                }

                // Update status
                await characterModel.updateStatus(userId, newStatus)
                res.json({
                    message: `Ran away successfully. ${monster.boss ? 'Quest failed: You did not kill the boss!' : ''}`,
                    character: {
                        status: newStatus,
                        name: user.name,
                        userId: user.userId,
                        classId: user.classId,
                        condition: user.condition,
                        level: user.level,
                        mana: user.mana,
                        hp: user.hp
                    }
                })
                return
            }
        }

        // Any other actions that we might include will go here.

        // Before monster's turn, check to see if monster is dead
        if (monster.hp === 0) {
            let newStatus = {
                userStatus: userStatus.IN_QUEST,
                choices: location.neighbors,
                questId,
                locationId: location.locationId
            }

            let rewardGp = 10 * monster.level

            // If the monster was a BOSS, the quest is completed!
            if (monster.boss) {
                // Give reward for finishing quest
                rewardGp += quest.rewardGp

                // Mark quest as complete and user as not in quest
                await questModel.updateStatus(questId, questStatus.COMPLETE)

                newStatus = { userStatus: userStatus.NOT_IN_QUEST }
                // Level up character
                const updatedUser = await characterModel.levelUpCharacter(user)
                        
                user.level = updatedUser.level
                user.attack = updatedUser.attack
                user.defense = updatedUser.defense
                user.hp = updatedUser.hp

                await characterModel.updateStatus(userId, { userStatus: userStatus.COMPLETE })
            }
            console.log('rewardGp: ', rewardGp)

            await characterModel.updateCharacterGold(userId, user.gold + rewardGp)
            await characterModel.updateStatus(userId, newStatus)

            // For now this assumes there is ONE and ONLY ONE monster.
            res.json({
                message: `${monster.monsterName} slain!` + (monster.boss ? ' Quest complete!' : `` + ` Earned ${rewardGp} gold.`),
                character: {
                    status: newStatus,
                    name: user.name,
                    userId: user.userId,
                    classId: user.classId,
                    condition: user.condition,
                    level: user.level,
                    mana: user.mana,
                    hp: user.hp
                }
            })
            return
        }

        // ##### MONSTER'S TURN #####
        // This will run ONLY if the function did not return earlier.
        // If monster attack is negative, raise to 1 (no attack does no damage)
        let monsterAttack = armor ? monster.attack - user.defense - armor.defense : monster.attack - user.defense
        monsterAttack <= 0 ? monsterAttack = 1 : null

        // Damage the user. If it falls beneath 0, raise to 0.
        user.hp -= monsterAttack
        user.hp < 0 ? user.hp = 0 : null
        await characterModel.updateCharacterStats(user)
        
        // Generate the message to return
        let message = ''
        if (action === userActions.ATTACK)
            message = `You attacked the ${monster.monsterName}, inflicting ${userAttack} damage.` +
            `The ${monster.monsterName} attacked back, doing ${monsterAttack} damage.`
        if (action === userActions.RUN)
            message = `You attempt to run away, and failed. The ${monster.monsterName} attacked, inflicting ${monsterAttack} damage.`

        // Check if user is dead. If they are, set userStatus to DEAD
        if (user.hp === 0) {
            status = { userStatus: userStatus.DEAD }
            await characterModel.updateStatus(userId, status)
            await questModel.updateStatus(questId, questStatus.FAILED)

            message = inputString.slice(0, -1)
            message += ', killing you. GAME OVER'
        }

        res.json({
            message,
            status: status,
            monsters: location.monsters,
            character: {
                status: status,
                name: user.name,
                userId: user.userId,
                classId: user.classId,
                condition: user.condition,
                level: user.level,
                mana: user.mana,
                hp: user.hp
            }
        })

    } catch (e) {
        console.error(e)
        res.status(500).send('Error doing action')
    }
}

module.exports = {
    requestQuests,
    acceptQuest,
    leaveQuest,
    makeChoice,
    doAction,
    generateId
}
