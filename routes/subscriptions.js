const express = require('express')
const {
  getChannels,
  getSubscribers,
  createSubscriber,
  checkSubscription,
  getSubscripedVideos
} = require('../controllers/subscriptions')

const Subscription = require('../models/Subscription')

const router = express.Router()

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.post('/', protect, createSubscriber)

router.post('/check', protect, checkSubscription)

router.route('/subscribers').get(
  protect,
  advancedResults(Subscription, [{ path: 'subscriberId' }], {
    status: 'private',
    filter: 'channel'
  }),
  getSubscribers
)

router
  .route('/channels')
  .get(
    advancedResults(Subscription, [
      { path: 'channelId', select: 'photoUrl channelName' }
    ]),
    getChannels
  )

router.route('/videos').get(protect, getSubscripedVideos)

module.exports = router
