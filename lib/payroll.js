'use strict';

const _ = require('lodash');

const HELPERS = {
  timesheets: { file: 'timesheets' },
  payitems: { file: 'payitems' },
  employees: { file: 'employees' },
};

function Payroll(application) {
  const self = this;

  _.each(HELPERS, (entityHelper, id) => {
    const instance = new(require('./entity_helpers/payroll/' + entityHelper.file))(application);
    Object.defineProperty(self, id, {
      get: () => instance,
    });
  });
}

module.exports = Payroll;
