const dotenv = require('dotenv')
const express = require('express')
const app = express()

dotenv.config()
const port = process.env.PORT

require('../config/database.js')

const apiRoutes = require('./routes/apiRoutes')
app.use(express.json())
app.use('/', apiRoutes)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
