const md5 = require('md5')

const cookieKey = 'sid'

const data = []

const createRandomSalt = () => {
	return md5(Math.random())
}

const createHash = (password, salt) => {
	return md5(password + salt)
}

const queryHashByUsername = (username, data) => {

	function isThisUsername(item) {
		return item.username === username
	}
	return data.find(isThisUsername)
}

const actRegister = (req, res) => {
	console.log('Payload received', req.body)
	const username = req.body.username
	const password = req.body.password
	const dataItem = queryHashByUsername(username, data)
	if (dataItem) {
		res.status(400).send({result: 'The username is already registered.'})
		return
	} else {
		const mySalt = createRandomSalt()
		const myHash = createHash(password, mySalt)
		data.push({username: username, salt: mySalt, hash: myHash})
		res.status(200).send({result: 'success', username: username})
	}
}

const actLogin = (req, res) => {
	console.log('Payload received', req.body)
	const username = req.body.username
	const password = req.body.password
	const dataItem = queryHashByUsername(username, data)
	if (!dataItem) {
		res.status(401).send({result: 'Wrong username.'})
		return
	} else {
		const salt = dataItem.salt
		const hash = dataItem.hash
		if (createHash(password, salt) != hash) {
			res.status(401).send({result: 'Wrong password.'})
		} else {
			res.cookie(cookieKey, createHash(password, salt), 
				{maxAge: 3600 * 1000, httpOnly: true})
			res.status(200).send({username: username, result: 'success'})
			return
		}
	}
}

const actLogout = (req, res) => {
	res.status(200).send('OK')
}

const actChangePassword = (req, res) => {
	res.status(200).send({username: 'Scott', status:'will not change'})
}


module.exports = app => {
	app.post('/login', actLogin)
	app.put('/logout', actLogout)
	app.post('/register', actRegister)
	app.put('/password', actChangePassword)
}