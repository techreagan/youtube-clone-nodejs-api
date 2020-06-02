const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const advancedResultsFunc = require('../utils/advancedResultsFunc')

const Video = require('../models/Video')
const Feeling = require('../models/Feeling')

// @desc    Create feeling
// @route   POST /api/v1/feelings/
// @access  Private
exports.createFeeling = asyncHandler(async (req, res, next) => {
  req.body.userId = req.user._id
  const { type, userId, videoId } = req.body

  // check video
  const video = await Video.findById(videoId)
  if (!video) {
    return next(new ErrorResponse(`No video with video id of ${videoId}`))
  }

  if (video.status !== 'public') {
    return next(
      new ErrorResponse(
        `You can't like/dislike this video until it's made pulbic`
      )
    )
  }

  // Check if feeling exists
  let feeling = await Feeling.findOne({
    videoId,
    userId
  })
  // if not - create feeling

  if (!feeling) {
    feeling = await Feeling.create({
      type,
      videoId,
      userId
    })
    return res.status(200).json({ success: true, data: feeling })
  }
  // else - check req.body.feeling if equals to feeling.type remove
  if (type == feeling.type) {
    await feeling.remove()
    return res.status(200).json({ success: true, data: {} })
  }
  // else - change feeling type
  feeling.type = type
  feeling = await feeling.save()

  res.status(200).json({ success: true, data: feeling })
})

// @desc    Check feeling
// @route   POST /api/v1/feelings/check
// @access  Private
exports.checkFeeling = asyncHandler(async (req, res, next) => {
  const feeling = await Feeling.findOne({
    videoId: req.body.videoId,
    userId: req.user._id
  })

  if (!feeling) {
    return res.status(200).json({ success: true, data: { feeling: '' } })
  }

  return res
    .status(200)
    .json({ success: true, data: { feeling: feeling.type } })
})

// @desc    Get liked videos
// @route   GET /api/v1/feelings/videos
// @access  Private
exports.getLikedVideos = asyncHandler(async (req, res, next) => {
  const likes = await Feeling.find({
    userId: req.user._id,
    type: 'like'
  })

  const videosId = likes.map((video) => {
    return {
      _id: video.videoId.toString()
    }
  })

  const populates = [{ path: 'userId', select: 'photoUrl channelName' }]
  advancedResultsFunc(req, res, Video, populates, 'public', videosId)
})
