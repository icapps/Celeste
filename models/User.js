var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	//Standard keystone props
	name: {type: Types.Name, required: false, index: true},
	email: {type: Types.Email, initial: true, required: false, index: true},
	password: {type: Types.Password, initial: true, required: false},

	//Slack props
	slack_id: {type:String, initial:false, required: false, noedit:true},
	team_id:{type:String, initial:false, required: false, noedit:true},
	deleted:{type:Boolean, initial:false, required: false, noedit:true},
	status:{type:String, initial:false, required: false, noedit:true},
	color:{type:String, initial:false, required: false, noedit:true},
	real_name:{type:String, initial:false, required: false, noedit:true},
	google_access_token:{type:String, initial:false, required: false, noedit:true},
	profile:{
		first_name: {type:String, initial:false, required: false, noedit:true},
		last_name: {type:String, initial:false, required: false, noedit:true},
		title: {type:String, initial:false, required: false, noedit:true},
		skype: {type:String, initial:false, required: false, noedit:true},
		phone: {type:String, initial:false, required: false, noedit:true},
		image: {type:String, initial:false, required: false, noedit:true}
	}
	
}, 'Permissions', {
	isAdmin: {type: Boolean, label: 'Can access Keystone', index: true},

	
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});


/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin';
User.register();
