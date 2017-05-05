//@ts-check
const common = require(__dirname + "/common/common"),
    mocha = common.mocha

process.on('uncaughtException', (err) => {
    console.log('uncaught', err)
})

describe('testrunner', function() {
    //Accounting (Core) API Tests 
    importTest('token_tests', __dirname + '/core/token_tests.js')
    importTest('organisation_tests', __dirname + '/core/organisation_tests.js')
    importTest('report_tests', __dirname + '/core/report_tests.js')

    //Payroll API Tests 
    importTest('payroll_tests', __dirname + '/payroll/payrolltests.js')
})

function importTest(name, path) {
    describe(name, function() {
        require(path)
    })
}