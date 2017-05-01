// this is model.js 
var mongoose = require('mongoose')
require('./db.js')

exports.ObjectId = mongoose.Types.ObjectId

var commentSchema = new mongoose.Schema({
	commentId: Number, author: String, date: Date, text: String
})
var articleSchema = new mongoose.Schema({
	id: Number, author: String, img: String, date: Date, text: String,
	comments: [ commentSchema ]
})

exports.Article = mongoose.model('article', articleSchema)

const userSchema = new mongoose.Schema({
    username: String,
    salt: String,
    hash: String,
    auth: String,
    authId: String
})

exports.User = mongoose.model('user', userSchema)

const profileSchema = new mongoose.Schema({
    username: String,
    headline: String,
    email: String,
    dob: Date,
    zipcode: String,
    avatar: String,
    following: [String]
})

exports.Profile = mongoose.model('profile', profileSchema)

exports.getUser = (username, callback) => {
    mongoose.model('user', userSchema).find({ username : username}).exec(callback)
}

//This queries userSchema by username.
exports.findByUsernameInUser = (username, callback)=> {
    user.find({ username }).exec(function(err, items) {
        callback(items);
    })
}

//This queries profileSchema by username
exports.findByUsernameInProfile = (username, callback)=> {
    profile.find({ username }).exec(function(err,items){
        callback(items);
    })
}