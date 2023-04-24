const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator')
const session = require('express-session');
const MongoStore = require('connect-mongo')

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

//STRIPE
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// const stripe = require('stripe')(
//   'sk_test_51JmGhYGQO5hF0ENvCYAYMXYmNjuK1dBaKJrtDDV0R5NVlnB43AdQOiuZLBqBdGbrtDuC5plOQeJ51t3Ad8kxCF3p00hB3EE4JA'
//   );

  // const paymentIntent = stripe.paymentIntents.create({
  //   amount: 500,
  //   currency: 'eur',
  //   payment_method_types: ['card'],
  //   receipt_email: 'jenny.rosen@example.com',
  // })

  // paymentIntent.then(value => {
  //   console.log(value)
  // })




// PASSPORT
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
const flash = require("connect-flash")

// S. Storage
const bodyParser = require('body-parser')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')
const upload = require('./storage')







var app = express();


// <<live-server
// const livereload = require("livereload");

// const liveReloadServer = livereload.createServer();
// liveReloadServer.watch(path.join(__dirname, 'views'));
// liveReloadServer.server.once("connection", () => {
    // setTimeout(() => {
        // liveReloadServer.refresh("/")
//       }, 100)
//     })
// app.use(connectLivereload());


// live-server>>

//------ Mongo Connection -----//
const mongoURI = process.env.MONGO_URI
// mongoose.connect(mongoURI)
mongoose.connect(mongoURI, { useUnifiedTopology: true, useNewUrlParser: true });

const conn = mongoose.connection




app.use(bodyParser.json())
app.use(methodOverride('_method'))


//-----Image Storage-----//
let gfstream;
let gridFSBucket;

conn.once('open', () => {
  // Init stream
  gfstream = Grid(conn.db, mongoose.mongo); // j'établis un stream avec la db, et avec un intermédiaire étant mongoose

  gfstream.collection('images') //j'ai le stream qui appelle une collection
  gridFSBucket  = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'images' })
})





const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const fetchRouter = require('./routes/fetch');
const brandRouter = require('./routes/brand');
const itemRouter = require('./routes/item');
const cartRouter = require('./routes/cart');
const stripeRouter = require('./routes/stripe');
const { isRedirect } = require('node-fetch');
const emailRouter = require('./routes/email')

//----- View engine configuration -----//
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//------ Express session configuration -----//
app.use(session({
  secret: 'keyboard cat',
  store: MongoStore.create({
    mongoUrl: mongoURI
   }),
  cookie: { maxAge: 180 * 60 * 1000 },
  resave: true,
  saveUninitialized: true
}));

//----- Passport middlewares -----//
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

//------ Global variables ------//
app.use(function(req, res, next) { //local currentUser & session
  res.locals.currentUser = req.user
  res.locals.session = req.session
  next();
})

//----- Routes -----//
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/fetch', fetchRouter); //TODO: A supprimer à un moment donné
app.use('/brand', brandRouter);
app.use('/item', (req, res, next) => {
  res.locals.gfstream = gfstream
  res.locals.gridFSBucket = gridFSBucket
  next()
})
// TODO: /item/image
app.use('/item', itemRouter);
app.use('/cart', cartRouter);
app.use('/stripe', stripeRouter)
app.use('/email', emailRouter)



app.get('/image/new', (req, res) => { res.render('new-image')}) //TODO: C'est quoi cette ligne ?

//------------ Passport Configuration (Local Strategy) ------------//
require('./config/passport')(passport)



//----- Catch 404, and Forward to error handler -----//
app.use(function(req, res, next) {
  next(createError(404));
});

//----- Error handler -----/
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('parts/error');
});


module.exports = app;
