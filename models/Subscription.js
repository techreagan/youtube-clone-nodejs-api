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
    },
    tx:{
        type:String
    },
    expire:{
        type:Number
    }
  },
  { timestamps: true }
)

SubscriptionSchema.index({ subscriberId: 1 })
SubscriptionSchema.index({ channelId: 1 })
SubscriptionSchema.index({ createdAt: 1 })

module.exports = mongoose.model('Subscription', SubscriptionSchema)
