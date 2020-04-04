const express = require('express')
const {
  getVideos,
  getVideo,
  videoUpload,
  updateVideo,
  deleteVideo
} = require('../controllers/videos')

const Video = require('../models/Video')

const router = express.Router()

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.use(protect)
// router.use(authorize('admin'))

router
  .route('/')
  .get(advancedResults(Video), getVideos)
  .post(videoUpload)

router
  .route('/:id')
  .get(getVideo)
  .put(updateVideo)
  .delete(deleteVideo)

module.exports = router
