const path = require('path')
const fs = require('fs')
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Video = require('../models/Video')
const Comment = require('../models/Comment')

// @desc    Get videos
// @route   GET /api/v1/videos
// @access  Private
exports.getVideos = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc    Get single video
// @route   GET /api/v1/videos/:id
// @access  Private
exports.getVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id)
    .populate({
      path: 'categoryId'
    })
    .populate({ path: 'userId', select: 'channelName subscribers photoUrl' })
    .populate({ path: 'likes' })
    .populate({ path: 'dislikes' })
    .populate({ path: 'comments' })
  if (!video) {
    return next(new ErrorResponse(`No video with that id of ${req.params.id}`))
  }

  // const comment = await Comment.find({ videoId: video._id })
  // console.log(comment)
  // video._doc.comments = comment
  res.status(200).json({ sucess: true, data: video })
})

// @desc    Upload video
// @route   PUT /api/v1/video
// @access  Private Admin
exports.videoUpload = asyncHandler(async (req, res, next) => {
  let videoModel = await Video.create({ userId: req.user._id })
  // if (!category) {
  //   return next(
  //     new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
  //   )
  // }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a video`, 404))
  }

  const video = req.files.video

  if (!video.mimetype.startsWith('video')) {
    await videoModel.remove()
    return next(new ErrorResponse(`Please upload a video`, 404))
  }
  console.log(video.size, process.env.MAX_FILE_UPLOAD * 5)
  if (video.size > process.env.MAX_FILE_UPLOAD * 5) {
    await videoModel.remove()
    return next(
      new ErrorResponse(
        `Please upload a video less than ${
          (process.env.MAX_FILE_UPLOAD * 5) / 1000 / 1000
        }mb`,
        404
      )
    )
  }
  video.originalName = video.name.split('.')[0]
  video.name = `video-${videoModel._id}${path.parse(video.name).ext}`

  video.mv(
    `${process.env.FILE_UPLOAD_PATH}/videos/${video.name}`,
    async (err) => {
      if (err) {
        await videoModel.remove()
        console.error(err)
        return next(new ErrorResponse(`Problem with video upload`, 500))
      }

      videoModel = await Video.findByIdAndUpdate(
        videoModel._id,
        {
          url: video.name,
          title: video.originalName
        },
        { new: true, runValidators: true }
      )

      res.status(200).json({ success: true, data: videoModel })
    }
  )
})

// @desc    Update video
// @route   PUT /api/v1/videos/:id
// @access  Private/Admin
exports.updateVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if (!video)
    return next(new ErrorResponse(`No video with that id of ${req.params.id}`))

  res.status(200).json({ success: true, data: video })
})

// @desc    Update video views
// @route   PUT /api/v1/videos/:id/views
// @access  Private
exports.updateViews = asyncHandler(async (req, res, next) => {
  let video = await Video.findById(req.params.id)

  if (!video)
    return next(new ErrorResponse(`No video with that id of ${req.params.id}`))

  video.views++

  await video.save()

  res.status(200).json({ success: true, data: video })
})

// @desc    Upload thumbnail
// @route   PUT /api/v1/videos/:id/thumbnail
// @access  Private
exports.uploadVideoThumbnail = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id)
  if (!video)
    return next(new ErrorResponse(`No video with id of ${req.params.id}`, 404))

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 404))
  }

  const file = req.files.thumbnail

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 404))
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${
          process.env.MAX_FILE_UPLOAD / 1000 / 1000
        }mb`,
        404
      )
    )
  }

  file.name = `thumbnail-${video._id}${path.parse(file.name).ext}`

  file.mv(
    `${process.env.FILE_UPLOAD_PATH}/thumbnails/${file.name}`,
    async (err) => {
      if (err) {
        console.error(err)
        return next(new ErrorResponse(`Problem with file upload`, 500))
      }

      await Video.findByIdAndUpdate(req.params.id, { thumbnailUrl: file.name })

      res.status(200).json({ success: true, data: file.name })
    }
  )
})

// @desc    Delete video
// @route   DELETE /api/v1/videos/:id
// @access  Private
exports.deleteVideo = asyncHandler(async (req, res, next) => {
  let video = await Video.findOne({ userId: req.user._id, _id: req.params.id })

  if (!video) {
    return next(new ErrorResponse(`No video with id of ${req.params.id}`, 404))
  }

  // if (video) {
  fs.unlink(
    `${process.env.FILE_UPLOAD_PATH}/videos/${video.url}`,
    async (err) => {
      if (err) {
        return next(
          new ErrorResponse(
            `Something went wrong, couldn't delete video photo`,
            500
          )
        )
      }
      fs.unlink(
        `${process.env.FILE_UPLOAD_PATH}/thumbnails/${video.thumbnailUrl}`,
        async (err) => {
          // if (err) {
          //   return next(
          //     new ErrorResponse(
          //       `Something went wrong, couldn't delete video photo`,
          //       500
          //     )
          //   )
          // }
          await video.remove()
          return res.status(200).json({ success: true, video })
        }
      )
    }
  )
  // } else {
  //   await category.remove()
  //   return res.status(200).json({ success: true, category })
  // }
})
