const mongoose = require('mongoose')
const URI = process.env.URI

mongoose.connect(URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + URI)
})

mongoose.connection.on('error', (e) => {
  console.log('Mongoose connection error: ' + e)
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected')
})