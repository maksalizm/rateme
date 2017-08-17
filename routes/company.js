var formidable = require('formidable');
var path = require('path');
var fs = require('fs');

var Company = require('../models/company');

module.exports = (app) => {
    app.get('/company/create', (req, res) => {
        var success = req.flash('success');
        res.render('company/company', {title: 'Company Registration', user: req.user, hasSuccess: success.length > 0, success: success});
    });

    app.post('/company/create', (req, res) => {
        var newCompany = new Company();
        newCompany.name = req.body.name;
        newCompany.address = req.body.address;
        newCompany.city = req.body.city;
        newCompany.country = req.body.website;
        newCompany.sector = req.body.sector;
        newCompany.website = req.body.website;
        newCompany.image = req.body.upload;

        newCompany.save((err) => {
            if (err) {
                console.log(err);
            }

            console.log(newCompany);

            req.flash('success', 'Company data has been added.');
            res.redirect('/company/create');
        });
    });

    app.post('/upload', (req, res) => {
        var form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, '../public/uploads');

        form.on('file', (field, file) => {
            fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
                if (err) {
                    throw err
                }
                console.log('File has been renamed');
            });
        });

        form.on('error', (err) => {
            console.log('An error occured', err);
        });

        form.on('end', () => {
            console.log('File upload was successful');
        });

        form.parse(req);
    })
};