module.exports = (app) => {
    app.get('/review/:id', (req, res) => {
        res.render('company/review', {title: 'Company review', user: req.user});
    });

}