const MongoClient = require('mongodb').MongoClient
const db = require('./config/db')

const uri = 'mongodb+srv://heroku_3q2qt9k2:nitroshot3@cluster-3q2qt9k2.9wnvx.mongodb.net/heroku_3q2qt9k2?retryWrites=true&w=majority'
MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, client) {
  if (err) {
    console.log('Error occurred while connecting to MongoDB Atlas... \n', err)
  }
  console.log('Connected...')
  const collection = client.db('test').collection('devices')
  // perform actions on the collection object
  client.close()
})
