const express = require('express')
const {
  getHistories,
  createHistory,
  deleteHistory
} = require('../controllers/histories')

const History = require('../models/History')

const router = express.Router()

const advancedResults = require('../middleware/advancedResults')
const { protect } = require('../middleware/auth')

router.use(protect)

router
  .route('/')
  .get(
    advancedResults(History, [{ path: 'videoId' }], { status: 'private' }),
    getHistories
  )
  .post(createHistory)

router
  .route('/:id')
  // .get(getCategory)
  // .put(updateCategory)
  .delete(deleteHistory)

module.exports = router
