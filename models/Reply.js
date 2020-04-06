const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ReplySchema = new Schema(
  {
    text: {
      type: String,
      minlength: [3, 'Must be three characters long'],
      required: [true, 'Text is required'],
    },
    commentId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
      required: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
)
ReplySchema.pre('find', function () {
  this.populate({ path: 'userId', select: 'channelName' })
})

module.exports = mongoose.model('Reply', ReplySchema)
