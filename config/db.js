const mongoose = require('mongoose')

mongoose.set('strictQuery', true)

const DBconnection = async () => {
	const conn = await mongoose.connect(process.env.MONGO_URI).catch((err) => {
		console.log(`For some reasons we couldn't connect to the DB`.red, err)
	})

	console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold)
}

module.exports = DBconnection
