var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);
var sync = require('../updates/sync.js');

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

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
	app.get('/api/users',routes.api.users.getAll);
	app.get('/api/rooms',routes.api.rooms.getAll);
	
	//api post
	app.post('/api/events',routes.api.events.postEvent);
	
	//sync
	app.get('/api/sync', sync.syncUsersToDb);

};
