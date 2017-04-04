const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
var cookieParser = require('cookie-parser')
app.use(cookieParser())
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
