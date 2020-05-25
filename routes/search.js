const express = require('express')
const { search } = require('../controllers/search')

const router = express.Router()

// const advancedResults = require('../middleware/advancedResults')
// const { protect } = require('../middleware/auth')

router
  .route('/')

  .post(search)

module.exports = router
