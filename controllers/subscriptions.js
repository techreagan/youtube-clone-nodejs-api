const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Comment = require('../models/Comment')
const Video = require('../models/Video')
const Subscription = require('../models/Subscription')

// Get subscriber
// Get Channels
// Subscribe to a channel
// Add subscribers to users

// @desc    Get all subscribers
// @route   GET /api/v1/subscriptions/subscribers
// @access  Private/User
exports.getSubscribers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc    Get all channels subscribed to
// @route   GET /api/v1/subscriptions/channels
// @access  Private/User
exports.getChannels = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc    Check subscription
// @route   POST /api/v1/subscriptions/check
// @access  Private/User
exports.checkSubscription = asyncHandler(async (req, res, next) => {
  const channel = await Subscription.findOne({
    channelId: req.body.channelId,
    subscriberId: req.user._id
  })

  if (!channel) {
    return res.status(200).json({ success: true, data: {} })
  }

  return res.status(200).json({ success: true, data: channel })
})

// @desc    Create subscriber
// @route   Post /api/v1/subscriptions
// @access  Private
exports.createSubscriber = asyncHandler(async (req, res, next) => {
  const { channelId } = req.body

  if (channelId.toString() == req.user._id.toString()) {
    return next(new ErrorResponse(`You can't subscribe to your own channle`))
  }

  let subscription = await Subscription.findOne({
    channelId: channelId,
    subscriberId: req.user._id
  })

  if (subscription) {
    await subscription.remove()
    return res.status(200).json({ success: true, data: {} })
  } else {
    subscription = await Subscription.create({
      subscriberId: req.user._id,
      channelId: channelId
    })
  }

  res.status(200).json({ success: true, data: subscription })
})

// @desc    Get subscriped videos
// @route   GET /api/v1/subscriptions/videos
// @access  Private/User
exports.getSubscripedVideos = asyncHandler(async (req, res, next) => {
  const channels = await Subscription.find({
    subscriberId: req.user._id
  })

  const channelsId = channels.map((channel) => {
    return {
      userId: channel.channelId.toString()
    }
  })

  const videos = await Video.find({ status: 'public' }).or(channelsId)

  return res.status(200).json({ success: true, data: videos })
})
