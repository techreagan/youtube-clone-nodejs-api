const express = require('express')
const {
  getCommentByVideoId,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/comments')

const router = express.Router()

// const advancedResults = require('../middleware/advancedResults')
const { protect } = require('../middleware/auth')

router
  .route('/')
  // .get(advancedResults(Category), getCategories)
  .post(protect, createComment)

router
  .route('/:id')

  .put(protect, updateComment)
  .delete(protect, deleteComment)

router.route('/:videoId/videos').get(getCommentByVideoId)

module.exports = router
