var _ = require('lodash'),
    logger = require('../logger'),
    EntityHelper = require('./entity_helper'),
    TrackingCategory = require('../entities/trackingcategory'),
    TrackingOption = require('../entities/trackingoption.js'),
    util = require('util')

var entityName = 'TrackingCategoriesHelper';
var TrackingCategories = EntityHelper.extend({
    constructor: function(application, options) {
        EntityHelper.call(this, application, Object.assign({ entityName: 'TrackingCategory', entityPlural: 'TrackingCategories' }, options));
    },
    newTrackingCategory: function(data, options) {
        this.trackEvent(entityName, arguments.callee.name);
        return new TrackingCategory(this.application, data, options)
    },
    newTrackingOption: function(data, options) {
        this.trackEvent(entityName, arguments.callee.name);
        return new TrackingOption(this.application, data, options)
    },
    getTrackingCategory: function(id, where, order, includeArchived) {
        this.trackEvent(entityName, arguments.callee.name);
        return this.getTrackingCategories({ id: id, other: { includeArchived: includeArchived }, where: where, order: order })
            .then(function(trackingCategories) {
                return _.first(trackingCategories);
            })
    },
    getTrackingCategories: function(options) {
        this.trackEvent(entityName, arguments.callee.name);
        var self = this;
        var clonedOptions = _.clone(options || {});
        clonedOptions.entityPath = 'TrackingCategories.TrackingCategory';
        clonedOptions.entityConstructor = function(data) { return self.newTrackingCategory(data) };
        return this.getEntities(clonedOptions);
    },
    deleteTrackingCategory: function(id) {
        this.trackEvent(entityName, arguments.callee.name);
        var options = {
            id: id
        };
        return this.deleteEntities(options);
    }
})

module.exports = TrackingCategories;