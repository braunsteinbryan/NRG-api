const mongoose = require('mongoose')

const drinkSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true
  },
  // productionLine:
  flavor: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Drink', drinkSchema)
