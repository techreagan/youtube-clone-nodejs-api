const express = require('express')
const {
  getChannels,
  getSubscribers,
  createSubscriber
} = require('../controllers/subscriptions')

const Subscription = require('../models/Subscription')

const router = express.Router()

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.post('/', protect, createSubscriber)

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
  .get(advancedResults(Subscription, [{ path: 'channelId' }]), getChannels)

module.exports = router
