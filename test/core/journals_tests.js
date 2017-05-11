const common = require("../common/common"),
    mocha = common.mocha,
    expect = common.expect,
    xero = common.xero,
    wrapError = common.wrapError,
    util = common.util

let currentApp = common.currentApp

describe('journals', function() {
    var sampleJournalId = "";

    it('get (paging with callback)', function(done) {
        currentApp.core.journals.getJournals({ pager: { start: 1, callback: onJournals } })
            .catch(function(err) {
                console.log(util.inspect(err, null, null));
                done(wrapError(err));
            })

        var recordCount = 0;

        function onJournals(err, ret, cb) {
            cb();
            recordCount += ret.data.length;
            ret.data.forEach(function(journal) {
                expect(journal.JournalID).to.not.equal("");
                expect(journal.JournalID).to.not.equal(undefined);
                expect(journal.JournalLines).to.have.length.at.least(0);
            });

            ret.finished && done();
        }
    });

    it('get (paging no callback)', function(done) {
        currentApp.core.journals.getJournals({ pager: { start: 1, callback: undefined } })
            .then(function(journals) {
                expect(journals).to.not.equal(undefined);
                done();
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null));
                done(wrapError(err));
            })
    });

    it('get (no paging)', function(done) {
        currentApp.core.journals.getJournals()
            .then(function(journals) {
                expect(journals).to.not.equal(undefined);
                expect(journals).to.be.an('Array');
                expect(journals).to.have.length.greaterThan(0);

                sampleJournalId = journals[0].JournalID;
                done();
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null));
                done(wrapError(err));
            })
    });

    it('get single journal', function(done) {
        currentApp.core.journals.getJournal(sampleJournalId)
            .then(function(journal) {
                expect(journal).to.be.an('Object');
                expect(journal.JournalID).to.equal(sampleJournalId);
                done();
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null));
                done(wrapError(err));
            })
    });
});