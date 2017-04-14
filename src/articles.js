var Article = require('./model.js').Article

const addArticle = (req, res) => {
	console.log("Now user go to addArticle")
	console.log("--------------------------------------")
	console.log("The req body is")
	console.log(req.body)
	if (!req.body.text) {
		console.log("Empty text")
		res.status(401).send("Empty text")
		return
	}
	console.log("req.username is")
	console.log(req.username)
	var username = req.username
	if (!username) {
		username = 'testUser'
		console.log("Now set username to testUser")
	}
	const articleToSave = {
		author: username,
		img: null,
		date: new Date().getTime(),
		text: req.body.text,
		comments:[]
	}
	console.log("The article that will be saved in next step is:")
	console.log(articleToSave)
	new Article(articleToSave)
	.save((err, doc) => {
		if (err || !doc) {
			console.log(err)
			res.status(400).send({error: err})
			return
		} else {
			res.status(200).send({"articles": [doc]})
			return
		}
	})
}

const getArticles = (req, res) => {
	console.log("Now user try to get articles")
	console.log("id of the one article if it is one")
	console.log(req.params.id)
	const id = req.params.id
	if (!id) {
		// not providing id, return all articles in the database, will change in final assign
		Article.find({}, (err, items) => {
			if (err) {
				res.status(400).send({error: err})
				return
			} else {
				if (items) {
					res.status(200).send({articles: items})
					return
				} else {
					console.log("Now the database has no article.")
					res.status(200).send({articles: items})
					return					
				}
			}
		})
	} else {
		if (id) {
			Article.findById(id, (err, item) => {
				if (err) {
					res.status(400).send({error: err})
				} else {
					if (item) {
						res.status(200).send({articles: [item]})
					} else {
						res.status(404).send({result: 'No article with that id in the database.'})
					}
				}
			})
		}
	}
}

// the api suggests that if commentId == 0, meaning to put article itself, 
//if it is postive, put comment.
//if it is -1, add a comment
const putArticle = (req, res) => {
	console.log("req body is:")
	console.log(req.body)
	const id = req.params.id
	if (!id) {
		res.status(400).send("id cannot be empty")
		return
	}
	if (!req.body.text) {
		res.status(400).send("Comment text cannot be empty")
		return
	} 
	const commentId = req.body.commentId
	const username = req.username
	console.log("req.username is")
	console.log(req.username)
	//update article
	if (!commentId || commentId == 0) {
		Article.findByIdAndUpdate(id, {text: req.body.text}, {new: true}, (err, item) => {
			if (err) {
				res.status(400).send({error: err})
				return
			} else {
				if (item) {
					res.status(200).send({articles: [item]})
					return
				} else {
					res.status(404).send({result: 'No article with that id'})
					return
				}
			}
		})
	} else if (commentId == -1) {
		//add a comment
		Article.findByIdAndUpdate(id, 
			{$push: {comments: {author: username, date: new Date().getTime(), text:req.body.text}}},{new:true},
		(err, item) => {
			if (err) {
				res.status(400).send({error:err})
				return
			} else {
				if (item) {
					res.status(200).send({articles:[item]})
					return
				} else {
					res.status(404).send({result: 'No article with that id'})
					return
				}
			}
		})

	} else {
		// $ replace the position
		Article.findOneAndUpdate({_id:id, "comments._id":commentId},
			{$set: {"comments.$.text": req.body.text, "comments.$.date": new Date().getTime()}},
			{new:true},
			(err, item)=>{
			if (err) {
				res.status(400).send({error:err})
			}
			else {
				if(item){
					res.status(200).send({articles:[item]})
				}
				else{
					res.status(404).send({result: 'No article with that id'})
				}
			}
		})
	}
}

module.exports = (app) => {
	app.post('/article', addArticle)
	app.get('/articles/:id*?', getArticles)
	app.put('/articles/:id*', putArticle)
}