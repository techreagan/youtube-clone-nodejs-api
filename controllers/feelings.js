const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Video = require('../models/Video')
const Feeling = require('../models/Feeling')

// @desc    Create feeling
// @route   POST /api/v1/feelings/
// @access  Public
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
  // feeling = await Feeling.findByIdAndUpdate(feeling._id, req.body, {
  //   new: true,
  //   runValidators: true
  // })

  res.status(200).json({ success: true, data: feeling })
})

// @desc    Check feeling
// @route   POST /api/v1/feelings/check
// @access  Private/User
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
