/**
 * @file app.js
 * @authors Tad Decker, Indy Brown, Gavin Hart, Mo Ray (Tech Titans)
 * @Date 11/1/2023
 * 
 * Entry point for Node.js endpoint using Express. Connects to MongoDB using Mongoose.
 */

const dotenv = require('dotenv')
const express = require('express')
const apiRoutes = require('./routes/apiRoutes')
const connect = require('../config/database.js')

const app = express()

// Get environment variables
dotenv.config()
const port = process.env.PORT
const URI = process.env.URI

// Connect to MongoDB
connect(URI)

// Use API routes from apiRoutes.js
app.use(express.json())
app.use('/', apiRoutes)

// Begin server!
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
