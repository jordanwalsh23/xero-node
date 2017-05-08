//@ts-check
const common = require("../common/common"),
    expect = common.expect,
    wrapError = common.wrapError

describe('Invoice Reminders', function() {

    it('get', function(done) {
        common.currentApp.core.invoiceReminders.getInvoiceReminders()
            .then(function(invoiceReminders) {
                expect(invoiceReminders).to.have.length.greaterThan(0)
                invoiceReminders.forEach(function(invoiceReminder) {
                    expect(invoiceReminder.Enabled).to.be.oneOf([true, false])
                })
                done()
            })
            .catch(function(err) {
                console.log(err)
                done(wrapError(err))
            })
    })
})