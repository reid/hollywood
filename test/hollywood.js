/**
 * Hollywood
 * Copyright 2011 Yahoo! Inc.
 * Provided under the BSD license.
 */

var vows = require("vows");
var assert = require("assert");

var hollywood = require("../lib/hollywood");

vows.describe("Hollywood").addBatch({
    "A Hollywood app": {
        topic: function () {
            return new hollywood.App({
                __test_plugged: {
                    foo: true
                },
                __test_plugged2: {
                    quux: true
                }
            });
        },
        "contains the correct properties and methods": function (app) {
            assert.isFunction(app.plug);
            assert.isFunction(app.unplug);
        },
        "and a mock plugin": {
            topic: function () {
                return {
                    name: "__test_plugged",
                    initializer: function (options, done) {
                        assert.ok(options.foo);
                        this.__test_plugged = true;
                        done();
                    },
                    destructor: function (done) {
                        delete this.__test_plugged;
                        done();
                    }
                };
            },
            "when it is added": {
                topic: function (mockPlugin, app) {
                    var vow = this;
                    app.once("plugin:__test_plugged:initializer", function (err) {
                        vow.callback(err, app);
                    });
                    app.plug(mockPlugin, {
                        bar: true
                    });
                },
                "the plugin is available on the application": function (app) {
                    assert.ok(app.__test_plugged);
                },
                "the combined options are availble": function (app) {
                    assert.ok(app.options.__test_plugged.foo);
                    assert.ok(app.options.__test_plugged.bar);
                },
                "then removed": {
                    topic: function (app) {
                        var vow = this;
                        app.once("plugin:__test_plugged:destructor", function (err) {
                            vow.callback(err, app);
                        });
                        app.unplug("__test_plugged");
                    },
                    "the plugin is no longer on the application": function (app) {
                        assert.isUndefined(app.__test_plugged);
                    }
                }
            }
        },
        "and another mock plugin": {
            topic: function () {
                return {
                    name: "__test_plugged2",
                    initializer: function (options, done) {
                        assert.ok(options.quux);
                        this.__test_plugged2 = true;
                        done();
                    },
                    destructor: function (done) {
                        delete this.__test_plugged2;
                        done();
                    }
                };
            },
            "when it is added (callback-on-complete)": {
                topic: function (mockPlugin, app) {
                    var vow = this;
                    app.plug(mockPlugin, function (err) {
                        vow.callback(err, app);
                    });
                },
                "the plugin is available on the application": function (app) {
                    assert.ok(app.__test_plugged2);
                },
                "the options are availble": function (app) {
                    assert.ok(app.options.__test_plugged2.quux);
                },
                "then removed": {
                    topic: function (app) {
                        var vow = this;
                        app.unplug("__test_plugged2", function (err) {
                            vow.callback(err, app);
                        });
                    },
                    "the plugin is no longer on the application": function (app) {
                        assert.isUndefined(app.__test_plugged2);
                    },
                    "when unplugged again": {
                        topic: function (app) {
                            var vow = this;
                            app.unplug("__test_plugged2", function (err) {
                                vow.callback(null, err);
                            });    
                        },
                        "the callback gets an error": function (err) {
                            assert.ok(err instanceof Error, "Error expected.");
                            assert.include(err.message, "No such plugin");
                        }
                    }
                }
            }
        },
        "an anonymous (bad) plugin": {
            topic: function () {
                return {
                    initializer: function (options, done) {
                        done();
                    },
                    destructor: function (done) {
                        done();
                    }
                };
            },
            "when it is added": {
                topic: function (mockPlugin, app) {
                    var vow = this;
                    app.once("plugin:anonymous:error", function (err) {
                        vow.callback(null, err);
                    });
                    app.plug(mockPlugin);
                },
                "the callback gets an error": function (err) {
                    assert.ok(err instanceof Error, "Error expected.");
                    assert.include(err.message, "Name property required");
                }
            },
            "when it is added (callback-on-complete)": {
                topic: function (mockPlugin, app) {
                    var vow = this;
                    app.plug(mockPlugin, function (err) {
                        vow.callback(null, err);
                    });
                },
                "the callback gets an error": function (err) {
                    assert.ok(err instanceof Error, "Error expected.");
                    assert.include(err.message, "Name property required");
                }
            }
        }
    }
}).export(module);
