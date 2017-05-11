const common = require("../common/common"),
    mocha = common.mocha,
    expect = common.expect,
    xero = common.xero,
    wrapError = common.wrapError,
    util = common.util,
    uuid = common.uuid

let currentApp = common.currentApp

describe('payments', function() {
    /* Please note that this test pays an invoice created in the previous tests */

    let invoiceID,
        amountDue,
        paymentId,
        testAccountId,
        testAccountCode,
        testAccount

    before('create an account to pay into', function() {
        const randomString = uuid.v4()

        var testAccountData = {
            Code: randomString.replace(/-/g, '').substring(0, 10),
            Name: 'Test account from Node SDK ' + randomString,
            Type: 'SALES',
            EnablePaymentsToAccount: true
        }

        testAccountCode = testAccountData.Code

        var account = currentApp.core.accounts.newAccount(testAccountData)

        return account.save()
            .then(function(response) {
                var account = response.entities[0]
                testAccountId = account.AccountID
                testAccount = account
            })
    })

    before('get an unpaid invoice to pay', function() {
        let filter = 'Status == "AUTHORISED"'
        return currentApp.core.invoices.getInvoices({ where: filter })
            .then(function(invoices) {
                invoiceID = invoices[0].InvoiceID
                amountDue = invoices[0].AmountDue
            })
    })

    after('archive the test account', function() {
        testAccount.Status = 'ARCHIVED'
        return testAccount.save()
    })

    it('Create Payment', function(done) {

        var payment = currentApp.core.payments.createPayment({
            Invoice: {
                InvoiceID: invoiceID
            },
            Account: {
                Code: testAccountCode
            },
            Date: new Date().toISOString().split("T")[0],
            Amount: amountDue
        })

        payment.save()
            .then(function(response) {
                expect(response.entities).to.have.length.greaterThan(0)

                paymentId = response.entities[0].PaymentID
                expect(paymentId).to.not.equal("")
                expect(paymentId).to.not.equal(undefined)
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })

    it('Retrieve Payments', function(done) {
        currentApp.core.payments.getPayments()
            .then(function(payments) {
                expect(payments).to.have.length.greaterThan(0)
                payments.forEach(function(payment) {
                    expect(payment.PaymentID).to.not.equal(undefined)
                    expect(payment.PaymentID).to.not.equal("")

                })
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })

    it('Retrieve Single Payment', function(done) {

        currentApp.core.payments.getPayment(paymentId)
            .then(function(payment) {
                expect(payment.PaymentID).to.not.equal("")
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })

    it('Update Payment', function(done) {

        var paymentToDelete = currentApp.core.payments.createPayment({
            PaymentID: paymentId,
            Status: "DELETED"
        })

        paymentToDelete.save()
            .then(function(response) {
                expect(response.entities).to.have.length.greaterThan(0)
                expect(response.entities[0].Status).to.equal("DELETED")
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })

    })

    it('Delete Payment', function(done) {
        //NOT CURRENTLY SUPPORTED.
        //Use update Payment with Payment.Status = DELETED.
        this.skip()
    })

})