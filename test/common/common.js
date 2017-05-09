//@ts-check
const metaConfig = require(__dirname + '/../config/testing_config.json'),
    fs = require('fs'),
    xero = require('../..'),
    mocha = require('mocha'),
    sinon = require('sinon'),
    Browser = require('zombie'),
    uuid = require('uuid'),
    chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    util = require('util')

//Change the log level
xero.setLogLevel('debug')

let APPTYPE = metaConfig.APPTYPE
let config = metaConfig[APPTYPE.toLowerCase()]

//Set up the global variables
let currentApp

if (config.privateKeyPath && !config.privateKey) config.privateKey = fs.readFileSync(config.privateKeyPath)

switch (APPTYPE) {
    case "PRIVATE":
        currentApp = new xero.PrivateApplication(config)
        break
    case "PUBLIC":
        currentApp = new xero.PublicApplication(config)
        break
    case "PARTNER":
        currentApp = new xero.PartnerApplication(config)
        break
    default:
        throw "No App Type Set!!"
}

function wrapError(err) {
    if (err instanceof Error)
        return err;
    else if (err.statusCode) {
        var msg = err.data;
        if (err.exception && err.exception.Message) {
            msg = err.exception.Message;
        }
        return new Error(err.statusCode + ': ' + msg);
    }
}

module.exports.fs = fs
module.exports.sinon = sinon
module.exports.mocha = mocha
module.exports.Browser = Browser
module.exports.config = metaConfig
module.exports.uuid = uuid
module.exports.util = util
module.exports.xero = xero
module.exports.chai = chai
module.exports.should = should
module.exports.expect = expect
module.exports.currentApp = currentApp
module.exports.wrapError = wrapError