const path = require('path')
const fs = require('fs')
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Category = require('../models/Category')

// @desc    Get categories
// @route   GET /api/v1/categories
// @access  Private/Admin
exports.getCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Private/Admin
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)

  if (!category) {
    return next(
      new ErrorResponse(`No category with that id of ${req.params.id}`)
    )
  }

  res.status(200).json({ sucess: true, data: category })
})

// @desc    Create Category
// @route   POST /api/v1/categories/
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create({
    ...req.body,
    user: req.user.id
  })

  return res.status(200).json({ sucess: true, data: category })
})

// @desc    Update category
// @route   PUT /api/v1/categories
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    context: 'query'
  })

  if (!category)
    return next(
      new ErrorResponse(`No category with that id of ${req.params.id}`)
    )

  res.status(200).json({ success: true, data: category })
})

// @desc    Delete Category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  // const category = await Category.findByIdAndDelete(req.params.id)
  let category = await Category.findById(req.params.id)

  if (!category) {
    return next(
      new ErrorResponse(`No category with id of ${req.params.id}`, 404)
    )
  }

  await category.remove()

  return res.status(200).json({ success: true, category })
})
