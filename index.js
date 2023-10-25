/**
 * A test Node input.
 * 
 * Receive request and send response
 * Check for a query
 */
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const uri = process.env.URI

console.log(port)
console.log(uri)

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("Connected to MongoDB")
})
.catch((e) => {
  console.error("Error connecting to MongoDB", e)
})

app.use(express.json())

const bookScheme = new mongoose.Schema({
  title: String,
  author: String,
  publishedYear: String
})

const Book = mongoose.model('Book', bookScheme)

const userClassSchema = new mongoose.Schema({
  className: String,
  classSymbol: String,
  classId: Number
})

const userClass = mongoose.model('UserClass', userClassSchema, "Classes")

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})

app.get('/classes', async (req, res) => {
  res.send ("hello world")
})

app.get('/', async (req, res) => {
  try {
    const userClasses = await userClass.find(req.body)

    res.json(userClasses)
  } catch (e) {
    console.error('Serve side error', e)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/', (req, res) => {
  const thing = req.body.thing
  if (thing) {
    res.send('Success: you sent: ' + thing)
  }
  else 
    res.send('Failure')
})

app.post('/', (req, res) => {
  try {
    const newBook = new Book(req.body)
    console.log(newBook)
    const savedBook = newBook.save()
    console.log(savedBook)
    // res.json(savedBook)
    res.send("Success")
  } catch (e) {
    res.status(500)
  }
})

app.delete('/', (req, res) => {
  const thing = req.body.thing
  if (thing) {
    res.send('Success: you sent: ' + thing)
  }
  else
    res.send('Failure')
})

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  })
})