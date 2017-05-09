//@ts-check
const common = require("../common/common"),
    mocha = common.mocha,
    expect = common.expect,
    xero = common.xero,
    wrapError = common.wrapError

let currentApp = common.currentApp

describe('users', function() {
    let sampleUserId = ''

    it('retrieves a list of users', function(done) {
        currentApp.core.users.getUsers()
            .then(function(users) {
                expect(users.length).to.be.at.least(1)
                users.forEach(function(user) {
                    expect(user.UserID).to.not.equal(undefined)
                    expect(user.UserID).to.not.equal("")
                    sampleUserId = user.UserID
                })
                done()
            })
            .catch(function(err) {
                console.log(err)
                done(wrapError(err))
            })
    })

    it('retrieves a single user', function(done) {
        currentApp.core.users.getUser(sampleUserId)
            .then(function(user) {
                expect(user.UserID).to.equal(sampleUserId)
                done()
            })
            .catch(function(err) {
                console.log(err)
                done(wrapError(err))
            })
    })
})