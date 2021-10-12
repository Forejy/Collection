const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator')

require('dotenv').config();


// PASSPORT
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs")
const User = require('./models/user')

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const connectLivereload = require("connect-livereload");

// S. Storage
const bodyParser = require('body-parser')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')
const upload = require('./storage')







var app = express();


// <<live-server
const livereload = require("livereload");

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/")
  }, 100)
})



app.use(connectLivereload());

// live-server>>
const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI)
const conn = mongoose.connection





//S. Storage - Middleware
app.use(bodyParser.json())
app.use(methodOverride('_method'))

  let gfstream;

conn.once('open', () => {
  // Init stream
  gfstream = Grid(conn.db, mongoose.mongo); // j'établis un stream avec la db, et avec un intermédiaire étant mongoose
  gfstream.collection('images') //j'ai le stream qui appelle une collection
})






const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const fetchRouter = require('./routes/fetch');
const brandRouter = require('./routes/brand');
const itemRouter = require('./routes/item');
const { isRedirect } = require('node-fetch');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/fetch', fetchRouter); //TODO: A supprimer à un moment donné
app.use('/brand', brandRouter);
app.use('/item/image', (req, res, next) => {
  res.locals.gfstream = gfstream
  next()
})
app.use('/item', itemRouter);
app.get('/login', (req, res) => {
  const message = req.session.message
  req.session.message = null
  res.render('log-in', { message: message })
})
app.get('/signup', (req, res) => { res.render('sign-up')})
app.get('/image/new', (req, res) => { res.render('new-image')})


passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            return done(null, user)
          } else {
            return done(null, false, { message: 'Incorrect password.' });
          }
        })
        // if (user.password != password) {
        //   return done(null, false, { message: 'Incorrect password.' });
        // }
        console.log('LOGIN3')
        // return done(null, user);
      });
    }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



app.post('/login',
passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('LOGIN')

    res.redirect('/');
  });

app.post('/signup', function(req, res) {
  console.log("bcrypt: ", bcrypt)
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) done(err)
    new User({
      username: req.body.username,
      password: hashedPassword
    }).save(function(err) {
      if (err) done(err)
      res.redirect('/')
    })
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


const https = require("https")
const fs = require("fs")

const url = "https://images.pokemontcg.io/sm9/1_hires.png"

https.get(url, (res) => {
  const path = "download/poke1.png"
  const writeStream = fs.createWriteStream(path)

  res.pipe(writeStream)

  writeStream.on("finish", () => {
    writeStream.close()
    console.log("Download Completed")
  })
})




module.exports = app;
