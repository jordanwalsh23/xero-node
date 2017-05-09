//@ts-check
var _ = require('lodash'),
    Entity = require('../entity'),
    logger = require('../../logger')

var EarningsRateSchema = Entity.SchemaObject({
    EarningRateID: { type: String, toObject: 'always' },
    Name: { type: String, toObject: 'always' },
    AccountCode: { type: String, toObject: 'always' },
    TypeOfUnits: { type: String, toObject: 'always' },
    IsExemptFromTax: { type: Boolean, toObject: 'always' },
    IsExemptFromSuper: { type: Boolean, toObject: 'always' },
    EarningsType: { type: String, toObject: 'always' },
    RateType: { type: String, toObject: 'always' },
    RatePerUnit: { type: String, toObject: 'hasValue' },
    Multiplier: { type: Number, toObject: 'hasValue' },
    AccrueLeave: { type: Boolean, toObject: 'hasValue' },
    Amount: { type: Number, toObject: 'always' }
});

var DeductionTypeSchema = Entity.SchemaObject({
    DeductionTypeID: { type: String, toObject: 'always' },
    Name: { type: String, toObject: 'always' },
    AccountCode: { type: String, toObject: 'hasValue' },
    ReducesTax: { type: Boolean, toObject: 'hasValue' },
    ReducesSuper: { type: Boolean, toObject: 'hasValue' },
    UpdatedDateUTC: { type: String, toObject: 'hasValue' }
});

var BenefitTypeSchema = Entity.SchemaObject({
    BenefitType: { type: String },
    BenefitCategory: { type: String },
    LiabilityAccountCode: { type: String },
    ExpenseAccountCode: { type: String },
    BenefitTypeID: { type: String },
    StandardAmount: { type: Number },
    CompanyMax: { type: Number },
    Percentage: { type: Number },
    ShowBalanceOnPaystub: { type: Boolean }
});

var ReimbursementTypeSchema = Entity.SchemaObject({
    DeductionType: { type: String },
    ExpenseOfLiabilityAccountCode: { type: String },
    ReimbursementTypeID: { type: String }
});

var LeaveTypeSchema = Entity.SchemaObject({
    LeaveType: { type: String },
    LeaveCategory: { type: String },
    LiabilityAccountCode: { type: String },
    ExpenseAccountCode: { type: String },
    LeaveTypeID: { type: String },
    ShowBalanceToEmployee: { type: Boolean }
});

var PayItemsSchema = Entity.SchemaObject({
    EarningsRates: [EarningsRateSchema],
    BenefitTypes: [BenefitTypeSchema],
    DeductionTypes: [DeductionTypeSchema],
    ReimbursementTypes: [ReimbursementTypeSchema],
    LeaveTypes: [LeaveTypeSchema]
});

var PayItems = Entity.extend(PayItemsSchema, {
    constructor: function(application, data, options) {
        logger.debug('PayItems::constructor');
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
        Object.assign(self, _.omit(obj, 'BenefitTypes', 'EarningsRates', 'ReimbursementTypes', 'DeductionTypes', 'LeaveTypes'));
        if (obj.BenefitTypes) {
            this.extractArray(obj.BenefitTypes.BenefitType, this.BenefitTypes);
        }
        if (obj.EarningsRates) {
            this.extractArray(obj.EarningsRates.EarningsRate, this.EarningsRates);
        }
        if (obj.ReimbursementTypes) {
            this.extractArray(obj.ReimbursementTypes.ReimbursementType, this.ReimbursementTypes);
        }
        if (obj.LeaveTypes) {
            this.extractArray(obj.LeaveTypes.LeaveTypes, this.LeaveTypes);
        }
        if (obj.DeductionTypes) {
            this.extractArray(obj.DeductionTypes.DeductionType, this.DeductionTypes);
        }
        return this;
    }
});

var EarningsRate = Entity.extend(EarningsRateSchema, {
    constructor: function(application, data, options) {
        logger.debug('EarningsRates::constructor');
        this.Entity.apply(this, arguments);
    },
    initialize: function(data, options) {},
    changes: function(options) {
        return this._super(options);
    },
    _toObject: function(options) {
        return this._super(options);
    },
    toXml: function() {
        var earningsRate = _.omit(this.toObject());
        return this.application.js2xml(earningsRate, 'EarningsRate');
    },
    save: function(options) {
        var self = this;
        var xml = '<PayItems><EarningsRates>' + this.toXml() + '</EarningsRates></PayItems>';
        var path = 'PayItems';
        var method = 'post'

        return this.application.putOrPostEntity(method, path, xml, { entityPath: 'PayItems.EarningsRates.EarningsRate', entityConstructor: function(data) { return self.application.payroll.payitems.newEarningsRate(data) }, api: 'payroll' })
    }
});

module.exports.EarningsRate = EarningsRate
module.exports.PayItems = PayItems