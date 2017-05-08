//@ts-check
const common = require("../common/common"),
    mocha = common.mocha,
    expect = common.expect,
    xero = common.xero,
    wrapError = common.wrapError,
    util = common.util,
    uuid = common.uuid

let currentApp = common.currentApp

describe('bank transactions', function() {
    let sharedTransaction,
        expenseAccountId,
        expenseAccountCode,
        bankAccountId,
        bankAccountCode

    before('create an expense account for testing', function() {
        const randomString = uuid.v4()

        var testAccountData = {
            Code: randomString.replace(/-/g, '').substring(0, 10),
            Name: 'Test expense from Node SDK ' + randomString,
            Type: 'EXPENSE',
            Status: 'ACTIVE'
        }

        var account = currentApp.core.accounts.newAccount(testAccountData)

        return account.save()
            .then(function(response) {
                expenseAccountId = response.entities[0].AccountID
                expenseAccountCode = response.entities[0].Code
            })
    })

    before('create a bank account for testing', function() {
        const randomString = uuid.v4()

        var testAccountData = {
            Code: randomString.replace(/-/g, '').substring(0, 10),
            Name: 'Test bank from Node SDK ' + randomString,
            Type: 'BANK',
            Status: 'ACTIVE',
            BankAccountNumber: '062-021-0000000',
        }

        var account = currentApp.core.accounts.newAccount(testAccountData)

        return account.save()
            .then(function(response) {
                bankAccountId = response.entities[0].AccountID
                bankAccountCode = response.entities[0].Code
            })
    })

    after('archive the expense account for testing', function() {
        currentApp.core.accounts.getAccount(expenseAccountId)
            .then(function(account) {
                account.Status = 'ARCHIVED'
                return account.save()
            })


    })

    it('creates a new transaction', function(done) {
        var transaction = currentApp.core.bankTransactions.newBankTransaction({
            Type: "SPEND",
            Contact: {
                Name: "Johnny McGibbons"
            },
            LineItems: [{
                Description: 'Annual Bank Account Fee',
                UnitAmount: 250,
                AccountCode: expenseAccountCode
            }],
            BankAccount: {
                AccountID: bankAccountId
            }
        })

        transaction.save()
            .then(function(response) {
                expect(response.entities).to.have.length.greaterThan(0)
                expect(response.entities[0].BankTransactionID).to.not.equal("")
                expect(response.entities[0].BankTransactionID).to.not.equal(undefined)
                sharedTransaction = response.entities[0].BankTransactionID
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })

    it('get (no paging)', function(done) {
        currentApp.core.bankTransactions.getBankTransactions()
            .then(function(bankTransactions) {
                expect(bankTransactions).to.have.length.greaterThan(0)
                bankTransactions.forEach(function(bankTransaction) {
                    expect(bankTransaction.BankTransactionID).to.not.equal("")
                    expect(bankTransaction.BankTransactionID).to.not.equal(undefined)
                })
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })

    it('get by id', function(done) {
        currentApp.core.bankTransactions.getBankTransaction(sharedTransaction)
            .then(function(bankTransaction) {
                expect(bankTransaction.BankTransactionID).to.not.equal("")
                expect(bankTransaction.BankTransactionID).to.not.equal(undefined)
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })
})