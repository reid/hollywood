/**
 * Hollywood
 * Copyright 2011 Yahoo! Inc.
 * Provided under the BSD license.
 */

var events = require("eventemitter2");
var util = require("util");

var App = exports.App = function (options) {
    if (!options) {
        options = {};
    }
    this.options = options;

    events.EventEmitter2.call(this, {
        delimiter: ":",
        wildcard: true
    });

    this.plugins = {};
};

util.inherits(App, events.EventEmitter2);

App.prototype.emitPlugError = function (name, error, cb) {
    if (!name) {
        name = "anonymous";
    }
    this.emit(["plugin", name, "error"], error);
    if (cb) {
        cb(error);
    }
};

App.prototype.callPluginMethod = function (name, method, options, cb) {
    var self = this,
        methodError = false;

    function pluginCallback (err) {
        if (err) {
            self.emit(["plugin", name, "error"], err);
        } else {
            self.emit(["plugin", name, method]);
            err = null;
        }

        if (cb) {
            cb(err);
        }
    }

    if (self.plugins.hasOwnProperty(name)) {
        // The methods we call are optional.
        if (self.plugins[name].hasOwnProperty(method)) {
            var args = [pluginCallback];
            if (options) {
                args.unshift(options);
            }
            self.plugins[name][method].apply(self, args);
        } else {
            pluginCallback();
           // methodError = new Error("No such method " + method + " on plugin " + name);
        }
    } else {
        methodError = new Error("No such plugin " + name);
    }

    if (methodError) {
        self.emitPlugError(name, methodError, cb);
    }
};

App.prototype.plug = function (plugin, options, cb) {
    if ("function" === typeof options) {
        cb = options;
        options = {};
    } else if (!options) {
        options = {};
    }

    var self = this,
        name = plugin.name;

    if (!name) {
        self.emitPlugError(name, new Error("Name property required."), cb);
        return;
    }

    if (self.plugins.hasOwnProperty(name)) {
        self.callPluginMethod(name, "destructor");
    }

    self.plugins[name] = plugin;

    if (!self.options.hasOwnProperty(name)) {
        self.options[name] = {};
    }

    Object.keys(options).forEach(function (key) {
        self.options[name][key] = options[key];
    });

    self.callPluginMethod(name, "initializer", self.options[name], cb);
};

App.prototype.unplug = function (name, cb) {
    this.callPluginMethod(name, "destructor", false, cb);

    delete this.plugins[name];
};
