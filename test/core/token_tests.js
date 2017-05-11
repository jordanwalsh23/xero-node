const common = require("../common/common"),
    mocha = common.mocha,
    chai = common.mocha,
    should = common.should,
    expect = common.expect,
    sinon = common.sinon,
    config = common.config,
    xero = common.xero,
    Browser = common.Browser,
    wrapError = common.wrapError

let currentApp = common.currentApp
let eventReceiver = currentApp.eventEmitter

describe('get access for public or partner application', function() {
    beforeEach(function() {
        if (config.APPTYPE === "PRIVATE") {
            this.skip();
        }
    });

    describe('Get tokens', function() {
        var authoriseUrl = "";
        var requestToken = "";
        var requestSecret = "";
        var verifier = "";

        var accessToken = "";
        var accessSecret = "";

        //This function is used by the event emitter to receive the event when the token
        //is automatically refreshed.  We use the 'spy' function so that we can include 
        //some checks within the tests.
        var spy = sinon.spy(function() {
            console.log("Event Received. Creating new Partner App");

            //Create a new application object when we receive new tokens
            currentApp = new xero.PartnerApplication(config);
            currentApp.setOptions(arguments[0]);
            //Reset the event receiver so the listener stack is shared correctly.
            eventReceiver = currentApp.eventEmitter;
            eventReceiver.on('xeroTokenUpdate', function(data) { console.log("Event Received: ", data); });

            console.log("Partner app recreated");
        });

        it('adds the event listener', function(done) {
            eventReceiver.on('xeroTokenUpdate', spy);
            done();
        });

        it('user gets a token and builds the url', function() {
            return currentApp.getRequestToken()
                .then(function(res) {
                    requestToken = res.token;
                    requestSecret = res.secret;
                    authoriseUrl = currentApp.buildAuthorizeUrl(requestToken);
                    console.log("URL: " + authoriseUrl);
                    console.log("token: " + requestToken);
                    console.log("secret: " + requestSecret);
                });
        });

        describe('gets the request token from the url', function() {
            var user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7';
            const browser = new Browser({
                userAgent: user_agent,
                waitFor: 20000,
                runScripts: false
            });

            browser.debug();

            before(function(done) {
                if (config.APPTYPE === "PRIVATE") {
                    this.skip();
                }

                browser.visit(authoriseUrl, done);
            });

            describe('submits form', function() {
                var options = {
                    XeroUsername: config.xeroUsername,
                    XeroPassword: config.xeroPassword
                };

                it('should login', function(done) {
                    browser
                        .fill('userName', options.XeroUsername)
                        .fill('password', options.XeroPassword)
                        .pressButton('Login', done);
                });

                it('should be successful', function(done) {
                    browser.assert.success();
                    done();
                });

                it('should see noscript page', function(done) {
                    console.log(browser.dump());

                    browser.assert.text('title', 'Working...');
                    browser.document.forms[0].submit();
                    browser.wait().then(function() {
                        // just dump some debug data to see if we're on the right page
                        //console.log(browser.dump());
                        done();
                    });

                });

                it('should see application auth page', function(done) {
                    //console.log(browser.document.documentElement.innerHTML);
                    browser.assert.text('title', 'Xero | Authorise Application');

                    if (config.APPTYPE === "PUBLIC") {
                        browser.pressButton("Allow access for 30 mins");
                    } else {
                        //It must be a partner app
                        browser.pressButton("Allow access");
                    }

                    browser.wait().then(function() {
                        // just dump some debug data to see if we're on the right page
                        //console.log(browser.document.documentElement.innerHTML);
                        done();
                    });
                });

                it('should get a code to enter', function(done) {
                    browser.assert.text('title', 'Xero | Authorise Application');
                    verifier = browser.field('#pin-input').value;

                    expect(verifier).to.not.equal("");
                    expect(verifier).to.be.a('String');
                    done();
                });

            });
        });

        describe('swaps the request token for an access token', function() {
            it('calls the access token method and sets the options', function(done) {
                currentApp.setAccessToken(requestToken, requestSecret, verifier)
                    .then(function() {
                        expect(currentApp.options.accessToken).to.not.equal(undefined);
                        expect(currentApp.options.accessToken).to.not.equal("");
                        expect(currentApp.options.accessSecret).to.not.equal(undefined);
                        expect(currentApp.options.accessSecret).to.not.equal("");

                        if (config.APPTYPE === "PARTNER") {
                            expect(currentApp.options.sessionHandle).to.not.equal(undefined);
                            expect(currentApp.options.sessionHandle).to.not.equal("");
                        }

                        done();
                    }).catch(function(err) {
                        done(wrapError(err));
                    });
            });

            it('refreshes the token', function(done) {
                if (config.APPTYPE !== "PARTNER") {
                    this.skip();
                }

                //Only supported for Partner integrations
                currentApp.refreshAccessToken()
                    .then(function() {
                        expect(currentApp.options.accessToken).to.not.equal(undefined);
                        expect(currentApp.options.accessToken).to.not.equal("");
                        expect(currentApp.options.accessSecret).to.not.equal(undefined);
                        expect(currentApp.options.accessSecret).to.not.equal("");
                        expect(currentApp.options.sessionHandle).to.not.equal(undefined);
                        expect(currentApp.options.sessionHandle).to.not.equal("");

                        expect(spy.called).to.equal(true);
                        done();
                    }).catch(function(err) {
                        done(wrapError(err));
                    });
            });
        });
    });
});