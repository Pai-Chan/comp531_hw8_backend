const md5 = require('md5')

const cookieKey = 'sid'

const data = []

//use facebook authentication
const callbackURL = 'http://localhost:3000/auth/callback'
const config = {
	clientSecret: '124d6d71bc38d8748972ca84db895c2b',
	clientID: '1783965338584990',
	callbackURL
}

var sessionUser = {}
var session = require('express-session')
var cookieParser = require('cookie-parser')
var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy 

const redis = require('redis').createClient('redis://h:p0e60a7039ff1ba8cba6bf8b6392171e9418e48c55c8956087d4d5f7bed6009c2@ec2-34-206-56-163.compute-1.amazonaws.com:28069')

const User = require('./model.js').User
const Profile = require('./model.js').Profile 

const getUser = require('./model.js').getUser


const createRandomSalt = () => {
	return md5(Math.random().toString())
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
	console.log("Receiving payload to actRegister")
	console.log(req.body)
	const username = req.body.username
	const password = req.body.password
	const email = req.body.email
	const dob = req.body.dob
	const zipcode = req.body.zipcode
	if (!username || !password || !email || !dob || !zipcode) {
		res.status(400).send({result: 'Invalid Username or Password'})
		return
	}
	getUser(username, (err, users) => {
		console.log("it is here1")
		if (err) {
			console.log(err)
			throw err
			res.send(err)
			return
		}
		if (users.length > 0) {
			console.log('Username is already taken!')
			res.status(400).send({result: 'Username is already taken!'})
			return
		} else {
			console.log('prepare data to insert into database')
			const mySalt = createRandomSalt()
			const userObj = {
				username: username,
				salt: mySalt,
				hash: createHash(password, mySalt)
			}
			const profileObj = {
				username: username,
				email: email,
				zipcode: zipcode,
				dob: dob,
				headline: "This is the default headline.",
				avatar: "http://www.rice.edu/_images/rice-logo.jpg",
				following: []
			}
			new User(userObj).save(
				(err, msg) => {
					if (err) {
						res.send(err)
					} else {
						console.log(msg)
						new Profile(profileObj).save((err, msg) => {
							if (err) {
								res.send(err)
							} else {
								console.log(msg)
								console.log("here about to succeed")
								res.status(200).send({result: 'success', username: username})
							}
						})
					}
				}
			)
		}
	}) 
}

const actLogin = (req, res) => {
	console.log("Receiving payload to actLogin")
	console.log(req.body)
	const username = req.body.username
	const password = req.body.password
	if (!username || !password) {
		res.status(400).send({result: 'Unauthorized'})
		return
	}
	
	getUser(username, (err, users) => {
		if (err) {
			console.log(err)
			throw err
			return
		}
		if (users.length === 0 || !users[0]) {
			console.log("cannot find the username")
			res.status(401).send("Unauthorized")
			return
		} else {
			console.log("can find a valid user record. going to check password.")
			const userObj = users[0]
			const hash = createHash(password, userObj.salt)
			if (hash !== userObj.hash) {
				console.log("Password does not match username")
				res.status(401).send("Password does not match username")
				return
			}

			let currentCookie = createHash(hash, userObj.salt)
			redis.hmset(currentCookie,{username})
			req.user = username
			const sessionKey = md5('ThisIsMySecret' + new Date().getTime() + userObj.username)		
			sessionUser[sessionKey] = userObj
			res.cookie(cookieKey, sessionKey, { maxAge: 3600*1000, httpOnly: true })

			res.send({result: 'success', username: username})
			return
		}
	})
}

const isLoggedIn = (req, res, next) => {
	console.log('call isLoggedIn')
	console.log(req.cookies)
	console.log(sessionUser)
	const sid = req.cookies[cookieKey]

	if (!sid) {
		return res.status(401).send('sid undefined - user session does not exist')
	}

    if (!sessionUser[req.cookies.sid]) {
    	return res.status(401).send('Session not exist, maybe the server rebooted')
    }
    const username = sessionUser[req.cookies.sid].username
    console.log("get username in isLoggedIn")
    req.username = username
    next()
}

const actLogout = (req, res) => {
	console.log('log out')
	// clear session id and set empty cookie
	const sid = req.cookies[cookieKey]
	// delete sessionUser[sid]
    redis.del(sid, function(err) {
    	console.log(err)
    })
	res.clearCookie(cookieKey)
	res.send('OK')
}

const actChangePassword = (req, res) => {
	const password = req.body.password
	const username = sessionUser[req.cookies.sid].username
	if (!username) {
		res.status(401).send('Unauthorized')
	}
	console.log(password)
	console.log(username)
    const query = { username : username}
    const mySalt = createRandomSalt()
    const myHash = createHash(password, mySalt)
    const newValue = { salt : mySalt,  hash : myHash}
    console.log(newValue)
    User.findOneAndUpdate(query, newValue, {new : true}).exec()
        .then((msg) => {
            console.log('password is changed : ', msg)
            res.send({ username : username,
                message : 'Password has changed, please log out and log in again'})
        })
        .catch(err => {
        	console.log(err)
            res.status(404).send(err)
        })	
}

passport.serializeUser(function(user, done){
	users[user.id] = user
	done(null, user.id)
})

passport.deserializeUser(function(id, done){
	var user = users[id]
	done(null, user)
})

passport.use(new FacebookStrategy(
	config,
	function(token, refreshToken, profile, done){
		process.nextTick(function(){
			return done(null, profile)
		})
	}
))

const profile = (req, res) => {
	res.send({'ok now what?':req.user})
}

module.exports = app => {
	app.use(session({secret: 'ThisIsMySecret'}))
	app.use(passport.initialize())
	app.use(passport.session())
	app.use(cookieParser())
	app.post('/login', actLogin)
	app.post('/register', actRegister)
	app.use(isLoggedIn)
	app.put('/password', isLoggedIn, actChangePassword)
	app.use('/login/facebook', passport.authenticate('facebook',{scope: 'email'}))
	app.use('/auth/callback', passport.authenticate('facebook', {successRedirect: '/profile', failureRedirect:'/fail'}))
	app.use('/logout', actLogout)
	app.use('/profile', profile)
}