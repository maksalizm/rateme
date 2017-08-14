module.exports = (app) => {
    app.get('/', (req, res) => {
        res.render('index', {title: 'Rate me'});
    });

    app.get('/signup', (req, res) => {
        res.render('user/signup', {title: 'Sign up || Rate me'})
    })

    app.get('/login', (req, res) => {
        res.render('user/login', {title: 'Login || Rate me'})
    })
};