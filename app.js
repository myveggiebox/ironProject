const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const layouts      = require('express-ejs-layouts');
const mongoose     = require('mongoose');
require("dotenv");

// mongoose.connect('mongodb://localhost/organicbox');  ya cambiamos // Base de datos en la nube
mongoose.connect(process.env.DATABASE_URL)
  .then(console.log("Connected!!!"))


  const index = require('./routes/index')
  const users = require('./routes/users')
  const authRoutes = require('./routes/auth')
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const User = require("./models/User");
const passport = require("passport");

// F A C E B O O K
const FbStrategy = require('passport-facebook').Strategy;

passport.use(new FbStrategy({
  clientID: "560200537686094",
  clientSecret: "7cde41ca7b4dab22cca18935511aa961",
  callbackURL: "/authentification/facebook/callback"
  // profileFields: ['email', 'displayName']
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ facebookID: profile.id }, (err, user) => {
  console.log(profile);
    if (err) {
      return done(err);
    }
    if (user) {
      return done(null, user);
    }

    const newUser = new User({
      facebookID: profile.id
      // displayName:profile.displayName,
      // email:profile.email.length > 0 ? profile.emails[0].value:null
    });

    newUser.save((err) => {
      if (err) {
        return done(err);
      }
      done(null, newUser);
    });
  });

}));





// P A S S P O R T 
//ponemos flash aqui para que las estratégias de facebook e instragram puedan usa flash
const flash = require("connect-flash");

const session = require("express-session");
const bcrypt = require("bcrypt");

const LocalStrategy = require("passport-local").Strategy; // Porque .Strategy ?

//middleware session:
app.use(session({
  secret: "Andrea-y-Dimitri", // para que ?
  resave: true,
  saveUninitialized:true
}));

passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findOne({ "_id": id }, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

app.use(flash());


passport.use(new LocalStrategy({
  passReqToCallback: true}, (req, username, password, next) => {

  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));



//after
app.use(passport.initialize());
app.use(passport.session());



// default value for title local
app.locals.title = 'My Veggie Box';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);




// uso de rutas
app.use('/', index);
app.use("/users", users);
app.use("/", authRoutes);




// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
