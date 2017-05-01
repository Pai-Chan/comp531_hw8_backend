const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use( function(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*')
	res.set({'Access-Control-Allow-Credentials': true,
             'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With, Origin',
             'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'})
	if (req.method == 'OPTIONS') {
		res.status(200).send()
	} else {
    	next()
    }
})

if (!process.env.CLOUDINARY_URL) {
     process.env.CLOUDINARY_URL="cloudinary://456579844915565:IFigu4KDj21i_RyXc0pRpgKL1o8@hz5dgdqpb"
}

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