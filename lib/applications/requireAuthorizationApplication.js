'use strict';

const Application = require('./application').Application;

const RequireAuthorizationApplication = Application.extend({
  constructor: function(options) {
    Application.call(this, options);
  },
  init: function() {
    Application.prototype.init.apply(this, arguments);
  },
  getRequestToken: function(extras, callback) {
    if (_.isFunction(extras)) {
      callback = extras;
      extras = {};
    }
    extras = extras || {};

    const self = this;

    return new Promise(function(resolve, reject) {
      self.oa.getOAuthRequestToken(extras, function(
        err,
        token,
        secret,
        results
      ) {
        if (err) reject(err);
        else resolve({ token: token, secret: secret, results: results });
        callback && callback.apply(callback, arguments);
      });
    });
  },
  setAccessToken: function(token, secret, verifier, callback, options) {
    const self = this;

    return new Promise(function(resolve, reject) {
      self.oa.getOAuthAccessToken(token, secret, verifier, function(
        err,
        results
      ) {
        if (err) reject(err);
        else {
          const exp = new Date();
          exp.setTime(exp.getTime() + results.oauth_expires_in * 1000);
          self.setOptions({
            accessToken: results.oauth_token,
            accessSecret: results.oauth_token_secret,
            sessionHandle: results.oauth_session_handle,
            tokenExpiry: exp.toString(),
          });
          resolve({ results: results });
        }
        callback && callback.apply(callback, arguments);
      });
    });
  },
  refreshAccessToken: function(callback, options) {
    const self = this;

    return new Promise(function(resolve, reject) {
      self.oa.getOAuthAccessToken(
        self.options.accessToken,
        self.options.accessSecret,
        { oauth_session_handle: self.options.sessionHandle },
        function(err, results) {
          if (err) reject(err);
          else {
            const exp = new Date();
            exp.setTime(exp.getTime() + results.oauth_expires_in * 1000);
            self.setOptions({
              accessToken: results.oauth_token,
              accessSecret: results.oauth_token_secret,
              sessionHandle: results.oauth_session_handle,
              tokenExpiry: exp.toString(),
            });
            resolve({ results: results });
          }

          callback && callback.apply(callback, arguments);
        }
      );
    });
  },
  buildAuthorizeUrl: function(requestToken, other) {
    const q = Object.assign({}, { oauth_token: requestToken }, other);
    return (
      this.options.baseUrl +
      this.options.authorizeUrl +
      '?' +
      querystring.stringify(q)
    );
  },
  setOptions: function(options) {
    if (this.options.accessToken) {
      if (options.accessToken !== this.options.accessToken) {
        if (this.eventEmitter) {
          this.eventEmitter.emit('xeroTokenUpdate', options);
        }
      }
    }

    this.options = Object.assign(this.options, options);
  },
});

module.exports.RequireAuthorizationApplication = RequireAuthorizationApplication;
