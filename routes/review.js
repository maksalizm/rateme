var async = require('async');

var Company = require('../models/company');

module.exports = (app) => {
    app.get('/review/:id', (req, res) => {
        var msg = req.flash('success');
        Company.findOne({_id: req.params.id}, (err, data) => {
            res.render('company/review', {title: 'Company review', user: req.user, data: data, hasMsg: msg.length > 0, msg: msg});
        });
    });
    app.post('/review/:id', (req, res) => {
        async.waterfall([
            function (callback) {
                Company.findOne({_id: req.params.id}, (err , result) => {
                    callback(err, result);
                })
            },
            function (result, callback) {
                Company.update(
                    {
                        _id: req.params.id
                    },
                    {
                        $push: {
                            companyRating: {
                                companyName: req.body.sender,
                                userFullname: req.user.fullname,
                                userRole: req.user.role,
                                companyImage: req.user.company.image,
                                userRating: req.body.rating,
                                userReview: req.body.review
                            },
                            ratingNumber: req.body.rating
                        },
                        $inc: {
                            ratingSum: req.body.rating
                        }
                    },
                    (err) => {
                        req.flash('success', 'Your review has been added.');
                        res.redirect('/review/' + req.params.id);
                    }

                )
            }
        ])
    })
};