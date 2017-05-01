//Auth functions
const md5 = require('md5')
const passport = require('passport')
const User = require('./model.js').User
const Profile = require('./model.js').Profile
const findByUsernameInUser = require('./model.js').findByUsernameInUser
const findByUsernameInProfile = require('./model.js').findByUsernameInProfile
const getUser = require('./model.js').getUser
const FacebookStrategy = require('passport-facebook').Strategy
const cookieParser = require('cookie-parser')
const session = require('express-session')
const users = []
const islocal = true
const callbackURL= (islocal ? 'http://localhost:3000' : 'https://hw8sc62.herokuapp.com') + '/auth/facebook/callback'
const facebookConfig = {
    clientID:'1783965338584990', 
    clientSecret:'124d6d71bc38d8748972ca84db895c2b', 
    callbackURL: callbackURL,
    passReqToCallback: true
} 
const redis = require('redis').createClient('redis://h:pbb73050857c017a7499d00a1382b7921790282744378719fe6ad94e302993a38@ec2-34-206-214-110.compute-1.amazonaws.com:9939')
const cookieKey = 'sid'
let hostUrl = ''
const Article = require('./model.js').Article
const Comment = require('./model.js').Comment
//Middleware to check if user is loggedin
const isLoggedIn = (req, res, next) =>{
    //console.log(req.isAuthenticated())
    console.log("enter isLoggedIn")
    if(req.isAuthenticated()){
        //console.log(req.user.username)
        req.username = req.user.username
        next()
        return
    }
    if(!req.cookies){
        res.status(401).send('Not authorized! No cookie!')
        return
    }
    let sid = req.cookies[cookieKey]
    if(!sid){
        res.status(401).send('Not authorized! No cookie with sid!')
        return
    }
    //Get sid value from redis hashmap
    redis.hgetall(sid, function(err, userObject){
    if(userObject && userObject.username){
        req.username = userObject.username;
        next()
        return
    }
    else{
        res.status(401).send('Not authorized! Invalid cookie!')
        return
        }
    })
}

//Normal login part
const loginAction = (req, res) => {
    console.log("enter loginAction")
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password){
        res.status(400).send({result:"Missing username or password"});
        return
    }
    findByUsernameInUser(username, (items)=>{
        if(items.length===0){
            res.status(401).send({result:"No such user exist!"})
            return
        }
        else{
            //Get them from DB
            const salt = items[0].salt; 
            const hash = items[0].hash;
            if(md5(password + salt)!=hash){
                res.status(401).send({result:"Wrong password!"})
                return;
            }
            else{
                const currentCookie = md5(hash + salt)
                redis.hmset(currentCookie,{username})
                //Assign cookie
                res.cookie(cookieKey, currentCookie, {maxAge:3600*1000, httpOnly:true})
                res.status(200).send({username:username, result:'success'})
                return;
            }
        }
    })
}

const registerAction = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const dob = req.body.dob;
    const zipcode = req.body.zipcode;
    if (!username || !password || !email || !dob || !zipcode) {
        res.status(400).send({ result: "Invalid input!" });
        return;
    }
    findByUsernameInUser(username, function(items){
        if(items.length !== 0){ 
            res.status(400).send({result:"User already exist!"})
            return
        }
        else{
            const salt = md5((new Date()).getTime())
            //Creat new user instance
            new User({username:username, salt:salt, hash:md5(password + salt), auth:null}).save(()=>{
                new Profile({username:username, email: email, zipcode: zipcode, dob: dob, headline:"Default headline!",
                            avatar:'https://s-media-cache-ak0.pinimg.com/236x/ab/66/80/ab66803f1bf1a9bf2bddca5209202fa1.jpg',
                            following: []}).save(()=>{
                    res.status(200).send({result:"Succeed!"})
                    return
                })
            })
        }
    })

}

