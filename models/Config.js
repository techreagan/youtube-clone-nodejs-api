const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ConfigSchema = new Schema(
  {
    key: {
      type: String,
        unique:true,
      required: [true, 'key is required']
    },
      value:{
        type:Object
      }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }}
)

module.exports = mongoose.model('Config', ConfigSchema)
