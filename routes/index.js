var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);
var User = keystone.list('User');

/** Google Auth */
//var gcal = require('google-calendar');
//var googleCalendar = new gcal.GoogleCalendar(accessToken);
var authVerifyUrl = '/#/verify';
var jwt = require('../services/jwt');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var passport = require('passport');
var _ = require('lodash');


// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

//
var runPort = keystone.get('port');

// Import Route Controllers
var routes = {
    views: importRoutes('./views')
};

// Setup Route Bindings
exports = module.exports = function (app) {
    // Views
    app.get('/', routes.views.index);

    passport.use(new GoogleStrategy({
            clientID: '644028977678-a8a351epmpq4nunb7jr1ege5slp2keq1.apps.googleusercontent.com',//process.env.GOOGLE_CONSUMER_KEY,
            clientSecret: 'kJYjCTQMHxeDo6giQFuUHVko', //process.env.GOOGLE_CONSUMER_KEY,
            callbackURL: process.env.BASE_URL + ':' + runPort + '/auth/callback',
            scope: ['openid', 'email', 'https://www.googleapis.com/auth/calendar']
        },
        function (accessToken, refreshToken, profile, done) {

            var emailsArray = profile.emails,
                email = emailsArray[0].value;

                if (!email) {
                    return done(null, false, {errorType: 'no_email'});
                }

                var toUpdate = {
                    google_access_token: accessToken
                };

            console.log('try to find user with email', email);
            User.model.findOneAndUpdate({email: email}, toUpdate, function (err, user) {
                if (err) {
                    return done(null, false, {errorType: 'unknown'});
                } else if (_.isNull(user)) {
                    return done(null, false, {errorType: 'no_part_of_slack'});
                }

                console.log('user found', user);

                return done(null, user._id);
            });
        }
    ));

    app.get('/auth',
        passport.authenticate('google', {session: false}));

    app.get('/auth/callback', function(req, res, next) {
        passport.authenticate('google', function(err, userId, info) {

            if (err) {
                res.redirect(authVerifyUrl + '?error=' + info.errorType);
            }

            res.redirect(authVerifyUrl + '?token=' + jwt.createJWTToken(userId));
        })(req, res, next);
    });

};


