const express = require('express')
const {
  getVideos,
  getVideo,
  videoUpload,
  updateVideo,
  updateViews,
  uploadVideoThumbnail,
  deleteVideo
} = require('../controllers/videos')

const Video = require('../models/Video')

const router = express.Router()

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.post('/', protect, videoUpload)

router.route('/private').get(
  protect,
  advancedResults(
    Video,
    [
      { path: 'userId' },
      { path: 'categoryId' },
      { path: 'likes' },
      { path: 'dislikes' },
      { path: 'comments' }
    ],
    {
      status: 'private'
    }
  ),
  getVideos
)

router
  .route('/public')
  .get(
    advancedResults(
      Video,
      [
        { path: 'userId' },
        { path: 'categoryId' },
        { path: 'likes' },
        { path: 'dislikes' }
      ],
      { status: 'public' }
    ),
    getVideos
  )

router
  .route('/:id')
  .get(getVideo)
  .put(protect, updateVideo)
  .delete(protect, deleteVideo)

router.route('/:id/thumbnails').put(protect, uploadVideoThumbnail)
router.route('/:id/views').put(protect, updateViews)

module.exports = router
