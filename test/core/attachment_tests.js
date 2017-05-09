//@ts-check
const common = require("../common/common"),
    mocha = common.mocha,
    expect = common.expect,
    xero = common.xero,
    wrapError = common.wrapError,
    fs = common.fs

let currentApp = common.currentApp

/**
 * Attachments should work on the following endpoints:
 *  Invoices
 *  Credit Notes
 *  Bank Transactions
 *  Bank Transfers
 *  Contacts
 *  Accounts
 */

/** Attachments are not yet supported on the following endpoints:
 *   Receipts
 *   Manual Journals
 *   Repeating Invoices
 */

describe('attachments', function() {
    var invoiceID = '';

    it('creates an attachment on an invoice using a file reference', function(done) {
        var attachmentTemplate = {
            FileName: "1-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";

        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.invoices.getInvoices()
            .then(function(invoices) {
                var sampleInvoice = invoices[0];
                attachmentPlaceholder.save("Invoices/" + sampleInvoice.InvoiceID, sampleDataReference, false)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        invoiceID = sampleInvoice.InvoiceID;
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('gets the content of an attachment as stream', function(done) {
        //Add attachment to an Invoice
        currentApp.core.invoices.getInvoice(invoiceID)
            .then(function(invoice) {
                invoice.getAttachments()
                    .then(function(attachments) {

                        expect(attachments.length).to.be.at.least(1);

                        var first = attachments[0];

                        var wstream = fs.createWriteStream(__dirname + '/testdata/test1-' + first.FileName, { encoding: 'binary' });
                        wstream.on('finish', function() {
                            //Data has been written successfully
                            done();
                        });

                        wstream.on('error', function(err) {
                            console.log('data writing failed');
                            wstream.close();
                            console.log(err);
                            done(wrapError(err));
                        });

                        first.getContent(wstream)
                            .catch(function(err) {
                                console.log(err);
                                done(wrapError(err));
                            });
                    });

            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('creates an attachment on a credit note using a file reference', function(done) {

        var attachmentTemplate = {
            FileName: "1-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";

        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.creditNotes.getCreditNotes()
            .then(function(creditNotes) {
                var sampleCreditNote = creditNotes[0];
                attachmentPlaceholder.save("CreditNotes/" + sampleCreditNote.CreditNoteID, sampleDataReference, false)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('creates an attachment on an banktransaction using a file reference', function(done) {
        var attachmentTemplate = {
            FileName: "1-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";

        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.bankTransactions.getBankTransactions()
            .then(function(bankTransactions) {
                var sampleBankTransaction = bankTransactions[0];
                attachmentPlaceholder.save("BankTransactions/" + sampleBankTransaction.BankTransactionID, sampleDataReference, false)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('creates an attachment on an banktransfer using a file reference', function(done) {
        var attachmentTemplate = {
            FileName: "1-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";

        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.bankTransfers.getBankTransfers()
            .then(function(bankTransfers) {
                var sampleBankTransfer = bankTransfers[0];
                attachmentPlaceholder.save("BankTransfers/" + sampleBankTransfer.BankTransferID, sampleDataReference, false)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('creates an attachment on an contact using a file reference', function(done) {
        var attachmentTemplate = {
            FileName: "1-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";

        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.contacts.getContacts()
            .then(function(contacts) {
                var sampleContact = contacts[0];
                attachmentPlaceholder.save("Contacts/" + sampleContact.ContactID, sampleDataReference, false)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('creates an attachment on an account using a file reference', function(done) {
        var attachmentTemplate = {
            FileName: "1-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";

        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.accounts.getAccounts()
            .then(function(accounts) {
                var sampleAccount = accounts[0];
                attachmentPlaceholder.save("Accounts/" + sampleAccount.AccountID, sampleDataReference, false)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });


    //Using streams instead of files (attachment number 2)
    it('creates an attachment on an invoice using a file stream', function(done) {

        var attachmentTemplate = {
            FileName: "2-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";

        var dataReadStream = fs.createReadStream(sampleDataReference);
        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.invoices.getInvoices()
            .then(function(invoices) {
                var sampleInvoice = invoices[0];
                attachmentPlaceholder.save("Invoices/" + sampleInvoice.InvoiceID, dataReadStream, true)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('creates an attachment on a credit note using a file stream', function(done) {

        var attachmentTemplate = {
            FileName: "2-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";
        var dataReadStream = fs.createReadStream(sampleDataReference);
        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.creditNotes.getCreditNotes()
            .then(function(creditNotes) {
                var sampleCreditNote = creditNotes[0];
                attachmentPlaceholder.save("CreditNotes/" + sampleCreditNote.CreditNoteID, dataReadStream, true)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('creates an attachment on an banktransaction using a file stream', function(done) {
        var attachmentTemplate = {
            FileName: "2-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";
        var dataReadStream = fs.createReadStream(sampleDataReference);
        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.bankTransactions.getBankTransactions()
            .then(function(bankTransactions) {
                var sampleBankTransaction = bankTransactions[0];
                attachmentPlaceholder.save("BankTransactions/" + sampleBankTransaction.BankTransactionID, dataReadStream, true)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('creates an attachment on an banktransfer using a file stream', function(done) {
        var attachmentTemplate = {
            FileName: "1-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";
        var dataReadStream = fs.createReadStream(sampleDataReference);
        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.bankTransfers.getBankTransfers()
            .then(function(bankTransfers) {
                var sampleBankTransfer = bankTransfers[0];
                attachmentPlaceholder.save("BankTransfers/" + sampleBankTransfer.BankTransferID, dataReadStream, true)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('creates an attachment on an contact using a file stream', function(done) {
        var attachmentTemplate = {
            FileName: "2-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";
        var dataReadStream = fs.createReadStream(sampleDataReference);
        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.contacts.getContacts()
            .then(function(contacts) {
                var sampleContact = contacts[0];
                attachmentPlaceholder.save("Contacts/" + sampleContact.ContactID, dataReadStream, true)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('creates an attachment on an account using a file stream', function(done) {
        var attachmentTemplate = {
            FileName: "2-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";
        var dataReadStream = fs.createReadStream(sampleDataReference);
        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.accounts.getAccounts()
            .then(function(accounts) {
                var sampleAccount = accounts[0];
                attachmentPlaceholder.save("Accounts/" + sampleAccount.AccountID, dataReadStream, true)
                    .then(function(response) {
                        expect(response.entities.length).to.equal(1);
                        var thisFile = response.entities[0];
                        expect(thisFile.AttachmentID).to.not.equal("");
                        expect(thisFile.AttachmentID).to.not.equal(undefined);
                        expect(thisFile.FileName).to.equal(attachmentTemplate.FileName);
                        expect(thisFile.MimeType).to.equal(attachmentTemplate.MimeType);
                        expect(thisFile.ContentLength).to.be.greaterThan(0);
                        expect(thisFile.Url).to.not.equal("");
                        expect(thisFile.Url).to.not.equal(undefined);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(wrapError(err));
                    })
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });

    it('creates an attachment on an account using text as a stream - should fail', function(done) {
        var attachmentTemplate = {
            FileName: "2-test-attachment.pdf",
            MimeType: "application/pdf"
        };

        var sampleDataReference = __dirname + "/testdata/test-attachment.pdf";
        var attachmentPlaceholder = currentApp.core.attachments.newAttachment(attachmentTemplate);

        //Add attachment to an Invoice
        currentApp.core.accounts.getAccounts()
            .then(function(accounts) {
                var sampleAccount = accounts[0];
                attachmentPlaceholder.save("Accounts/" + sampleAccount.AccountID, sampleDataReference, true)
                    .then(function() {
                        done(new Error('Expected method to reject.'))
                    })
                    .catch(function(err) {
                        expect(err).to.not.equal(undefined);
                        done();
                    })
                    .catch(done);
            })
            .catch(function(err) {
                console.log(err);
                done(wrapError(err));
            });
    });
});