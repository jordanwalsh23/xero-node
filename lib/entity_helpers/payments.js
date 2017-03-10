var _ = require('lodash'),
    logger = require('../logger'),
    EntityHelper = require('./entity_helper'),
    Payment = require('../entities/payment'),
    util = require('util')

var entityName = 'PaymentsHelper';
var Payments = EntityHelper.extend({
    constructor: function(application, options) {
        EntityHelper.call(this, application, Object.assign({ entityName: 'Payment', entityPlural: 'Payments' }, options));
    },
    createPayment: function(data, options) {
        this.trackEvent(entityName, arguments.callee.name);
        return new Payment(this.application, data, options);
    },
    getPayment: function(id, modifiedAfter) {
        this.trackEvent(entityName, arguments.callee.name);
        return this.getPayments({ id: id, modifiedAfter: modifiedAfter })
            .then(function(payments) {
                return _.first(payments);
            })
    },
    getPayments: function(options) {
        this.trackEvent(entityName, arguments.callee.name);
        var self = this;
        var clonedOptions = _.clone(options || {});
        clonedOptions.entityConstructor = function(data) { return self.createPayment(data) };
        return this.getEntities(clonedOptions)
    }
})

module.exports = Payments;