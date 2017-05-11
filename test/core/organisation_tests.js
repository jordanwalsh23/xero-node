const common = require("../common/common"),
    mocha = common.mocha,
    expect = common.expect,
    xero = common.xero,
    wrapError = common.wrapError,
    util = common.util

let currentApp = common.currentApp

describe('organisations', function() {
    it('get', function(done) {
        currentApp.core.organisations.getOrganisation()
            .then(function(ret) {

                var orgVersions = ["AU", "NZ", "GLOBAL", "UK", "US"]
                expect(ret.Name).to.not.equal("")
                expect(ret.Version).to.not.equal("")
                expect(ret.Version).to.be.oneOf(orgVersions)
                done()
            })
            .catch(function(err) {
                console.log(err)
                done(wrapError(err))
            })
    })
})