const mongoose = require('mongoose')

const Schema = mongoose.Schema

const HistorySchema = new Schema(
  {
    searchText: {
      type: String
    },
    type: {
      type: String,
      enum: ['watch', 'search'],
      required: [true, 'Type is required']
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User id is required']
    },
    videoId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Video'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('History', HistorySchema)
