const express = require('express')
const { createFeeling, checkFeeling } = require('../controllers/feelings')

const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

router.use(protect)

router.route('/').post(createFeeling)

router.route('/check').post(checkFeeling)

// router
//   .route('/:id')
//   // .get(getCategory)
//   .put(updateComment)
//   .delete(deleteComment)

// router.route('/:videoId/videos').get(getCommentByVideoId)

module.exports = router
