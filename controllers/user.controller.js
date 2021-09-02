const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');

const User = mongoose.model('User');


// Sign up user
module.exports.signup = (req, res, next) => {
    var user = new User();

    user.firstName = req.body.firstName;
    user.score = req.body.score;
    user.email = req.body.email;
    user.password = req.body.password;

    // Save records
    user.save((err, doc) => {
        if (!err)
            res.send(doc);
        else {
            if (err.code == 11000)
                res.status(409).send(['Email address already exists.']);
            else
                return next(err);
        }

    });
}

module.exports.authenticate = (req, res, next) => {
    // call for passport authentication
    passport.authenticate('local', (err, user, info) => {       
        // error from passport middleware
        if (err) return res.status(400).json(err);

        // registered user
        else if (user) return res.status(200).json({ "token": user.generateJwt() });

        // unknown user or wrong password
        else return res.status(404).json(info);
    })(req, res);
}

module.exports.userProfile = (req, res, next) =>{
    User.findOne({ _id: req._id },
        (err, user) => {
            if (!user)
                return res.status(404).json({ status: false, message: 'User record not found.' });
            else
                return res.status(200).json({ status: true, user : _.pick(user,['firstName', 'score', 'email', 'history']) });
        }
    );
}

module.exports.updateUser = (req, res, next) =>{
    var body = req.body
    User.findOneAndUpdate({email: req.email}, body, {upsert:true, new:true}, function(err, doc) {
        if(err){
            return res.status(404).json({ status: false, error: err });
        }else{
            res.json(doc)
        }
      });
}