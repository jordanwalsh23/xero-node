'use strict';

module.exports.PrivateApplication = require('./applications/privateApplication').PrivateApplication;
module.exports.PublicApplication = require('./applications/publicApplication').PublicApplication;
module.exports.PartnerApplication = require('./applications/partnerApplication').PartnerApplication;

module.exports.setLogLevel = () => {
  console.warn(
    'DEPRECATION WARNING: The setLogLevel function is deprecated as at 2.5.0.'
  );
};
