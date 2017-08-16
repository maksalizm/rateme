module.exports = (app) => {
    app.get('/company/create', (req, res) => {
        res.render('company/company', {title: 'Company Registration', user: req.user});
    })
};