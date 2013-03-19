
(function() {

    var loaded = (typeof(snap) !== 'undefined');
    if (loaded) return;

    var snap = {

        alias : function(type,name) {
            var dot = name.lastIndexOf('.'),path = name.substring(0,dot);
            snap.Meta.define(type,{name:name,path:path,file:name.substring(dot+1)});
        },

        create : function(prototype) {
            var object = function() {};
            object.prototype = prototype;
            return new object();
        },

        define : function(name,factory) {
            var meta = new snap.Meta(name,factory);
            if (typeof(module) != 'undefined') return this.require(name);
        },

        find : function(name) {
            return snap.Meta.load(name);
        },

        inherit : function(object,base) {

            var type = snap.isString(base)?snap.Meta.load(base):base;
            if (type == null) throw new Error('Cannot find type ' + base);
            for (var name in type) object[name] = type[name];

            var proto = snap.create(type.prototype);
            proto.constructor = object;

            object.superclass = type.prototype;
            object.prototype = proto;

            return object;

        },

        extend : function(target,source,value) {
            target = target || {};
            for (var name in source) {
                var type = typeof(value = source[name]);
                if (type !== 'undefined') target[name] = value;
            }
            return target;
        },

        merge : function(target,source,value) {
            var target = target || {};
            for (var name in source) {
                var type = typeof(value = source[name]);
                if (type == 'object') snap.merge(target[name] || (target[name] = {}),value);
                else if (type !== 'undefined') target[name] = value;
            }
            return target;
        },

        require : function(name) {
            var type = snap.Meta.load(name);
            if (type == null) throw new Error(name.concat(' not found!'));
            return type;
        },

        elem : function(elem) {
            if (typeof(elem) == 'string') return $(document.getElementById(elem.match(/^#?(.*)/)[1]) || elem);
            else return (elem && elem.jquery)?elem:$(elem);
        },

        except : function(except) {
            snap.log('except',except.name,except.message);
        },

        log : function() {
        }

    };

    // Define Snap Meta Object

    snap.Meta = function(name,factory) {

        var dot = name.lastIndexOf('.'),path = name.substring(0,dot);
        this.meta = {name:name,path:path,file:name.substring(dot+1)};

        this.factory(factory);

    };

    snap.extend(snap.Meta,{

        meta : {},
        paths : {},

        types : {},

        paused : {},

        define : function(type,meta) {

            var self = this,name = meta.name,file = meta.file;
            var path = meta.path,dir = self.paths[path];self.meta[name] = meta;
            if (dir && (self.types[name] = type)) return dir[file] = type;

            var root = (typeof(window) != 'undefined')?window:global;
            for (var idx = 0,dirs = path?path.split('.'):[],len = dirs.length,dir = root,key;((idx < len) && (dir[key = dirs[idx]]));idx++) dir = dir[key];
            while (idx < len) dir = dir[key = dirs[idx++]] = {};

            self.paths[path] = dir;
            self.types[name] = dir[file] = type;

            return type;

        },

        pause : function(type,name) {
            (this.paused[type] || (this.paused[type] = {}))[name] = true;
        },

        resume : function(type) {
            for (var name in this.paused[type]) this.load(name);
            delete this.paused[type];
        },

        ready : function(meta,ready) {

            for (var name in meta.requires) {

                var required = meta.requires[name];
                if (typeof(required) === 'function') continue;

                var loaded = this.load(required);
                if (loaded) meta.requires[name] = loaded;
                else this.pause(required,meta.name,ready = false);

            }

            return ready;

        },

        construct : function(name,args) {

            var type = snap.Meta.load(name);
            if (type == null) throw new Error('Cannot find type ' + name);

            var object = snap.create(type.prototype);
            object.constructor.apply(object,args);
            return object;

        },

        load : function(name) {

            var self = this,type = self.types[name],meta;
            if (type && (meta = self.meta[name]).loaded) return type;
            else if (type && self.ready(meta,true)) type = snap.Meta.define(meta.factory(snap),meta);
            else return;

            type.getName = function() { return meta.name; };

            var paused = self.paused[name];
            if (paused) self.resume(name);

            meta.loaded = true;

            return type;

        }

    });

    snap.extend(snap.Meta.prototype,{

        requires : function(requires) {

            var types = (requires instanceof Array)?requires:[requires];

            var self = this;self.meta.requires = self.meta.requires || (self.meta.requires = {});
            for (var idx = 0,type;(type = types[idx]);idx++) self.meta.requires[type] = type;

            return self;

        },

        factory : function(factory) {

            var self = this,meta = self.meta,name = meta.name;meta.factory = factory;
            if (snap.Meta.types[name] != null) return;

            snap.Meta.define(function() { return snap.Meta.construct(name,arguments); },meta);

        }

    });

    // Add Snap Utilities

    snap.extend(snap,{

        // Boolean Utilities

        isNull : function(object) {
            return (object === null);
        },

        isEmpty : function(object) {
            for (var name in object) return false;
            return true;
        },

        isObject : function(object) {
            return (typeof(object) === 'object');
        },

        isFunction : function(object) {
            return (typeof(object) === 'function');
        },

        isBoolean : function(object) {
            return (typeof(object) === 'boolean');
        },

        isNumber : function(object) {
            return (typeof(object) === 'number');
        },

        isString : function(object) {
            return (typeof(object) === 'string');
        },

        isNode : function(object) {
            return ((object != null) && (typeof(object.nodeType) !== 'undefined'));
        },

        isArray : Array.isArray || function(object) {
            return (Object.prototype.toString.call(object) == '[object Array]');
        },

        isDefined : function(object) {
            return (typeof(object) !== 'undefined');
        },

        isUndefined : function(object) {
            return (typeof(object) === 'undefined');
        },

        isClient : function() {
            return (typeof(snap.server) === 'undefined');
        },

        isServer : function() {
            return (typeof(snap.server) !== 'undefined');
        }

    });

    // Add Function Bind Prototype

    var slice = Array.prototype.slice;

    if (!Function.prototype.bind) {
        Function.prototype.bind = function() {
            var self = this,args = slice.call(arguments);
            return function() { return self.call.apply(self,args.concat(slice.call(arguments))); };
        };
    };

    this.snap = snap = snap.extend(function(snap) { return snap; },snap);
    this.define = this.snap.define.bind(this.snap);

    if (typeof(module) !== 'undefined') module.exports = this.snap;

    return this.snap;

}).apply((typeof(global) != 'undefined')?global:window);