//Update psaaword
const putPassword = (req, res) => {
    const password = req.body.password;
    const username = req.username;
    if(!password){
        res.status(400).send({result:"Missing password!"});
    }
    const newSalt = md5((new Date()).getTime())
    User.findOneAndUpdate({username}, {salt:newSalt, hash: md5(password + newSalt)},{new:true}, (err,item)=>{
        if(err){
            res.status(400).send({error:err})
        }
        else{
            if(item){
                redis.del(req.cookies[cookieKey])
                let newCookie = md5(item.hash + item.salt)
                redis.hmset(newCookie,{username})
                res.cookie(cookieKey, newCookie, {maxAge:3600*1000, httpOnly:true})
                res.status(200).send({username, status: 'Password changed!'})
            }
            else{
                res.status(404).send({result:'No matched items!'})
            }
        }
    })
}

// FacebookStrategy login part
passport.serializeUser(function(user, done){
    done(null, user.id)
})

passport.deserializeUser(function(id, done){
    User.findOne({authId:id}).exec(function(err, user){
            done(null, user)
    })
})

// passport.use(new FacebookStrategy(facebookConfig,
//     function(req, token, refreshToken, profile, done){
//         const sid = req.cookies[cookieKey]
//         const username = profile.displayName+'@facebook'
//         console.log("It is in facebookstrategy")
//         if (!sid){
//             console.log("It is in facebookstrategy if")
//             let username = profile.displayName+'@facebook'
//             findByUsernameInUser(username, (items)=>{
//                 if(items.length===0){//New facebook user;
//                     new User({username:username, salt:null, hash: null, auth:'facebook', authId: profile.id}).save(()=>{
//                         new Profile({username:username, email: null, zipcode: null, dob: null, 
//                             headline:"Welcome facebook user!",
//                             avatar:'https://www.facebook.com/images/fb_icon_325x325.png',
//                             //avatar:profile.profileUrl,
//                             //avatar: "https://graph.facebook.com/" + profile.username + "/picture" + "?width=200&height=200" + "&access_token=" + token,
//                             following: []}).save();
//                     });
//                 }
//                 return done(null,profile);
//             })
//         }
//         else {
//             //link the accounts if a normal account is already logged in
//             console.log("It is in facebookstrategy else")
//             redis.hgetall(sid, function(err, Obj_user) {
//                 const localUser = Obj_user.username
//                 Profile.findOne({username: username}).exec(function(err, profileData){
//                     if(profileData){
//                         const old_followers = profileData.following
//                         Profile.findOne({username: localUser}).exec(function(err, newProfile) {
//                             if(newProfile){
//                                 //merge the follower
//                                 const newfollowers3 = newProfile.following.concat(old_followers)
//                                 Profile.update({username: localUser}, {$set: {'following': newfollowers3}}, function(){})
//                             }
//                         })
//                         //clear the data in the facebook account
//                         Profile.update({username: username}, {$set: {'following':[]}}, function(){})
//                     }
//                 })
//                 Article.update({author:username}, { $set: { 'author': localUser}}, { new: true, multi: true }, function(){})
//                 Article.update({'comments.author' : username}, { $set: {'comments.$.author': localUser}}, { new: true, multi: true }, function(){})
//                 User.findOne({username: localUser}).exec(function(err, user){
//                     if(user){
//                         let authObj = {}
//                         authObj[`${profile.provider}`] = profile.displayName
//                         User.update({username: localUser}, {$addToSet: {'authorization': authObj}}, {new: true}, function(){})
//                     }
//                 })
//             })
//             return done(null, profile)
//         }
//     })
// )

passport.use(new FacebookStrategy(
    facebookConfig,
    function(req, token, refreshToken, profile, done){
        process.nextTick(function(){
            let username = profile.displayName + '@facebook'
            getUser(username, (err, users) => {
                if (users.length == 0) {
                    new User({username:username, salt:null, hash: null, auth:'facebook'}).save(()=>{
                        new Profile({username:username, email: null, zipcode: null, dob: null, 
                            headline: "I am a facebook user.",
                            avatar:'https://facebookbrand.com/wp-content/themes/fb-branding/prj-fb-branding/assets/images/fb-art.png',
                            following: []}).save()
                    })
                }
            })
            return done(null, profile)
        })
    }
))


function facebookLogin(req, res){
    res.redirect(hostUrl)
}

