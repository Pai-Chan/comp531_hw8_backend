const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(function(req, res, next){
    const origin = req.headers.origin
    if (origin) {
        res.set('Access-Control-Allow-Origin', origin)
    }
	res.set({'Access-Control-Allow-Credentials': true,
             'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With, Origin',
             'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'})
	if (req.method == 'OPTIONS') {
		res.status(200).send()
	} else {
    	next()
    }
})

require('./src/auth')(app)
require('./src/articles')(app)
require('./src/profile')(app)
require('./src/following')(app)


// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
     const addr = server.address()
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
})