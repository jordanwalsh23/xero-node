//@ts-check
var _ = require('lodash'),
    Entity = require('../entity'),
    logger = require('../../logger')

var EarningsRateSchema = Entity.SchemaObject({
    EarningsRateID: { type: String, toObject: 'always' },
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
    Amount: { type: Number, toObject: 'always' },
    UpdatedDateUTC: { type: Boolean, toObject: 'never' }
});

var DeductionTypeSchema = Entity.SchemaObject({
    DeductionTypeID: { type: String, toObject: 'always' },
    DeductionCategory: { type: String, toObject: 'always' },
    Name: { type: String, toObject: 'always' },
    AccountCode: { type: String, toObject: 'hasValue' },
    ReducesTax: { type: Boolean, toObject: 'hasValue' },
    ReducesSuper: { type: Boolean, toObject: 'hasValue' },
    UpdatedDateUTC: { type: String, toObject: 'never' }
});

var ReimbursementTypeSchema = Entity.SchemaObject({
    ReimbursementTypeID: { type: String, toObject: 'always' },
    Name: { type: 'String', toObject: 'always' },
    AccountCode: { type: String, toObject: 'hasValue' },
    UpdatedDateUTC: { type: Boolean, toObject: 'never' }
});

var LeaveTypeSchema = Entity.SchemaObject({
    LeaveTypeID: { type: String, toObject: 'always' },
    Name: { type: String, toObject: 'always' },
    TypeOfUnits: { type: String, toObject: 'always' },
    NormalEntitlement: { type: String, toObject: 'hasValue' },
    LeaveLoadingRate: { type: String, toObject: 'hasValue' },
    IsPaidLeave: { type: Boolean, toObject: 'always' },
    ShowOnPayslip: { type: Boolean, toObject: 'always' },
    UpdatedDateUTC: { type: Boolean, toObject: 'never' }
});

var PayItemsSchema = Entity.SchemaObject({
    EarningsRates: [EarningsRateSchema],
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
        Object.assign(self, _.omit(obj, 'EarningsRates', 'ReimbursementTypes', 'DeductionTypes', 'LeaveTypes'));
        if (obj.EarningsRates) {
            this.extractArray(obj.EarningsRates.EarningsRate, this.EarningsRates);
        }
        if (obj.ReimbursementTypes) {
            this.extractArray(obj.ReimbursementTypes.ReimbursementType, this.ReimbursementTypes);
        }
        if (obj.LeaveTypes) {
            this.extractArray(obj.LeaveTypes.LeaveType, this.LeaveTypes);
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
    save: function(options) {
        return saveObj(this, 'EarningsRate', options)
    },
    delete: function(options) {
        return this.save({ delete: true })
    }
});

var DeductionType = Entity.extend(DeductionTypeSchema, {
    constructor: function(application, data, options) {
        logger.debug('DeductionType::constructor');
        this.Entity.apply(this, arguments);
    },
    initialize: function(data, options) {},
    save: function(options) {
        return saveObj(this, 'DeductionType', options)
    },
    delete: function(options) {
        return this.save({ delete: true })
    }
});

var ReimbursementType = Entity.extend(ReimbursementTypeSchema, {
    constructor: function(application, data, options) {
        logger.debug('ReimbursementType::constructor');
        this.Entity.apply(this, arguments);
    },
    initialize: function(data, options) {},
    save: function(options) {
        return saveObj(this, 'ReimbursementType', options)
    },
    delete: function(options) {
        return this.save({ delete: true })
    }
});

var LeaveType = Entity.extend(LeaveTypeSchema, {
    constructor: function(application, data, options) {
        logger.debug('LeaveType::constructor');
        this.Entity.apply(this, arguments);
    },
    initialize: function(data, options) {},
    save: function(options) {
        return saveObj(this, 'LeaveType', options)
    },
    delete: function(options) {
        return this.save({ delete: true })
    }
});

/** 
 * Jordan Walsh - May 2017 
 * These two functions manage the serialisation and deserialisation of the different object types in the PayItems endpoint.
 * 
 * Currently this endpoint functions in an odd way.  Instead of having 5 different endpoints, the objects all exist on one.
 * 
 * When data is not supplied to the endpoint on updates, the data is removed from the back end.  
 * 
 * In an effort to streamline the process for the SDK user, they can work with single objects, and any data not supplied by
 * the SDK consumer is automatically restored to it's original state in the back end. 
 * 
 * If the PayItems endpoint changes behaviour in future, these two functions will need to be updated.
 */

function fromXmlObj(obj, objType, options) {
    var options = options || {};
    var payItem = _.omit(obj.toObject());
    var self = obj;
    var xml = '';

    var currentID = payItem[objType + 'ID'] || '';

    if (currentID === '') {
        //This is a new earnings rate, so we can generate the XML now
        xml = self.application.js2xml(payItem, objType)
    }

    return self.application.payroll.payitems[`get${objType}s`]()
        .then(function(existingPayItems) {
            existingPayItems.forEach(function(existingPayItem) {
                if (existingPayItem[objType + 'ID'] === currentID) {
                    if (options.delete === true) {
                        //we need to remove the current object
                        existingPayItem = null;
                    } else {
                        //we're doing an update so merge the current object
                        _.merge(existingPayItem, payItem)
                    }
                }

                if (existingPayItem)
                    xml += self.application.js2xml(existingPayItem.toJSON(), objType)
            })
            return xml;
        })
        .catch(function(err) {
            return err;
        })
}

function saveObj(obj, objType, options) {
    var self = obj;
    return fromXmlObj(obj, objType, options).then(function(entityXml) {
        var xml = `<PayItems><${objType}s>` + entityXml + `</${objType}s></PayItems>`;
        var path = 'PayItems';
        var method = 'post'

        return self.application.putOrPostEntity(method, path, xml, { entityPath: `PayItems.${objType}s.${objType}`, entityConstructor: function(data) { return self.application.payroll.payitems[`new${objType}`](data) }, api: 'payroll' })
    })
}

module.exports.LeaveType = LeaveType
module.exports.ReimbursementType = ReimbursementType
module.exports.DeductionType = DeductionType
module.exports.EarningsRate = EarningsRate
module.exports.PayItems = PayItems