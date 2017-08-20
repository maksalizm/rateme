var User = require('../models/user');
var Message = require('../models/message');

var async = require('async');

module.exports = (app) => {
    app.get('/message/:userId', (req, res) => {
        async.parallel([
            function(callback) {
                User.findById({'_id': req.params.userId}, (err, result1) => {
                    callback(err, result1)
                });
            },
            function(callback) {
                Message.find({
                    '$or': [
                        {
                            userFrom: req.user._id,
                            userTo: req.params.userId
                        },
                        {
                            userFrom: req.params.userId,
                            userTo: req.user._id
                        }
                    ]
                }, function(err, result2) {
                    callback(err, result2);
                })
            }
        ], (err, results) => {
            var data = results[0];
            var messages = results[1];
            res.render('messages/message', {title: 'Private Message', user: req.user, data: data, chats: messages})
        })
    });

    app.post('/message/:userId', (req, res) => {
        User.findOne({'_id': req.params.userId}, (err, data) => {
            var newMessage = new Message();
            newMessage.userFrom = req.user._id;
            newMessage.userTo = req.params.userId;
            newMessage.userFromName = req.user.fullname;
            newMessage.userToName = data.fullname;
            newMessage.body = req.body.message;
            newMessage.createdAt = new Date();

            newMessage.save((err) => {
                res.redirect('/message/' + req.params.userId);
            });
        })
    })
};