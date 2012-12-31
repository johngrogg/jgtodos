var redis = require('redis')
  , moment = require('moment')
  , crypto = require("crypto")
  , assert = require("assert");
// Export modules
if (process.env.REDISTOGO_URL) {
  // redistogo connection
  console.log("Connecting to redistogo:"+process.env.REDISTOGO_URL);
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var client = redis.createClient(rtg.port, rtg.hostname);
  client.auth(rtg.auth.split(":")[1]);
  exports.client = client;
} else {
  exports.client = redis.createClient();
}
exports.moment = moment;
exports.crypto = crypto;
exports.assert = assert;
