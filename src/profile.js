const myProfile = {
	username: 'Scott',
	headline: 'This is a headline',
	zipcode: '77005',
	dob: '794668136679.8558',
	email: 'aName@aName.com',
	avatar: "http://www.rice.edu/aNameMaybeNotMe.jpg"
}


const index = (req, res) => {
     res.send({ hello: 'world' })
}

const getHeadlines = (req, res) => {
	if (req.params.user) {
		res.send({
			headlines:[
			{
				username: req.params.user,
				headline: myProfile.headline
			}
			]
		})		
	} else {
		res.send({
			headlines:[
			{
				username: myProfile.username,
				headline: myProfile.headline
			}
			]
		})
	}
}

const getHeadline = (req, res) => {
	res.send({
		username: myProfile.username,
		headline: myProfile.headline
	})
}

const putHeadline = (req, res) => {
	if (req.body.headline) {
		myProfile.headline = req.body.headline
	}
	res.send({
		username: myProfile.username,
		headline: req.body.headline || "Not Provided"
	})
}

const getEmail = (req, res) => {
	if (req.params.user) {
		res.send({
			username: req.params.user,
			email: myProfile.email
		})
	} else {
		res.send({
			username: "aNameMaybeNotMe",
			email: myProfile.email
		})		
	}
}

const putEmail = (req, res) => {
	res.send({
		username: "aName",
		email: req.body.email || "Not Provided"
	})
}

const getDob = (req, res) => {
	res.send({
		username: "CurrentLoginedUsername",
		dob: 794668136679.8558
	})
}

const getZipcode = (req, res) => {
	if (req.params.user) {
		res.send({
			username: req.params.user,
			zipcode: myProfile.zipcode
		})
	} else {
		res.send({
			username: "aNameMaybeNotMe",
			zipcode: myProfile.zipcode
		})		
	}
}

const putZipcode = (req, res) => {
	res.send({
		username: "aName",
		zipcode: req.body.zipcode || "Not Provided"
	})
}

const getAvatars = (req, res) => {
	if (req.params.user) {
		res.send({
			avatars: [{
				username: req.params.user,
				avatar: myProfile.avatar
			}]
		})
	} else {
		res.send({
			avatars: [{
				username: "aNameMaybeNotMe",
				avatar: myProfile.avatar
			}]
		})		
	}
}

const putAvatar = (req, res) => {
	res.send({
			username: "aName",
			avatar: req.body.avatar || "Not Provided"
		}
	)
}

module.exports = app => {
	app.get('/', index)
	app.get("/headline", getHeadline)
	app.put("/headline", putHeadline)
	app.get("/headlines/:user?", getHeadlines)
	app.get("/email/:user?", getEmail)
	app.put("/email", putEmail)
	app.get("/dob", getDob)
	app.get("/zipcode/:user?", getZipcode)
	app.put("/zipcode", putZipcode)
	app.get("/avatars/:user?", getAvatars)
	app.put("/avatar", putAvatar)
}
