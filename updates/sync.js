var _ = require('lodash'),
	rp = require('request-promise');
	keystone = require('keystone');
	User = keystone.list('User');
	dotenv = require('dotenv').config();

module.exports = {

	//TODO Continuous sync
	syncUsersToDb: function () {
		var options = {
			uri: 'https://slack.com/api/users.list?',
			qs: {
				token: process.env.SLACK_TOKEN
			},
			json: true
		};
		
		var admin = { 'name.first': 'Admin', 'name.last': 'User', 'email': 'development@icapps.com', 'password': 'admin', 'isAdmin': true };
		
		
		_removeTable('User').then(function(){
			_createAdmin(admin);
			_getInfoFromSlack(options);
		});

	}


};

function _getInfoFromSlack(options) {

	var userArray = [];

	rp(options)
		.then(function (res) {
			_.forEach(res.members, function (member) {
				
				userArray.push(new Promise(function(resolve,reject){
					//Define the userObject
					var userToSave = {
						name: member.name,
						email: member.profile.email,
						slack_id: member.id,
						team_id: member.team_id,
						deleted: member.deleted,
						status: member.status,
						color: member.color,
						real_name: member.real_name,
						profile: {
							first_name: member.profile.first_name,
							last_name: member.profile.last_name,
							title: member.profile.title,
							skype: member.profile.skype,
							phone: member.profile.phone,
							image: member.profile.image_192
						}
					};
					
					var newUser = User.model(userToSave);
					if(newUser.email && newUser.email.indexOf(process.env.EMAIL_DOMAIN)>-1){
						newUser.save(function(err){
							if(err)console.log('error in saving user',err);
							resolve();
						});
					}else {
						resolve();
					}
					
					
				}))
				
			});
			
			Promise.all(userArray).then(function(res){
				console.log('all users posted to db');
				res.json({ok:'all users synced'})
			},function(err){
				console.log('err',err);
			})
			
			
		})
		.catch(function (err) {
			console.log(err);
		});

}

function _removeTable(list) {
	return new Promise(function (resolve, reject) {
		var tableToRemove = keystone.list(list);
		tableToRemove.model.remove({}, function (err) {
			if (err) {
				console.log(err);
				console.log('failed to remove');
				reject();
			} else {
				console.log('collection removed');
				resolve();
			}
		});
	});
}

function _createAdmin(user){
	var newUser = User.model(user);
	newUser.save();
}

