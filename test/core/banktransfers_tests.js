const common = require("../common/common"),
    mocha = common.mocha,
    expect = common.expect,
    xero = common.xero,
    wrapError = common.wrapError,
    util = common.util,
    uuid = common.uuid

let currentApp = common.currentApp

describe('bank transfers', function() {
    let sampleTransferID = '',
        bankAccounts = []

    before('get the bank accounts for testing', function() {
        let filter = 'TYPE == "BANK" && Status == "ACTIVE"'
        return currentApp.core.accounts.getAccounts({ where: filter })
            .then(function(accounts) {
                //Remove any accounts that don't have a 'Code' set as we need this later.
                accounts.forEach(function(el, i, array) {
                    if (!el.Code) {
                        accounts.splice(i, 1)
                    }
                })
                bankAccounts = accounts
            })
    })

    it('create sample bank transfer', function(done) {
        var transfer = currentApp.core.bankTransfers.newBankTransfer({
            FromBankAccount: {
                Code: bankAccounts[0].Code,
            },
            ToBankAccount: {
                Code: bankAccounts[1].Code,
            },
            Amount: '20.00'
        });
        transfer.save()
            .then(function(response) {
                expect(response.entities).to.have.length.greaterThan(0);
                expect(response.entities[0].BankTransferID).to.not.equal("");
                expect(response.entities[0].BankTransferID).to.not.equal(undefined);

                sampleTransferID = response.entities[0].BankTransferID;
                done();
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null));
                done(wrapError(err));
            })
    });

    it('get (no paging)', function(done) {
        currentApp.core.bankTransfers.getBankTransfers()
            .then(function(bankTransfers) {
                bankTransfers.forEach(function(bankTransfer) {
                    expect(bankTransfer.BankTransferID).to.not.equal("");
                    expect(bankTransfer.BankTransferID).to.not.equal(undefined);
                });
                done();
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null));
                done(wrapError(err));
            })
    });

    it('get single bank transfer', function(done) {
        currentApp.core.bankTransfers.getBankTransfer(sampleTransferID)
            .then(function(bankTransfer) {
                expect(bankTransfer.BankTransferID).to.not.equal("");
                expect(bankTransfer.BankTransferID).to.not.equal(undefined);
                expect(bankTransfer.BankTransferID).to.equal(sampleTransferID);
                done();
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null));
                done(wrapError(err));
            })
    });

});