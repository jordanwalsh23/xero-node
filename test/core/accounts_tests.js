const common = require("../common/common"),
    mocha = common.mocha,
    expect = common.expect,
    xero = common.xero,
    wrapError = common.wrapError,
    util = common.util,
    uuid = common.uuid

let currentApp = common.currentApp

describe('accounts', function() {
    //Accounts supporting data
    var accountClasses = ["ASSET", "EQUITY", "EXPENSE", "LIABILITY", "REVENUE"]
    var accountTypes = ["BANK", "CURRENT", "CURRLIAB", "DEPRECIATN", "DIRECTCOSTS", "EQUITY", "EXPENSE", "FIXED", "INVENTORY", "LIABILITY", "NONCURRENT", "OTHERINCOME", "OVERHEADS", "PREPAYMENT", "REVENUE", "SALES", "TERMLIAB", "PAYGLIABILITY", "SUPERANNUATIONEXPENSE", "SUPERANNUATIONLIABILITY", "WAGESEXPENSE", "WAGESPAYABLELIABILITY"]
    var accountStatusCodes = ["ACTIVE", "ARCHIVED"]
    var bankAccountTypes = ["BANK", "CREDITCARD", "PAYPAL"]

    it('GET ALL', function(done) {
        currentApp.core.accounts.getAccounts()
            .then(function(accounts) {

                accounts.forEach(function(account) {

                    //Fields required for POST / PUT
                    if (account.Code) {
                        expect(account.Code).to.be.a('string')
                        expect(account.Code).to.have.length.below(11)
                    }

                    expect(account.Name).to.not.equal("")
                    expect(account.Name).to.be.a('string')

                    expect(account.Type).to.not.equal("")
                    expect(account.Type).to.be.oneOf(accountTypes)

                    if (account.Type === "BANK") {
                        expect(account.BankAccountType).to.be.a('string')
                        expect(account.BankAccountType).to.be.oneOf(bankAccountTypes)

                        expect(account.BankAccountNumber).to.be.a('string')
                        expect(account.BankAccountNumber).to.not.equal("")

                        if (account.CurrencyCode) {
                            expect(account.CurrencyCode).to.be.a('string')
                            expect(account.CurrencyCode).to.not.equal("")
                        }
                    }

                    expect(account.Status).to.be.a('string')
                    expect(account.Status).to.be.oneOf(accountStatusCodes)

                    //Description is an optional field, when not provided it should be undefined.
                    if (account.Description) {
                        expect(account.Description).to.be.a('string')
                        expect(account.Description).to.have.length.below(4001)
                    }

                    expect(account.TaxType).to.be.a('string')
                    expect(account.TaxType).to.not.equal("")

                    expect(account.EnablePaymentsToAccount).to.be.a('boolean')
                    expect(account.EnablePaymentsToAccount).to.not.be.undefined

                    expect(account.ShowInExpenseClaims).to.be.a('boolean')
                    expect(account.ShowInExpenseClaims).to.not.be.undefined

                    //Fields returned in the GET
                    expect(account.AccountID).to.not.equal("")
                    expect(account.Class).to.be.oneOf(accountClasses)

                    if (account.SystemAccount) {
                        expect(account.SystemAccount).to.not.equal("")
                        expect(account.SystemAccount).to.be.a('string')
                    }

                    if (account.ReportingCode) {
                        expect(account.ReportingCode).to.not.equal("")
                        expect(account.ReportingCode).to.be.a('string')
                    }

                    if (account.ReportingCodeName) {
                        expect(account.ReportingCodeName).to.not.equal("")
                        expect(account.ReportingCodeName).to.be.a('string')
                    }

                    expect(account.HasAttachments).to.be.a('boolean')
                    expect(account.HasAttachments).to.not.be.undefined

                    expect(account.UpdatedDateUTC).to.not.equal("")
                    expect(account.UpdatedDateUTC).to.be.a('string')
                })
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })

    //Create a new account
    //Get it, Update it, then delete it

    const randomString = uuid.v4()

    var testAccountId = ""
    var testAccountData = {
        Code: randomString.replace(/-/g, '').substring(0, 10),
        Name: 'Test account from Node SDK ' + randomString,
        Type: 'EXPENSE'
    }

    it('CREATE ONE', function(done) {
        var account = currentApp.core.accounts.newAccount(testAccountData)

        account.save()
            .then(function(response) {
                var thisAccount = response.entities[0]
                expect(thisAccount.Code).to.equal(testAccountData.Code)
                expect(thisAccount.Name).to.equal(testAccountData.Name)
                expect(thisAccount.Type).to.equal(testAccountData.Type)
                expect(thisAccount.BankAccountNumber).to.equal(testAccountData.BankAccountNumber)
                    //expect(thisAccount.Status).to.equal(testAccountData.Status)
                    //expect(thisAccount.Description).to.equal(testAccountData.Description)
                expect(thisAccount.BankAccountType).to.equal(testAccountData.BankAccountType)
                    //expect(thisAccount.CurrencyCode).to.equal(testAccountData.CurrencyCode)
                    //expect(thisAccount.TaxType).to.equal(testAccountData.TaxType)
                    //expect(thisAccount.EnablePaymentsToAccount).to.equal(testAccountData.EnablePaymentsToAccount)
                    //expect(thisAccount.ShowInExpenseClaims).to.equal(testAccountData.ShowInExpenseClaims)

                expect(thisAccount.AccountID).to.not.equal("")
                testAccountId = thisAccount.AccountID

                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })

    it('GET ONE', function(done) {
        currentApp.core.accounts.getAccount(testAccountId)
            .then(function(account) {
                expect(account.Code).to.equal(testAccountData.Code)
                expect(account.Name).to.equal(testAccountData.Name)
                expect(account.Type).to.equal(testAccountData.Type)
                expect(account.BankAccountNumber).to.equal(testAccountData.BankAccountNumber)
                    //expect(account.Status).to.equal(testAccountData.Status)
                    //expect(account.Description).to.equal(testAccountData.Description)
                    //expect(account.BankAccountType).to.equal(testAccountData.BankAccountType)
                    //expect(account.CurrencyCode).to.equal(testAccountData.CurrencyCode)
                    //expect(account.TaxType).to.equal(testAccountData.TaxType)
                    //expect(account.EnablePaymentsToAccount).to.equal(testAccountData.EnablePaymentsToAccount)
                    //expect(account.ShowInExpenseClaims).to.equal(testAccountData.ShowInExpenseClaims)

                expect(account.AccountID).to.not.equal("")
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })

    })

    it('UPDATE ONE', function(done) {
        currentApp.core.accounts.getAccount(testAccountId)
            .then(function(account) {
                testAccountData.Name = "Updated from the SDK " + uuid.v4()
                account.Name = testAccountData.Name

                account.save()
                    .then(function(response) {
                        var thisAccount = response.entities[0]
                        expect(thisAccount.Name).to.equal(testAccountData.Name)
                        done()
                    })
                    .catch(function(err) {
                        console.log(util.inspect(err, null, null))
                        done(wrapError(err))
                    })
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })

    it('DELETE ONE', function(done) {
        currentApp.core.accounts.deleteAccount(testAccountId)
            .then(function(response) {
                expect(response.Status).to.equal("OK")
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })

})