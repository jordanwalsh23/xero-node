'use strict';

const _ = require('lodash');
const extend = require('../misc/extend');
const querystring = require('querystring');
const Core = require('../core');
const Payroll = require('../payroll');
const events = require('events');

function Application(options) {
  this.options = _.merge(_.clone(Application.defaults), options);

  this.init();

  const core = new Core(this);
  const payroll = new Payroll(this);

  Object.defineProperties(this, {
    core: {
      get() {
        return core;
      },
    },
    payroll: {
      get() {
        return payroll;
      },
    },
  });
}

Application.extend = extend;

Object.assign(Application, {
  defaults: {
    baseUrl: 'https://api.xero.com',
    consumerSecret: '',
    consumerKey: '',
    requestTokenUrl: '/oauth/RequestToken',
    accessTokenUrl: '/oauth/AccessToken',
    authorizeUrl: '/oauth/Authorize',
    authorizeCallbackUrl: '',
    coreAPIEndPointUrl: '/api.xro/2.0/',
    payrollAPIEndPointUrl: '/payroll.xro/1.0/',
    pageMaxRecords: 100,
  },
});

Object.assign(Application.prototype, {
  init: function() {
    if (this.options.runscopeBucketId && this.options.runscopeBucketId !== '') {
      this.options.baseUrl = `https://api-xero-com-${this.options.runscopeBucketId}.runscope.net`;
    }

    if (!this.options.userAgent) {
      this.options.userAgent = this.options.consumerKey;
      console.warn(
        'DEPRECATION WARNING: User agent not specified in config file. Consumer Key used instead. This may be deprecated in a future release.'
      );
    }

    const PKG_JSON = require('../../package.json');
    const XERO_APP_NAME = PKG_JSON.name;
    const XERO_VERSION = PKG_JSON.version;

    // Include the SDK name and version in the user-agent
    this.options.userAgent += ` (${XERO_APP_NAME} - v${XERO_VERSION})`;

    this.eventEmitter = new events.EventEmitter();
  },
  post: function(path, body, options, callback) {
    return this.putOrPost('post', path, body, options, callback);
  },
  put: function(path, body, options, callback) {
    return this.putOrPost('put', path, body, options, callback);
  },
  putOrPost: function(method, path, body, options, callback) {
    const self = this;

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }
    options = options || {};
    return new Promise(function(resolve, reject) {
      const params = {};

      self
        .checkExpiry()
        .then(function() {
          if (options.summarizeErrors === false) params.summarizeErrors = false;

          // Added to support more than 2dp being added.
          if (options.unitdp) params.unitdp = options.unitdp;

          // Added to support attachments POST/PUT for invoices
          // being included on the online invoice
          if (options.IncludeOnline === true) params.IncludeOnline = 'true';

          const endPointUrl =
            options.api === 'payroll'
              ? self.options.payrollAPIEndPointUrl
              : self.options.coreAPIEndPointUrl;
          let url = self.options.baseUrl + endPointUrl + path;
          if (!_.isEmpty(params)) url += '?' + querystring.stringify(params);

          const payload = body;
          const contentType = options.contentType || 'application/json';

          self.oa[method](
            url,
            self.options.accessToken,
            self.options.accessSecret,
            payload,
            contentType,
            function(err, data, res) {
              data = JSON.parse(data);
              if (err && data && data['ErrorNumber'] >= 0) {
                var errObj = new Error(
                  method.toUpperCase() + ' call failed with: ' + err.statusCode
                );
                errObj.data = data;
                reject(errObj);
                callback && callback(errObj);
                return;
              }

              if (err) {
                let exception = '';
                if (data.ApiException) exception = data.ApiException;
                else if (data.ErrorNumber) exception = data;
                var errObj = new Error(
                  method.toUpperCase() +
                    ' call failed with: ' +
                    err.statusCode +
                    ' and exception: ' +
                    JSON.stringify(exception, null, 2)
                );
                reject(errObj);
                callback && callback(errObj);
              } else {
                const ret = { response: data, res: res };
                if (options.entityConstructor) {
                  ret.entities = self.convertEntities(data, options);
                }
                resolve(ret);
                callback && callback(null, data, res, ret.entities);
              }
            }
          );
        })
        .catch(function(err) {
          if (err && err.data) {
            const errObj = new Error(
              method.toUpperCase() + ' call failed with: ' + err.statusCode
            );
            errObj.data = data;
            reject(errObj);
            callback && callback(errObj);
            return;
          }
        });
    });
  },
  delete: function(path, options, callback) {
    const self = this;
    options = options || {};

    return new Promise(function(resolve, reject) {
      const endPointUrl =
        options.api === 'payroll'
          ? self.options.payrollAPIEndPointUrl
          : self.options.coreAPIEndPointUrl;
      const url = self.options.baseUrl + endPointUrl + path;

      self
        .checkExpiry()
        .then(function() {
          self.oa.delete(
            url,
            self.options.accessToken,
            self.options.accessSecret,
            function(err, data, res) {
              if (data) data = JSON.parse(data);

              if (options.stream && !err) {
                // Already done
                return resolve();
              }
              if (err && data && data['ErrorNumber'] >= 0) {
                var errObj = new Error(
                  'DELETE call failed with: ' + err.statusCode
                );
                errObj.data = data;
                reject(errObj);
                callback && callback(errObj);
                return;
              }

              if (err) {
                var errObj = new Error(
                  'DELETE call failed with: ' +
                    err.statusCode +
                    ' and message: ' +
                    err.data
                );
                reject(errObj);
                callback && callback(errObj);
                return;
              }

              //Some delete operations don't return any content (e.g. HTTP204) so simply resolve the promise
              if (!data || data === '') {
                return resolve();
              }

              const ret = { response: data, res: res };
              resolve(ret);
              callback && callback(null, data, res);
            },
            { stream: options.stream }
          );
        })
        .catch(function(err) {
          console.log(err);
          if (err && err.data) {
            const errObj = new Error(
              'DELETE call failed with: ' + err.statusCode
            );
            errObj.data = data;
            reject(errObj);
            callback && callback(errObj);
            return;
          }
        });
    });
  },
  get: function(path, options, callback) {
    const self = this;
    options = options || {};

    return new Promise(function(resolve, reject) {
      // modifiedAfter
      delete self.oa._headers['If-Modified-Since'];
      if (options.modifiedAfter) {
        //parse the supplied value. timestamp will be NaN if an invalid string is parsed.
        const modifiedDate = new Date(options.modifiedAfter);

        if (isNaN(modifiedDate.getTime()) === false) {
          self.oa._headers['If-Modified-Since'] = modifiedDate.toISOString();
        }
      }

      if (options.format) {
        self.oa._headers['Accept'] = 'application/' + options.format;
      } else {
        self.oa._headers['Accept'] = 'application/json';
      }

      self
        .checkExpiry()
        .then(function() {
          if (options.pager) getResource(options.pager.start || 1);
          else getResource();
        })
        .catch(function(err) {
          console.log(err);
          if (err && err.data) {
            const errObj = new Error('GET call failed with: ' + err.statusCode);
            errObj.data = data;
            reject(errObj);
            callback && callback(errObj);
            return;
          }
        });

      function getResource(offset) {
        const endPointUrl =
          options.api === 'payroll'
            ? self.options.payrollAPIEndPointUrl
            : self.options.coreAPIEndPointUrl;
        let url = self.options.baseUrl + endPointUrl + path;
        const params = options.params || {};
        if (offset) {
          params[options.pager.paramName || 'page'] = offset;
          if (options.other) {
            _.each(options.other, function(value, key) {
              if (!_.isUndefined(value)) params[key] = value;
            });
          }
        }

        // Added for where clause support on the GET requests.
        if (options.where) {
          params['Where'] = options.where;
        }

        if (!_.isEmpty(params)) {
          url += '?' + querystring.stringify(params);
        }

        self.oa.get(
          url,
          self.options.accessToken,
          self.options.accessSecret,
          function(err, data, res) {
            data = JSON.parse(data);

            if (options.stream && !err) {
              // Already done
              return resolve();
            }
            if (err && data) {
              var errObj = new Error('GET call failed with: ' + err.statusCode);
              errObj.data = data;
              reject(errObj);
              callback && callback(errObj);
              return;
            }

            const ret = { response: data, res: res };
            if (err) {
              var errObj = new Error(
                'GET call failed with: ' +
                  err.statusCode +
                  ' and exception: ' +
                  JSON.stringify(data.ApiException, null, 2)
              );
              reject(errObj);
              callback && callback(errObj);
              return;
            }

            if (options.pager && options.pager.callback) {
              options.pager.callback(err, ret, function(err, result) {
                result = _.defaults({}, result, {
                  recordCount: 0,
                  stop: false,
                });
                if (!result.stop) getResource(result.nextOffset || ++offset);
                else done();
              });
              return;
            }

            done();

            function done() {
              resolve(ret);
              callback && callback(null, data, res);
            }
          },
          { stream: options.stream }
        );
      }
    });
  },
  getRaw: function(path, options, callback) {
    const self = this;
    options = options || {};

    return new Promise(function(resolve, reject) {
      // modifiedAfter
      delete self.oa._headers['If-Modified-Since'];
      delete self.oa._headers['Accept'];

      self
        .checkExpiry()
        .then(function() {
          getResource();
        })
        .catch(function(err) {
          console.log(err);
          if (err && err.data) {
            const errObj = new Error('GET call failed with: ' + err.statusCode);
            errObj.data = data;
            reject(errObj);
            callback && callback(errObj);
            return;
          }
        });

      function getResource() {
        const url = path;

        self.oa.get(
          url,
          self.options.accessToken,
          self.options.accessSecret,
          function(err, data, res) {
            if (options.stream && !err) {
              // Already done
              return resolve();
            }
            if (err && data) {
              const errObj = new Error(
                'GET call failed with: ' + err.statusCode
              );
              errObj.data = data;
              reject(errObj);
              callback && callback(errObj);
              return;
            }

            resolve(data);
            callback && callback(null, data, null);
            return;
          },
          { stream: options.stream }
        );
      }
    });
  },
  makeObjectFromPath: function(path) {
    const pathParts = path.split('.');
    const obj = (currentObj = {});
    _.each(pathParts, function(pathPart) {
      currentObj = currentObj[pathPart] = {};
    });
    return obj;
  },
  putOrPostEntity: function(method, path, body, options, callback) {
    return this.putOrPost(method, path, body, options, callback);
  },
  putOrPostPostEntities: function(method, path, body, options, callback) {
    return this.putOrPost(method, path, body, options, callback);
  },
  postEntity: function(path, body, options, callback) {
    return this.putOrPostEntity('post', path, body, options, callback);
  },
  putEntity: function(path, body, options, callback) {
    return this.putOrPostEntity('put', path, body, options, callback);
  },
  postEntities: function(path, body, options, callback) {
    return this.putOrPostPostEntities('post', path, body, options, callback);
  },
  putEntities: function(path, body, options, callback) {
    return this.putOrPostPostEntities('put', path, body, options, callback);
  },
  convertEntities: function(obj, options) {
    const entities = [];
    const entitiesTop = obj[options.entityPath];
    if (!entitiesTop) return [];

    if (_.isArray(entitiesTop)) {
      _.each(entitiesTop, function(entityObj) {
        addEntity(entityObj);
      });
    } else {
      addEntity(entitiesTop);
    }
    return entities;

    function addEntity(entityObj) {
      const entity = options.entityConstructor();
      entity.fromXmlObj(entityObj);
      entities.push(entity);
    }
  },
  deleteEntities: function(path, options) {
    return this.delete(path, options)
      .then(function(ret) {
        if (ret && ret.response) return ret.response;
      })
      .catch(function(err) {
        console.error(err);
        throw err;
      });
  },
  getEntities: function(path, options) {
    const self = this;
    const clonedOptions = _.clone(options || {});

    let callerPagerCallback;
    if (clonedOptions.pager) {
      callerPagerCallback = clonedOptions.pager.callback;
      clonedOptions.pager.callback = pagerCallback;
    }

    return this.get(path, options)
      .then(function(ret) {
        if (ret && ret.response)
          return self.convertEntities(ret.response, clonedOptions);
      })
      .catch(function(err) {
        console.error(err);
        throw err;
      });

    function pagerCallback(err, result, cb) {
      if (err) {
        callerPagerCallback &&
          callerPagerCallback(err, null, function() {
            cb(err);
          });
      } else {
        const entities = self.convertEntities(result.response, clonedOptions);
        callerPagerCallback &&
          callerPagerCallback(
            err,
            {
              data: entities,
              finished: entities.length < self.options.pageMaxRecords,
            },
            function(err, result) {
              result = _.defaults({}, result, {
                recordCount: entities.length,
                stop: entities.length < self.options.pageMaxRecords,
              });
              cb(err, result);
            }
          );
      }
    }
  },
  convertDate: function(d) {
    if (typeof d.getDate === 'function') {
      return d.toISOString().split('T')[0];
    } else {
      return d;
    }
  },
  checkExpiry: function() {
    /**
     * CheckExpiry is a helper function that will compare the current token expiry to the current time.
     *
     * As there is potential for a time difference, instead of waiting all the way until the current time
     * has passed the expiry time, we instead add 3 minutes to the current time, and use that as a comparison.
     *
     * This ensures that if the token is 'nearing' the expiry, it'll attempt to be refreshed.
     */

    let expiry = new Date(this.options.tokenExpiry),
      checkTime = addMinutes(new Date(), 3);

    if (checkTime >= expiry) {
      console.log('Refreshing Access Token');
      return this.refreshAccessToken();
    } else {
      return Promise.resolve();
    }

    function addMinutes(date, minutes) {
      return new Date(date.getTime() + minutes * 60000);
    }
  },
});

module.exports.Application = Application;
