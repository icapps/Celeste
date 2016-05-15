'use strict';

var moment = require('moment'),
    nJwt = require('njwt'),
    tokenSecret = process.env.TOKEN_SECRET;

module.exports = function () {
    var module = {};

    module.createJWTToken = function(userId) {
        var payload = {
            sub: userId,
            iat: moment().unix(),
            exp: moment().add(1, 'days').unix(),
            iss: process.env.BASE_URL,
            aud: process.env.BASE_URL
        };
        var token = nJwt.create(payload, tokenSecret);
        return token.compact();
    };

    return module;
}();
