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
	res.status(200).send({result: 'success', username: req.body.username})
}

const actLogin = (req, res) => {
	console.log('Payload received', req.body)
	res.status(200).send({username: req.body.username, result: 'success'})
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