const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')

const Comment = require('../models/Comment')
const Reply = require('../models/Reply')

// @desc    Get comments
// @route   GET /api/v1/replies
// @access  Public
exports.getReplies = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc    Create reply
// @route   POST /api/v1/replies/
// @access  Private
exports.createReply = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findOne({
    _id: req.body.commentId
  })

  if (!comment) {
    return next(
      new ErrorResponse(`No comment with id of ${req.body.commentId}`, 404)
    )
  }
  const reply = await Reply.create({
    ...req.body,
    userId: req.user._id
  })

  return res.status(200).json({ sucess: true, data: reply })
})

// @desc    Update comment
// @route   PUT /api/v1/comments/:id
// @access  Private
exports.updateReply = asyncHandler(async (req, res, next) => {
  let reply = await await Reply.findById(req.params.id).populate({
    path: 'commentId',
    select: 'userId videoId',
    populate: { path: 'videoId', select: 'userId' }
  })

  if (!reply) {
    return next(new ErrorResponse(`No reply with id of ${req.params.id}`, 404))
  }

  if (
    reply.userId.toString() == req.user._id.toString() ||
    reply.commentId.videoId.userId.toString() != req.user._id.toString()
  ) {
    reply = await Reply.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({ success: true, data: reply })
  } else {
    return next(
      new ErrorResponse(`You are not authorized to update this reply`, 400)
    )
  }
})

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Private
exports.deleteReply = asyncHandler(async (req, res, next) => {
  let reply = await await Reply.findById(req.params.id).populate({
    path: 'commentId',
    select: 'userId videoId',
    populate: { path: 'videoId', select: 'userId' }
  })

  if (!reply) {
    return next(new ErrorResponse(`No reply with id of ${req.params.id}`, 404))
  }

  if (
    reply.userId.toString() == req.user._id.toString() ||
    reply.commentId.videoId.userId.toString() == req.user._id.toString()
  ) {
    await reply.remove()
  } else {
    return next(
      new ErrorResponse(`You are not authorized to delete this reply`, 400)
    )
  }

  return res.status(200).json({ success: true, reply })
})
