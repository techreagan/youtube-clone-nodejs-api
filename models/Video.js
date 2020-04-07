const mongoose = require('mongoose')
// const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema

const VideoSchema = new Schema(
  {
    title: {
      type: String,
      minlength: [3, 'Must be three characters long']
    },
    description: {
      type: String,
      minlength: [6, 'Must be three characters long']
    },
    views: {
      type: Number,
      default: 0
    },
    url: {
      type: String
    },
    status: {
      type: String,
      enum: ['draft', 'private', 'public'],
      default: 'draft'
    },
    categoryId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category'
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
)

VideoSchema.virtual('likes', {
  ref: 'Feeling',
  localField: '_id',
  foreignField: 'videoId',
  justOne: false,
  count: true,
  match: { type: 'like' }
})

VideoSchema.virtual('dislikes', {
  ref: 'Feeling',
  localField: '_id',
  foreignField: 'videoId',
  justOne: false,
  count: true,
  match: { type: 'dislike' }
})

// VideoSchema.plugin(uniqueValidator, { message: '{PATH} already exists.' })

module.exports = mongoose.model('Video', VideoSchema)
