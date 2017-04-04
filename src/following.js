const getFollowing = (req, res) => {
	if (req.params.user) {
		res.send({
			username: req.params.user,
			following: [
				'sep1',
				'sep2',
				'sep3'
			]
		})
	} else {
		res.send({
			username: req.params.user,
			following: [
				'sep1',
				'sep2',
				'sep3'
			]
		})		
	}
}

const putFollowing = (req, res) => {
	res.send({
		username: req.params.user,
		following: [
			'sep1',
			'sep2',
			'sep3'
		]
	})
}

const deleteFollowing = (req, res) => {
	res.send({
		username: req.params.user,
		following: [
			'sep1',
			'sep2',
			'sep3'
		]		
	})
}

module.exports = app => {
	app.get("/following/:user?", getFollowing)
	app.put("/following/:user", putFollowing)
	app.delete("/following/:user", deleteFollowing)
}
