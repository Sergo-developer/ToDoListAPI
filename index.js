const express = require('express')
const app = express()
const port = 3000
const Datastore = require('@seald-io/nedb')
const db = new Datastore({ filename: 'db', autoload: true })
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(cors())

app.get('/', async (req, res) => {
  const docs = await db.findAsync({})
  res.send(docs)
})

app.delete('/', async (req, res) => {
  await db.removeAsync({ _id: req.body._id }, {})
  res.send("Deleted")
})

app.post('/', async (req, res) => {
  await db.insertAsync({ name: req.body.name, description: req.body.description })
  res.send("Ok")
})

app.put('/', async (req, res) => {
  await db.updateAsync({_id: req.body._id},{ name: req.body.name, description: req.body.description }, {})
  res.send("Ok")
})

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}

module.exports = app
