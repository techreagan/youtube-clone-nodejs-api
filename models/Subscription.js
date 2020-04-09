const mongoose = require('mongoose')

const Schema = mongoose.Schema

const SubscriptionSchema = new Schema(
  {
    subscriberId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Subscriber id is required']
    },
    channelId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Subscription', SubscriptionSchema)
