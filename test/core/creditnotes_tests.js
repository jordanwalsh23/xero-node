//@ts-check
const common = require("../common/common"),
    mocha = common.mocha,
    expect = common.expect,
    xero = common.xero,
    wrapError = common.wrapError,
    util = common.util,
    uuid = common.uuid

let currentApp = common.currentApp

describe('Credit Notes', function() {
    let creditNoteID = "",
        salesAccountID = "",
        salesAccountCode = ""

    before('create a sales account for testing', function() {
        const randomString = uuid.v4()

        var testAccountData = {
            Code: randomString.replace(/-/g, '').substring(0, 10),
            Name: 'Test sales from Node SDK ' + randomString,
            Type: 'REVENUE',
            Status: 'ACTIVE',
            TaxType: 'OUTPUT'
        }

        var account = currentApp.core.accounts.newAccount(testAccountData)

        return account.save()
            .then(function(response) {
                salesAccountID = response.entities[0].AccountID
                salesAccountCode = response.entities[0].Code
            })
    })

    after('archive the account for testing', function() {
        currentApp.core.accounts.getAccount(salesAccountID)
            .then(function(account) {
                account.Status = 'ARCHIVED'
                return account.save()
            })
    })

    it('get', function(done) {
        currentApp.core.creditNotes.getCreditNotes()
            .then(function(creditNotes) {
                expect(creditNotes).to.have.length.greaterThan(0)
                creditNotes.forEach(function(creditNote) {
                    //Check the contact
                    if (creditNote.Contact) {
                        expect(creditNote.Contact.ContactID).to.not.equal("")
                        expect(creditNote.Contact.ContactID).to.not.equal(undefined)
                        expect(creditNote.Contact.Name).to.not.equal("")
                        expect(creditNote.Contact.Name).to.not.equal(undefined)
                    } else {
                        console.log("Credit note has no contact record")
                    }

                    expect(creditNote.Date).to.not.equal("")
                    expect(creditNote.Date).to.not.equal(undefined)

                    expect(creditNote.Status).to.be.oneOf(["DRAFT", "SUBMITTED", "DELETED", "AUTHORISED", "PAID", "VOIDED"])
                    expect(creditNote.LineAmountTypes).to.be.oneOf(["Exclusive", "Inclusive", "NoTax"])

                    expect(creditNote.SubTotal).to.be.a('Number')
                    expect(creditNote.SubTotal).to.be.at.least(0)
                    expect(creditNote.TotalTax).to.be.a('Number')
                    expect(creditNote.TotalTax).to.be.at.least(0)
                    expect(creditNote.Total).to.be.a('Number')
                    expect(creditNote.Total).to.be.at.least(0)

                    expect(creditNote.UpdatedDateUTC).to.not.equal("")
                    expect(creditNote.UpdatedDateUTC).to.not.equal(undefined)

                    expect(creditNote.CurrencyCode).to.not.equal("")
                    expect(creditNote.CurrencyCode).to.not.equal(undefined)

                    if (creditNote.FullyPaidOnDate) {
                        expect(creditNote.FullyPaidOnDate).to.not.equal("")
                    }

                    expect(creditNote.Type).to.be.oneOf(["ACCPAYCREDIT", "ACCRECCREDIT"])

                    expect(creditNote.CreditNoteID).to.not.equal("")
                    expect(creditNote.CreditNoteID).to.not.equal(undefined)

                    //Set the variable for the next test.
                    creditNoteID = creditNote.CreditNoteID

                    if (creditNote.Status === "AUTHORISED") {
                        if (creditNote.CreditNoteNumber) {
                            expect(creditNote.CreditNoteNumber).to.not.equal("")
                        }

                        if (creditNote.CurrencyRate) {
                            expect(creditNote.CurrencyRate).to.be.a('Number')
                            expect(creditNote.CurrencyRate).to.be.at.least(0)
                        }

                        if (creditNote.RemainingCredit) {
                            expect(creditNote.RemainingCredit).to.be.a('Number')
                            expect(creditNote.RemainingCredit).to.be.at.least(0)
                        }

                        if (creditNote.Allocations) {
                            creditNote.Allocations.forEach(function(allocation) {
                                if (allocation.AppliedAmount) {
                                    expect(allocation.AppliedAmount).to.be.a('Number')
                                    expect(allocation.AppliedAmount).to.be.at.least(0)
                                }

                                if (allocation.Invoice) {
                                    expect(allocation.Invoice.InvoiceID).to.not.equal("")
                                    expect(allocation.Invoice.InvoiceID).to.not.equal(undefined)
                                } else {
                                    console.log("Credit note allocation has no invoice record")
                                }
                            })
                        } else {
                            console.log("Credit note has no allocation records")
                        }
                    }
                })
                done()
            })
            .catch(function(err) {
                console.log(err)
                done(wrapError(err))
            })
    })

    it('get a single credit note', function(done) {
        currentApp.core.creditNotes.getCreditNote(creditNoteID)
            .then(function(creditNote) {
                //Check the contact
                if (creditNote.Contact) {
                    expect(creditNote.Contact.ContactID).to.not.equal("")
                    expect(creditNote.Contact.ContactID).to.not.equal(undefined)
                    expect(creditNote.Contact.Name).to.not.equal("")
                    expect(creditNote.Contact.Name).to.not.equal(undefined)
                } else {
                    console.log("Credit note has no contact record")
                }

                expect(creditNote.Date).to.not.equal("")
                expect(creditNote.Date).to.not.equal(undefined)

                expect(creditNote.Status).to.be.oneOf(["DRAFT", "SUBMITTED", "DELETED", "AUTHORISED", "PAID", "VOIDED"])
                expect(creditNote.LineAmountTypes).to.be.oneOf(["Exclusive", "Inclusive", "NoTax"])

                expect(creditNote.SubTotal).to.be.a('Number')
                expect(creditNote.SubTotal).to.be.at.least(0)
                expect(creditNote.TotalTax).to.be.a('Number')
                expect(creditNote.TotalTax).to.be.at.least(0)
                expect(creditNote.Total).to.be.a('Number')
                expect(creditNote.Total).to.be.at.least(0)

                expect(creditNote.UpdatedDateUTC).to.not.equal("")
                expect(creditNote.UpdatedDateUTC).to.not.equal(undefined)

                expect(creditNote.CurrencyCode).to.not.equal("")
                expect(creditNote.CurrencyCode).to.not.equal(undefined)

                if (creditNote.FullyPaidOnDate) {
                    expect(creditNote.FullyPaidOnDate).to.not.equal("")
                }

                expect(creditNote.Type).to.be.oneOf(["ACCPAYCREDIT", "ACCRECCREDIT"])

                expect(creditNote.CreditNoteID).to.not.equal("")
                expect(creditNote.CreditNoteID).to.not.equal(undefined)

                //Set the variable for the next test.
                creditNoteID = creditNote.CreditNoteID

                if (creditNote.Status === "AUTHORISED") {
                    if (creditNote.CreditNoteNumber) {
                        expect(creditNote.CreditNoteNumber).to.not.equal("")
                    }

                    if (creditNote.CurrencyRate) {
                        expect(creditNote.CurrencyRate).to.be.a('Number')
                        expect(creditNote.CurrencyRate).to.be.at.least(0)
                    }

                    if (creditNote.RemainingCredit) {
                        expect(creditNote.RemainingCredit).to.be.a('Number')
                        expect(creditNote.RemainingCredit).to.be.at.least(0)
                    }

                    if (creditNote.Allocations) {
                        creditNote.Allocations.forEach(function(allocation) {
                            if (allocation.AppliedAmount) {
                                expect(allocation.AppliedAmount).to.be.a('Number')
                                expect(allocation.AppliedAmount).to.be.at.least(0)
                            }

                            if (allocation.Invoice) {
                                expect(allocation.Invoice.InvoiceID).to.not.equal("")
                                expect(allocation.Invoice.InvoiceID).to.not.equal(undefined)
                            } else {
                                console.log("Credit note allocation has no invoice record")
                            }
                        })
                    } else {
                        console.log("Credit note has no allocation records")
                    }

                    if (creditNote.LineItems) {
                        creditNote.LineItems.forEach(function(lineItem) {

                            if (lineItem.LineItemID) {
                                expect(lineItem.LineItemID).to.not.equal("")
                            }

                            expect(lineItem.Description).to.not.equal("")
                            expect(lineItem.Description).to.not.equal(undefined)

                            if (lineItem.Quantity) {
                                expect(lineItem.Quantity).to.be.a('Number')
                                expect(lineItem.Quantity).to.be.at.least(0)

                                expect(lineItem.UnitAmount).to.be.a('Number')
                                expect(lineItem.UnitAmount).to.be.at.least(0)

                                if (lineItem.ItemCode) {
                                    expect(lineItem.ItemCode).to.be.a('String')
                                    expect(lineItem.ItemCode).to.not.equal("")
                                    expect(lineItem.ItemCode).to.not.equal(undefined)
                                }

                                expect(lineItem.AccountCode).to.be.a('String')
                                expect(lineItem.AccountCode).to.not.equal("")
                                expect(lineItem.AccountCode).to.not.equal(undefined)

                                expect(lineItem.TaxType).to.not.equal("")
                                expect(lineItem.TaxType).to.not.equal(undefined)

                                expect(lineItem.TaxAmount).to.be.a('Number')
                                expect(lineItem.TaxAmount).to.be.at.least(0)

                                expect(lineItem.LineAmount).to.be.a('Number')
                                expect(lineItem.LineAmount).to.be.at.least(0)

                                if (lineItem.Tracking) {
                                    lineItem.Tracking.forEach(function(trackingCategory) {
                                        expect(trackingCategory.Name).to.not.equal("")
                                        expect(trackingCategory.Name).to.not.equal(undefined)

                                        expect(trackingCategory.Option).to.not.equal("")
                                        expect(trackingCategory.Option).to.not.equal(undefined)

                                        expect(trackingCategory.TrackingCategoryID).to.not.equal("")
                                        expect(trackingCategory.TrackingCategoryID).to.not.equal(undefined)

                                        expect(trackingCategory.TrackingOptionID).to.not.equal("")
                                        expect(trackingCategory.TrackingOptionID).to.not.equal(undefined)
                                    })
                                }
                            }
                        })
                    } else {
                        console.log("Credit note has no line item records")
                    }
                }
                done()
            })
            .catch(function(err) {
                console.log(err)
                done(wrapError(err))
            })
    })

    it('creates a draft credit note', function(done) {

        var creditNoteData = {
            Type: 'ACCPAYCREDIT',
            Contact: {
                ContactID: ''
            },
            LineItems: [{
                Description: 'MacBook - White',
                Quantity: 1,
                UnitAmount: 1995.00,
                AccountCode: salesAccountCode
            }]
        }

        currentApp.core.contacts.getContacts()
            .then(function(contacts) {
                creditNoteData.Contact.ContactID = contacts[0].ContactID

                var creditNote = currentApp.core.creditNotes.newCreditNote(creditNoteData)

                creditNote.save()
                    .then(function(creditNotes) {
                        expect(creditNotes.entities).to.have.length(1)
                        var thisNote = creditNotes.entities[0]

                        creditNoteID = thisNote.CreditNoteID

                        expect(thisNote.Type).to.equal(creditNoteData.Type)
                        expect(thisNote.Contact.ContactID).to.equal(creditNoteData.Contact.ContactID)

                        thisNote.LineItems.forEach(function(lineItem) {
                            expect(lineItem.Description).to.equal(creditNoteData.LineItems[0].Description)
                            expect(lineItem.Quantity).to.equal(creditNoteData.LineItems[0].Quantity)
                            expect(lineItem.UnitAmount).to.equal(creditNoteData.LineItems[0].UnitAmount)
                            expect(lineItem.AccountCode.toLowerCase()).to.equal(creditNoteData.LineItems[0].AccountCode.toLowerCase())
                        })

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

    it('approves a credit note', function(done) {

        //Get the draft credit note, update it, and save it.
        currentApp.core.creditNotes.getCreditNote(creditNoteID)
            .then(function(creditNote) {

                creditNote.Status = 'AUTHORISED'
                creditNote.Date = new Date().toISOString().split("T")[0]

                creditNote.save()
                    .then(function(savedCreditNote) {
                        expect(savedCreditNote.entities).to.have.length(1)
                        var thisNote = savedCreditNote.entities[0]
                        expect(thisNote.Status).to.equal('AUTHORISED')
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

    it('adds an allocation to a credit note', function(done) {

        currentApp.core.invoices.getInvoices({ where: 'Type == "ACCPAY" and Status == "AUTHORISED"' })
            .then(function(invoices) {
                expect(invoices).to.have.length.greaterThan(0)

                var myInvoice = invoices[0]
                var myContact = myInvoice.Contact
                var myCreditNoteAmount = myInvoice.AmountDue / 2 //50% of total amount left

                //Create the credit note.
                var creditNoteData = {
                    Type: 'ACCPAYCREDIT',
                    Contact: {
                        ContactID: myContact.ContactID
                    },
                    LineItems: [{
                        Description: 'Credit',
                        Quantity: 1,
                        UnitAmount: myCreditNoteAmount,
                        AccountCode: salesAccountCode
                    }],
                    Status: 'AUTHORISED',
                    Date: new Date().toISOString().split("T")[0]
                }

                var creditNote = currentApp.core.creditNotes.newCreditNote(creditNoteData)

                creditNote.save()
                    .then(function(creditNotes) {
                        expect(creditNotes.entities).to.have.length(1)
                        var thisNote = creditNotes.entities[0]

                        //Now apply the allocation to the original invoice.
                        var allocations = [{
                            AppliedAmount: myCreditNoteAmount,
                            InvoiceID: myInvoice.InvoiceID
                        }]

                        thisNote.saveAllocations(allocations)
                            .then(function(res) {
                                //console.log(res)
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
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })

    })


})