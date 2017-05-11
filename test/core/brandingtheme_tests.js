const common = require("../common/common"),
    mocha = common.mocha,
    expect = common.expect,
    xero = common.xero,
    wrapError = common.wrapError,
    util = common.util,
    uuid = common.uuid

let currentApp = common.currentApp

describe('branding themes', function() {

    var brandingThemeID = ""

    it('get', function(done) {
        currentApp.core.brandingThemes.getBrandingThemes()
            .then(function(brandingThemes) {
                expect(brandingThemes).to.have.length.greaterThan(0)
                brandingThemes.forEach(function(brandingTheme) {
                    expect(brandingTheme.BrandingThemeID).to.not.equal(undefined)
                    expect(brandingTheme.BrandingThemeID).to.not.equal("")
                    expect(brandingTheme.Name).to.not.equal(undefined)
                    expect(brandingTheme.Name).to.not.equal("")

                    brandingThemeID = brandingTheme.BrandingThemeID
                })
                done()
            })
            .catch(function(err) {
                console.log(err)
                done(wrapError(err))
            })
    })

    it('get by ID', function(done) {
        currentApp.core.brandingThemes.getBrandingTheme(brandingThemeID)
            .then(function(brandingTheme) {

                expect(brandingTheme.BrandingThemeID).to.not.equal(undefined)
                expect(brandingTheme.BrandingThemeID).to.not.equal("")
                expect(brandingTheme.Name).to.not.equal(undefined)
                expect(brandingTheme.Name).to.not.equal("")

                done()
            })
            .catch(function(err) {
                console.log(err)
                done(wrapError(err))
            })
    })
})