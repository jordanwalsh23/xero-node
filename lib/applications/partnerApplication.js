'use strict';

const RequireAuthorizationApplication = require('./requireAuthorizationApplication')
  .RequireAuthorizationApplication;
const OAuth = require('../oauth/oauth').OAuth;

const PartnerApplication = RequireAuthorizationApplication.extend({
  constructor: function(config) {
    RequireAuthorizationApplication.call(
      this,
      Object.assign({}, config, { type: 'partner' })
    );
  },

  init: function() {
    RequireAuthorizationApplication.prototype.init.apply(this);
    const rsaPrivateKey = this.options.privateKey;
    this.oa = new OAuth(
      this.options.baseUrl + this.options.requestTokenUrl,
      this.options.baseUrl + this.options.accessTokenUrl,
      this.options.consumerKey,
      rsaPrivateKey,
      '1.0a',
      this.options.authorizeCallbackUrl,
      'RSA-SHA1',
      null,
      { 'User-Agent': this.options.userAgent }
    );
    // use SSL certificate
    const keyCert = this.options.privateKey;
    this.oa._createClient = function(
      port,
      hostname,
      method,
      path,
      headers,
      sslEnabled
    ) {
      const options = {
        host: hostname,
        port: port,
        path: path,
        method: method,
        headers: headers,
        key: keyCert,
      };
      let httpModel;
      if (sslEnabled) {
        httpModel = require('https');
      } else {
        httpModel = require('http');
      }
      return httpModel.request(options);
    };
  },
});

module.exports.PartnerApplication = PartnerApplication;
