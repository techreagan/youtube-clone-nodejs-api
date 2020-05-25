const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Video = require('../models/Video')
const User = require('../models/User')

// @desc    Search for videos and channels
// @route   POST /api/v1/search/
// @access  Private/Admin
exports.search = asyncHandler(async (req, res, next) => {
  // const category = await Category.create({
  //   ...req.body,
  //   userId: req.user.id
  // })

  const text = req.body.text

  let channels = await User.find({ $text: { $search: text } })
  const videos = await Video.find({ $text: { $search: text } }).populate({
    path: 'userId'
  })

  channels.push(...videos)

  let search = channels

  // console.log(...channels)

  // console.log(search)
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 12
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = search.length
  const totalPage = Math.ceil(total / limit)

  // console.log(total)
  // console.log(search)
  if (parseInt(req.query.limit) !== 0) {
    search = search.slice(startIndex, endIndex)
  }

  console.log(search.length)
  // console.log(search)

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
