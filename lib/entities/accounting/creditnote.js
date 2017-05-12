var _ = require('lodash'),
    Entity = require('../entity'),
    logger = require('../../logger'),
    LineItemSchema = require('../shared').LineItemSchema;

var CreditNoteContactSchema = Entity.SchemaObject({
    ContactID: { type: String },
    Name: { type: String }
});

var CreditNoteInvoiceType = Entity.SchemaObject({
    InvoiceID: { type: String },
    InvoiceNumber: { type: String }
});

var CreditNoteAllocationsSchema = Entity.SchemaObject({
    AppliedAmount: { type: Number },
    Date: { type: String },
    Invoice: {
        type: CreditNoteInvoiceType,
        toObject: 'hasValue'
    },
});

var CreditNoteSchema = Entity.SchemaObject({
    CreditNoteID: { type: String },
    Contact: {
        type: CreditNoteContactSchema,
        toObject: 'hasValue'
    },
    Date: { type: String, toObject: 'always' },
    Status: { type: String, toObject: 'hasValue' },
    LineAmountTypes: { type: String },
    SubTotal: { type: Number },
    TotalTax: { type: Number },
    Total: { type: Number },
    UpdatedDateUTC: { type: String, toObject: 'never' },
    CurrencyCode: { type: String },
    FullyPaidOnDate: { type: String },
    Type: { type: String, toObject: 'always' },
    CreditNoteNumber: { type: String },
    CurrencyRate: { type: Number },
    RemainingCredit: { type: Number },
    Allocations: { type: Array, arrayType: CreditNoteAllocationsSchema },
    LineItems: { type: Array, arrayType: LineItemSchema, toObject: 'hasValue' }
});

var CreditNote = Entity.extend(CreditNoteSchema, {
    constructor: function(application, data, options) {
        logger.debug('CreditNote::constructor');
        this.Entity.apply(this, arguments);
    },
    initialize: function(data, options) {},
    changes: function(options) {
        return this._super(options);
    },
    _toObject: function(options) {
        return this._super(options);
    },
    getAttachments: function(options) {
        return this.application.core.attachments.getAttachments('CreditNotes/' + this.CreditNoteID, options)
    },
    toXml: function() {
        var creditNote = _.omit(this.toObject(), 'LineItems');

        Object.assign(creditNote, { LineItems: { LineItem: [] } });
        _.forEach(this.LineItems, function(lineItem) {
            creditNote.LineItems.LineItem.push(lineItem.toObject());
        });

        return this.application.js2xml(creditNote, 'CreditNote');
    },
    save: function(options) {
        var self = this;
        var xml = '<CreditNotes>' + this.toXml() + '</CreditNotes>';
        var path, method;

        options = options || {};

        if (this.CreditNoteID) {
            path = 'CreditNotes/' + this.CreditNoteID;
            method = 'post'
        } else {
            path = 'CreditNotes';
            method = 'put'
        }

        //Adding other options for saving purposes
        options.entityPath = 'CreditNotes';
        options.entityConstructor = function(data) {
            return self.application.core.creditNotes.newCreditNote(data)
        };

        return this.application.putOrPostEntity(method, path, xml, options);
    },
    saveAllocations: function(allocations) {
        var self = this;
        var xml = '<Allocations>';

        _.each(allocations, function(allocation) {
            xml += "<Allocation>";
            xml += "<AppliedAmount>" + allocation.AppliedAmount + "</AppliedAmount>";
            xml += "<Invoice>";
            xml += "<InvoiceID>" + allocation.InvoiceID + "</InvoiceID>";
            xml += "</Invoice>";
            xml += "</Allocation>";
        });

        xml += "</Allocations>";

        var path, method;
        path = 'CreditNotes/' + this.CreditNoteID + "/Allocations";
        method = 'put'
        return this.application.putOrPostEntity(method, path, xml, {});
    },
});


module.exports.CreditNote = CreditNote;