'use strict';

const Application = require('./application').Application;
const OAuth = require('../oauth/oauth').OAuth;

const PrivateApplication = Application.extend({
  constructor: function(config) {
    Application.call(this, Object.assign({}, config, { type: 'private' }));
  },
  init: function() {
    Application.prototype.init.apply(this);
    const rsaPrivateKey = this.options.privateKey;
    this.oa = new OAuth(
      null,
      null,
      this.options.consumerKey,
      rsaPrivateKey,
      '1.0a',
      null,
      'RSA-SHA1',
      null,
      { 'User-Agent': this.options.userAgent }
    );
    this.options.accessToken = this.options.consumerKey;
    this.accessSecret = this.options.consumerSecret;
  },
});

module.exports.PrivateApplication = PrivateApplication;
