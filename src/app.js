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
const cors = require('cors')

const app = express()

// Get environment variables
dotenv.config()
const port = process.env.PORT ?? 80
const URI = process.env.URI

// Connect to MongoDB
connect(URI)

// Use API routes from apiRoutes.js
app.use(express.json())
app.use('/', apiRoutes)

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:80', 'https://questgangapi.onrender.com', process.env.IP_1],
    methods: 'GET, PUT, POST, DELETE, HEAD, PATCH',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization'
}

app.use(cors(corsOptions))

// Begin server!
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
