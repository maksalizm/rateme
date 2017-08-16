var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');
var crypto = require('crypto');
var User = require('../models/user');
var secret = require('../secret/secret');

module.exports = (app, passport) => {
    app.get('/', (req, res) => {
        if (req.session.cookie.originalMaxAge !== null) {
            res.redirect('/home');
        } else {
            res.render('index', {title: 'Rate me'});
        }
    });

    app.get('/signup', (req, res) => {
        var errors = req.flash('error');
        res.render('user/signup', {title: 'Sign up || Rate me', messages: errors, hasError: errors.length > 0})
    });

    app.post('/signup', validateSignup, passport.authenticate('local.signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/login', (req, res) => {
        var errors = req.flash('error');
        res.render('user/login', {title: 'Login || Rate me', messages: errors, hasError: errors.length > 0})
    });

    app.post('/login', validateLogin, passport.authenticate('local.login', {
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => {
        if (req.body.rememberme) {
            req.session.cookie.maxAge = 30 * 24 * 60 *  60 * 1000;
        } else {
            req.session.cookie.expires = null;
        }
        res.redirect('/home');
    });

    app.get('/auth/facebook', passport.authenticate('facebook'));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/home', (req, res) => {
        res.render('home', {title: 'Home || Rate me'});
    });

    app.get('/forgot', (req, res) => {
        var errors = req.flash('error');
        var info = req.flash('info');
        res.render('user/forgot',
            {
                title: 'Request Password Reset',
                messages: errors,
                hasError: errors.length > 0,
                info: info,
                hasInfo: info.length > 0
            });
    });

    app.post('/forgot', (req, res, next) => {
        async.waterfall([
            function (callback) {
                crypto.randomBytes(20, (err, buf) => {
                    var rand = buf.toString('hex');
                    callback(err, rand);
                })
            },
            function (rand, callback) {
                User.findOne({email: req.body.email}, (err, user) => {
                    if (!user) {
                        req.flash('error', 'No account with this email or email is invalid');
                        return res.redirect('/forgot');
                    }
                    user.passwordResetToken = rand;
                    user.passwordResetExpire = Date.now() + 60 * 60 * 1000;
                    user.save((err) => {
                        callback(err, rand, user);
                    });
                })
            },
            function (rand, user, callback) {
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: secret.auth.user,
                        pass: secret.auth.pass
                    }
                });

                var mailOptions = {
                    from: `Rate Me <${secret.auth.user}>`,
                    to: user.email,
                    subject: 'Rate Me Application Password Reset Token',
                    text: `You have requested for password reset token. \n\n
                    Please click on the link to complete the process
                    http://localhost:3000/reset/${rand}\n\n`
                };
                smtpTransport.sendMail(mailOptions, (err, response) => {
                    req.flash('info', `A password reset token have benn sent to ${user.email}`);
                    return callback(err, user);
                });
            }
        ], (err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/forgot');
        })
    });
    app.get('/reset/:token', (req, res) => {
        User.findOne({passwordResetToken: req.params.token, passwordResetExpire: {$gt: Date.now()}},
            (err, user) => {
                if (!user) {
                    req.flash('error', 'Password reset token has expired or is invalid');
                    return res.redirect('/forgot');
                }
                var error = req.flash('error');
                var success = req.flash('success');


                res.render('user/reset', {
                    title: 'Reset your password',
                    messages: error,
                    hasError: error.length > 0,
                    hasSuccess: success.length > 0,
                    success: success
                })
            }
        );
    });
    app.post('/reset/:token', (req, res) => {
        async.waterfall([
            function (callback) {
                User.findOne({passwordResetToken: req.params.token, passwordResetExpire: {$gt: Date.now()}},
                    (err, user) => {
                        if (!user) {
                            req.flash('error', 'Password reset token has expired or is invalid')
                            return res.redirect('/forgot')
                        }
                        req.checkBody('password', 'Password is required').notEmpty();
                        req.checkBody('password', 'Password must not be less than 5').isLength({min: 5});
                        req.check('password', 'Password must contain at least 1 Number.').matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, 'i');

                        var errors = req.validationErrors();

                        if (req.body.password === req.body.cpassword) {
                            if (errors) {
                                var messages = [];
                                errors.forEach((error) => {
                                    messages.push(error.msg)
                                });
                                req.flash('error', messages);
                                res.redirect('/reset/' + req.params.token);
                            } else {
                                user.password = user.encryptPassword(req.body.password);
                                user.passwordResetToken = undefined;
                                user.passwordResetExpire = undefined;

                                user.save((err) => {
                                    req.flash('success', 'Your password has been succesfully updated');
                                    callback(err, user);
                                })
                            }
                        } else {
                            req.flash('error', 'Password and confirm password is not equal.');
                            res.redirect('/reset/' + req.params.token);
                        }

                        // var errors = req.flash('error');

                    })
            },
            function (user, callback) {
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: secret.auth.user,
                        pass: secret.auth.pass
                    }
                });

                var mailOptions = {
                    from: `Rate Me <${secret.auth.user}>`,
                    to: user.email,
                    subject: 'Your password has been updated',
                    text: `This is a confirmation that you updated the password for ${user.email}`
                };
                smtpTransport.sendMail(mailOptions, (err, response) => {
                    callback(err, user);

                    var error = req.flash('error');
                    var success = req.flash('success');

                    res.render('user/reset', {
                        title: 'Reset your password',
                        messages: error,
                        hasError: error.length > 0,
                        hasSuccess: success.length > 0,
                        success: success
                    });
                    return callback(err, user);
                });
            }
        ])
    });

    app.get('/logout', (req, res) => {
        req.logout();

       req.session.destroy((err) => {
           res.redirect('/');
       })
    })
};

function validateSignup(req, res, next) {
    req.checkBody('fullname', 'Full name is required').notEmpty();
    req.checkBody('fullname', 'Length must not be less than 5').isLength({min: 5});
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'Password must not be less than 5').isLength({min: 5});
    req.check('password', 'Password must contain at least 1 Number.').matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, 'i');

    var errors = req.validationErrors();

    if (errors) {
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        res.redirect('/signup');
    } else {
        return next();
    }
}

function validateLogin(req, res, next) {
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'Password must not be less than 5').isLength({min: 5});

    var errors = req.validationErrors();

    if (errors) {
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        res.redirect('/login');
    } else {
        return next();
    }
}