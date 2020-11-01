const mongoose = require('mongoose')

const selectionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  // productionLine:
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Selection', selectionSchema)
