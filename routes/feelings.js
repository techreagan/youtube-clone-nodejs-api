const express = require('express')
const { createFeeling } = require('../controllers/feelings')

const router = express.Router()

// const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.use(protect)
// router.use(authorize('admin'))

router
  .route('/')
  // .get(advancedResults(Category), getCategories)
  .post(createFeeling)

// router
//   .route('/:id')
//   // .get(getCategory)
//   .put(updateComment)
//   .delete(deleteComment)

// router.route('/:videoId/videos').get(getCommentByVideoId)

module.exports = router
