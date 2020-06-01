const mongoose = require('mongoose')

const Schema = mongoose.Schema

const VideoSchema = new Schema(
  {
    title: {
      type: String,
      minlength: [3, 'Must be three characters long']
    },
    description: {
      type: String,
      default: ''
    },
    thumbnailUrl: {
      type: String,
      default: 'no-photo.jpg'
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

VideoSchema.index({ title: 'text' })

VideoSchema.virtual('dislikes', {
  ref: 'Feeling',
  localField: '_id',
  foreignField: 'videoId',
  justOne: false,
  count: true,
  match: { type: 'dislike' }
})

VideoSchema.virtual('likes', {
  ref: 'Feeling',
  localField: '_id',
  foreignField: 'videoId',
  justOne: false,
  count: true,
  match: { type: 'like' }
})

VideoSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'videoId',
  justOne: false,
  count: true
})

module.exports = mongoose.model('Video', VideoSchema)
