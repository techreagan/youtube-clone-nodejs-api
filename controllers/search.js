const asyncHandler = require('../middleware/async')

const Video = require('../models/Video')
const User = require('../models/User')

// @desc    Search for videos and channels
// @route   POST /api/v1/search/
// @access  Public
exports.search = asyncHandler(async (req, res, next) => {
  const text = req.body.text

  let channels = await User.find({ $text: { $search: text } }).populate({
    path: 'videos'
  })
  const videos = await Video.find({ $text: { $search: text } }).populate({
    path: 'userId'
  })

  channels.push(...videos)

  let search = channels

  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 12
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = search.length
  const totalPage = Math.ceil(total / limit)

  if (parseInt(req.query.limit) !== 0) {
    search = search.slice(startIndex, endIndex)
  }

  // Pagination result
  const pagination = {}

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  if (parseInt(req.query.limit) !== 0) {
    res.status(200).json({
      success: true,
      count: search.length,
      totalPage,
      pagination,
      data: search
    })
  } else {
    res.status(200).json({
      success: true,
      data: search
    })
  }
})
