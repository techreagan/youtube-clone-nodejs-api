const express = require('express')
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categories')

const Category = require('../models/Category')

const router = express.Router()

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.use(protect)
router.use(authorize('admin'))

router
  .route('/')
  .get(advancedResults(Category), getCategories)
  .post(createCategory)

router
  .route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory)

module.exports = router
