var _ = require('lodash'),
    Entity = require('../entity'),
    logger = require('../../logger'),
    ContactSchema = require('./contact').ContactSchema,
    Contact = require('./contact'),
    PaymentSchema = require('../shared').PaymentSchema,
    LineItemSchema = require('../shared').LineItemSchema;

var InvoiceSchema = Entity.SchemaObject({
    Type: { type: String, toObject: 'hasValue' },
    Contact: { type: ContactSchema, toObject: 'always' },
    LineItems: { type: Array, arrayType: LineItemSchema, toObject: 'hasValue' },
    Date: { type: Date, toObject: 'always' },
    DueDate: { type: Date, toObject: 'always' },
    LineAmountTypes: { type: String, toObject: 'hasValue' },
    InvoiceNumber: { type: String, toObject: 'hasValue' },
    Reference: { type: String, toObject: 'hasValue' },
    BrandingThemeID: { type: String, toObject: 'hasValue' },
    URL: { type: String, toObject: 'hasValue' },
    CurrencyCode: { type: String, toObject: 'hasValue' },
    CurrencyRate: { type: Number, toObject: 'hasValue' },
    Status: { type: String, toObject: 'hasValue' },
    SentToContact: { type: Boolean, toObject: 'hasValue' },
    ExpectedPaymentDate: { type: Date, toObject: 'hasValue' },
    PlannedPaymentDate: { type: Date, toObject: 'hasValue' },
    SubTotal: { type: Number, toObject: 'hasValue' },
    TotalTax: { type: Number, toObject: 'hasValue' },
    Total: { type: Number, toObject: 'hasValue' },
    TotalDiscount: { type: String, toObject: 'hasValue' },
    InvoiceID: { type: String, toObject: 'hasValue' },
    HasAttachments: { type: Boolean, toObject: 'hasValue' },
    Payments: { type: Array, arrayType: PaymentSchema, toObject: 'hasValue' },
    AmountDue: { type: Number, toObject: 'hasValue' },
    AmountPaid: { type: Number, toObject: 'hasValue' },
    FullyPaidOnDate: { type: Date, toObject: 'hasValue' },
    AmountCredited: { type: Number, toObject: 'hasValue' },
    UpdatedDateUTC: { type: Date, toObject: 'never' }
    //CreditNotes: {type: Array, arrayType: CreditNoteSchema, toObject: 'always'},
    //Prepayments: {type: Array, arrayType: PrepaymentsSchema, toObject: 'always'},
    //Overpayments: {type: Array, arrayType: OverpaymentsSchema, toObject: 'always'},
});

var Invoice = Entity.extend(InvoiceSchema, {
    constructor: function(application, data, options) {
        logger.debug('Invoice::constructor');
        this.Entity.apply(this, arguments);
    },
    initialize: function(data, options) {},
    changes: function(options) {
        return this._super(options);
    },
    _toObject: function(options) {
        return this._super(options);
    },
    fromXmlObj: function(obj) {
        var self = this;
        Object.assign(self, _.omit(obj, 'Contact'));
        if (obj.Contact) {
            _.merge(self.Contact, obj.Contact);
        }

        return this;
    },
    toXml: function() {
        var invoice = _.omit(this.toObject(), 'Contact', 'LineItems', 'Payments', 'CreditNotes', 'InvoiceID', 'HasAttachments', 'AmountDue', 'AmountPaid', 'AmountCredited', 'UpdatedDateUTC');
        Object.assign(invoice, { LineItems: { LineItem: [] } });
        _.forEach(this.LineItems, function(lineItem) {
            invoice.LineItems.LineItem.push(lineItem.toObject());
        });

        if (this.Contact) {
            var contact = _.omit(this.Contact.toObject(), 'Addresses', 'Phones', 'ContactPersons', 'BatchPayments', 'PaymentTerms');

            if (!_.isEmpty(this.Contact.Addresses)) {
                contact.Addresses = [];
                _.forEach(this.Contact.Addresses, function(address) {
                    contact.Addresses.push({ Address: address.toObject() })
                })
            }
            if (!_.isEmpty(this.Contact.Phones)) {
                contact.Phones = [];
                _.forEach(this.Contact.Phones, function(phone) {
                    contact.Phones.push({ Phone: phone.toObject() })
                })
            }
            if (!_.isEmpty(this.Contact.ContactPersons)) {
                contact.ContactPersons = [];
                _.forEach(this.Contact.ContactPersons, function(contactPerson) {
                    contact.ContactPersons.push({ ContactPerson: contactPerson.toObject() })
                })
            }

            invoice.Contact = contact
        }

        if (this.DueDate) {
            invoice.DueDate = this.application.convertDate(this.DueDate)
        }

        if (this.Date) {
            invoice.Date = this.application.convertDate(this.Date)
        }

        if (this.FullyPaidOnDate) {
            invoice.FullyPaidOnDate = this.application.convertDate(this.FullyPaidOnDate)
        }

        return this.application.js2xml(invoice, 'Invoice');

    },
    getAttachments: function(options) {
        return this.application.core.attachments.getAttachments('Invoices/' + this.InvoiceID, options)
    },
    save: function(options) {
        var self = this;
        var xml = '<Invoices>' + this.toXml() + '</Invoices>';
        var path, method;

        options = options || {};

        if (this.InvoiceID) {
            path = 'Invoices/' + this.InvoiceID;
            method = 'post'
        } else {
            path = 'Invoices';
            method = 'put'
        }

        //Adding other options for saving purposes
        options.entityPath = 'Invoices';
        options.entityConstructor = function(data) {
            return self.application.core.invoices.newInvoice(data)
        };

        return this.application.putOrPostEntity(method, path, xml, options);
    }

});


module.exports.Invoice = Invoice;
module.exports.InvoiceSchema = InvoiceSchema;
module.exports.LineItemSchema = LineItemSchema;