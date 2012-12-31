var redis = require('redis')
  , moment = require('moment')
  , crypto = require("crypto")
  , assert = require("assert");
exports.client = redis.createClient();
exports.moment = moment;
exports.crypto = crypto;
exports.assert = assert;
