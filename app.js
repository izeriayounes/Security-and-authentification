const ejs = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);
const User = require('./models/User');
const Secret = require('./models/Secret');
const bcrypt = require('bcryptjs');
const app = express();

const mongoURI = process.env.MONGO_URI;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const store = new mongoDBSession({
    uri: mongoURI,
    collection: 'mySessions'
});

store.on('error', (error) => {
    console.error('Session store error:', error);
});

app.use(session({
    secret: "my little secret.!!",
    resave: false,
    saveUninitialized: false,
    store: store
}))

const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', function (req, res) {
    req.session.isAuth = true;
    res.render('home');
})

app.get('/login', function (req, res) {
    res.render('login', {
        regSuccess: '',
        wrongCreds: ''
    })
})

app.get('/register', function (req, res) {
    res.render('register', {
        regSuccess: '',
        usernameTaken: ''
    });
})

app.get('/logout', function (req, res) {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/login");
    });
})

app.get('/secrets', async (req, res) => {
    const foundSecrets = await Secret.find({});
    console.log(foundSecrets);
    foundSecrets ? res.render('secrets', {secrets: foundSecrets}) : res.send("no secrets found")
    
})

app.get('/submit', isAuth, function(req, res) {
    res.render('submit');
})

app.post('/submit', async (req, res) => {
    try {
        const submittedSecret = req.body.secret;
        await mongoose.connect(mongoURI);
        const newSecret = new Secret({ secret: submittedSecret });
        await newSecret.save();
        res.render('secrets');
    } catch (err) {
        res.send('Error during secret submission: ' + err);
    } finally {
        mongoose.connection.close(); // Close the connection after the operation
    }
});

//popup messages for success/fail login or register
const regSuccess = { wrongCreds: '', regSuccess: 'You have successfully registered. You can log in now' };
const usernameTaken = { regSuccess: '', usernameTaken: 'Username already taken. Please try another one' };
const wrongCreds = { wrongCreds: 'The username you entered or password is invalid', regSuccess: '' };

app.post('/register', async (req, res) => {
    try {
        await mongoose.connect(mongoURI);
        const { email, password } = req.body;
        hashedPass = await bcrypt.hash(password, 12);
        const user = await User.findOne({ email });
        if (user) {
            return res.render('register', usernameTaken);
        }
        const newUser = new User({ email, password: hashedPass });
        await newUser.save();
        res.render('login', regSuccess);
    }
    catch (err) {
        console.error('Error during registration:', err);
    } finally {
        mongoose.connection.close(); // Close the connection after the operation
    }
})

app.post('/login', async (req, res) => {
    try {
        await mongoose.connect(mongoURI);

        const { email, password } = req.body;
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            return res.render('login', wrongCreds);
        }
        const passMatch = await bcrypt.compare(password, foundUser.password);
        if (!passMatch) {
            return res.render('login', wrongCreds);
        }
        req.session.isAuth = true;
        req.session.username = foundUser.email;
        res.redirect('/secrets');
    }
    catch (err) {
        console.error('Error during login:', err);
    } finally {
        mongoose.connection.close(); // Close the connection after the operation
    }
})

app.listen(process.env.PORT || 3000, () => console.log('server running on port 3000'))