//@ts-check
var _ = require('lodash'),
    logger = require('../../logger'),
    EntityHelper = require('../entity_helper'),
    PayItemsObject = require('../../entities/payroll/payitems').PayItems,
    EarningsRate = require('../../entities/payroll/payitems').EarningsRate,
    BenefitType = require('../../entities/payroll/payitems').BenefitType,
    DeductionType = require('../../entities/payroll/payitems').DeductionType,
    ReimbursementType = require('../../entities/payroll/payitems').ReimbursementType,
    LeaveType = require('../../entities/payroll/payitems').LeaveType,
    util = require('util')

var PayItems = EntityHelper.extend({
    constructor: function(application, options) {
        EntityHelper.call(this, application, Object.assign({
            entityPlural: 'PayItems',
            path: 'PayItems'
        }, options));
    },
    newPayItems: function(data, options) {
        return new PayItemsObject(this.application, data, options)
    },

    newDeductionType: function(data, options) {
        return new DeductionType(this.application, data, options)
    },
    newBenefitType: function(data, options) {
        return new BenefitType(this.application, data, options)
    },
    newReimbursementType: function(data, options) {
        return new ReimbursementType(this.application, data, options)
    },
    newLeaveType: function(data, options) {
        return new LeaveType(this.application, data, options)
    },
    /*Earnings Rates*/
    newEarningsRate: function(data, options) {
        return new EarningsRate(this.application, data, options)
    },
    getEarningsRate: function(id) {
        return this.getEarningsRates()
            .then(function(earningsRates) {
                let array = earningsRates.toArray();
                return _.find(array, { EarningsRateID: id })
            })
    },
    getEarningsRates: function(options) {
        return this.getPayItems(options)
            .then(function(payItems) {
                return payItems[0].EarningsRates
            })
    },
    getPayItems: function(options) {
        var self = this;
        var clonedOptions = Object.assign({}, options, { api: 'payroll' });
        clonedOptions.entityConstructor = function(data) { return self.newPayItems(data) };
        return this.getEntities(clonedOptions)
    }
})

module.exports = PayItems;