/**
 * A test index.js file.
 * 
 * Receive request and send response
 * Check for a query
 */

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
  const thing = req.query.test
  if (thing) {
		const response = {
			message: 'You\'ve sent an API request!'
		}
    res.json(response)
  }
  else {
    res.send('Hello, World!')
  }
});

app.put('/', (req, res) => {
  const thing = req.body.thing
  if (thing) {
    res.send('Success: you sent: ' + thing)
  }
  else 
    res.send('Failure')
})

app.post('/', (req, res) => {
  const thing = req.body.thing
  if (thing) {
    res.send('Success: you sent: ' + thing)
  }
  else
    res.send('Failure')
})

app.delete('/', (req, res) => {
  const thing = req.body.thing
  if (thing) {
    res.send('Success: you sent: ' + thing)
  }
  else
    res.send('Failure')
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
});