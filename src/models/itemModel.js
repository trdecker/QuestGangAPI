/**
 * @file item.js
 * @date 11/16/2023
 */

 const mongoose = require('mongoose')
 
 const itemSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id: String,
    name: String,
    type: String,
    damage: String,
    sellPriceInGold: Number,
    description: String,
    equipped: Boolean
 })
 
 const itemModel = mongoose.model('item', itemSchema, 'items')
 
 /**
  * @param {String} itemId
  * @returns {Object} The found item
  */
 async function getItem(itemId) {
     try {
         const foundItem = await itemModel.find({ id: itemId }).exec()
         return foundItem
     } catch (e) {
         console.error('Error while getting item')
         throw (e)
     }
 }

 
 module.exports = {
    getItem, itemSchema
 }
 