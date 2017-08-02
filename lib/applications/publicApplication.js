'use strict';

const RequireAuthorizationApplication = require('./requireAuthorizationApplication')
  .RequireAuthorizationApplication;
const OAuth = require('../oauth/oauth').OAuth;

const PublicApplication = RequireAuthorizationApplication.extend({
  constructor: function(config) {
    RequireAuthorizationApplication.call(
      this,
      Object.assign({}, config, { type: 'public' })
    );
  },
  init: function() {
    RequireAuthorizationApplication.prototype.init.apply(this);
    this.oa = new OAuth(
      this.options.baseUrl + this.options.requestTokenUrl,
      this.options.baseUrl + this.options.accessTokenUrl,
      this.options.consumerKey,
      this.options.consumerSecret,
      '1.0a',
      this.options.authorizeCallbackUrl,
      'HMAC-SHA1',
      null,
      { 'User-Agent': this.options.userAgent }
    );
  },
});

module.exports.PublicApplication = PublicApplication;
