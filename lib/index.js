'use strict';

module.exports.PrivateApplication = require('./application').PrivateApplication;
module.exports.PublicApplication = require('./application').PublicApplication;
module.exports.PartnerApplication = require('./application').PartnerApplication;

module.exports.setLogLevel = () => {
  console.warn(
    'DEPRECATION WARNING: The setLogLevel function is deprecated as at 2.5.0.'
  );
};
