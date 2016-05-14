var keystone = require('keystone');
var User = keystone.list('User');
var rp = require('request-promise');
var _ = require('lodash');
var apiResponse = require('../../services/apiResponseService');
var dotenv = require('dotenv').config();


exports.getAll = function (req, res) {
	var options = {
		uri: 'https://slack.com/api/channels.list?',
		qs: {
			token: process.env.SLACK_TOKEN
		},
		json: true
	};

	rp(options)
		.then(function (result) {
			var channels = [];
			var channelPromises = [];
			_.forEach(result.channels, function (channel) {
				channelPromises.push(new Promise(function (parentResolve, parentReject) {

					var channelObject = channel;

					var memberPromiseArray = [];
					var memberArray = [];
					_.forEach(channel.members, function (member) {

						memberPromiseArray.push(new Promise(function (resolve, reject) {
							User.model.findOne({slack_id: member}).exec(function (err, user) {
									if(user) {
										var userToSend = {
											id: user.id,
											real_name: user.real_name,
											title: user.profile.title
										};

										memberArray.push(userToSend);
									}
								
								
								resolve();
							})
						}))

					});

					Promise.all(memberPromiseArray).then(function () {
						channelObject.members = memberArray;
						channels.push(channelObject);
						parentResolve();
					})
				}));


			});

			Promise.all(channelPromises).then(function () {
				apiResponse.sendResponse(req,res,null,null,channels);
			})
		});
};
