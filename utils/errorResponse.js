class ErrorResponse extends Error {
  constructor(message, statusCode, messageWithField = null) {
    super(message)
    this.statusCode = statusCode
    this.messageWithField = messageWithField
  }
}

module.exports = ErrorResponse
