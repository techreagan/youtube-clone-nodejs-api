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

// router.use(protect)
// router.use(authorize('admin'))

router.post('/', protect, videoUpload)

router.route('/private').get(
  protect,
  advancedResults(Video, [{ path: 'userId' }, { path: 'categoryId' }], {
    status: 'private'
  }),
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

module.exports = router
