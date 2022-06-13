const crypto = require('crypto')
const web3Utils = require ("web3-utils");
const path = require('path')
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')

const User = require('../models/User')

const ethSigUtil = require("eth-sig-util");

const checkSignature = (nonce, signature) =>{
  const msgParams = {
    data: nonce,
    sig: signature
  };
  return ethSigUtil.recoverPersonalSignature(msgParams);
}

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  let { channelName, email, address,timespan,signature } = req.body
  address = address.toLowerCase()
  email = email.toLowerCase()

  let message = web3Utils.sha3(address+timespan)

  let addr = checkSignature(message, signature);

  addr = addr.toLowerCase()

  if (addr !== address) {
    return res.status(400).json({
      success: false,
      error: [
        { field: 'address', message: 'signature is incorrect' }
      ]
    })
  }

  let user = await User.create({
    channelName,
    email,
    address
  })

  sendTokenResponse(user, 200, res)
})

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  let { address,timespan,signature } = req.body
  address = address.toLowerCase()
  let message = web3Utils.sha3(address+timespan);
  let addr = checkSignature(message, signature);
  addr = addr.toLowerCase()
  if (addr !== address) {
    return next(new ErrorResponse('Invalid credentials', 400))
  }

  const user = await User.findOne({ address })

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 400))
  }

  sendTokenResponse(user, 200, res)
})

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })

  res.status(200).json({ success: true, data: {} })
})

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = req.user

  res.status(200).json({ success: true, data: user })
})

// @desc    Update user details
// @route   POST /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    channelName: req.body.channelName,
    email: req.body.email.toLowerCase()
  }
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
    context: 'query'
  })

  res.status(200).json({ success: true, data: user })
})

// @desc    Upload avatar
// @route   PUT /api/v1/users
// @access  Private
exports.uploadChannelAvatar = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 404))
  }

  const file = req.files.avatar

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

  file.name = `avatar-${req.user._id}${path.parse(file.name).ext}`

  file.mv(
    `${process.env.FILE_UPLOAD_PATH}/avatars/${file.name}`,
    async (err) => {
      if (err) {
        console.error(err)
        return next(new ErrorResponse(`Problem with file upload`, 500))
      }

      // await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
      req.user.photoUrl = file.name
      await req.user.save()
      res.status(200).json({ success: true, data: file.name })
    }
  )
})

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  if (!(await user.matchPassword(req.body.currentPassword))) {
    // return next(new ErrorResponse('Password is incorrect', 401))
    return res.status(400).json({
      success: false,
      error: [
        { field: 'currentPassword', message: 'Current password is incorrect' }
      ]
    })
  }

  user.password = req.body.newPassword
  await user.save()

  sendTokenResponse(user, 200, res)
})

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() })

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404))
  }

  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    })
    res.status(200).json({ success: true, data: 'Email sent' })
  } catch (err) {
    console.log(err)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(new ErrorResponse('Email could not be sent', 500))
  }
})

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex')

  console.log(resetPasswordToken)

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400))
  }

  // Set new password
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  sendTokenResponse(user, 200, res)
})

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token })
}
