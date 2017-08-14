module.exports = (app, passport) => {
    app.get('/', (req, res) => {
        res.render('index', {title: 'Rate me'});
    });

    app.get('/signup', (req, res) => {
        var errors = req.flash('error');
        res.render('user/signup', {title: 'Sign up || Rate me', messages: errors, hasError: errors.length > 0})
    });

    app.post('/signup',validate, passport.authenticate('local.signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/login', (req, res) => {
        res.render('user/login', {title: 'Login || Rate me'})
    });
};

function validate(req, res, next) {
    req.checkBody('fullname', 'Full name is required').notEmpty();
    req.checkBody('fullname', 'Length must not be less than 5').isLength({min: 5});
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'Password must not be less than 5').isLength({min: 5});
    req.check('password', 'Password must contain at least 1 Number.').matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/,'i');

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