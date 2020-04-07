const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Comment = require('../models/Comment')
const Video = require('../models/Video')
const Feeling = require('../models/Feeling')

// @desc    Get comments
// @route   GET /api/v1/categories
// @access  Private/Admin
exports.getComments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc    Get comments by video id
// @route   GET /api/v1/comments/:videoId/videos
// @access  Private/Admin
exports.getCommentByVideoId = asyncHandler(async (req, res, next) => {
  const comments = await Comment.find({ videoId: req.params.videoId })
    .populate('userId')
    .populate('replies')
  // const comments = await Comment.find({})

  if (!comments) {
    return next(
      new ErrorResponse(
        `No comment with that video id of ${req.params.videoId}`
      )
    )
  }

  res.status(200).json({ sucess: true, data: comments })
})

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

// @desc    Update comment
// @route   PUT /api/v1/comments/:id
// @access  Private/Admin
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id).populate('videoId')

  if (!comment) {
    return next(
      new ErrorResponse(`No comment with id of ${req.params.id}`, 404)
    )
  }

  if (
    comment.userId.toString() == req.user._id.toString() ||
    comment.videoId.userId.toString() == req.user._id.toString()
  ) {
    comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({ success: true, data: comment })
  } else {
    return next(
      new ErrorResponse(`You are not authorized to update this comment`, 400)
    )
  }
})

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Public
exports.deleteComment = asyncHandler(async (req, res, next) => {
  // const comment = await comment.findByIdAndDelete(req.params.id)
  let comment = await Comment.findById(req.params.id).populate('videoId')

  if (!comment) {
    return next(
      new ErrorResponse(`No comment with id of ${req.params.id}`, 404)
    )
  }

  if (
    comment.userId.toString() == req.user._id.toString() ||
    comment.videoId.userId.toString() == req.user._id.toString()
  ) {
    await comment.remove()
  } else {
    return next(
      new ErrorResponse(`You are not authorized to delete this comment`, 400)
    )
  }

  return res.status(200).json({ success: true, comment })
})
