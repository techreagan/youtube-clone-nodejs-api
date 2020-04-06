const path = require('path')
const fs = require('fs')
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Video = require('../models/Video')

// @desc    Get videos
// @route   GET /api/v1/videos
// @access  Private/Admin
exports.getVideos = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc    Get single video
// @route   GET /api/v1/videos/:id
// @access  Private/Admin
exports.getVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id)

  if (!video) {
    return next(new ErrorResponse(`No video with that id of ${req.params.id}`))
  }

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
          title: video.originalName,
        },
        { new: true, runValidators: true }
      )

      res.status(200).json({ success: true, data: videoModel })
    }
  )
})

// @desc    Update video
// @route   PUT /api/v1/videos
// @access  Private/Admin
exports.updateVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!video)
    return next(new ErrorResponse(`No video with that id of ${req.params.id}`))

  res.status(200).json({ success: true, data: video })
})

// @desc    Delete video
// @route   DELETE /api/v1/videos/:id
// @access  Private/Admin
exports.deleteVideo = asyncHandler(async (req, res, next) => {
  // const video = await video.findByIdAndDelete(req.params.id)
  let video = await Video.findById(req.params.id)

  if (!video) {
    return next(new ErrorResponse(`No video with id of ${req.params.id}`, 404))
  }

  // if (video) {
  fs.unlink(
    `${process.env.FILE_UPLOAD_PATH}/videos/${video.url}`,
    async (err) => {
      await video.remove()
      if (err) {
        return next(
          new ErrorResponse(
            `Something went wrong, couldn't delete video photo`,
            500
          )
        )
      }

      return res.status(200).json({ success: true, video })
    }
  )
  // } else {
  //   await category.remove()
  //   return res.status(200).json({ success: true, category })
  // }
})