function logoutAction(req, res) {
    if (req.isAuthenticated()) {
        req.session.destroy()
        req.logout()
        res.status(200).send("OK")
    } 
    else{
    redis.del(req.cookies[cookieKey])
    res.clearCookie(cookieKey)
    res.status(200).send("OK")  
    }
}

const FB_connect = (req, res) => {
    const username = req.body.originalUserName;
    const password = req.body.originalPassword;
    if (!username || !password) {
        res.status(400).send("Missing Username or Password")
        return
    }
    User.find({username: username}).exec(function(err, users){
        if (!users || users.length === 0){
            res.sendStatus(400)
            return
        }
        const Obj_user = users[0]
        if(!Obj_user){
            res.status(400).send("This user has not registered")
        }
        const salt = Obj_user.salt;
        const hash = Obj_user.hash;

        if(md5(password + salt) === hash){
            //third party username
            console.log("i am now here")
            Article.update({author:req.username}, { $set: { 'author': username}}, { new: true, multi: true}, function(){})
            Article.update({'comments.author' : req.username}, { $set: {'comments.$.author': username}}, { new: true, multi: true }, function(){})
            Profile.findOne({username: req.username}).exec(function(err, profile){
                if(profile){
                    const old_followers = profile.following
                    Profile.findOne({username: username}).exec(function(err, newProfile) {
                        if(newProfile){
                            const newfollowers3 = newProfile.following.concat(old_followers)
                            Profile.update({username: username}, {$set: {'following': newfollowers3}}, function(){})
                        }
                    })
                    //delete the profile record
                    Profile.update({username: req.username}, {$set: {
                        'headline': "Login from facebook account", 
                        'following':[], 
                        'email': null, 
                        'zipcode': null, 
                        'dob': new Date('1993-11-02'), 
                        'avatar': "http://www.cfz.org.uk/images/facebook.png"}}, function(){})
                }
            })
            User.findOne({username: username}).exec(function(err, user){
                if(user){
                    const usrArr = req.username.split('@');
                    const authObj = {}
                    authObj[`${usrArr[1]}`] = usrArr[0]
                    User.update({username: username}, {$addToSet: {'authorization': authObj}}, {new: true}, function(){})
                }
            })
            res.status(200).send({ username: username, result: 'success'})
        } else{
            res.status(401).send("incorrect password!")
        }
    })
}


const FB_disconnect = (req, res) => {
    const username = req.username
    User.findOne({username: username}).exec(function(err, user){
        if(user.authorization){
            User.update({username: username}, {$set: {authorization: []}}, {new: true}, function(){
                res.status(200).send({result: 'successfully unlink'})
            })
        } else {
            res.status(400).send("no link account")
        }
    })
}


function profile(req,res){
    res.send({'ok now what?':req.user})
}

function fail(req,res){
    res.send('fail:', req.user)
}

function hello(req,res){
    res.send({'hello':'world'})
}

const success_res = (req,res) => {
    req.session.save(() => {
        res.redirect(hostUrl)
    })
}

const error_res = (err,req,res,next) => {
    if(err) {
        res.status(400);
        res.send({err: err.message});
    }
}

const location_res = (req, res, next) => {
    if(hostUrl === ''){
        hostUrl = req.headers.referer
    }
    next()
}

module.exports = app => {
    app.use(cookieParser())
    app.get('/', hello)
    app.use(location_res)
    // FacebookStrategy login part
    app.use(session({secret:'cccccccccccccret', resave: true, saveUninitialized: true}))
    app.use(passport.initialize())
    app.use(passport.session())

    app.use('/login/facebook', passport.authenticate('facebook', {scope:'email'}))
    app.use('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect:'/fail'}), success_res, error_res)
    
    //Normal login part
    app.post('/login', loginAction)
    app.post('/register', registerAction)

    app.use(isLoggedIn)
    //app.use('/link/facebook', passport.authorize('facebook', {scope:'email'}))
    app.use('/link/facebook', passport.authorize('facebook', {scope:'email'}))
    app.get('/FB_disconnect', FB_disconnect)
    app.post('/FB_connect', FB_connect)
    app.put('/logout', logoutAction)
    app.put('/password', putPassword)
}