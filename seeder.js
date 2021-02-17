const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

// Load env vars
dotenv.config({ path: './config/.env' })

const User = require('./models/User')
const Category = require('./models/Category')

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
})

const users = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
)
const categories = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/categories.json`, 'utf-8')
)

const importData = async () => {
	try {
		// await User.create(users)
		await Category.create(categories)

		console.log('Data Imported...'.green.inverse)
		process.exit()
	} catch (err) {
		console.error(err)
	}
}

const deleteData = async () => {
	try {
		// await User.deleteMany()
		await Category.deleteMany()

		console.log('Data Destroyed...'.red.inverse)
		process.exit()
	} catch (err) {
		console.error(err)
	}
}

if (process.argv[2] === '-i') {
	// node seeder -i
	importData()
} else if (process.argv[2] === '-d') {
	// node seeder -d
	deleteData()
}
