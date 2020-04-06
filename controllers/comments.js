const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Comment = require('../models/Comment')
const Video = require('../models/Video')

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
  const comments = await Comment.find({ videoId: req.params.videoId }).populate(
    'userId'
  )

  if (!comments) {
    return next(
      new ErrorResponse(
        `No comment with that video id of ${req.params.videoId}`
      )
    )
  }

  res.status(200).json({ sucess: true, data: comments })
})

// @desc    Create comment
// @route   POST /api/v1/comments/
// @access  Public
exports.createComment = asyncHandler(async (req, res, next) => {
  console.log(req.body.videoId)
  let video = await Video.findOne({
    _id: req.body.videoId,
    status: 'public',
  })

  if (!video) {
    return next(
      new ErrorResponse(`No video with id of ${req.body.videoId}`, 404)
    )
  }
  const comment = await Comment.create({
    ...req.body,
    userId: req.user._id,
  })

  return res.status(200).json({ sucess: true, data: comment })
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

  if (comment.userId.toString() != req.user._id.toString()) {
    return next(
      new ErrorResponse(`You are not authorized to update this comment`, 400)
    )
  }

  if (comment.videoId.userId.toString() != req.user._id.toString()) {
    return next(
      new ErrorResponse(`You are not authorized to update this comment`, 400)
    )
  }
  comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({ success: true, data: comment })
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
