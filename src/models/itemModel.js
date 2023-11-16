/**
 * @file item.js
 * @date 11/16/2023
 */

 const mongoose = require('mongoose')
 
 const itemSchema = new mongoose.Schema({
    id: String,
    name: String,
    type: String,
    sellPriceInGold: Number,
    description: String
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
    getItem
 }
 