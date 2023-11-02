const mongoose = require('mongoose')

const userClassSchema = new mongoose.Schema({
    className: String,
    classSymbol: String,
    classId: Number
})

/*
className
"Barbarian"
classSymbol
"BARBARIAN"
classId
3
*/

const userClass = mongoose.model('userClass', userClassSchema, 'Classes')

/**
 * Return a class given a classId. Range is 1-3 INCLUSIVE
 * @param {Number} classId 
 * @returns {Array} userClass
 */
async function getUserClass(classId) {
    const query = { classId: classId }
    console.log(query)
    const res = await userClass.find(query)
    console.log('res', res)
    return res
}

module.exports = {
    getUserClass
}
