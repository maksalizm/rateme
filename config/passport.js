var passport = require('passport');
var LocalStraegy = require('passport-local').Strategy;

var User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    })
});

passport.use('local.signup', new LocalStraegy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({'email': email}, (err, user) => {
        if (err) {
            return done(err);
        }

        if (user) {
            return done(null, false, req.flash('error', 'User With Email Already Exist.'));
        }

        var newUser = new User();
        newUser.fullname = req.body.fullname;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password);

        newUser.save((err) => {
            return done(null, newUser);
        })
    })
}));

passport.use('local.login', new LocalStraegy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({'email': email}, (err, user) => {
        if (err) {
            return done(err);
        }

        var messages = [];
        if (!user || !user.validPassword(password)) {
            messages.push('Email does not exist or password is invalid!');
            return done(null, false, req.flash('error', messages));
        }

        return done(null, user);
    })
}));