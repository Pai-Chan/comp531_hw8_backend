// for reference: the link is cloudinary://583315683521936:GGKx_UsXyL9nKSHlI_p82txl8DE@hsligsscb

const uploadImage = require('./uploadCloudinary')

var Profile = require('./model.js').Profile

const index = (req, res) => {
     res.send({ hello: 'world' })
}

const getHeadlines = (req, res) => {
	const users = req.params.user ? req.params.user.split(','): [req.username];
	Profile.find({username:{$in:users}}).exec((err, items)=>{
		if (err) {
			res.status(400).send({error:err})
		} else {
			if (items) {
				res.status(200).send({ headlines: items.map((item)=>{
					return {username:item.username, headline:item.headline}
				})})
			}
			else {
				res.status(404).send({result:'Not found in database'})
			}
		}
	})
}

const getHeadline = (req, res) => {
	const username = req.username
	Profile.findOne({username:username}).exec((err, item)=>{
		if(err) {
			res.status(400).send({error:err})
			return
		}
		else {
			if (item) {
				res.status(200).send({username:username, headline:item.headline})
			}
			else {
				res.status(404).send({result:'Not found in database'})
			}
		}
	})
}

const putHeadline = (req, res) => {
	const username = req.username
	const headline = req.body.headline
	if (!headline) {
		res.status(400).send("Empty headline is not allowed")
		return
	}
	Profile.findOneAndUpdate({username:username},{headline:headline},{new:true}, (err,item) => {
		if (err) {
			res.status(400).send({error:err})
			return
		} else {
			if (item) {
				res.status(200).send({username:username, headline:item.headline})
			}
			else{
				res.status(404).send({result:'Not found in database'})
			}
		}
	})

}

const getEmail = (req, res) => {

	const username = req.params.user ? req.params.user : req.username

	Profile.findOne({username:username}).exec((err, item)=>{
		if (err) {
			res.status(400).send({error:err})
			return
		} else {
			if (item) {
				res.status(200).send({username:username, email:item.email})
			} else{
				res.status(404).send({result:'Not found in database'})
			}
		}
	})
}

const putEmail = (req, res) => {
	const username = req.username

	if (!req.body.email) {
		res.status(400).send("Empty email field is not allowed")
		return
	}
	const email = req.body.email

	Profile.findOneAndUpdate({username:username},{email:email},{new:true}, (err,item) => {
		if (err) {
			res.status(400).send({error:err})
			return
		} else {
			if (item) {
				res.status(200).send({username:username, email:email})
			} else {
				res.status(404).send({result:'Not found in database'})
			}
		}
	})
}

const getDob = (req, res) => {
	const username = req.username

	Profile.findOne({username:username}).exec((err, item)=>{
		if (err) {
			res.status(400).send({error:err})
			return
		} else {
			if (item) {
				res.status(200).send({username:username, dob:item.dob})
			} else{
				res.status(404).send({result:'Not found in database'})
			}
		}
	})

}

const getZipcode = (req, res) => {
	const username = req.params.user ? req.params.user : req.username

	Profile.findOne({username:username}).exec((err, item)=>{
		if (err) {
			res.status(400).send({error:err})
			return
		} else {
			if (item) {
				res.status(200).send({username:username, zipcode:item.zipcode})
			} else{
				res.status(404).send({result:'Not found in database'})
			}
		}
	})
}

const putZipcode = (req, res) => {
	const username = req.username

	if (!req.body.zipcode) {
		res.status(400).send("Empty zipcode field is not allowed")
		return
	}
	const zipcode = req.body.zipcode

	Profile.findOneAndUpdate({username:username},{zipcode:zipcode},{new:true}, (err,item) => {
		if (err) {
			res.status(400).send({error:err})
			return
		} else {
			if (item) {
				res.status(200).send({username:username, zipcode:zipcode})
			} else {
				res.status(404).send({result:'Not found in database'})
			}
		}
	})
}

const getAvatars = (req, res) => {
	const users = req.params.user ? req.params.user.split(','): [req.username];
	Profile.find({username:{$in:users}}).exec((err, items)=>{
		if (err) {
			res.status(400).send({error:err})
		} else {
			if (items) {
				res.status(200).send({ avatars: items.map((item)=>{
					return {username:item.username, avatar:item.avatar}
				})})
			}
			else {
				res.status(404).send({result:'Not found in database'})
			}
		}
	})
}

const putAvatar = (req, res) => {
	if (!req.fileurl) {
		res.status(400).send("missing avatar input")
		return
	}
	const avatar = req.fileurl
	const username = req.username

	Profile.findOneAndUpdate({username:username},{avatar:avatar},{new:true}, (err,item) => {
		if (err) {
			res.status(400).send({error:err})
			return
		} else {
			if (item) {
				res.status(200).send({username:username, avatar:avatar})
			} else {
				res.status(404).send({result:'Not found in database'})
			}
		}
	})	
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
	app.put("/avatar", uploadImage('avatar'), putAvatar)
}
