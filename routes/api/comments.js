var rp = require('request-promise');
var Promise = require('promise');

module.exports.getUserComments = function (req, res) {
	var options = {
		uri: 'https://slack.com/api/channels.history?',
		qs: {
			token: process.env.SLACK_TOKEN,
			channel: 'C0ZLK3R2P'
		},
		json: true
	};
	rp(options)
		.then(function (result) {
			console.log(JSON.stringify(result));
			if (result && result.hasOwnProperty('messages') && result.messages.length) {
				var promises = [];
				result.messages.forEach(function (message, i) {
					var options = {
						uri: 'https://slack.com/api/users.info?',
						qs: {
							token: process.env.SLACK_TOKEN,
							user: message.user
						},
						json: true
					};
					var promise = rp(options);
					promises.push(promise);
				});

				Promise.all(promises).then(function (result2) {
					// TODO: possible that the values don't map to the correct user HYPE
					var results = result.messages.map(function (message, i) {
						var finalMessage = message;
						finalMessage.user = result2[i].user;
						return finalMessage;
					});
					res.send(results);
				})
			} else {
				res.status(500).send('failed');
			}
		});

}
