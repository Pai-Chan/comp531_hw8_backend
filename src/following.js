var Profile = require('./model.js').Profile

const getFollowing = (req, res) => {
	const username = req.params.user ? req.params.user: req.username
	Profile.findOne({username}, 'following').exec((err, item)=>{
		if(err){
			res.status(400).send({error:err})
			return
		} else {
			if (item) {
				res.status(200).send({username, following:item.following})
			} else {
				res.status(404).send({result:'Not found in database'})
			}
		}
	})
}

const putFollowing = (req, res) => {
	const userToBeAdded = req.params.user

	if (!userToBeAdded) {
		res.status(404).send('Valid user name is expected')
		return
	}

	const username = req.username

	//first make sure that the user you want to add is in the database
	Profile.findOne({username:userToBeAdded}).exec((err, item)=>{
		if (err) {
			res.status(400).send({error:err})
			return
		} else {
			if (item) {
				if (item.username == username) {
					res.status(400).send({result: 'You cannot add yourself.'})
					return
				}
				Profile.findOneAndUpdate({username}, {$addToSet:{following:userToBeAdded}}, {new:true}).exec((err, item2)=>{
					if (err) {
						res.status(400).send({error:err})
					}
					else{
						if (item2) {
							res.status(200).send({username:username, following:item2.following})
						}
						else{
							res.status(404).send({result:'Not found in database'})
						}
					}
				})
			} else {
				// originally, if a username cannot be found in database, 
				// it must not be in the current following list
				// but since we test the database in inclass exercise, it cannot be guaranteed.
				// we will return valid json even if it is a test user
				Profile.findOne({username}, 'following').exec((err, item2)=>{
					if (err) {
						res.status(400).send({error:err})
						return
					} else {
						if (item) {
							res.status(200).send({username:username, following:item2.following})
						}
						else{
							res.status(404).send({result:'No matched items!'})
						}
					}
				})	
			}
		}
	})
}

const deleteFollowing = (req, res) => {
	const userToBeDeleted = req.params.user

	if (!userToBeDeleted) {
		res.status(404).send('Valid user name is expected')
		return		
	}

	const username = req.username
	console.log("going into delete following process, my own name is" + username)
	console.log("going to delete" + userToBeDeleted)
	Profile.findOneAndUpdate({username}, {$pull:{following:userToBeDeleted}}, {new:true}).exec((err, item)=>{
		if (err) {
			res.status(400).send({error:err})
		}
		else {
			if(item){
				res.status(200).send({username: username, following:item.following})
			}
			else{
				res.status(404).send({result:'You are deleting who you do not follow'})
			}
		}
	})
}

module.exports = app => {
	app.get("/following/:user?", getFollowing)
	app.put("/following/:user", putFollowing)
	app.delete("/following/:user", deleteFollowing)
}
