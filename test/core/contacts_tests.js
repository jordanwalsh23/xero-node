const common = require("../common/common"),
    mocha = common.mocha,
    expect = common.expect,
    xero = common.xero,
    wrapError = common.wrapError,
    util = common.util,
    uuid = common.uuid

let currentApp = common.currentApp

describe('contacts', function() {
    var sampleContact = {
        Name: 'Johnnies Coffee' + Math.random(),
        FirstName: 'John',
        LastName: 'Smith'
    }

    it('create single contact', function(done) {
        var contact = currentApp.core.contacts.newContact(sampleContact)
        contact.save()
            .then(function(response) {
                expect(response.entities).to.have.length.greaterThan(0)
                expect(response.entities[0].ContactID).to.not.equal("")
                expect(response.entities[0].ContactID).to.not.equal(undefined)
                expect(response.entities[0].Name).to.equal(sampleContact.Name)
                expect(response.entities[0].FirstName).to.equal(sampleContact.FirstName)
                expect(response.entities[0].LastName).to.equal(sampleContact.LastName)

                sampleContact = response.entities[0]

                done()
            })
            .catch(function(err) {
                console.log(err)
                done(wrapError(err))
            })
    })

    it('get (no paging)', function(done) {
        currentApp.core.contacts.getContacts()
            .then(function(contacts) {
                contacts.forEach(function(contact) {
                    expect(contact.ContactID).to.not.equal("")
                    expect(contact.ContactID).to.not.equal(undefined)
                })
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })
    it('get (paging)', function(done) {
        currentApp.core.contacts.getContacts({ pager: { start: 1, callback: onContacts } })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })

        function onContacts(err, response, cb) {
            cb()
            try {
                response.data.forEach(function(contact) {
                    expect(contact.ContactID).to.not.equal("")
                    expect(contact.ContactID).to.not.equal(undefined)
                })

                response.finished && done()
            } catch (ex) {
                console.log(util.inspect(err, null, null))
                done(ex)
                return
            }

        }
    })

    it('get by id', function(done) {
        currentApp.core.contacts.getContact(sampleContact.ContactID)
            .then(function(contact) {
                expect(contact.ContactID).to.equal(sampleContact.ContactID)
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })
    it('get - modifiedAfter', function(done) {
        var modifiedAfter = new Date()

        //take 20 seconds ago as we just created a contact
        modifiedAfter.setTime(modifiedAfter.getTime() - 20000)

        currentApp.core.contacts.getContacts({ modifiedAfter: modifiedAfter })
            .then(function(contacts) {
                expect(contacts.length).to.equal(1)
                done()

            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })

    })

    it('get - invalid modified date', function(done) {

        currentApp.core.contacts.getContacts({ modifiedAfter: 'cats' })
            .then(function(contacts) {
                expect(contacts.length).to.be.greaterThan(1)
                done()

            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })

    })

    it('create multiple contacts', function(done) {
        var contacts = []
        contacts.push(currentApp.core.contacts.newContact({ Name: 'Johnnies Coffee' + Math.random(), FirstName: 'John' + Math.random(), LastName: 'Smith' }))
        contacts.push(currentApp.core.contacts.newContact({ Name: 'Johnnies Coffee' + Math.random(), FirstName: 'John' + Math.random(), LastName: 'Smith' }))
        currentApp.core.contacts.saveContacts(contacts)
            .then(function(response) {
                expect(response.entities).to.have.length.greaterThan(0)
                response.entities.forEach(function(contact) {
                    expect(contact.ContactID).to.not.equal("")
                    expect(contact.ContactID).to.not.equal(undefined)
                })
                done()
            })
            .catch(function(err) {
                console.log(util.inspect(err, null, null))
                done(wrapError(err))
            })
    })

    it('update contact', function(done) {
        currentApp.core.contacts.getContact(sampleContact.ContactID)
            .then(function(contact) {
                expect(contact.ContactID).to.equal(sampleContact.ContactID)

                var newName = "Updated" + Math.random()

                contact.Name = newName
                contact.EmailAddress = contact.FirstName + "." + contact.LastName + "@gmail.com"
                contact.ContactPersons = [{
                    FirstName: "Johnny",
                    LastName: "Scribgibbons",
                    EmailAddress: "j.scribgib@gribbons.com",
                    IncludeInEmails: true
                }]
                contact.Addresses = [{
                    AddressLine1: "15 Scriby Street",
                    AddressLine2: "Preston",
                    AddressLine3: "Prestonville",
                    AddressLine4: "Scribeystanistan",
                    City: "Melbourne",
                    Region: "Victoria",
                    PostalCode: "3000",
                    Country: "Australia",
                    AttentionTo: "Johnny",
                    AddressType: "STREET"
                }]
                contact.save()
                    .then(function(updatedContact) {
                        expect(updatedContact.entities[0].Name).to.equal(newName)
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
    it('get attachments for contacts', function(done) {
        currentApp.core.contacts.getContact(sampleContact.ContactID)
            .then(function(contact) {
                expect(contact.ContactID).to.equal(sampleContact.ContactID)
                contact.getAttachments()
                    .then(function(attachments) {
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
})