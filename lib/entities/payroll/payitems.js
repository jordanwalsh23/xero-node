var _ = require('lodash'),
  Entity = require('../entity'),
  EarningsRateSchema = require('../shared').EarningsRateSchema,
  DeductionTypeSchema = require('../shared').DeductionTypeSchema,
  ReimbursementTypeSchema = require('../shared').ReimbursementTypeSchema,
  LeaveTypeSchema = require('../shared').LeaveTypeSchema,
  PayItemsSchema = require('../shared').PayItemsSchema;

var PayItems = Entity.extend(PayItemsSchema, {
  constructor: function(application, data, options) {
    this.Entity.apply(this, arguments);
  },
  initialize: function(data, options) {},
  changes: function(options) {
    return this._super(options);
  },
  _toObject: function(options) {
    return this._super(options);
  },
});

var EarningsRate = Entity.extend(EarningsRateSchema, {
  constructor: function(application, data, options) {
    this.Entity.apply(this, arguments);
  },
  initialize: function(data, options) {},
  save: function(options) {
    return saveObj(this, 'EarningsRate', options);
  },
  delete: function(options) {
    return this.save({ delete: true });
  },
});

var DeductionType = Entity.extend(DeductionTypeSchema, {
  constructor: function(application, data, options) {
    this.Entity.apply(this, arguments);
  },
  initialize: function(data, options) {},
  save: function(options) {
    return saveObj(this, 'DeductionType', options);
  },
  delete: function(options) {
    return this.save({ delete: true });
  },
});

var ReimbursementType = Entity.extend(ReimbursementTypeSchema, {
  constructor: function(application, data, options) {
    this.Entity.apply(this, arguments);
  },
  initialize: function(data, options) {},
  save: function(options) {
    return saveObj(this, 'ReimbursementType', options);
  },
  delete: function(options) {
    return this.save({ delete: true });
  },
});

var LeaveType = Entity.extend(LeaveTypeSchema, {
  constructor: function(application, data, options) {
    this.Entity.apply(this, arguments);
  },
  initialize: function(data, options) {},
  save: function(options) {
    return saveObj(this, 'LeaveType', options);
  },
  delete: function(options) {
    return this.save({ delete: true });
  },
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
  options = options || {};
  const payItem = _.omit(obj.toObject());
  const self = obj;
  let json = [];

  var currentID = payItem[objType + 'ID'] || '';

  if (currentID === '') {
    // This is a new earnings rate, so we can add the json now
    json.push(payItem);
  }

  return self.application.payroll.payitems
    [`get${objType}s`]()
    .then(existingPayItems => {
      existingPayItems.forEach(existingPayItem => {
        if (existingPayItem[`${objType}ID`] === currentID) {
          if (options.delete === true) {
            // we need to remove the current object
            existingPayItem = null;
          } else {
            // we're doing an update so merge the current object
            _.merge(existingPayItem, payItem);
          }
        }

        if (existingPayItem) json.push(existingPayItem.toObject());
      });
      return json;
    })
    .catch(err => err);
}

function saveObj(obj, objType, options) {
  const self = obj;
  return fromXmlObj(obj, objType, options).then(json => {
    const payload = {};

    payload[`${objType}s`] = json;

    return self.application.putOrPostEntity(
      'post',
      'PayItems',
      JSON.stringify(payload),
      {
        entityPath: `PayItems.${objType}s`,
        entityConstructor: data =>
          self.application.payroll.payitems[`new${objType}`](data),
        api: 'payroll',
      }
    );
  });
}

module.exports.LeaveType = LeaveType;
module.exports.ReimbursementType = ReimbursementType;
module.exports.DeductionType = DeductionType;
module.exports.EarningsRate = EarningsRate;
module.exports.PayItems = PayItems;
