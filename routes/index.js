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
var sync = require('../updates/sync.js');

// Common Middleware
keystone.pre('routes', middleware.enableCors);

//
var runPort = keystone.get('port');

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
	api: importRoutes('./api')
};

// Setup Route Bindings
exports = module.exports = function (app) {
	// Views
	app.get('/', routes.views.index);

	//api get
	app.get('/api/users', routes.api.users.getAll);
	app.get('/api/userDetails', routes.api.users.getDetails);
	app.get('/api/rooms', routes.api.rooms.getAll);
	app.get('/api/comments', routes.api.comments.getUserComments);
	app.get('/api/channels', routes.api.channels.getAll);


	//api post
	app.post('/api/events', routes.api.events.postEvent);

	//sync
	app.get('/api/sync', sync.syncUsersToDb);

    passport.use(new GoogleStrategy({
            clientID: '644028977678-a8a351epmpq4nunb7jr1ege5slp2keq1.apps.googleusercontent.com',
            clientSecret: 'kJYjCTQMHxeDo6giQFuUHVko',
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
                res.redirect(authVerifyUrl + _generateError(err.code ? 'oauth2_error' : info && info.errorType));
				return;
            }

            res.redirect(authVerifyUrl + '?token=' + jwt.createJWTToken(userId));
        })(req, res, next);
    });

    function _generateError(type) {
        return type ? '?error=' + type : '';
    }

};
