const articles = {
	articles: [
		{
			_id: 0,
			author: 'Scott',
			text:'Hello Rice!',
			date: new Date(),
			comments: []
		},
		{
			_id:1, 
			author: 'Scott',
			text:'Hello Houston!',
			date: new Date(),
			comments: []
		},
		{
			_id:2, 
			author: 'Scott',
			text:'Hello Texas!',
			date: new Date(),
			comments: []
		},
		{
			_id:3, 
			author: 'Scott',
			text:'Hello America!',
			date: new Date(),
			comments: []
		}
	]
}

const addArticle = (req, res) => {
	console.log("Receive addArticle request.")
	const newArticle = {}
	newArticle._id = articles['articles'].length
	newArticle.author = 'Scott'
	newArticle.text = req.body.text
	newArticle.date = new Date()
	newArticle.comments = []
	articles['articles'].push(newArticle)
	const resBody = {}
	resBody.articles = [newArticle]
	res.send(resBody)
}

const getArticles = (req, res) => {
	const id = req.params.id
	if (!id) {
		res.send(articles)
	} else {
		const result = {}
		result.articles = articles.articles.filter(article => (article._id == id))
		res.send(result)
	}
}

module.exports = (app) => {
	app.post('/article', addArticle)
	app.get('/articles/:id*?', getArticles)
}