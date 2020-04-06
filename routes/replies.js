const express = require('express')
const {
  getReplies,
  createReply,
  updateReply,
  deleteReply,
} = require('../controllers/replies')

const Reply = require('../models/Reply')

const router = express.Router()

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router
  .route('/')
  .get(advancedResults(Reply), getReplies)
  .post(protect, createReply)

router
  .route('/:id')
  // .get(getCategory)
  .put(protect, updateReply)
  .delete(protect, deleteReply)

module.exports = router
