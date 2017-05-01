const md5 = require('md5')

const cookieKey = 'sid'

const data = []

//use facebook authentication
const callbackURL = 'https://ricebookpchw8.herokuapp.com/auth/callback'
const config = {
	clientSecret: '124d6d71bc38d8748972ca84db895c2b',
	clientID: '1783965338584990',
	callbackURL,
	passReqToCallback: true
}

var sessionUser = {}
var currentSessionKey = ""
var session = require('express-session')
var cookieParser = require('cookie-parser')
var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy 

const redis = require('redis').createClient('redis://h:pbb73050857c017a7499d00a1382b7921790282744378719fe6ad94e302993a38@ec2-34-206-214-110.compute-1.amazonaws.com:9939')

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
	
	console.log("The req.username from isLoggedIn is:")
	console.log(req.username)

	const username = req.body.username
	const password = req.body.password
	if (username === undefined || password === undefined) {
		res.status(400).send({result: 'Unauthorized'})
		return
	}

	if (username === "" && password === "") {
	    if (req.cookies.sid && sessionUser[req.cookies.sid]) {
	    	const usernameByCookie = sessionUser[req.cookies.sid].username
	    	//getUser without password authentication
			getUser(usernameByCookie, (err, users) => {
				if (err) {
					console.log(err)
					throw err
					return
				}
				if (users.length === 0 || !users[0]) {
					res.send({result: 'Unauthorized'})
					return
				} else {
					console.log("can find a valid user record. not check password.")
					res.send({result: 'success', username: usernameByCookie})
					return
				}
			})	    	
	    }
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

	if (req.isAuthenticated()) {
		username = req.username
		return
	}

	const sid = req.cookies.sid

	if (!sid) {
		return res.status(401).send('sid undefined - user session does not exist')
	}

 //    if (!sessionUser[req.cookies.sid]) {
 //    	return res.status(401).send('Session not exist, maybe the server rebooted')
 //    }
 //    const username = sessionUser[req.cookies.sid].username
 //    console.log("get username in isLoggedIn")
 //    req.username = username
 //    console.log("Encapsulate req.username in isLoggedIn, which is:")
 //    console.log(req.username)
 //    next()
 	redis.hgetall(sid, (err, userObj) => {
 		if (userObj && userObj.username) {
 			console.log(sid + "is mapped to" + userObj.username)
 			const username = userObj.username
 			req.username = username
 			next()
 		} else {
 			res.status(401).send('user session does not exist')
 		}
 	})

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
                status : 'Password has changed successfully'})
        })
        .catch(err => {
        	console.log(err)
            res.status(404).send(err)
        })	
}

var users = []
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
	function(req, token, refreshToken, profile, done){
		process.nextTick(function(){
			let username = profile.displayName + '@facebook'
			getUser(username, (err, users) => {
				if (users.length == 0) {
					new User({username:username, salt:null, hash: null, auth:'facebook'}).save(()=>{
						new Profile({username:username, email: null, zipcode: null, dob: null, 
							headline: "I am a facebook user.",
							avatar:'https://facebookbrand.com/wp-content/themes/fb-branding/prj-fb-branding/assets/images/fb-art.png',
							following: []}).save()
					})
				}
			})
			return done(null, profile)
		})
	}
))

const fbsuccess = (req, res, next) => {
	const username = req.user.displayName + "@facebook"
	getUser(username, (err, users) => {
		if (users.length === 0 || !users[0]) {
			res.status(404).send(err)
		} else {
			req.username = username
			req.password = "ThisIsMySecret"
			next()
		}
	})
}

const fail = (req, res) => {
	res.send('Fail to login by Facebook')
}

exports = app => {
	app.use(cookieParser())
	app.use(session({secret: 'ThisIsMySecret', resave: true, saveUninitialized: true}))
	app.use(passport.initialize())
	app.use(passport.session())

	app.use('/login/facebook', passport.authenticate('facebook',{scope: 'email'}))
	app.use('/auth/callback', passport.authenticate('facebook', {successRedirect: '/fbsuccess', failureRedirect:'/fail'}))	
	app.use('/link/facebook', passport.authenticate('facebook',{scope: 'email'}))
	app.use('/fail', fail)
	app.use('/fbsuccess', fbsuccess, actLogin)
	app.post('/login', actLogin)
	app.post('/register', actRegister)

	app.use(isLoggedIn)
	app.put('/password', actChangePassword)
	app.use('/logout', actLogout)
}

module.exports = exports