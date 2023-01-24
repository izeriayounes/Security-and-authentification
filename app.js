require('dotenv').config();
const ejs = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

var cnxToDB = async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/usersDB');
}()

const userSchema = new mongoose.Schema({  // we used to create a simple js object as a schema but now we gonna do some stuff with it we need to call the mongose schema !!
    email: String,
    password: String
})

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User =  mongoose.model('user', userSchema)

app.get('/', function(req, res){
    res.render('home')
})

app.get('/login', function(req, res){
    res.render('login')
})

app.get('/register', function(req, res){
    res.render('register')
})

app.get('/logout', function(req, res){
    res.redirect('/')
})

app.post('/register', function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    User.findOne({email: req.body.username}, function(err, foundEmail){
        if (foundEmail){
            res.send('username already in use. Please try another one')
        }else{
            newUser.save(err => {if (err) console.log(err)})
            res.render('secrets')
        }
    })
   
})

app.post('/login', function(req, res){
    email = req.body.username;
    password = req.body.password;
    cnxToDB;
    User.findOne({email: email}, function(er, foundUser){
        if(!foundUser){
            res.send('Username or password are invalid')
        }else{
            if (foundUser.password == password){
                res.render('secrets')
            }else{
                res.send('Username or password are invalid')
            }
        }
    })

})

app.listen(3000, () => console.log('server running on port 3000'))