
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
            if (typeof(module) != 'undefined') this.require(name);
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

/*
    http://www.JSON.org/json2.js
    2011-02-23

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

(function() {
	var tags = 'abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video'.split('|');
	for (var idx = 0,len = tags.length;(idx < len);idx++) document.createElement(tags[idx]);
}());

/*!
 * jQuery JavaScript Library v1.7.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Nov 21 21:11:03 2011 -0500
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
	navigator = window.navigator,
	location = window.location;
var jQuery = (function() {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	trimLeft = /^\s+/,
	trimRight = /\s+$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	// Useragent RegExp
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	rmsie = /(msie) ([\w.]+)/,
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Matches dashed string for camelizing
	rdashAlpha = /-([a-z]|[0-9])/ig,
	rmsPrefix = /^-ms-/,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,

	// The deferred used on DOM ready
	readyList,

	// The ready event handler
	DOMContentLoaded,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf,

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context && document.body ) {
			this.context = document;
			this[0] = document.body;
			this.selector = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = quickExpr.exec( selector );
			}

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context ? context.ownerDocument || context : document );

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector );

					if ( ret ) {
						if ( jQuery.isPlainObject( context ) ) {
							selector = [ document.createElement( ret[1] ) ];
							jQuery.fn.attr.call( selector, context, true );

						} else {
							selector = [ doc.createElement( ret[1] ) ];
						}

					} else {
						ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
						selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
					}

					return jQuery.merge( this, selector );

				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.7.1",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
		var ret = this.constructor();

		if ( jQuery.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Attach the listeners
		jQuery.bindReady();

		// Add the callback
		readyList.add( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {
		// Either a released hold or an DOMready/load event and not yet ready
		if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.fireWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.trigger ) {
				jQuery( document ).trigger( "ready" ).off( "ready" );
			}
		}
	},

	bindReady: function() {
		if ( readyList ) {
			return;
		}

		readyList = jQuery.Callbacks( "once memory" );

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction( object );

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type( array );

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
				push.call( ret, array );
			} else {
				jQuery.merge( ret, array );
			}
		}

		return ret;
	},

	inArray: function( elem, array, i ) {
		var len;

		if ( array ) {
			if ( indexOf ) {
				return indexOf.call( array, elem, i );
			}

			len = array.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in array && array[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		if ( typeof context === "string" ) {
			var tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		var args = slice.call( arguments, 2 ),
			proxy = function() {
				return fn.apply( context, args.concat( slice.call( arguments ) ) );
			};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, key, value, exec, fn, pass ) {
		var length = elems.length;

		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jQuery.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	},

	now: function() {
		return ( new Date() ).getTime();
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	sub: function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	},

	browser: {}
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true;
	jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( jQuery.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

return jQuery;

})();


// String to Object flags format cache
var flagsCache = {};

// Convert String-formatted flags into Object-formatted ones and store in cache
function createFlags( flags ) {
	var object = flagsCache[ flags ] = {},
		i, length;
	flags = flags.split( /\s+/ );
	for ( i = 0, length = flags.length; i < length; i++ ) {
		object[ flags[i] ] = true;
	}
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	flags:	an optional list of space-separated flags that will change how
 *			the callback list behaves
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible flags:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( flags ) {

	// Convert flags from String-formatted to Object-formatted
	// (we check in cache first)
	flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};

	var // Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = [],
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Add one or several callbacks to the list
		add = function( args ) {
			var i,
				length,
				elem,
				type,
				actual;
			for ( i = 0, length = args.length; i < length; i++ ) {
				elem = args[ i ];
				type = jQuery.type( elem );
				if ( type === "array" ) {
					// Inspect recursively
					add( elem );
				} else if ( type === "function" ) {
					// Add if not in unique mode and callback is not in
					if ( !flags.unique || !self.has( elem ) ) {
						list.push( elem );
					}
				}
			}
		},
		// Fire callbacks
		fire = function( context, args ) {
			args = args || [];
			memory = !flags.memory || [ context, args ];
			firing = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse ) {
					memory = true; // Mark as halted
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( !flags.once ) {
					if ( stack && stack.length ) {
						memory = stack.shift();
						self.fireWith( memory[ 0 ], memory[ 1 ] );
					}
				} else if ( memory === true ) {
					self.disable();
				} else {
					list = [];
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					var length = list.length;
					add( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away, unless previous
					// firing was halted (stopOnFalse)
					} else if ( memory && memory !== true ) {
						firingStart = length;
						fire( memory[ 0 ], memory[ 1 ] );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					var args = arguments,
						argIndex = 0,
						argLength = args.length;
					for ( ; argIndex < argLength ; argIndex++ ) {
						for ( var i = 0; i < list.length; i++ ) {
							if ( args[ argIndex ] === list[ i ] ) {
								// Handle firingIndex and firingLength
								if ( firing ) {
									if ( i <= firingLength ) {
										firingLength--;
										if ( i <= firingIndex ) {
											firingIndex--;
										}
									}
								}
								// Remove the element
								list.splice( i--, 1 );
								// If we have some unicity property then
								// we only need to do this once
								if ( flags.unique ) {
									break;
								}
							}
						}
					}
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				if ( list ) {
					var i = 0,
						length = list.length;
					for ( ; i < length; i++ ) {
						if ( fn === list[ i ] ) {
							return true;
						}
					}
				}
				return false;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory || memory === true ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( stack ) {
					if ( firing ) {
						if ( !flags.once ) {
							stack.push( [ context, args ] );
						}
					} else if ( !( flags.once && memory ) ) {
						fire( context, args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!memory;
			}
		};

	return self;
};




var // Static reference to slice
	sliceDeferred = [].slice;

jQuery.extend({

	Deferred: function( func ) {
		var doneList = jQuery.Callbacks( "once memory" ),
			failList = jQuery.Callbacks( "once memory" ),
			progressList = jQuery.Callbacks( "memory" ),
			state = "pending",
			lists = {
				resolve: doneList,
				reject: failList,
				notify: progressList
			},
			promise = {
				done: doneList.add,
				fail: failList.add,
				progress: progressList.add,

				state: function() {
					return state;
				},

				// Deprecated
				isResolved: doneList.fired,
				isRejected: failList.fired,

				then: function( doneCallbacks, failCallbacks, progressCallbacks ) {
					deferred.done( doneCallbacks ).fail( failCallbacks ).progress( progressCallbacks );
					return this;
				},
				always: function() {
					deferred.done.apply( deferred, arguments ).fail.apply( deferred, arguments );
					return this;
				},
				pipe: function( fnDone, fnFail, fnProgress ) {
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( {
							done: [ fnDone, "resolve" ],
							fail: [ fnFail, "reject" ],
							progress: [ fnProgress, "notify" ]
						}, function( handler, data ) {
							var fn = data[ 0 ],
								action = data[ 1 ],
								returned;
							if ( jQuery.isFunction( fn ) ) {
								deferred[ handler ](function() {
									returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise().then( newDefer.resolve, newDefer.reject, newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								});
							} else {
								deferred[ handler ]( newDefer[ action ] );
							}
						});
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					if ( obj == null ) {
						obj = promise;
					} else {
						for ( var key in promise ) {
							obj[ key ] = promise[ key ];
						}
					}
					return obj;
				}
			},
			deferred = promise.promise({}),
			key;

		for ( key in lists ) {
			deferred[ key ] = lists[ key ].fire;
			deferred[ key + "With" ] = lists[ key ].fireWith;
		}

		// Handle state
		deferred.done( function() {
			state = "resolved";
		}, failList.disable, progressList.lock ).fail( function() {
			state = "rejected";
		}, doneList.disable, progressList.lock );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( firstParam ) {
		var args = sliceDeferred.call( arguments, 0 ),
			i = 0,
			length = args.length,
			pValues = new Array( length ),
			count = length,
			pCount = length,
			deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
				firstParam :
				jQuery.Deferred(),
			promise = deferred.promise();
		function resolveFunc( i ) {
			return function( value ) {
				args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				if ( !( --count ) ) {
					deferred.resolveWith( deferred, args );
				}
			};
		}
		function progressFunc( i ) {
			return function( value ) {
				pValues[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				deferred.notifyWith( promise, pValues );
			};
		}
		if ( length > 1 ) {
			for ( ; i < length; i++ ) {
				if ( args[ i ] && args[ i ].promise && jQuery.isFunction( args[ i ].promise ) ) {
					args[ i ].promise().then( resolveFunc(i), deferred.reject, progressFunc(i) );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( deferred, args );
			}
		} else if ( deferred !== firstParam ) {
			deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
		}
		return promise;
	}
});




jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		marginDiv,
		fragment,
		tds,
		events,
		eventName,
		i,
		isSupported,
		div = document.createElement( "div" ),
		documentElement = document.documentElement;

	// Preliminary tests
	div.setAttribute("className", "t");
	div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

	all = div.getElementsByTagName( "*" );
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName( "input" )[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form(#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent( "onclick" );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute("type", "radio");
	support.radioValue = input.value === "t";

	input.setAttribute("checked", "checked");
	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	div.innerHTML = "";

	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. For more
	// info see bug #3333
	// Fails in WebKit before Feb 2011 nightlies
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	if ( window.getComputedStyle ) {
		marginDiv = document.createElement( "div" );
		marginDiv.style.width = "0";
		marginDiv.style.marginRight = "0";
		div.style.width = "2px";
		div.appendChild( marginDiv );
		support.reliableMarginRight =
			( parseInt( ( window.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
	}

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for( i in {
			submit: 1,
			change: 1,
			focusin: 1
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	fragment.removeChild( div );

	// Null elements to avoid leaks in IE
	fragment = select = opt = marginDiv = div = input = null;

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, outer, inner, table, td, offsetSupport,
			conMarginTop, ptlm, vb, style, html,
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		conMarginTop = 1;
		ptlm = "position:absolute;top:0;left:0;width:1px;height:1px;margin:0;";
		vb = "visibility:hidden;border:0;";
		style = "style='" + ptlm + "border:5px solid #000;padding:0;'";
		html = "<div " + style + "><div></div></div>" +
			"<table " + style + " cellpadding='0' cellspacing='0'>" +
			"<tr><td></td></tr></table>";

		container = document.createElement("div");
		container.style.cssText = vb + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName( "td" );
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Figure out if the W3C box model works as expected
		div.innerHTML = "";
		div.style.width = div.style.paddingLeft = "1px";
		jQuery.boxModel = support.boxModel = div.offsetWidth === 2;

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.style.display = "inline";
			div.style.zoom = 1;
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "";
			div.innerHTML = "<div style='width:4px;'></div>";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
		}

		div.style.cssText = ptlm + vb;
		div.innerHTML = html;

		outer = div.firstChild;
		inner = outer.firstChild;
		td = outer.nextSibling.firstChild.firstChild;

		offsetSupport = {
			doesNotAddBorder: ( inner.offsetTop !== 5 ),
			doesAddBorderForTableAndCells: ( td.offsetTop === 5 )
		};

		inner.style.position = "fixed";
		inner.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		offsetSupport.fixedPosition = ( inner.offsetTop === 20 || inner.offsetTop === 15 );
		inner.style.position = inner.style.top = "";

		outer.style.overflow = "hidden";
		outer.style.position = "relative";

		offsetSupport.subtractsBorderForOverflowNotVisible = ( inner.offsetTop === -5 );
		offsetSupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== conMarginTop );

		body.removeChild( container );
		div  = container = null;

		jQuery.extend( support, offsetSupport );
	});

	return support;
})();




var rbrace = /^(?:\{.*\}|\[.*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var privateCache, thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey,
			isEvents = name === "events";

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ internalKey ] = id = ++jQuery.uuid;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// Avoids exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		privateCache = thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// Users should not attempt to inspect the internal events object using jQuery.data,
		// it is undocumented and subject to change. But does anyone listen? No.
		if ( isEvents && !thisCache[ name ] ) {
			return privateCache.events;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			// Reference to internal data cache key
			internalKey = jQuery.expando,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,

			// See jQuery.data for more information
			id = isNode ? elem[ internalKey ] : internalKey;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !jQuery.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split( " " );
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

		// Browsers that fail expando deletion also refuse to delete expandos on
		// the window, but it will allow it on all other JS objects; other browsers
		// don't care
		// Ensure that `cache` is not a window object #10080
		if ( jQuery.support.deleteExpando || !cache.setInterval ) {
			delete cache[ id ];
		} else {
			cache[ id ] = null;
		}

		// We destroyed the cache and need to eliminate the expando on the node to avoid
		// false lookups in the cache for entries that no longer exist
		if ( isNode ) {
			// IE does not allow us to delete expando properties from nodes,
			// nor does it have a removeAttribute function on Document nodes;
			// we must handle all of these cases
			if ( jQuery.support.deleteExpando ) {
				delete elem[ internalKey ];
			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( internalKey );
			} else {
				elem[ internalKey ] = null;
			}
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		if ( elem.nodeName ) {
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
				return !(match === true || elem.getAttribute("classid") !== match);
			}
		}

		return true;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, attr, name,
			data = null;

		if ( typeof key === "undefined" ) {
			if ( this.length ) {
				data = jQuery.data( this[0] );

				if ( this[0].nodeType === 1 && !jQuery._data( this[0], "parsedAttrs" ) ) {
					attr = this[0].attributes;
					for ( var i = 0, l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( this[0], name, data[ name ] );
						}
					}
					jQuery._data( this[0], "parsedAttrs", true );
				}
			}

			return data;

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
			if ( data === undefined && this.length ) {
				data = jQuery.data( this[0], key );
				data = dataAttr( this[0], key, data );
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
			return this.each(function() {
				var self = jQuery( this ),
					args = [ parts[0], value ];

				self.triggerHandler( "setData" + parts[1] + "!", args );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				jQuery.isNumeric( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}




function handleQueueMarkDefer( elem, type, src ) {
	var deferDataKey = type + "defer",
		queueDataKey = type + "queue",
		markDataKey = type + "mark",
		defer = jQuery._data( elem, deferDataKey );
	if ( defer &&
		( src === "queue" || !jQuery._data(elem, queueDataKey) ) &&
		( src === "mark" || !jQuery._data(elem, markDataKey) ) ) {
		// Give room for hard-coded callbacks to fire first
		// and eventually mark/queue something else on the element
		setTimeout( function() {
			if ( !jQuery._data( elem, queueDataKey ) &&
				!jQuery._data( elem, markDataKey ) ) {
				jQuery.removeData( elem, deferDataKey, true );
				defer.fire();
			}
		}, 0 );
	}
}

jQuery.extend({

	_mark: function( elem, type ) {
		if ( elem ) {
			type = ( type || "fx" ) + "mark";
			jQuery._data( elem, type, (jQuery._data( elem, type ) || 0) + 1 );
		}
	},

	_unmark: function( force, elem, type ) {
		if ( force !== true ) {
			type = elem;
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";
			var key = type + "mark",
				count = force ? 0 : ( (jQuery._data( elem, key ) || 1) - 1 );
			if ( count ) {
				jQuery._data( elem, key, count );
			} else {
				jQuery.removeData( elem, key, true );
				handleQueueMarkDefer( elem, type, "mark" );
			}
		}
	},

	queue: function( elem, type, data ) {
		var q;
		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			q = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !q || jQuery.isArray(data) ) {
					q = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					q.push( data );
				}
			}
			return q || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			fn = queue.shift(),
			hooks = {};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			jQuery._data( elem, type + ".run", hooks );
			fn.call( elem, function() {
				jQuery.dequeue( elem, type );
			}, hooks );
		}

		if ( !queue.length ) {
			jQuery.removeData( elem, type + "queue " + type + ".run", true );
			handleQueueMarkDefer( elem, type, "queue" );
		}
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
		}

		if ( data === undefined ) {
			return jQuery.queue( this[0], type );
		}
		return this.each(function() {
			var queue = jQuery.queue( this, type, data );

			if ( type === "fx" && queue[0] !== "inprogress" ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, object ) {
		if ( typeof type !== "string" ) {
			object = type;
			type = undefined;
		}
		type = type || "fx";
		var defer = jQuery.Deferred(),
			elements = this,
			i = elements.length,
			count = 1,
			deferDataKey = type + "defer",
			queueDataKey = type + "queue",
			markDataKey = type + "mark",
			tmp;
		function resolve() {
			if ( !( --count ) ) {
				defer.resolveWith( elements, [ elements ] );
			}
		}
		while( i-- ) {
			if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
					( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
						jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
					jQuery.data( elements[ i ], deferDataKey, jQuery.Callbacks( "once memory" ), true ) )) {
				count++;
				tmp.add( resolve );
			}
		}
		resolve();
		return defer.promise();
	}
});




var rclass = /[\n\t\r]/g,
	rspace = /\s+/,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea)?$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	nodeHook, boolHook, fixSpecified;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.attr );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.prop );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classNames, i, l, elem, className, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) {
			classNames = ( value || "" ).split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 && elem.className ) {
					if ( value ) {
						className = (" " + elem.className + " ").replace( rclass, " " );
						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							className = className.replace(" " + classNames[ c ] + " ", " ");
						}
						elem.className = jQuery.trim( className );

					} else {
						elem.className = "";
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space seperated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var self = jQuery(this), val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, i, max, option,
					index = elem.selectedIndex,
					values = [],
					options = elem.options,
					one = elem.type === "select-one";

				// Nothing was selected
				if ( index < 0 ) {
					return null;
				}

				// Loop through all the selected options
				i = one ? index : 0;
				max = one ? index + 1 : options.length;
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Don't return options that are disabled or in a disabled optgroup
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
				if ( one && !values.length && options.length ) {
					return jQuery( options[ index ] ).val();
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},

	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( pass && name in jQuery.attrFn ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, "" + value );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, l,
			i = 0;

		if ( value && elem.nodeType === 1 ) {
			attrNames = value.toLowerCase().split( rspace );
			l = attrNames.length;

			for ( ; i < l; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;

					// See #9699 for explanation of this approach (setting first, then removal)
					jQuery.attr( elem, name, "" );
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( rboolean.test( name ) && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
				ret.nodeValue :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.nodeValue = value + "" );
		}
	};

	// Apply the nodeHook to tabindex
	jQuery.attrHooks.tabindex.set = nodeHook.set;

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = "" + value );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});




var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
	rhoverHack = /\bhover(\.\S+)?\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
	quickParse = function( selector ) {
		var quick = rquickIs.exec( selector );
		if ( quick ) {
			//   0  1    2   3
			// [ _, tag, id, class ]
			quick[1] = ( quick[1] || "" ).toLowerCase();
			quick[3] = quick[3] && new RegExp( "(?:^|\\s)" + quick[3] + "(?:\\s|$)" );
		}
		return quick;
	},
	quickIs = function( elem, m ) {
		var attrs = elem.attributes || {};
		return (
			(!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
			(!m[2] || (attrs.id || {}).value === m[2]) &&
			(!m[3] || m[3].test( (attrs[ "class" ] || {}).value ))
		);
	},
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, quick, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {

			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				quick: quickParse( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
			t, tns, type, origType, namespaces, origCount,
			j, events, special, handle, eventType, handleObj;

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			handle = elemData.handle;
			if ( handle ) {
				handle.elem = null;
			}

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, [ "events", "handle" ], true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}

		// Event object or event type
		var type = event.type || event,
			namespaces = [],
			cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

		// Handle a global trigger
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]];
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			old = null;
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( old && old === elem.ownerDocument ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Note that this is a bare JS function and not a jQuery handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				// IE<9 dies on focus/blur to hidden element (#1486)
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event || window.event );

		var handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = [].slice.call( arguments, 0 ),
			run_all = !event.exclusive && !event.namespace,
			handlerQueue = [],
			i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Determine handlers that should run if there are delegated events
		// Avoid disabled elements in IE (#6911) and non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !event.target.disabled && !(event.button && event.type === "click") ) {

			// Pregenerate a single jQuery object for reuse with .is()
			jqcur = jQuery(this);
			jqcur.context = this.ownerDocument || this;

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {
				selMatch = {};
				matches = [];
				jqcur[0] = cur;
				for ( i = 0; i < delegateCount; i++ ) {
					handleObj = handlers[ i ];
					sel = handleObj.selector;

					if ( selMatch[ sel ] === undefined ) {
						selMatch[ sel ] = (
							handleObj.quick ? quickIs( cur, handleObj.quick ) : jqcur.is( sel )
						);
					}
					if ( selMatch[ sel ] ) {
						matches.push( handleObj );
					}
				}
				if ( matches.length ) {
					handlerQueue.push({ elem: cur, matches: matches });
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

					event.data = handleObj.data;
					event.handleObj = handleObj;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		return event.result;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = jQuery.Event( originalEvent );

		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Target should not be a text node (#504, Safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8)
		if ( event.metaKey === undefined ) {
			event.metaKey = event.ctrlKey;
		}

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		ready: {
			// Make sure the ready event is setup
			setup: jQuery.bindReady
		},

		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector,
				ret;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !form._submit_attached ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						// If form was submitted by the user, bubble the event up the tree
						if ( this.parentNode && !event.isTrigger ) {
							jQuery.event.simulate( "submit", this.parentNode, event, true );
						}
					});
					form._submit_attached = true;
				}
			});
			// return undefined since we don't need an event listener
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
							jQuery.event.simulate( "change", this, event, true );
						}
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !elem._change_attached ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					elem._change_attached = true;
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on.call( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			var handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace? handleObj.type + "." + handleObj.namespace : handleObj.type,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( var type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector, fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});



/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	expando = "sizcache" + (Math.random() + '').replace('.', ''),
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rReturn = /\r\n/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context, seed );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set, seed );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set, i, len, match, type, left;

	if ( !expr ) {
		return [];
	}

	for ( i = 0, len = Expr.order.length; i < len; i++ ) {
		type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		type, found, item, filter, left,
		i, pass,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				filter = Expr.filter[ type ];
				left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							pass = not ^ found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Utility function for retreiving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
var getText = Sizzle.getText = function( elem ) {
    var i, node,
		nodeType = elem.nodeType,
		ret = "";

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 ) {
			// Use textContent || innerText for elements
			if ( typeof elem.textContent === 'string' ) {
				return elem.textContent;
			} else if ( typeof elem.innerText === 'string' ) {
				// Replace IE's carriage returns
				return elem.innerText.replace( rReturn, '' );
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
	} else {

		// If no nodeType, this is expected to be an array
		for ( i = 0; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			if ( node.nodeType !== 8 ) {
				ret += getText( node );
			}
		}
	}
	return ret;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var first, last,
				doneName, parent, cache,
				count, diff,
				type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					first = match[2];
					last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					doneName = match[0];
					parent = elem.parentNode;
	
					if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
						count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent[ expando ] = doneName;
					}
					
					diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Sizzle.attr ?
					Sizzle.attr( elem, name ) :
					Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				!type && Sizzle.attr ?
				result != null :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem[ expando ] = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem[ expando ] = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context, seed ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet, seed );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
Sizzle.selectors.attrMap = {};
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})();


var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jQuery.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var self = this,
			i, l;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		var ret = this.pushStack( "", "find", selector ),
			length, n, r;

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jQuery( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && ( 
			typeof selector === "string" ?
				// If this is a positional selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				POS.test( selector ) ? 
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var ret = [], i, l, cur = this[0];
		
		// Array (deprecated as of jQuery 1.7)
		if ( jQuery.isArray( selectors ) ) {
			var level = 1;

			while ( cur && cur.ownerDocument && cur !== context ) {
				for ( i = 0; i < selectors.length; i++ ) {

					if ( jQuery( cur ).is( selectors[ i ] ) ) {
						ret.push({ selector: selectors[ i ], elem: cur, level: level });
					}
				}

				cur = cur.parentNode;
				level++;
			}

			return ret;
		}

		// String
		var pos = POS.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}




function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")", "i"),
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( text ) {
		if ( jQuery.isFunction(text) ) {
			return this.each(function(i) {
				var self = jQuery( this );

				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( typeof text !== "object" && text !== undefined ) {
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
		}

		return jQuery.text( this );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		} else if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			set.push.apply( set, this.toArray() );
			return this.pushStack( set, "before", arguments );
		}
	},

	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {
			var set = this.pushStack( this, "after", arguments );
			set.push.apply( set, jQuery.clean(arguments) );
			return set;
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		if ( value === undefined ) {
			return this[0] && this[0].nodeType === 1 ?
				this[0].innerHTML.replace(rinlinejQuery, "") :
				null;

		// See if we can take a shortcut and just use innerHTML
		} else if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
			(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
			!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

			value = value.replace(rxhtmlTag, "<$1></$2>");

			try {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					// Remove element nodes and prevent memory leaks
					if ( this[i].nodeType === 1 ) {
						jQuery.cleanData( this[i].getElementsByTagName("*") );
						this[i].innerHTML = value;
					}
				}

			// If using innerHTML throws an exception, use the fallback method
			} catch(e) {
				this.empty().append( value );
			}

		} else if ( jQuery.isFunction( value ) ) {
			this.each(function(i){
				var self = jQuery( this );

				self.html( value.call(this, i, self.html()) );
			});

		} else {
			this.empty().append( value );
		}

		return this;
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		} else {
			return this.length ?
				this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
				this;
		}
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {
		var results, first, fragment, parent,
			value = args[0],
			scripts = [];

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback, true );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call(this, i, table ? self.html() : undefined);
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			parent = value && value.parentNode;

			// If we're in a fragment, just use that instead of building a new one
			if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
				results = { fragment: parent };

			} else {
				results = jQuery.buildFragment( args, this, scripts );
			}

			fragment = results.fragment;

			if ( fragment.childNodes.length === 1 ) {
				first = fragment = fragment.firstChild;
			} else {
				first = fragment.firstChild;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
					callback.call(
						table ?
							root(this[i], first) :
							this[i],
						// Make sure that we do not leak memory by inadvertently discarding
						// the original fragment (which might have attached data) instead of
						// using it; in addition, use the original fragment object for the last
						// item instead of first because it can end up being emptied incorrectly
						// in certain situations (Bug #8070).
						// Fragments from the fragment cache must always be cloned and never used
						// in place.
						results.cacheable || ( l > 1 && i < lastIndex ) ?
							jQuery.clone( fragment, true, true ) :
							fragment
					);
				}
			}

			if ( scripts.length ) {
				jQuery.each( scripts, evalScript );
			}
		}

		return this;
	}
});

function root( elem, cur ) {
	return jQuery.nodeName(elem, "table") ?
		(elem.getElementsByTagName("tbody")[0] ||
		elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
		elem;
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 fail to clone children inside object elements that use
	// the proprietary classid attribute value (rather than the type
	// attribute) to identify the type of content to display
	if ( nodeName === "object" ) {
		dest.outerHTML = src.outerHTML;

	} else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set
		if ( src.checked ) {
			dest.defaultChecked = dest.checked = src.checked;
		}

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, nodes, scripts ) {
	var fragment, cacheable, cacheresults, doc,
	first = args[ 0 ];

	// nodes may contain either an explicit document object,
	// a jQuery collection or context object.
	// If nodes[0] contains a valid object to assign to doc
	if ( nodes && nodes[0] ) {
		doc = nodes[0].ownerDocument || nodes[0];
	}

	// Ensure that an attr object doesn't incorrectly stand in as a document object
	// Chrome and Firefox seem to allow this to occur and will throw exception
	// Fixes #8950
	if ( !doc.createDocumentFragment ) {
		doc = document;
	}

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
		first.charAt(0) === "<" && !rnocache.test( first ) &&
		(jQuery.support.checkClone || !rchecked.test( first )) &&
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

		cacheable = true;

		cacheresults = jQuery.fragments[ first ];
		if ( cacheresults && cacheresults !== 1 ) {
			fragment = cacheresults;
		}
	}

	if ( !fragment ) {
		fragment = doc.createDocumentFragment();
		jQuery.clean( args, doc, fragment, scripts );
	}

	if ( cacheable ) {
		jQuery.fragments[ first ] = cacheresults ? fragment : 1;
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var ret = [],
			insert = jQuery( selector ),
			parent = this.length === 1 && this[0].parentNode;

		if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
			insert[ original ]( this[0] );
			return this;

		} else {
			for ( var i = 0, l = insert.length; i < l; i++ ) {
				var elems = ( i > 0 ? this.clone(true) : this ).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( elem.type === "checkbox" || elem.type === "radio" ) {
		elem.defaultChecked = elem.checked;
	}
}
// Finds all inputs and passes them to fixDefaultChecked
function findInputs( elem ) {
	var nodeName = ( elem.nodeName || "" ).toLowerCase();
	if ( nodeName === "input" ) {
		fixDefaultChecked( elem );
	// Skip scripts, get other children
	} else if ( nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined" ) {
		jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
	}
}

// Derived From: http://www.iecss.com/shimprove/javascript/shimprove.1-0-1.js
function shimCloneNode( elem ) {
	var div = document.createElement( "div" );
	safeFragment.appendChild( div );

	div.innerHTML = elem.outerHTML;
	return div.firstChild;
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,
			destElements,
			i,
			// IE<=8 does not properly clone detached, unknown element nodes
			clone = jQuery.support.html5Clone || !rnoshimcache.test( "<" + elem.nodeName ) ?
				elem.cloneNode( true ) :
				shimCloneNode( elem );

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var checkScriptType;

		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
		}

		var ret = [], j;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Trim whitespace, otherwise indexOf won't work as expected
					var tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase(),
						wrap = wrapMap[ tag ] || wrapMap._default,
						depth = wrap[0],
						div = context.createElement("div");

					// Append wrapper element to unknown element safe doc fragment
					if ( context === document ) {
						// Use the fragment we've already created for this document
						safeFragment.appendChild( div );
					} else {
						// Use a fragment created with the owner document
						createSafeFragment( context ).appendChild( div );
					}

					// Go to html and back, then peel off extra wrappers
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						var hasBody = rtbody.test(elem),
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;
				}
			}

			// Resets defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
			var len;
			if ( !jQuery.support.appendChecked ) {
				if ( elem[0] && typeof (len = elem.length) === "number" ) {
					for ( j = 0; j < len; j++ ) {
						findInputs( elem[j] );
					}
				} else {
					findInputs( elem );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				ret = jQuery.merge( ret, elem );
			}
		}

		if ( fragment ) {
			checkScriptType = function( elem ) {
				return !elem.type || rscriptType.test( elem.type );
			};
			for ( i = 0; ret[i]; i++ ) {
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

				} else {
					if ( ret[i].nodeType === 1 ) {
						var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
					}
					fragment.appendChild( ret[i] );
				}
			}
		}

		return ret;
	},

	cleanData: function( elems ) {
		var data, id,
			cache = jQuery.cache,
			special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				continue;
			}

			id = elem[ jQuery.expando ];

			if ( id ) {
				data = cache[ id ];

				if ( data && data.events ) {
					for ( var type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}

					// Null the DOM reference to avoid IE6/7/8 leak (#7054)
					if ( data.handle ) {
						data.handle.elem = null;
					}
				}

				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}

				delete cache[ id ];
			}
		}
	}
});

function evalScript( i, elem ) {
	if ( elem.src ) {
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});
	} else {
		jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "/*$0*/" ) );
	}

	if ( elem.parentNode ) {
		elem.parentNode.removeChild( elem );
	}
}




var ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	// fixed for IE9, see #8346
	rupper = /([A-Z]|^ms)/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,
	rrelNum = /^([\-+])=([\-+.\de]+)/,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],
	curCSS,

	getComputedStyle,
	currentStyle;

jQuery.fn.css = function( name, value ) {
	// Setting 'undefined' is a no-op
	if ( arguments.length === 2 && value === undefined ) {
		return this;
	}

	return jQuery.access( this, name, value, true, function( elem, name, value ) {
		return value !== undefined ?
			jQuery.style( elem, name, value ) :
			jQuery.css( elem, name );
	});
};

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity", "opacity" );
					return ret === "" ? "1" : ret;

				} else {
					return elem.style.opacity;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, origName = jQuery.camelCase( name ),
			style = elem.style, hooks = jQuery.cssHooks[ origName ];

		name = jQuery.cssProps[ origName ] || origName;

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( +( ret[1] + 1) * +ret[2] ) + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra ) {
		var ret, hooks;

		// Make sure that we're working with the right name
		name = jQuery.camelCase( name );
		hooks = jQuery.cssHooks[ name ];
		name = jQuery.cssProps[ name ] || name;

		// cssFloat needs a special treatment
		if ( name === "cssFloat" ) {
			name = "float";
		}

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
		} else if ( curCSS ) {
			return curCSS( elem, name );
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};

		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	}
});

// DEPRECATED, Use jQuery.css() instead
jQuery.curCSS = jQuery.css;

jQuery.each(["height", "width"], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			var val;

			if ( computed ) {
				if ( elem.offsetWidth !== 0 ) {
					return getWH( elem, name, extra );
				} else {
					jQuery.swap( elem, cssShow, function() {
						val = getWH( elem, name, extra );
					});
				}

				return val;
			}
		},

		set: function( elem, value ) {
			if ( rnumpx.test( value ) ) {
				// ignore negative width and height values #1599
				value = parseFloat( value );

				if ( value >= 0 ) {
					return value + "px";
				}

			} else {
				return value;
			}
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( parseFloat( RegExp.$1 ) / 100 ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery(function() {
	// This hook cannot be added until DOM ready because the support test
	// for it is not run until after DOM ready
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				var ret;
				jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						ret = curCSS( elem, "margin-right", "marginRight" );
					} else {
						ret = elem.style.marginRight;
					}
				});
				return ret;
			}
		};
	}
});

if ( document.defaultView && document.defaultView.getComputedStyle ) {
	getComputedStyle = function( elem, name ) {
		var ret, defaultView, computedStyle;

		name = name.replace( rupper, "-$1" ).toLowerCase();

		if ( (defaultView = elem.ownerDocument.defaultView) &&
				(computedStyle = defaultView.getComputedStyle( elem, null )) ) {
			ret = computedStyle.getPropertyValue( name );
			if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
				ret = jQuery.style( elem, name );
			}
		}

		return ret;
	};
}

if ( document.documentElement.currentStyle ) {
	currentStyle = function( elem, name ) {
		var left, rsLeft, uncomputed,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret === null && style && (uncomputed = style[ name ]) ) {
			ret = uncomputed;
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {

			// Remember the original values
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ( ret || 0 );
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

curCSS = getComputedStyle || currentStyle;

function getWH( elem, name, extra ) {

	// Start with offset property
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		which = name === "width" ? cssWidth : cssHeight,
		i = 0,
		len = which.length;

	if ( val > 0 ) {
		if ( extra !== "border" ) {
			for ( ; i < len; i++ ) {
				if ( !extra ) {
					val -= parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0;
				}
				if ( extra === "margin" ) {
					val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0;
				} else {
					val -= parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0;
				}
			}
		}

		return val + "px";
	}

	// Fall back to computed then uncomputed css if necessary
	val = curCSS( elem, name, name );
	if ( val < 0 || val == null ) {
		val = elem.style[ name ] || 0;
	}
	// Normalize "", auto, and prepare for extra
	val = parseFloat( val ) || 0;

	// Add padding, border, margin
	if ( extra ) {
		for ( ; i < len; i++ ) {
			val += parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0;
			if ( extra !== "padding" ) {
				val += parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0;
			}
			if ( extra === "margin" ) {
				val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0;
			}
		}
	}

	return val + "px";
}

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth,
			height = elem.offsetHeight;

		return ( width === 0 && height === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rselectTextarea = /^(?:select|textarea)/i,
	rspacesAjax = /\s+/,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Document location
	ajaxLocation,

	// Document location segments
	ajaxLocParts,

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters ),
		selection;

	for ( ; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.extend({
	load: function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );

		// Don't do a request if no elements are being requested
		} else if ( !this.length ) {
			return this;
		}

		var off = url.indexOf( " " );
		if ( off >= 0 ) {
			var selector = url.slice( off, url.length );
			url = url.slice( 0, off );
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params ) {
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = undefined;

			// Otherwise, build a param string
			} else if ( typeof params === "object" ) {
				params = jQuery.param( params, jQuery.ajaxSettings.traditional );
				type = "POST";
			}
		}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			// Complete callback (responseText is used internally)
			complete: function( jqXHR, status, responseText ) {
				// Store the response as specified by the jqXHR object
				responseText = jqXHR.responseText;
				// If successful, inject the HTML into all the matched elements
				if ( jqXHR.isResolved() ) {
					// #4825: Get the actual response in case
					// a dataFilter is present in ajaxSettings
					jqXHR.done(function( r ) {
						responseText = r;
					});
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						responseText );
				}

				if ( callback ) {
					self.each( callback, [ responseText, status, jqXHR ] );
				}
			}
		});

		return this;
	},

	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},

	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// ifModified key
			ifModifiedKey,
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// The jqXHR state
			state = 0,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			var isSuccess,
				success,
				error,
				statusText = nativeStatusText,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jQuery.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jQuery.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					try {
						success = ajaxConvert( s, response );
						statusText = "success";
						isSuccess = true;
					} catch(e) {
						// We have a parsererror
						statusText = "parsererror";
						error = e;
					}
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = "" + ( nativeStatusText || statusText );

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for ( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {
			return false;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			});

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	}
});

function buildParams( prefix, obj, traditional, add ) {
	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		// Serialize object item.
		for ( var name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	var dataTypes = s.dataTypes,
		converters = {},
		i,
		key,
		length = dataTypes.length,
		tmp,
		// Current and previous dataTypes
		current = dataTypes[ 0 ],
		prev,
		// Conversion expression
		conversion,
		// Conversion function
		conv,
		// Conversion functions (transitive conversion)
		conv1,
		conv2;

	// For each dataType in the chain
	for ( i = 1; i < length; i++ ) {

		// Create converters map
		// with lowercased keys
		if ( i === 1 ) {
			for ( key in s.converters ) {
				if ( typeof key === "string" ) {
					converters[ key.toLowerCase() ] = s.converters[ key ];
				}
			}
		}

		// Get the dataTypes
		prev = current;
		current = dataTypes[ i ];

		// If current is auto dataType, update it to prev
		if ( current === "*" ) {
			current = prev;
		// If no auto and dataTypes are actually different
		} else if ( prev !== "*" && prev !== current ) {

			// Get the converter
			conversion = prev + " " + current;
			conv = converters[ conversion ] || converters[ "* " + current ];

			// If there is no direct converter, search transitively
			if ( !conv ) {
				conv2 = undefined;
				for ( conv1 in converters ) {
					tmp = conv1.split( " " );
					if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
						conv2 = converters[ tmp[1] + " " + current ];
						if ( conv2 ) {
							conv1 = converters[ conv1 ];
							if ( conv1 === true ) {
								conv = conv2;
							} else if ( conv2 === true ) {
								conv = conv1;
							}
							break;
						}
					}
				}
			}
			// If we found no converter, dispatch an error
			if ( !( conv || conv2 ) ) {
				jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
			}
			// If found converter is not an equivalence
			if ( conv !== true ) {
				// Convert with 1 or 2 converters accordingly
				response = conv ? conv( response ) : conv2( conv1(response) );
			}
		}
	}
	return response;
}




var jsc = jQuery.now(),
	jsre = /(\=)\?(&|$)|\?\?/i;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		return jQuery.expando + "_" + ( jsc++ );
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
		( typeof s.data === "string" );

	if ( s.dataTypes[ 0 ] === "jsonp" ||
		s.jsonp !== false && ( jsre.test( s.url ) ||
				inspectData && jsre.test( s.data ) ) ) {

		var responseContainer,
			jsonpCallback = s.jsonpCallback =
				jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			previous = window[ jsonpCallback ],
			url = s.url,
			data = s.data,
			replace = "$1" + jsonpCallback + "$2";

		if ( s.jsonp !== false ) {
			url = url.replace( jsre, replace );
			if ( s.url === url ) {
				if ( inspectData ) {
					data = data.replace( jsre, replace );
				}
				if ( s.data === data ) {
					// Add callback manually
					url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
				}
			}
		}

		s.url = url;
		s.data = data;

		// Install callback
		window[ jsonpCallback ] = function( response ) {
			responseContainer = [ response ];
		};

		// Clean-up function
		jqXHR.always(function() {
			// Set callback back to previous value
			window[ jsonpCallback ] = previous;
			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( previous ) ) {
				window[ jsonpCallback ]( responseContainer[ 0 ] );
			}
		});

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( jsonpCallback + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Delegate to script
		return "script";
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});




var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0,
	xhrCallbacks;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var xhr = s.xhr(),
						handle,
						i;

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occured
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}
									responses.text = xhr.responseText;

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					// if we're in sync mode or it's in cache
					// and has been retrieved directly (IE6 & IE7)
					// we need to manually fire the callback
					if ( !s.async || xhr.readyState === 4 ) {
						callback();
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}




var elemdisplay = {},
	iframe, iframeDoc,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	],
	fxNow;

jQuery.fn.extend({
	show: function( speed, easing, callback ) {
		var elem, display;

		if ( speed || speed === 0 ) {
			return this.animate( genFx("show", 3), speed, easing, callback );

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					// Reset the inline display of this element to learn if it is
					// being hidden by cascaded rules or not
					if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
						display = elem.style.display = "";
					}

					// Set elements which have been overridden with display: none
					// in a stylesheet to whatever the default browser style is
					// for such an element
					if ( display === "" && jQuery.css(elem, "display") === "none" ) {
						jQuery._data( elem, "olddisplay", defaultDisplay(elem.nodeName) );
					}
				}
			}

			// Set the display of most of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					if ( display === "" || display === "none" ) {
						elem.style.display = jQuery._data( elem, "olddisplay" ) || "";
					}
				}
			}

			return this;
		}
	},

	hide: function( speed, easing, callback ) {
		if ( speed || speed === 0 ) {
			return this.animate( genFx("hide", 3), speed, easing, callback);

		} else {
			var elem, display,
				i = 0,
				j = this.length;

			for ( ; i < j; i++ ) {
				elem = this[i];
				if ( elem.style ) {
					display = jQuery.css( elem, "display" );

					if ( display !== "none" && !jQuery._data( elem, "olddisplay" ) ) {
						jQuery._data( elem, "olddisplay", display );
					}
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				if ( this[i].style ) {
					this[i].style.display = "none";
				}
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2, callback ) {
		var bool = typeof fn === "boolean";

		if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		} else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : jQuery(this).is(":hidden");
				jQuery(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.animate(genFx("toggle", 3), fn, fn2, callback);
		}

		return this;
	},

	fadeTo: function( speed, to, easing, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.animate({opacity: to}, speed, easing, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed( speed, easing, callback );

		if ( jQuery.isEmptyObject( prop ) ) {
			return this.each( optall.complete, [ false ] );
		}

		// Do not change referenced properties as per-property easing will be lost
		prop = jQuery.extend( {}, prop );

		function doAnimation() {
			// XXX 'this' does not always have a nodeName when running the
			// test suite

			if ( optall.queue === false ) {
				jQuery._mark( this );
			}

			var opt = jQuery.extend( {}, optall ),
				isElement = this.nodeType === 1,
				hidden = isElement && jQuery(this).is(":hidden"),
				name, val, p, e,
				parts, start, end, unit,
				method;

			// will store per property easing and be used to determine when an animation is complete
			opt.animatedProperties = {};

			for ( p in prop ) {

				// property name normalization
				name = jQuery.camelCase( p );
				if ( p !== name ) {
					prop[ name ] = prop[ p ];
					delete prop[ p ];
				}

				val = prop[ name ];

				// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
				if ( jQuery.isArray( val ) ) {
					opt.animatedProperties[ name ] = val[ 1 ];
					val = prop[ name ] = val[ 0 ];
				} else {
					opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
				}

				if ( val === "hide" && hidden || val === "show" && !hidden ) {
					return opt.complete.call( this );
				}

				if ( isElement && ( name === "height" || name === "width" ) ) {
					// Make sure that nothing sneaks out
					// Record all 3 overflow attributes because IE does not
					// change the overflow attribute when overflowX and
					// overflowY are set to the same value
					opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

					// Set display property to inline-block for height/width
					// animations on inline elements that are having width/height animated
					if ( jQuery.css( this, "display" ) === "inline" &&
							jQuery.css( this, "float" ) === "none" ) {

						// inline-level elements accept inline-block;
						// block-level elements need to be inline with layout
						if ( !jQuery.support.inlineBlockNeedsLayout || defaultDisplay( this.nodeName ) === "inline" ) {
							this.style.display = "inline-block";

						} else {
							this.style.zoom = 1;
						}
					}
				}
			}

			if ( opt.overflow != null ) {
				this.style.overflow = "hidden";
			}

			for ( p in prop ) {
				e = new jQuery.fx( this, opt, p );
				val = prop[ p ];

				if ( rfxtypes.test( val ) ) {

					// Tracks whether to show or hide based on private
					// data attached to the element
					method = jQuery._data( this, "toggle" + p ) || ( val === "toggle" ? hidden ? "show" : "hide" : 0 );
					if ( method ) {
						jQuery._data( this, "toggle" + p, method === "show" ? "hide" : "show" );
						e[ method ]();
					} else {
						e[ val ]();
					}

				} else {
					parts = rfxnum.exec( val );
					start = e.cur();

					if ( parts ) {
						end = parseFloat( parts[2] );
						unit = parts[3] || ( jQuery.cssNumber[ p ] ? "" : "px" );

						// We need to compute starting value
						if ( unit !== "px" ) {
							jQuery.style( this, p, (end || 1) + unit);
							start = ( (end || 1) / e.cur() ) * start;
							jQuery.style( this, p, start + unit);
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] ) {
							end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
						}

						e.custom( start, end, unit );

					} else {
						e.custom( start, val, "" );
					}
				}
			}

			// For JS strict compliance
			return true;
		}

		return optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},

	stop: function( type, clearQueue, gotoEnd ) {
		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var index,
				hadTimers = false,
				timers = jQuery.timers,
				data = jQuery._data( this );

			// clear marker counters if we know they won't be
			if ( !gotoEnd ) {
				jQuery._unmark( true, this );
			}

			function stopQueue( elem, data, index ) {
				var hooks = data[ index ];
				jQuery.removeData( elem, index, true );
				hooks.stop( gotoEnd );
			}

			if ( type == null ) {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && index.indexOf(".run") === index.length - 4 ) {
						stopQueue( this, data, index );
					}
				}
			} else if ( data[ index = type + ".run" ] && data[ index ].stop ){
				stopQueue( this, data, index );
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					if ( gotoEnd ) {

						// force the next step to be the last
						timers[ index ]( true );
					} else {
						timers[ index ].saveState();
					}
					hadTimers = true;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( !( gotoEnd && hadTimers ) ) {
				jQuery.dequeue( this, type );
			}
		});
	}

});

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout( clearFxNow, 0 );
	return ( fxNow = jQuery.now() );
}

function clearFxNow() {
	fxNow = undefined;
}

// Generate parameters to create a standard animation
function genFx( type, num ) {
	var obj = {};

	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice( 0, num )), function() {
		obj[ this ] = type;
	});

	return obj;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx( "show", 1 ),
	slideUp: genFx( "hide", 1 ),
	slideToggle: genFx( "toggle", 1 ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.extend({
	speed: function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

		// normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function( noUnmark ) {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			} else if ( noUnmark !== false ) {
				jQuery._unmark( this );
			}
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ( ( -Math.cos( p*Math.PI ) / 2 ) + 0.5 ) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		options.orig = options.orig || {};
	}

});

jQuery.fx.prototype = {
	// Simple function for setting a style value
	update: function() {
		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		( jQuery.fx.step[ this.prop ] || jQuery.fx.step._default )( this );
	},

	// Get the current size
	cur: function() {
		if ( this.elem[ this.prop ] != null && (!this.elem.style || this.elem.style[ this.prop ] == null) ) {
			return this.elem[ this.prop ];
		}

		var parsed,
			r = jQuery.css( this.elem, this.prop );
		// Empty strings, null, undefined and "auto" are converted to 0,
		// complex values such as "rotate(1rad)" are returned as is,
		// simple values such as "10px" are parsed to Float.
		return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
	},

	// Start an animation from one number to another
	custom: function( from, to, unit ) {
		var self = this,
			fx = jQuery.fx;

		this.startTime = fxNow || createFxNow();
		this.end = to;
		this.now = this.start = from;
		this.pos = this.state = 0;
		this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );

		function t( gotoEnd ) {
			return self.step( gotoEnd );
		}

		t.queue = this.options.queue;
		t.elem = this.elem;
		t.saveState = function() {
			if ( self.options.hide && jQuery._data( self.elem, "fxshow" + self.prop ) === undefined ) {
				jQuery._data( self.elem, "fxshow" + self.prop, self.start );
			}
		};

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			timerId = setInterval( fx.tick, fx.interval );
		}
	},

	// Simple 'show' function
	show: function() {
		var dataShow = jQuery._data( this.elem, "fxshow" + this.prop );

		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = dataShow || jQuery.style( this.elem, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any flash of content
		if ( dataShow !== undefined ) {
			// This show is picking up where a previous hide or show left off
			this.custom( this.cur(), dataShow );
		} else {
			this.custom( this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur() );
		}

		// Start by showing the element
		jQuery( this.elem ).show();
	},

	// Simple 'hide' function
	hide: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = jQuery._data( this.elem, "fxshow" + this.prop ) || jQuery.style( this.elem, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom( this.cur(), 0 );
	},

	// Each step of an animation
	step: function( gotoEnd ) {
		var p, n, complete,
			t = fxNow || createFxNow(),
			done = true,
			elem = this.elem,
			options = this.options;

		if ( gotoEnd || t >= options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			options.animatedProperties[ this.prop ] = true;

			for ( p in options.animatedProperties ) {
				if ( options.animatedProperties[ p ] !== true ) {
					done = false;
				}
			}

			if ( done ) {
				// Reset the overflow
				if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {

					jQuery.each( [ "", "X", "Y" ], function( index, value ) {
						elem.style[ "overflow" + value ] = options.overflow[ index ];
					});
				}

				// Hide the element if the "hide" operation was done
				if ( options.hide ) {
					jQuery( elem ).hide();
				}

				// Reset the properties, if the item has been hidden or shown
				if ( options.hide || options.show ) {
					for ( p in options.animatedProperties ) {
						jQuery.style( elem, p, options.orig[ p ] );
						jQuery.removeData( elem, "fxshow" + p, true );
						// Toggle data is no longer needed
						jQuery.removeData( elem, "toggle" + p, true );
					}
				}

				// Execute the complete function
				// in the event that the complete function throws an exception
				// we must ensure it won't be called twice. #5684

				complete = options.complete;
				if ( complete ) {

					options.complete = false;
					complete.call( elem );
				}
			}

			return false;

		} else {
			// classical easing cannot be used with an Infinity duration
			if ( options.duration == Infinity ) {
				this.now = t;
			} else {
				n = t - this.startTime;
				this.state = n / options.duration;

				// Perform the easing function, defaults to swing
				this.pos = jQuery.easing[ options.animatedProperties[this.prop] ]( this.state, n, 0, 1, options.duration );
				this.now = this.start + ( (this.end - this.start) * this.pos );
			}
			// Perform the next step of the animation
			this.update();
		}

		return true;
	}
};

jQuery.extend( jQuery.fx, {
	tick: function() {
		var timer,
			timers = jQuery.timers,
			i = 0;

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];
			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
	},

	interval: 13,

	stop: function() {
		clearInterval( timerId );
		timerId = null;
	},

	speeds: {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	},

	step: {
		opacity: function( fx ) {
			jQuery.style( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = fx.now + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	}
});

// Adds width/height step functions
// Do not set anything below 0
jQuery.each([ "width", "height" ], function( i, prop ) {
	jQuery.fx.step[ prop ] = function( fx ) {
		jQuery.style( fx.elem, prop, Math.max(0, fx.now) + fx.unit );
	};
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}

// Try to restore the default display value of an element
function defaultDisplay( nodeName ) {

	if ( !elemdisplay[ nodeName ] ) {

		var body = document.body,
			elem = jQuery( "<" + nodeName + ">" ).appendTo( body ),
			display = elem.css( "display" );
		elem.remove();

		// If the simple way fails,
		// get element's real default display by attaching it to a temp iframe
		if ( display === "none" || display === "" ) {
			// No iframe to use yet, so create it
			if ( !iframe ) {
				iframe = document.createElement( "iframe" );
				iframe.frameBorder = iframe.width = iframe.height = 0;
			}

			body.appendChild( iframe );

			// Create a cacheable copy of the iframe document on first call.
			// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
			// document to it; WebKit & Firefox won't allow reusing the iframe document.
			if ( !iframeDoc || !iframe.createElement ) {
				iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
				iframeDoc.write( ( document.compatMode === "CSS1Compat" ? "<!doctype html>" : "" ) + "<html><body>" );
				iframeDoc.close();
			}

			elem = iframeDoc.createElement( nodeName );

			iframeDoc.body.appendChild( elem );

			display = jQuery.css( elem, "display" );
			body.removeChild( iframe );
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return elemdisplay[ nodeName ];
}




var rtable = /^t(?:able|d|h)$/i,
	rroot = /^(?:body|html)$/i;

if ( "getBoundingClientRect" in document.documentElement ) {
	jQuery.fn.offset = function( options ) {
		var elem = this[0], box;

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		try {
			box = elem.getBoundingClientRect();
		} catch(e) {}

		var doc = elem.ownerDocument,
			docElem = doc.documentElement;

		// Make sure we're not dealing with a disconnected DOM node
		if ( !box || !jQuery.contains( docElem, elem ) ) {
			return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
		}

		var body = doc.body,
			win = getWindow(doc),
			clientTop  = docElem.clientTop  || body.clientTop  || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
			scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
			top  = box.top  + scrollTop  - clientTop,
			left = box.left + scrollLeft - clientLeft;

		return { top: top, left: left };
	};

} else {
	jQuery.fn.offset = function( options ) {
		var elem = this[0];

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		var computedStyle,
			offsetParent = elem.offsetParent,
			prevOffsetParent = elem,
			doc = elem.ownerDocument,
			docElem = doc.documentElement,
			body = doc.body,
			defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop,
			left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}

jQuery.offset = {

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[0] ) {
			return null;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
	var method = "scroll" + name;

	jQuery.fn[ method ] = function( val ) {
		var elem, win;

		if ( val === undefined ) {
			elem = this[ 0 ];

			if ( !elem ) {
				return null;
			}

			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				jQuery.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}

		// Set the scroll offset
		return this.each(function() {
			win = getWindow( this );

			if ( win ) {
				win.scrollTo(
					!i ? val : jQuery( win ).scrollLeft(),
					 i ? val : jQuery( win ).scrollTop()
				);

			} else {
				this[ method ] = val;
			}
		});
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}




// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn[ "inner" + name ] = function() {
		var elem = this[0];
		return elem ?
			elem.style ?
			parseFloat( jQuery.css( elem, type, "padding" ) ) :
			this[ type ]() :
			null;
	};

	// outerHeight and outerWidth
	jQuery.fn[ "outer" + name ] = function( margin ) {
		var elem = this[0];
		return elem ?
			elem.style ?
			parseFloat( jQuery.css( elem, type, margin ? "margin" : "border" ) ) :
			this[ type ]() :
			null;
	};

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];
		if ( !elem ) {
			return size == null ? null : this;
		}

		if ( jQuery.isFunction( size ) ) {
			return this.each(function( i ) {
				var self = jQuery( this );
				self[ type ]( size.call( this, i, self[ type ]() ) );
			});
		}

		if ( jQuery.isWindow( elem ) ) {
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
			var docElemProp = elem.document.documentElement[ "client" + name ],
				body = elem.document.body;
			return elem.document.compatMode === "CSS1Compat" && docElemProp ||
				body && body[ "client" + name ] || docElemProp;

		// Get document width or height
		} else if ( elem.nodeType === 9 ) {
			// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
			return Math.max(
				elem.documentElement["client" + name],
				elem.body["scroll" + name], elem.documentElement["scroll" + name],
				elem.body["offset" + name], elem.documentElement["offset" + name]
			);

		// Get or set width or height on the element
		} else if ( size === undefined ) {
			var orig = jQuery.css( elem, type ),
				ret = parseFloat( orig );

			return jQuery.isNumeric( ret ) ? ret : orig;

		// Set the width or height on the element (default to pixels if value is unitless)
		} else {
			return this.css( type, typeof size === "string" ? size : size + "px" );
		}
	};

});




// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}



})( window );
/**
 * History.js jQuery Adapter
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

// Closure
(function(window,undefined){
	"use strict";

	// Localise Globals
	var
		History = window.History = window.History||{},
		jQuery = window.jQuery;

	// Check Existence
	if ( typeof History.Adapter !== 'undefined' ) {
		throw new Error('History.js Adapter has already been loaded...');
	}

	// Add the Adapter
	History.Adapter = {
		/**
		 * History.Adapter.bind(el,event,callback)
		 * @param {Element|string} el
		 * @param {string} event - custom and standard events
		 * @param {function} callback
		 * @return {void}
		 */
		bind: function(el,event,callback){
			jQuery(el).bind(event,callback);
		},

		/**
		 * History.Adapter.trigger(el,event)
		 * @param {Element|string} el
		 * @param {string} event - custom and standard events
		 * @param {Object=} extra - a object of extra event data (optional)
		 * @return {void}
		 */
		trigger: function(el,event,extra){
			jQuery(el).trigger(event,extra);
		},

		/**
		 * History.Adapter.extractEventData(key,event,extra)
		 * @param {string} key - key for the event data to extract
		 * @param {string} event - custom and standard events
		 * @param {Object=} extra - a object of extra event data (optional)
		 * @return {mixed}
		 */
		extractEventData: function(key,event,extra){
			// jQuery Native then jQuery Custom
			var result = (event && event.originalEvent && event.originalEvent[key]) || (extra && extra[key]) || undefined;

			// Return
			return result;
		},

		/**
		 * History.Adapter.onDomLoad(callback)
		 * @param {function} callback
		 * @return {void}
		 */
		onDomLoad: function(callback) {
			jQuery(callback);
		}
	};

	// Try and Initialise History
	if ( typeof History.init !== 'undefined' ) {
		History.init();
	}

})(window);

/**
 * History.js HTML4 Support
 * Depends on the HTML5 Support
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

(function(window,undefined){
	"use strict";

	// ========================================================================
	// Initialise

	// Localise Globals
	var
		document = window.document, // Make sure we are using the correct document
		setTimeout = window.setTimeout||setTimeout,
		clearTimeout = window.clearTimeout||clearTimeout,
		setInterval = window.setInterval||setInterval,
		History = window.History = window.History||{}; // Public History Object

	// Check Existence
	if ( typeof History.initHtml4 !== 'undefined' ) {
		throw new Error('History.js HTML4 Support has already been loaded...');
	}


	// ========================================================================
	// Initialise HTML4 Support

	// Initialise HTML4 Support
	History.initHtml4 = function(){
		// Initialise
		if ( typeof History.initHtml4.initialized !== 'undefined' ) {
			// Already Loaded
			return false;
		}
		else {
			History.initHtml4.initialized = true;
		}


		// ====================================================================
		// Properties

		/**
		 * History.enabled
		 * Is History enabled?
		 */
		History.enabled = true;


		// ====================================================================
		// Hash Storage

		/**
		 * History.savedHashes
		 * Store the hashes in an array
		 */
		History.savedHashes = [];

		/**
		 * History.isLastHash(newHash)
		 * Checks if the hash is the last hash
		 * @param {string} newHash
		 * @return {boolean} true
		 */
		History.isLastHash = function(newHash){
			// Prepare
			var oldHash = History.getHashByIndex(),
				isLast;

			// Check
			isLast = newHash === oldHash;

			// Return isLast
			return isLast;
		};

		/**
		 * History.saveHash(newHash)
		 * Push a Hash
		 * @param {string} newHash
		 * @return {boolean} true
		 */
		History.saveHash = function(newHash){
			// Check Hash
			if ( History.isLastHash(newHash) ) {
				return false;
			}

			// Push the Hash
			History.savedHashes.push(newHash);

			// Return true
			return true;
		};

		/**
		 * History.getHashByIndex()
		 * Gets a hash by the index
		 * @param {integer} index
		 * @return {string}
		 */
		History.getHashByIndex = function(index){
			// Prepare
			var hash = null;

			// Handle
			if ( typeof index === 'undefined' ) {
				// Get the last inserted
				hash = History.savedHashes[History.savedHashes.length-1];
			}
			else if ( index < 0 ) {
				// Get from the end
				hash = History.savedHashes[History.savedHashes.length+index];
			}
			else {
				// Get from the beginning
				hash = History.savedHashes[index];
			}

			// Return hash
			return hash;
		};


		// ====================================================================
		// Discarded States

		/**
		 * History.discardedHashes
		 * A hashed array of discarded hashes
		 */
		History.discardedHashes = {};

		/**
		 * History.discardedStates
		 * A hashed array of discarded states
		 */
		History.discardedStates = {};

		/**
		 * History.discardState(State)
		 * Discards the state by ignoring it through History
		 * @param {object} State
		 * @return {true}
		 */
		History.discardState = function(discardedState,forwardState,backState){
			//History.debug('History.discardState', arguments);
			// Prepare
			var discardedStateHash = History.getHashByState(discardedState),
				discardObject;

			// Create Discard Object
			discardObject = {
				'discardedState': discardedState,
				'backState': backState,
				'forwardState': forwardState
			};

			// Add to DiscardedStates
			History.discardedStates[discardedStateHash] = discardObject;

			// Return true
			return true;
		};

		/**
		 * History.discardHash(hash)
		 * Discards the hash by ignoring it through History
		 * @param {string} hash
		 * @return {true}
		 */
		History.discardHash = function(discardedHash,forwardState,backState){
			//History.debug('History.discardState', arguments);
			// Create Discard Object
			var discardObject = {
				'discardedHash': discardedHash,
				'backState': backState,
				'forwardState': forwardState
			};

			// Add to discardedHash
			History.discardedHashes[discardedHash] = discardObject;

			// Return true
			return true;
		};

		/**
		 * History.discardState(State)
		 * Checks to see if the state is discarded
		 * @param {object} State
		 * @return {bool}
		 */
		History.discardedState = function(State){
			// Prepare
			var StateHash = History.getHashByState(State),
				discarded;

			// Check
			discarded = History.discardedStates[StateHash]||false;

			// Return true
			return discarded;
		};

		/**
		 * History.discardedHash(hash)
		 * Checks to see if the state is discarded
		 * @param {string} State
		 * @return {bool}
		 */
		History.discardedHash = function(hash){
			// Check
			var discarded = History.discardedHashes[hash]||false;

			// Return true
			return discarded;
		};

		/**
		 * History.recycleState(State)
		 * Allows a discarded state to be used again
		 * @param {object} data
		 * @param {string} title
		 * @param {string} url
		 * @return {true}
		 */
		History.recycleState = function(State){
			//History.debug('History.recycleState', arguments);
			// Prepare
			var StateHash = History.getHashByState(State);

			// Remove from DiscardedStates
			if ( History.discardedState(State) ) {
				delete History.discardedStates[StateHash];
			}

			// Return true
			return true;
		};


		// ====================================================================
		// HTML4 HashChange Support

		if ( History.emulated.hashChange ) {
			/*
			 * We must emulate the HTML4 HashChange Support by manually checking for hash changes
			 */

			/**
			 * History.hashChangeInit()
			 * Init the HashChange Emulation
			 */
			History.hashChangeInit = function(){
				// Define our Checker Function
				History.checkerFunction = null;

				// Define some variables that will help in our checker function
				var lastDocumentHash = '',
					iframeId, iframe,
					lastIframeHash, checkerRunning;

				// Handle depending on the browser
				if ( History.isInternetExplorer() ) {
					// IE6 and IE7
					// We need to use an iframe to emulate the back and forward buttons

					// Create iFrame
					iframeId = 'historyjs-iframe';
					iframe = document.createElement('iframe');

					// Adjust iFarme
					iframe.setAttribute('id', iframeId);
					iframe.style.display = 'none';

					// Append iFrame
					document.body.appendChild(iframe);

					// Create initial history entry
					iframe.contentWindow.document.open();
					iframe.contentWindow.document.close();

					// Define some variables that will help in our checker function
					lastIframeHash = '';
					checkerRunning = false;

					// Define the checker function
					History.checkerFunction = function(){
						// Check Running
						if ( checkerRunning ) {
							return false;
						}

						// Update Running
						checkerRunning = true;

						// Fetch
						var documentHash = History.getHash()||'',
							iframeHash = History.unescapeHash(iframe.contentWindow.document.location.hash)||'';

						// The Document Hash has changed (application caused)
						if ( documentHash !== lastDocumentHash ) {
							// Equalise
							lastDocumentHash = documentHash;

							// Create a history entry in the iframe
							if ( iframeHash !== documentHash ) {
								//History.debug('hashchange.checker: iframe hash change', 'documentHash (new):', documentHash, 'iframeHash (old):', iframeHash);

								// Equalise
								lastIframeHash = iframeHash = documentHash;

								// Create History Entry
								iframe.contentWindow.document.open();
								iframe.contentWindow.document.close();

								// Update the iframe's hash
								iframe.contentWindow.document.location.hash = History.escapeHash(documentHash);
							}

							// Trigger Hashchange Event
							History.Adapter.trigger(window,'hashchange');
						}

						// The iFrame Hash has changed (back button caused)
						else if ( iframeHash !== lastIframeHash ) {
							//History.debug('hashchange.checker: iframe hash out of sync', 'iframeHash (new):', iframeHash, 'documentHash (old):', documentHash);

							// Equalise
							lastIframeHash = iframeHash;

							// Update the Hash
							History.setHash(iframeHash,false);
						}

						// Reset Running
						checkerRunning = false;

						// Return true
						return true;
					};
				}
				else {
					// We are not IE
					// Firefox 1 or 2, Opera

					// Define the checker function
					History.checkerFunction = function(){
						// Prepare
						var documentHash = History.getHash();

						// The Document Hash has changed (application caused)
						if ( documentHash !== lastDocumentHash ) {
							// Equalise
							lastDocumentHash = documentHash;

							// Trigger Hashchange Event
							History.Adapter.trigger(window,'hashchange');
						}

						// Return true
						return true;
					};
				}

				// Apply the checker function
				History.intervalList.push(setInterval(History.checkerFunction, History.options.hashChangeInterval));

				// Done
				return true;
			}; // History.hashChangeInit

			// Bind hashChangeInit
			History.Adapter.onDomLoad(History.hashChangeInit);

		} // History.emulated.hashChange


		// ====================================================================
		// HTML5 State Support

		// Non-Native pushState Implementation
		if ( History.emulated.pushState ) {
			/*
			 * We must emulate the HTML5 State Management by using HTML4 HashChange
			 */

			/**
			 * History.onHashChange(event)
			 * Trigger HTML5's window.onpopstate via HTML4 HashChange Support
			 */
			History.onHashChange = function(event){
				//History.debug('History.onHashChange', arguments);

				// Prepare
				var currentUrl = ((event && event.newURL) || document.location.href),
					currentHash = History.getHashByUrl(currentUrl),
					currentState = null,
					currentStateHash = null,
					currentStateHashExits = null,
					discardObject;

				// Check if we are the same state
				if ( History.isLastHash(currentHash) ) {
					// There has been no change (just the page's hash has finally propagated)
					//History.debug('History.onHashChange: no change');
					History.busy(false);
					return false;
				}

				// Reset the double check
				History.doubleCheckComplete();

				// Store our location for use in detecting back/forward direction
				History.saveHash(currentHash);

				// Expand Hash
				if ( currentHash && History.isTraditionalAnchor(currentHash) ) {
					//History.debug('History.onHashChange: traditional anchor', currentHash);
					// Traditional Anchor Hash
					History.Adapter.trigger(window,'anchorchange');
					History.busy(false);
					return false;
				}

				// Create State
				currentState = History.extractState(History.getFullUrl(currentHash||document.location.href,false),true);

				// Check if we are the same state
				if ( History.isLastSavedState(currentState) ) {
					//History.debug('History.onHashChange: no change');
					// There has been no change (just the page's hash has finally propagated)
					History.busy(false);
					return false;
				}

				// Create the state Hash
				currentStateHash = History.getHashByState(currentState);

				// Check if we are DiscardedState
				discardObject = History.discardedState(currentState);
				if ( discardObject ) {
					// Ignore this state as it has been discarded and go back to the state before it
					if ( History.getHashByIndex(-2) === History.getHashByState(discardObject.forwardState) ) {
						// We are going backwards
						//History.debug('History.onHashChange: go backwards');
						History.back(false);
					} else {
						// We are going forwards
						//History.debug('History.onHashChange: go forwards');
						History.forward(false);
					}
					return false;
				}

				// Push the new HTML5 State
				//History.debug('History.onHashChange: success hashchange');
				History.pushState(currentState.data,currentState.title,currentState.url,false);

				// End onHashChange closure
				return true;
			};
			History.Adapter.bind(window,'hashchange',History.onHashChange);

			/**
			 * History.pushState(data,title,url)
			 * Add a new State to the history object, become it, and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.pushState = function(data,title,url,queue){
				//History.debug('History.pushState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.pushState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.pushState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy
				History.busy(true);

				// Fetch the State Object
				var newState = History.createStateObject(data,title,url),
					newStateHash = History.getHashByState(newState),
					oldState = History.getState(false),
					oldStateHash = History.getHashByState(oldState),
					html4Hash = History.getHash();

				// Store the newState
				History.storeState(newState);
				History.expectedStateId = newState.id;

				// Recycle the State
				History.recycleState(newState);

				// Force update of the title
				History.setTitle(newState);

				// Check if we are the same State
				if ( newStateHash === oldStateHash ) {
					//History.debug('History.pushState: no change', newStateHash);
					History.busy(false);
					return false;
				}

				// Update HTML4 Hash
				if ( newStateHash !== html4Hash && newStateHash !== History.getShortUrl(document.location.href) ) {
					//History.debug('History.pushState: update hash', newStateHash, html4Hash);
					History.setHash(newStateHash,false);
					return false;
				}

				// Update HTML5 State
				History.saveState(newState);

				// Fire HTML5 Event
				//History.debug('History.pushState: trigger popstate');
				History.Adapter.trigger(window,'statechange');
				History.busy(false);

				// End pushState closure
				return true;
			};

			/**
			 * History.replaceState(data,title,url)
			 * Replace the State and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.replaceState = function(data,title,url,queue){
				//History.debug('History.replaceState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.replaceState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.replaceState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy
				History.busy(true);

				// Fetch the State Objects
				var newState        = History.createStateObject(data,title,url),
					oldState        = History.getState(false),
					previousState   = History.getStateByIndex(-2);

				// Discard Old State
				History.discardState(oldState,newState,previousState);

				// Alias to PushState
				History.pushState(newState.data,newState.title,newState.url,false);

				// End replaceState closure
				return true;
			};

		} // History.emulated.pushState



		// ====================================================================
		// Initialise

		// Non-Native pushState Implementation
		if ( History.emulated.pushState ) {
			/**
			 * Ensure initial state is handled correctly
			 */
			if ( History.getHash() && !History.emulated.hashChange ) {
				History.Adapter.onDomLoad(function(){
					History.Adapter.trigger(window,'hashchange');
				});
			}

		} // History.emulated.pushState

	}; // History.initHtml4

	// Try and Initialise History
	if ( typeof History.init !== 'undefined' ) {
		History.init();
	}

})(window);
/**
 * History.js Core
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

(function(window,undefined){
	"use strict";

	// ========================================================================
	// Initialise

	// Localise Globals
	var
		console = window.console||undefined, // Prevent a JSLint complain
		document = window.document, // Make sure we are using the correct document
		navigator = window.navigator, // Make sure we are using the correct navigator
		sessionStorage = window.sessionStorage||false, // sessionStorage
		setTimeout = window.setTimeout,
		clearTimeout = window.clearTimeout,
		setInterval = window.setInterval,
		clearInterval = window.clearInterval,
		JSON = window.JSON,
		alert = window.alert,
		History = window.History = window.History||{}, // Public History Object
		history = window.history; // Old History Object

	// MooTools Compatibility
	JSON.stringify = JSON.stringify||JSON.encode;
	JSON.parse = JSON.parse||JSON.decode;

	// Check Existence
	if ( typeof History.init !== 'undefined' ) {
		throw new Error('History.js Core has already been loaded...');
	}

	// Initialise History
	History.init = function(){
		// Check Load Status of Adapter
		if ( typeof History.Adapter === 'undefined' ) {
			return false;
		}

		// Check Load Status of Core
		if ( typeof History.initCore !== 'undefined' ) {
			History.initCore();
		}

		// Check Load Status of HTML4 Support
		if ( typeof History.initHtml4 !== 'undefined' ) {
			History.initHtml4();
		}

		// Return true
		return true;
	};


	// ========================================================================
	// Initialise Core

	// Initialise Core
	History.initCore = function(){
		// Initialise
		if ( typeof History.initCore.initialized !== 'undefined' ) {
			// Already Loaded
			return false;
		}
		else {
			History.initCore.initialized = true;
		}


		// ====================================================================
		// Options

		/**
		 * History.options
		 * Configurable options
		 */
		History.options = History.options||{};

		/**
		 * History.options.hashChangeInterval
		 * How long should the interval be before hashchange checks
		 */
		History.options.hashChangeInterval = History.options.hashChangeInterval || 100;

		/**
		 * History.options.safariPollInterval
		 * How long should the interval be before safari poll checks
		 */
		History.options.safariPollInterval = History.options.safariPollInterval || 500;

		/**
		 * History.options.doubleCheckInterval
		 * How long should the interval be before we perform a double check
		 */
		History.options.doubleCheckInterval = History.options.doubleCheckInterval || 500;

		/**
		 * History.options.storeInterval
		 * How long should we wait between store calls
		 */
		History.options.storeInterval = History.options.storeInterval || 1000;

		/**
		 * History.options.busyDelay
		 * How long should we wait between busy events
		 */
		History.options.busyDelay = History.options.busyDelay || 250;

		/**
		 * History.options.debug
		 * If true will enable debug messages to be logged
		 */
		History.options.debug = History.options.debug || false;

		/**
		 * History.options.initialTitle
		 * What is the title of the initial state
		 */
		History.options.initialTitle = History.options.initialTitle || document.title;


		// ====================================================================
		// Interval record

		/**
		 * History.intervalList
		 * List of intervals set, to be cleared when document is unloaded.
		 */
		History.intervalList = [];

		/**
		 * History.clearAllIntervals
		 * Clears all setInterval instances.
		 */
		History.clearAllIntervals = function(){
			var i, il = History.intervalList;
			if (typeof il !== "undefined" && il !== null) {
				for (i = 0; i < il.length; i++) {
					clearInterval(il[i]);
				}
				History.intervalList = null;
			}
		};


		// ====================================================================
		// Debug

		/**
		 * History.debug(message,...)
		 * Logs the passed arguments if debug enabled
		 */
		History.debug = function(){
			if ( (History.options.debug||false) ) {
				History.log.apply(History,arguments);
			}
		};

		/**
		 * History.log(message,...)
		 * Logs the passed arguments
		 */
		History.log = function(){
			// Prepare
			var
				consoleExists = !(typeof console === 'undefined' || typeof console.log === 'undefined' || typeof console.log.apply === 'undefined'),
				textarea = document.getElementById('log'),
				message,
				i,n,
				args,arg
				;

			// Write to Console
			if ( consoleExists ) {
				args = Array.prototype.slice.call(arguments);
				message = args.shift();
				if ( typeof console.debug !== 'undefined' ) {
					console.debug.apply(console,[message,args]);
				}
				else {
					console.log.apply(console,[message,args]);
				}
			}
			else {
				message = ("\n"+arguments[0]+"\n");
			}

			// Write to log
			for ( i=1,n=arguments.length; i<n; ++i ) {
				arg = arguments[i];
				if ( typeof arg === 'object' && typeof JSON !== 'undefined' ) {
					try {
						arg = JSON.stringify(arg);
					}
					catch ( Exception ) {
						// Recursive Object
					}
				}
				message += "\n"+arg+"\n";
			}

			// Textarea
			if ( textarea ) {
				textarea.value += message+"\n-----\n";
				textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
			}
			// No Textarea, No Console
			else if ( !consoleExists ) {
				alert(message);
			}

			// Return true
			return true;
		};


		// ====================================================================
		// Emulated Status

		/**
		 * History.getInternetExplorerMajorVersion()
		 * Get's the major version of Internet Explorer
		 * @return {integer}
		 * @license Public Domain
		 * @author Benjamin Arthur Lupton <contact@balupton.com>
		 * @author James Padolsey <https://gist.github.com/527683>
		 */
		History.getInternetExplorerMajorVersion = function(){
			var result = History.getInternetExplorerMajorVersion.cached =
					(typeof History.getInternetExplorerMajorVersion.cached !== 'undefined')
				?	History.getInternetExplorerMajorVersion.cached
				:	(function(){
						var v = 3,
								div = document.createElement('div'),
								all = div.getElementsByTagName('i');
						while ( (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->') && all[0] ) {}
						return (v > 4) ? v : false;
					})()
				;
			return result;
		};

		/**
		 * History.isInternetExplorer()
		 * Are we using Internet Explorer?
		 * @return {boolean}
		 * @license Public Domain
		 * @author Benjamin Arthur Lupton <contact@balupton.com>
		 */
		History.isInternetExplorer = function(){
			var result =
				History.isInternetExplorer.cached =
				(typeof History.isInternetExplorer.cached !== 'undefined')
					?	History.isInternetExplorer.cached
					:	Boolean(History.getInternetExplorerMajorVersion())
				;
			return result;
		};

		/**
		 * History.emulated
		 * Which features require emulating?
		 */
		History.emulated = {
			pushState: !Boolean(
				window.history && window.history.pushState && window.history.replaceState
				&& !(
					(/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent) /* disable for versions of iOS before version 4.3 (8F190) */
					|| (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
				)
			),
			hashChange: Boolean(
				!(('onhashchange' in window) || ('onhashchange' in document))
				||
				(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8)
			)
		};

		/**
		 * History.enabled
		 * Is History enabled?
		 */
		History.enabled = !History.emulated.pushState;

		/**
		 * History.bugs
		 * Which bugs are present
		 */
		History.bugs = {
			/**
			 * Safari 5 and Safari iOS 4 fail to return to the correct state once a hash is replaced by a `replaceState` call
			 * https://bugs.webkit.org/show_bug.cgi?id=56249
			 */
			setHash: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

			/**
			 * Safari 5 and Safari iOS 4 sometimes fail to apply the state change under busy conditions
			 * https://bugs.webkit.org/show_bug.cgi?id=42940
			 */
			safariPoll: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

			/**
			 * MSIE 6 and 7 sometimes do not apply a hash even it was told to (requiring a second call to the apply function)
			 */
			ieDoubleCheck: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8),

			/**
			 * MSIE 6 requires the entire hash to be encoded for the hashes to trigger the onHashChange event
			 */
			hashEscape: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 7)
		};

		/**
		 * History.isEmptyObject(obj)
		 * Checks to see if the Object is Empty
		 * @param {Object} obj
		 * @return {boolean}
		 */
		History.isEmptyObject = function(obj) {
			for ( var name in obj ) {
				return false;
			}
			return true;
		};

		/**
		 * History.cloneObject(obj)
		 * Clones a object and eliminate all references to the original contexts
		 * @param {Object} obj
		 * @return {Object}
		 */
		History.cloneObject = function(obj) {
			var hash,newObj;
			if ( obj ) {
				hash = JSON.stringify(obj);
				newObj = JSON.parse(hash);
			}
			else {
				newObj = {};
			}
			return newObj;
		};


		// ====================================================================
		// URL Helpers

		/**
		 * History.getRootUrl()
		 * Turns "http://mysite.com/dir/page.html?asd" into "http://mysite.com"
		 * @return {String} rootUrl
		 */
		History.getRootUrl = function(){
			// Create
			var rootUrl = document.location.protocol+'//'+(document.location.hostname||document.location.host);
			if ( document.location.port||false ) {
				rootUrl += ':'+document.location.port;
			}
			rootUrl += '/';

			// Return
			return rootUrl;
		};

		/**
		 * History.getBaseHref()
		 * Fetches the `href` attribute of the `<base href="...">` element if it exists
		 * @return {String} baseHref
		 */
		History.getBaseHref = function(){
			// Create
			var
				baseElements = document.getElementsByTagName('base'),
				baseElement = null,
				baseHref = '';

			// Test for Base Element
			if ( baseElements.length === 1 ) {
				// Prepare for Base Element
				baseElement = baseElements[0];
				baseHref = baseElement.href.replace(/[^\/]+$/,'');
			}

			// Adjust trailing slash
			baseHref = baseHref.replace(/\/+$/,'');
			if ( baseHref ) baseHref += '/';

			// Return
			return baseHref;
		};

		/**
		 * History.getBaseUrl()
		 * Fetches the baseHref or basePageUrl or rootUrl (whichever one exists first)
		 * @return {String} baseUrl
		 */
		History.getBaseUrl = function(){
			// Create
			var baseUrl = History.getBaseHref()||History.getBasePageUrl()||History.getRootUrl();

			// Return
			return baseUrl;
		};

		/**
		 * History.getPageUrl()
		 * Fetches the URL of the current page
		 * @return {String} pageUrl
		 */
		History.getPageUrl = function(){
			// Fetch
			var
				State = History.getState(false,false),
				stateUrl = (State||{}).url||document.location.href,
				pageUrl;

			// Create
			pageUrl = stateUrl.replace(/\/+$/,'').replace(/[^\/]+$/,function(part,index,string){
				return (/\./).test(part) ? part : part+'/';
			});

			// Return
			return pageUrl;
		};

		/**
		 * History.getBasePageUrl()
		 * Fetches the Url of the directory of the current page
		 * @return {String} basePageUrl
		 */
		History.getBasePageUrl = function(){
			// Create
			var basePageUrl = document.location.href.replace(/[#\?].*/,'').replace(/[^\/]+$/,function(part,index,string){
				return (/[^\/]$/).test(part) ? '' : part;
			}).replace(/\/+$/,'')+'/';

			// Return
			return basePageUrl;
		};

		/**
		 * History.getFullUrl(url)
		 * Ensures that we have an absolute URL and not a relative URL
		 * @param {string} url
		 * @param {Boolean} allowBaseHref
		 * @return {string} fullUrl
		 */
		History.getFullUrl = function(url,allowBaseHref){
			// Prepare
			var fullUrl = url, firstChar = url.substring(0,1);
			allowBaseHref = (typeof allowBaseHref === 'undefined') ? true : allowBaseHref;

			// Check
			if ( /[a-z]+\:\/\//.test(url) ) {
				// Full URL
			}
			else if ( firstChar === '/' ) {
				// Root URL
				fullUrl = History.getRootUrl()+url.replace(/^\/+/,'');
			}
			else if ( firstChar === '#' ) {
				// Anchor URL
				fullUrl = History.getPageUrl().replace(/#.*/,'')+url;
			}
			else if ( firstChar === '?' ) {
				// Query URL
				fullUrl = History.getPageUrl().replace(/[\?#].*/,'')+url;
			}
			else {
				// Relative URL
				if ( allowBaseHref ) {
					fullUrl = History.getBaseUrl()+url.replace(/^(\.\/)+/,'');
				} else {
					fullUrl = History.getBasePageUrl()+url.replace(/^(\.\/)+/,'');
				}
				// We have an if condition above as we do not want hashes
				// which are relative to the baseHref in our URLs
				// as if the baseHref changes, then all our bookmarks
				// would now point to different locations
				// whereas the basePageUrl will always stay the same
			}

			// Return
			return fullUrl.replace(/\#$/,'');
		};

		/**
		 * History.getShortUrl(url)
		 * Ensures that we have a relative URL and not a absolute URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.getShortUrl = function(url){
			// Prepare
			var shortUrl = url, baseUrl = History.getBaseUrl(), rootUrl = History.getRootUrl();

			// Trim baseUrl
			if ( History.emulated.pushState ) {
				// We are in a if statement as when pushState is not emulated
				// The actual url these short urls are relative to can change
				// So within the same session, we the url may end up somewhere different
				shortUrl = shortUrl.replace(baseUrl,'');
			}

			// Trim rootUrl
			shortUrl = shortUrl.replace(rootUrl,'/');

			// Ensure we can still detect it as a state
			if ( History.isTraditionalAnchor(shortUrl) ) {
				shortUrl = './'+shortUrl;
			}

			// Clean It
			shortUrl = shortUrl.replace(/^(\.\/)+/g,'./').replace(/\#$/,'');

			// Return
			return shortUrl;
		};


		// ====================================================================
		// State Storage

		/**
		 * History.store
		 * The store for all session specific data
		 */
		History.store = {};

		/**
		 * History.idToState
		 * 1-1: State ID to State Object
		 */
		History.idToState = History.idToState||{};

		/**
		 * History.stateToId
		 * 1-1: State String to State ID
		 */
		History.stateToId = History.stateToId||{};

		/**
		 * History.urlToId
		 * 1-1: State URL to State ID
		 */
		History.urlToId = History.urlToId||{};

		/**
		 * History.storedStates
		 * Store the states in an array
		 */
		History.storedStates = History.storedStates||[];

		/**
		 * History.savedStates
		 * Saved the states in an array
		 */
		History.savedStates = History.savedStates||[];

		/**
		 * History.noramlizeStore()
		 * Noramlize the store by adding necessary values
		 */
		History.normalizeStore = function(){
			History.store.idToState = History.store.idToState||{};
			History.store.urlToId = History.store.urlToId||{};
			History.store.stateToId = History.store.stateToId||{};
		};

		/**
		 * History.getState()
		 * Get an object containing the data, title and url of the current state
		 * @param {Boolean} friendly
		 * @param {Boolean} create
		 * @return {Object} State
		 */
		History.getState = function(friendly,create){
			// Prepare
			if ( typeof friendly === 'undefined' ) { friendly = true; }
			if ( typeof create === 'undefined' ) { create = true; }

			// Fetch
			var State = History.getLastSavedState();

			// Create
			if ( !State && create ) {
				State = History.createStateObject();
			}

			// Adjust
			if ( friendly ) {
				State = History.cloneObject(State);
				State.url = State.cleanUrl||State.url;
			}

			// Return
			return State;
		};

		/**
		 * History.getIdByState(State)
		 * Gets a ID for a State
		 * @param {State} newState
		 * @return {String} id
		 */
		History.getIdByState = function(newState){

			// Fetch ID
			var id = History.extractId(newState.url),
				str;
			
			if ( !id ) {
				// Find ID via State String
				str = History.getStateString(newState);
				if ( typeof History.stateToId[str] !== 'undefined' ) {
					id = History.stateToId[str];
				}
				else if ( typeof History.store.stateToId[str] !== 'undefined' ) {
					id = History.store.stateToId[str];
				}
				else {
					// Generate a new ID
					while ( true ) {
						id = (new Date()).getTime() + String(Math.random()).replace(/\D/g,'');
						if ( typeof History.idToState[id] === 'undefined' && typeof History.store.idToState[id] === 'undefined' ) {
							break;
						}
					}

					// Apply the new State to the ID
					History.stateToId[str] = id;
					History.idToState[id] = newState;
				}
			}

			// Return ID
			return id;
		};

		/**
		 * History.normalizeState(State)
		 * Expands a State Object
		 * @param {object} State
		 * @return {object}
		 */
		History.normalizeState = function(oldState){
			// Variables
			var newState, dataNotEmpty;

			// Prepare
			if ( !oldState || (typeof oldState !== 'object') ) {
				oldState = {};
			}

			// Check
			if ( typeof oldState.normalized !== 'undefined' ) {
				return oldState;
			}

			// Adjust
			if ( !oldState.data || (typeof oldState.data !== 'object') ) {
				oldState.data = {};
			}

			// ----------------------------------------------------------------

			// Create
			newState = {};
			newState.normalized = true;
			newState.title = oldState.title||'';
			newState.url = History.getFullUrl(History.unescapeString(oldState.url||document.location.href));
			newState.hash = History.getShortUrl(newState.url);
			newState.data = History.cloneObject(oldState.data);

			// Fetch ID
			newState.id = History.getIdByState(newState);

			// ----------------------------------------------------------------

			// Clean the URL
			newState.cleanUrl = newState.url.replace(/\??\&_suid.*/,'');
			newState.url = newState.cleanUrl;

			// Check to see if we have more than just a url
			dataNotEmpty = !History.isEmptyObject(newState.data);

			// Apply
			if ( newState.title || dataNotEmpty ) {
				// Add ID to Hash
				newState.hash = History.getShortUrl(newState.url).replace(/\??\&_suid.*/,'');
				if ( !/\?/.test(newState.hash) ) {
					newState.hash += '?';
				}
				newState.hash += '&_suid='+newState.id;
			}

			// Create the Hashed URL
			newState.hashedUrl = History.getFullUrl(newState.hash);

			// ----------------------------------------------------------------

			// Update the URL if we have a duplicate
			if ( (History.emulated.pushState || History.bugs.safariPoll) && History.hasUrlDuplicate(newState) ) {
				newState.url = newState.hashedUrl;
			}

			// ----------------------------------------------------------------

			// Return
			return newState;
		};

		/**
		 * History.createStateObject(data,title,url)
		 * Creates a object based on the data, title and url state params
		 * @param {object} data
		 * @param {string} title
		 * @param {string} url
		 * @return {object}
		 */
		History.createStateObject = function(data,title,url){
			// Hashify
			var State = {
				'data': data,
				'title': title,
				'url': url
			};

			// Expand the State
			State = History.normalizeState(State);

			// Return object
			return State;
		};

		/**
		 * History.getStateById(id)
		 * Get a state by it's UID
		 * @param {String} id
		 */
		History.getStateById = function(id){
			// Prepare
			id = String(id);

			// Retrieve
			var State = History.idToState[id] || History.store.idToState[id] || undefined;

			// Return State
			return State;
		};

		/**
		 * Get a State's String
		 * @param {State} passedState
		 */
		History.getStateString = function(passedState){
			// Prepare
			var State, cleanedState, str;

			// Fetch
			State = History.normalizeState(passedState);

			// Clean
			cleanedState = {
				data: State.data,
				title: passedState.title,
				url: passedState.url
			};

			// Fetch
			str = JSON.stringify(cleanedState);

			// Return
			return str;
		};

		/**
		 * Get a State's ID
		 * @param {State} passedState
		 * @return {String} id
		 */
		History.getStateId = function(passedState){
			// Prepare
			var State, id;
			
			// Fetch
			State = History.normalizeState(passedState);

			// Fetch
			id = State.id;

			// Return
			return id;
		};

		/**
		 * History.getHashByState(State)
		 * Creates a Hash for the State Object
		 * @param {State} passedState
		 * @return {String} hash
		 */
		History.getHashByState = function(passedState){
			// Prepare
			var State, hash;
			
			// Fetch
			State = History.normalizeState(passedState);

			// Hash
			hash = State.hash;

			// Return
			return hash;
		};

		/**
		 * History.extractId(url_or_hash)
		 * Get a State ID by it's URL or Hash
		 * @param {string} url_or_hash
		 * @return {string} id
		 */
		History.extractId = function ( url_or_hash ) {
			// Prepare
			var id,parts,url;

			// Extract
			parts = /(.*)\&_suid=([0-9]+)$/.exec(url_or_hash);
			url = parts ? (parts[1]||url_or_hash) : url_or_hash;
			id = parts ? String(parts[2]||'') : '';

			// Return
			return id||false;
		};

		/**
		 * History.isTraditionalAnchor
		 * Checks to see if the url is a traditional anchor or not
		 * @param {String} url_or_hash
		 * @return {Boolean}
		 */
		History.isTraditionalAnchor = function(url_or_hash){
			// Check
			var isTraditional = !(/[\/\?\.]/.test(url_or_hash));

			// Return
			return isTraditional;
		};

		/**
		 * History.extractState
		 * Get a State by it's URL or Hash
		 * @param {String} url_or_hash
		 * @return {State|null}
		 */
		History.extractState = function(url_or_hash,create){
			// Prepare
			var State = null, id, url;
			create = create||false;

			// Fetch SUID
			id = History.extractId(url_or_hash);
			if ( id ) {
				State = History.getStateById(id);
			}

			// Fetch SUID returned no State
			if ( !State ) {
				// Fetch URL
				url = History.getFullUrl(url_or_hash);

				// Check URL
				id = History.getIdByUrl(url)||false;
				if ( id ) {
					State = History.getStateById(id);
				}

				// Create State
				if ( !State && create && !History.isTraditionalAnchor(url_or_hash) ) {
					State = History.createStateObject(null,null,url);
				}
			}

			// Return
			return State;
		};

		/**
		 * History.getIdByUrl()
		 * Get a State ID by a State URL
		 */
		History.getIdByUrl = function(url){
			// Fetch
			var id = History.urlToId[url] || History.store.urlToId[url] || undefined;

			// Return
			return id;
		};

		/**
		 * History.getLastSavedState()
		 * Get an object containing the data, title and url of the current state
		 * @return {Object} State
		 */
		History.getLastSavedState = function(){
			return History.savedStates[History.savedStates.length-1]||undefined;
		};

		/**
		 * History.getLastStoredState()
		 * Get an object containing the data, title and url of the current state
		 * @return {Object} State
		 */
		History.getLastStoredState = function(){
			return History.storedStates[History.storedStates.length-1]||undefined;
		};

		/**
		 * History.hasUrlDuplicate
		 * Checks if a Url will have a url conflict
		 * @param {Object} newState
		 * @return {Boolean} hasDuplicate
		 */
		History.hasUrlDuplicate = function(newState) {
			// Prepare
			var hasDuplicate = false,
				oldState;

			// Fetch
			oldState = History.extractState(newState.url);

			// Check
			hasDuplicate = oldState && oldState.id !== newState.id;

			// Return
			return hasDuplicate;
		};

		/**
		 * History.storeState
		 * Store a State
		 * @param {Object} newState
		 * @return {Object} newState
		 */
		History.storeState = function(newState){
			// Store the State
			History.urlToId[newState.url] = newState.id;

			// Push the State
			History.storedStates.push(History.cloneObject(newState));

			// Return newState
			return newState;
		};

		/**
		 * History.isLastSavedState(newState)
		 * Tests to see if the state is the last state
		 * @param {Object} newState
		 * @return {boolean} isLast
		 */
		History.isLastSavedState = function(newState){
			// Prepare
			var isLast = false,
				newId, oldState, oldId;

			// Check
			if ( History.savedStates.length ) {
				newId = newState.id;
				oldState = History.getLastSavedState();
				oldId = oldState.id;

				// Check
				isLast = (newId === oldId);
			}

			// Return
			return isLast;
		};

		/**
		 * History.saveState
		 * Push a State
		 * @param {Object} newState
		 * @return {boolean} changed
		 */
		History.saveState = function(newState){
			// Check Hash
			if ( History.isLastSavedState(newState) ) {
				return false;
			}

			// Push the State
			History.savedStates.push(History.cloneObject(newState));

			// Return true
			return true;
		};

		/**
		 * History.getStateByIndex()
		 * Gets a state by the index
		 * @param {integer} index
		 * @return {Object}
		 */
		History.getStateByIndex = function(index){
			// Prepare
			var State = null;

			// Handle
			if ( typeof index === 'undefined' ) {
				// Get the last inserted
				State = History.savedStates[History.savedStates.length-1];
			}
			else if ( index < 0 ) {
				// Get from the end
				State = History.savedStates[History.savedStates.length+index];
			}
			else {
				// Get from the beginning
				State = History.savedStates[index];
			}

			// Return State
			return State;
		};


		// ====================================================================
		// Hash Helpers

		/**
		 * History.getHash()
		 * Gets the current document hash
		 * @return {string}
		 */
		History.getHash = function(){
			var hash = History.unescapeHash(document.location.hash);
			return hash;
		};

		/**
		 * History.unescapeString()
		 * Unescape a string
		 * @param {String} str
		 * @return {string}
		 */
		History.unescapeString = function(str){
			// Prepare
			var result = str,
				tmp;

			// Unescape hash
			while ( true ) {
				tmp = window.unescape(result);
				if ( tmp === result ) {
					break;
				}
				result = tmp;
			}

			// Return result
			return result;
		};

		/**
		 * History.unescapeHash()
		 * normalize and Unescape a Hash
		 * @param {String} hash
		 * @return {string}
		 */
		History.unescapeHash = function(hash){
			// Prepare
			var result = History.normalizeHash(hash);

			// Unescape hash
			result = History.unescapeString(result);

			// Return result
			return result;
		};

		/**
		 * History.normalizeHash()
		 * normalize a hash across browsers
		 * @return {string}
		 */
		History.normalizeHash = function(hash){
			// Prepare
			var result = hash.replace(/[^#]*#/,'').replace(/#.*/, '');

			// Return result
			return result;
		};

		/**
		 * History.setHash(hash)
		 * Sets the document hash
		 * @param {string} hash
		 * @return {History}
		 */
		History.setHash = function(hash,queue){
			// Prepare
			var adjustedHash, State, pageUrl;

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.setHash: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.setHash,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Log
			//History.debug('History.setHash: called',hash);

			// Prepare
			adjustedHash = History.escapeHash(hash);

			// Make Busy + Continue
			History.busy(true);

			// Check if hash is a state
			State = History.extractState(hash,true);
			if ( State && !History.emulated.pushState ) {
				// Hash is a state so skip the setHash
				//History.debug('History.setHash: Hash is a state so skipping the hash set with a direct pushState call',arguments);

				// PushState
				History.pushState(State.data,State.title,State.url,false);
			}
			else if ( document.location.hash !== adjustedHash ) {
				// Hash is a proper hash, so apply it

				// Handle browser bugs
				if ( History.bugs.setHash ) {
					// Fix Safari Bug https://bugs.webkit.org/show_bug.cgi?id=56249

					// Fetch the base page
					pageUrl = History.getPageUrl();

					// Safari hash apply
					History.pushState(null,null,pageUrl+'#'+adjustedHash,false);
				}
				else {
					// Normal hash apply
					document.location.hash = adjustedHash;
				}
			}

			// Chain
			return History;
		};

		/**
		 * History.escape()
		 * normalize and Escape a Hash
		 * @return {string}
		 */
		History.escapeHash = function(hash){
			// Prepare
			var result = History.normalizeHash(hash);

			// Escape hash
			result = window.escape(result);

			// IE6 Escape Bug
			if ( !History.bugs.hashEscape ) {
				// Restore common parts
				result = result
					.replace(/\%21/g,'!')
					.replace(/\%26/g,'&')
					.replace(/\%3D/g,'=')
					.replace(/\%3F/g,'?');
			}

			// Return result
			return result;
		};

		/**
		 * History.getHashByUrl(url)
		 * Extracts the Hash from a URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.getHashByUrl = function(url){
			// Extract the hash
			var hash = String(url)
				.replace(/([^#]*)#?([^#]*)#?(.*)/, '$2')
				;

			// Unescape hash
			hash = History.unescapeHash(hash);

			// Return hash
			return hash;
		};

		/**
		 * History.setTitle(title)
		 * Applies the title to the document
		 * @param {State} newState
		 * @return {Boolean}
		 */
		History.setTitle = function(newState){
			// Prepare
			var title = newState.title,
				firstState;

			// Initial
			if ( !title ) {
				firstState = History.getStateByIndex(0);
				if ( firstState && firstState.url === newState.url ) {
					title = firstState.title||History.options.initialTitle;
				}
			}

			// Apply
			try {
				document.getElementsByTagName('title')[0].innerHTML = title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
			}
			catch ( Exception ) { }
			document.title = title;

			// Chain
			return History;
		};


		// ====================================================================
		// Queueing

		/**
		 * History.queues
		 * The list of queues to use
		 * First In, First Out
		 */
		History.queues = [];

		/**
		 * History.busy(value)
		 * @param {boolean} value [optional]
		 * @return {boolean} busy
		 */
		History.busy = function(value){
			// Apply
			if ( typeof value !== 'undefined' ) {
				//History.debug('History.busy: changing ['+(History.busy.flag||false)+'] to ['+(value||false)+']', History.queues.length);
				History.busy.flag = value;
			}
			// Default
			else if ( typeof History.busy.flag === 'undefined' ) {
				History.busy.flag = false;
			}

			// Queue
			if ( !History.busy.flag ) {
				// Execute the next item in the queue
				clearTimeout(History.busy.timeout);
				var fireNext = function(){
					var i, queue, item;
					if ( History.busy.flag ) return;
					for ( i=History.queues.length-1; i >= 0; --i ) {
						queue = History.queues[i];
						if ( queue.length === 0 ) continue;
						item = queue.shift();
						History.fireQueueItem(item);
						History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
					}
				};
				History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
			}

			// Return
			return History.busy.flag;
		};

		/**
		 * History.busy.flag
		 */
		History.busy.flag = false;

		/**
		 * History.fireQueueItem(item)
		 * Fire a Queue Item
		 * @param {Object} item
		 * @return {Mixed} result
		 */
		History.fireQueueItem = function(item){
			return item.callback.apply(item.scope||History,item.args||[]);
		};

		/**
		 * History.pushQueue(callback,args)
		 * Add an item to the queue
		 * @param {Object} item [scope,callback,args,queue]
		 */
		History.pushQueue = function(item){
			// Prepare the queue
			History.queues[item.queue||0] = History.queues[item.queue||0]||[];

			// Add to the queue
			History.queues[item.queue||0].push(item);

			// Chain
			return History;
		};

		/**
		 * History.queue (item,queue), (func,queue), (func), (item)
		 * Either firs the item now if not busy, or adds it to the queue
		 */
		History.queue = function(item,queue){
			// Prepare
			if ( typeof item === 'function' ) {
				item = {
					callback: item
				};
			}
			if ( typeof queue !== 'undefined' ) {
				item.queue = queue;
			}

			// Handle
			if ( History.busy() ) {
				History.pushQueue(item);
			} else {
				History.fireQueueItem(item);
			}

			// Chain
			return History;
		};

		/**
		 * History.clearQueue()
		 * Clears the Queue
		 */
		History.clearQueue = function(){
			History.busy.flag = false;
			History.queues = [];
			return History;
		};


		// ====================================================================
		// IE Bug Fix

		/**
		 * History.stateChanged
		 * States whether or not the state has changed since the last double check was initialised
		 */
		History.stateChanged = false;

		/**
		 * History.doubleChecker
		 * Contains the timeout used for the double checks
		 */
		History.doubleChecker = false;

		/**
		 * History.doubleCheckComplete()
		 * Complete a double check
		 * @return {History}
		 */
		History.doubleCheckComplete = function(){
			// Update
			History.stateChanged = true;

			// Clear
			History.doubleCheckClear();

			// Chain
			return History;
		};

		/**
		 * History.doubleCheckClear()
		 * Clear a double check
		 * @return {History}
		 */
		History.doubleCheckClear = function(){
			// Clear
			if ( History.doubleChecker ) {
				clearTimeout(History.doubleChecker);
				History.doubleChecker = false;
			}

			// Chain
			return History;
		};

		/**
		 * History.doubleCheck()
		 * Create a double check
		 * @return {History}
		 */
		History.doubleCheck = function(tryAgain){
			// Reset
			History.stateChanged = false;
			History.doubleCheckClear();

			// Fix IE6,IE7 bug where calling history.back or history.forward does not actually change the hash (whereas doing it manually does)
			// Fix Safari 5 bug where sometimes the state does not change: https://bugs.webkit.org/show_bug.cgi?id=42940
			if ( History.bugs.ieDoubleCheck ) {
				// Apply Check
				History.doubleChecker = setTimeout(
					function(){
						History.doubleCheckClear();
						if ( !History.stateChanged ) {
							//History.debug('History.doubleCheck: State has not yet changed, trying again', arguments);
							// Re-Attempt
							tryAgain();
						}
						return true;
					},
					History.options.doubleCheckInterval
				);
			}

			// Chain
			return History;
		};


		// ====================================================================
		// Safari Bug Fix

		/**
		 * History.safariStatePoll()
		 * Poll the current state
		 * @return {History}
		 */
		History.safariStatePoll = function(){
			// Poll the URL

			// Get the Last State which has the new URL
			var
				urlState = History.extractState(document.location.href),
				newState;

			// Check for a difference
			if ( !History.isLastSavedState(urlState) ) {
				newState = urlState;
			}
			else {
				return;
			}

			// Check if we have a state with that url
			// If not create it
			if ( !newState ) {
				//History.debug('History.safariStatePoll: new');
				newState = History.createStateObject();
			}

			// Apply the New State
			//History.debug('History.safariStatePoll: trigger');
			History.Adapter.trigger(window,'popstate');

			// Chain
			return History;
		};


		// ====================================================================
		// State Aliases

		/**
		 * History.back(queue)
		 * Send the browser history back one item
		 * @param {Integer} queue [optional]
		 */
		History.back = function(queue){
			//History.debug('History.back: called', arguments);

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.back: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.back,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Make Busy + Continue
			History.busy(true);

			// Fix certain browser bugs that prevent the state from changing
			History.doubleCheck(function(){
				History.back(false);
			});

			// Go back
			history.go(-1);

			// End back closure
			return true;
		};

		/**
		 * History.forward(queue)
		 * Send the browser history forward one item
		 * @param {Integer} queue [optional]
		 */
		History.forward = function(queue){
			//History.debug('History.forward: called', arguments);

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.forward: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.forward,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Make Busy + Continue
			History.busy(true);

			// Fix certain browser bugs that prevent the state from changing
			History.doubleCheck(function(){
				History.forward(false);
			});

			// Go forward
			history.go(1);

			// End forward closure
			return true;
		};

		/**
		 * History.go(index,queue)
		 * Send the browser history back or forward index times
		 * @param {Integer} queue [optional]
		 */
		History.go = function(index,queue){
			//History.debug('History.go: called', arguments);

			// Prepare
			var i;

			// Handle
			if ( index > 0 ) {
				// Forward
				for ( i=1; i<=index; ++i ) {
					History.forward(queue);
				}
			}
			else if ( index < 0 ) {
				// Backward
				for ( i=-1; i>=index; --i ) {
					History.back(queue);
				}
			}
			else {
				throw new Error('History.go: History.go requires a positive or negative integer passed.');
			}

			// Chain
			return History;
		};


		// ====================================================================
		// HTML5 State Support

		// Non-Native pushState Implementation
		if ( History.emulated.pushState ) {
			/*
			 * Provide Skeleton for HTML4 Browsers
			 */

			// Prepare
			var emptyFunction = function(){};
			History.pushState = History.pushState||emptyFunction;
			History.replaceState = History.replaceState||emptyFunction;
		} // History.emulated.pushState

		// Native pushState Implementation
		else {
			/*
			 * Use native HTML5 History API Implementation
			 */

			/**
			 * History.onPopState(event,extra)
			 * Refresh the Current State
			 */
			History.onPopState = function(event,extra){
				// Prepare
				var stateId = false, newState = false, currentHash, currentState;

				// Reset the double check
				History.doubleCheckComplete();

				// Check for a Hash, and handle apporiatly
				currentHash	= History.getHash();
				if ( currentHash ) {
					// Expand Hash
					currentState = History.extractState(currentHash||document.location.href,true);
					if ( currentState ) {
						// We were able to parse it, it must be a State!
						// Let's forward to replaceState
						//History.debug('History.onPopState: state anchor', currentHash, currentState);
						History.replaceState(currentState.data, currentState.title, currentState.url, false);
					}
					else {
						// Traditional Anchor
						//History.debug('History.onPopState: traditional anchor', currentHash);
						History.Adapter.trigger(window,'anchorchange');
						History.busy(false);
					}

					// We don't care for hashes
					History.expectedStateId = false;
					return false;
				}

				// Ensure
				stateId = History.Adapter.extractEventData('state',event,extra) || false;

				// Fetch State
				if ( stateId ) {
					// Vanilla: Back/forward button was used
					newState = History.getStateById(stateId);
				}
				else if ( History.expectedStateId ) {
					// Vanilla: A new state was pushed, and popstate was called manually
					newState = History.getStateById(History.expectedStateId);
				}
				else {
					// Initial State
					newState = History.extractState(document.location.href);
				}

				// The State did not exist in our store
				if ( !newState ) {
					// Regenerate the State
					newState = History.createStateObject(null,null,document.location.href);
				}

				// Clean
				History.expectedStateId = false;

				// Check if we are the same state
				if ( History.isLastSavedState(newState) ) {
					// There has been no change (just the page's hash has finally propagated)
					//History.debug('History.onPopState: no change', newState, History.savedStates);
					History.busy(false);
					return false;
				}

				// Store the State
				History.storeState(newState);
				History.saveState(newState);

				// Force update of the title
				History.setTitle(newState);

				// Fire Our Event
				History.Adapter.trigger(window,'statechange');
				History.busy(false);

				// Return true
				return true;
			};
			History.Adapter.bind(window,'popstate',History.onPopState);

			/**
			 * History.pushState(data,title,url)
			 * Add a new State to the history object, become it, and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.pushState = function(data,title,url,queue){
				//History.debug('History.pushState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.pushState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.pushState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy + Continue
				History.busy(true);

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Check it
				if ( History.isLastSavedState(newState) ) {
					// Won't be a change
					History.busy(false);
				}
				else {
					// Store the newState
					History.storeState(newState);
					History.expectedStateId = newState.id;

					// Push the newState
					history.pushState(newState.id,newState.title,newState.url);

					// Fire HTML5 Event
					History.Adapter.trigger(window,'popstate');
				}

				// End pushState closure
				return true;
			};

			/**
			 * History.replaceState(data,title,url)
			 * Replace the State and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.replaceState = function(data,title,url,queue){
				//History.debug('History.replaceState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.replaceState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.replaceState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy + Continue
				History.busy(true);

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Check it
				if ( History.isLastSavedState(newState) ) {
					// Won't be a change
					History.busy(false);
				}
				else {
					// Store the newState
					History.storeState(newState);
					History.expectedStateId = newState.id;

					// Push the newState
					history.replaceState(newState.id,newState.title,newState.url);

					// Fire HTML5 Event
					History.Adapter.trigger(window,'popstate');
				}

				// End replaceState closure
				return true;
			};

		} // !History.emulated.pushState


		// ====================================================================
		// Initialise

		/**
		 * Load the Store
		 */
		if ( sessionStorage ) {
			// Fetch
			try {
				History.store = JSON.parse(sessionStorage.getItem('History.store'))||{};
			}
			catch ( err ) {
				History.store = {};
			}

			// Normalize
			History.normalizeStore();
		}
		else {
			// Default Load
			History.store = {};
			History.normalizeStore();
		}

		/**
		 * Clear Intervals on exit to prevent memory leaks
		 */
		History.Adapter.bind(window,"beforeunload",History.clearAllIntervals);
		History.Adapter.bind(window,"unload",History.clearAllIntervals);

		/**
		 * Create the initial State
		 */
		History.saveState(History.storeState(History.extractState(document.location.href,true)));

		/**
		 * Bind for Saving Store
		 */
		if ( sessionStorage ) {
			// When the page is closed
			History.onUnload = function(){
				// Prepare
				var	currentStore, item;

				// Fetch
				try {
					currentStore = JSON.parse(sessionStorage.getItem('History.store'))||{};
				}
				catch ( err ) {
					currentStore = {};
				}

				// Ensure
				currentStore.idToState = currentStore.idToState || {};
				currentStore.urlToId = currentStore.urlToId || {};
				currentStore.stateToId = currentStore.stateToId || {};

				// Sync
				for ( item in History.idToState ) {
					if ( !History.idToState.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.idToState[item] = History.idToState[item];
				}
				for ( item in History.urlToId ) {
					if ( !History.urlToId.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.urlToId[item] = History.urlToId[item];
				}
				for ( item in History.stateToId ) {
					if ( !History.stateToId.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.stateToId[item] = History.stateToId[item];
				}

				// Update
				History.store = currentStore;
				History.normalizeStore();

				// Store
				sessionStorage.setItem('History.store',JSON.stringify(currentStore));
			};

			// For Internet Explorer
			History.intervalList.push(setInterval(History.onUnload,History.options.storeInterval));
			
			// For Other Browsers
			History.Adapter.bind(window,'beforeunload',History.onUnload);
			History.Adapter.bind(window,'unload',History.onUnload);
			
			// Both are enabled for consistency
		}

		// Non-Native pushState Implementation
		if ( !History.emulated.pushState ) {
			// Be aware, the following is only for native pushState implementations
			// If you are wanting to include something for all browsers
			// Then include it above this if block

			/**
			 * Setup Safari Fix
			 */
			if ( History.bugs.safariPoll ) {
				History.intervalList.push(setInterval(History.safariStatePoll, History.options.safariPollInterval));
			}

			/**
			 * Ensure Cross Browser Compatibility
			 */
			if ( navigator.vendor === 'Apple Computer, Inc.' || (navigator.appCodeName||'') === 'Mozilla' ) {
				/**
				 * Fix Safari HashChange Issue
				 */

				// Setup Alias
				History.Adapter.bind(window,'hashchange',function(){
					History.Adapter.trigger(window,'popstate');
				});

				// Initialise Alias
				if ( History.getHash() ) {
					History.Adapter.onDomLoad(function(){
						History.Adapter.trigger(window,'hashchange');
					});
				}
			}

		} // !History.emulated.pushState


	}; // History.initCore

	// Try and Initialise History
	History.init();

})(window);
var dust = {};

function getGlobal(){
  return (function(){
    return this.dust;
  }).call(null);
}

(function(dust) {

dust.helpers = {};

dust.cache = {};

dust.register = function(name, tmpl) {
  if (!name) return;
  dust.cache[name] = tmpl;
};

dust.render = function(name, context, callback) {
  var chunk = new Stub(callback).head;
  dust.load(name, chunk, Context.wrap(context)).end();
};

dust.stream = function(name, context) {
  var stream = new Stream();
  dust.nextTick(function() {
    dust.load(name, stream.head, Context.wrap(context)).end();
  });
  return stream;
};

dust.renderSource = function(source, context, callback) {
  return dust.compileFn(source)(context, callback);
};

dust.compileFn = function(source, name) {
  var tmpl = dust.loadSource(dust.compile(source, name));
  return function(context, callback) {
    var master = callback ? new Stub(callback) : new Stream();
    dust.nextTick(function() {
      tmpl(master.head, Context.wrap(context)).end();
    });
    return master;
  };
};

dust.load = function(name, chunk, context) {
  var tmpl = dust.cache[name];
  if (tmpl) {
    return tmpl(chunk, context);
  } else {
    if (dust.onLoad) {
      return chunk.map(function(chunk) {
        dust.onLoad(name, function(err, src) {
          if (err) return chunk.setError(err);
          if (!dust.cache[name]) dust.loadSource(dust.compile(src, name));
          dust.cache[name](chunk, context).end();
        });
      });
    }
    return chunk.setError(new Error("Template Not Found: " + name));
  }
};

dust.loadSource = function(source, path) {
  return eval(source);
};

if (Array.isArray) {
  dust.isArray = Array.isArray;
} else {
  dust.isArray = function(arr) {
    return Object.prototype.toString.call(arr) == "[object Array]";
  };
}

dust.nextTick = (function() {
  if (typeof process !== "undefined") {
    return process.nextTick;
  } else {
    return function(callback) {
      setTimeout(callback,0);
    };
  }
} )();

dust.isEmpty = function(value) {
  if (dust.isArray(value) && !value.length) return true;
  if (value === 0) return false;
  return (!value);
};

// apply the filter chain and return the output string
dust.filter = function(string, auto, filters) {
  if (filters) {
    for (var i=0, len=filters.length; i<len; i++) {
      var name = filters[i];
      if (name === "s") {
        auto = null;
      }
      // fail silently for invalid filters
      else if (typeof dust.filters[name] === 'function') {
        string = dust.filters[name](string);
      }
    }
  }
  // by default always apply the h filter, unless asked to unescape with |s
  if (auto) {
    string = dust.filters[auto](string);
  }
  return string;
};

dust.filters = {
  h: function(value) { return dust.escapeHtml(value); },
  j: function(value) { return dust.escapeJs(value); },
  u: encodeURI,
  uc: encodeURIComponent,
  js: function(value) { if (!JSON) { return value; } return JSON.stringify(value); },
  jp: function(value) { if (!JSON) { return value; } return JSON.parse(value); }
};

function Context(stack, global, blocks) {
  this.stack  = stack;
  this.global = global;
  this.blocks = blocks;
}

dust.makeBase = function(global) {
  return new Context(new Stack(), global);
};

Context.wrap = function(context) {
  if (context instanceof Context) {
    return context;
  }
  return new Context(new Stack(context));
};

Context.prototype.get = function(key) {
  var ctx = this.stack, value;

  while(ctx) {
    if (ctx.isObject) {
      value = ctx.head[key];
      if (!(value === undefined)) {
        return value;
      }
    }
    ctx = ctx.tail;
  }
  return this.global ? this.global[key] : undefined;
};

Context.prototype.getPath = function(cur, down) {
  var ctx = this.stack,
      len = down.length;

  if (cur && len === 0) return ctx.head;
  ctx = ctx.head;
  var i = 0;
  while(ctx && i < len) {
    ctx = ctx[down[i]];
    i++;
  }
  return ctx;
};

Context.prototype.push = function(head, idx, len) {
  return new Context(new Stack(head, this.stack, idx, len), this.global, this.blocks);
};

Context.prototype.rebase = function(head) {
  return new Context(new Stack(head), this.global, this.blocks);
};

Context.prototype.current = function() {
  return this.stack.head;
};

Context.prototype.getBlock = function(key, chk, ctx) {
  if (typeof key === "function") {
    key = key(chk, ctx).data;
    chk.data = "";
  }

  var blocks = this.blocks;

  if (!blocks) return;
  var len = blocks.length, fn;
  while (len--) {
    fn = blocks[len][key];
    if (fn) return fn;
  }
};

Context.prototype.shiftBlocks = function(locals) {
  var blocks = this.blocks,
      newBlocks;

  if (locals) {
    if (!blocks) {
      newBlocks = [locals];
    } else {
      newBlocks = blocks.concat([locals]);
    }
    return new Context(this.stack, this.global, newBlocks);
  }
  return this;
};

function Stack(head, tail, idx, len) {
  this.tail = tail;
  this.isObject = !dust.isArray(head) && head && typeof head === "object";
  this.head = head;
  this.index = idx;
  this.of = len;
}

function Stub(callback) {
  this.head = new Chunk(this);
  this.callback = callback;
  this.out = '';
}

Stub.prototype.flush = function() {
  var chunk = this.head;

  while (chunk) {
    if (chunk.flushable) {
      this.out += chunk.data;
    } else if (chunk.error) {
      this.callback(chunk.error);
      this.flush = function() {};
      return;
    } else {
      return;
    }
    chunk = chunk.next;
    this.head = chunk;
  }
  this.callback(null, this.out);
};

function Stream() {
  this.head = new Chunk(this);
}

Stream.prototype.flush = function() {
  var chunk = this.head;

  while(chunk) {
    if (chunk.flushable) {
      this.emit('data', chunk.data);
    } else if (chunk.error) {
      this.emit('error', chunk.error);
      this.flush = function() {};
      return;
    } else {
      return;
    }
    chunk = chunk.next;
    this.head = chunk;
  }
  this.emit('end');
};

Stream.prototype.emit = function(type, data) {
  if (!this.events) return false;
  var handler = this.events[type];
  if (!handler) return false;
  if (typeof handler == 'function') {
    handler(data);
  } else {
    var listeners = handler.slice(0);
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i](data);
    }
  }
};

Stream.prototype.on = function(type, callback) {
  if (!this.events) {
    this.events = {};
  }
  if (!this.events[type]) {
    this.events[type] = callback;
  } else if(typeof this.events[type] === 'function') {
    this.events[type] = [this.events[type], callback];
  } else {
    this.events[type].push(callback);
  }
  return this;
};

Stream.prototype.pipe = function(stream) {
  this.on("data", function(data) {
    stream.write(data, "utf8");
  }).on("end", function() {
    stream.end();
  }).on("error", function(err) {
    stream.error(err);
  });
  return this;
};

function Chunk(root, next, taps) {
  this.root = root;
  this.next = next;
  this.data = '';
  this.flushable = false;
  this.taps = taps;
}

Chunk.prototype.write = function(data) {
  var taps  = this.taps;

  if (taps) {
    data = taps.go(data);
  }
  this.data += data;
  return this;
};

Chunk.prototype.end = function(data) {
  if (data) {
    this.write(data);
  }
  this.flushable = true;
  this.root.flush();
  return this;
};

Chunk.prototype.map = function(callback) {
  var cursor = new Chunk(this.root, this.next, this.taps),
      branch = new Chunk(this.root, cursor, this.taps);

  this.next = branch;
  this.flushable = true;
  callback(branch);
  return cursor;
};

Chunk.prototype.tap = function(tap) {
  var taps = this.taps;

  if (taps) {
    this.taps = taps.push(tap);
  } else {
    this.taps = new Tap(tap);
  }
  return this;
};

Chunk.prototype.untap = function() {
  this.taps = this.taps.tail;
  return this;
};

Chunk.prototype.render = function(body, context) {
  return body(this, context);
};

Chunk.prototype.reference = function(elem, context, auto, filters) {
  if (typeof elem === "function") {
    elem.isFunction = true;
    // Changed the function calling to use apply with the current context to make sure 
    // that "this" is wat we expect it to be inside the function
    elem = elem.apply(context.current(), [this, context, null, {auto: auto, filters: filters}]);
    if (elem instanceof Chunk) {
      return elem;
    }
  }
  if (!dust.isEmpty(elem)) {
    return this.write(dust.filter(elem, auto, filters));
  } else {
    return this;
  }
};

Chunk.prototype.section = function(elem, context, bodies, params) {
  // anonymous functions
  if (typeof elem === "function") {
    elem = elem.apply(context.current(), [this, context, bodies, params]);
    // functions that return chunks are assumed to have handled the body and/or have modified the chunk
    // use that return value as the current chunk and go to the next method in the chain
    if (elem instanceof Chunk) {
      return elem;
    }
  }
  var body = bodies.block,
      skip = bodies['else'];

  // a.k.a Inline parameters in the Dust documentations
  if (params) {
    context = context.push(params);
  }

  /*
  Dust's default behavior is to enumerate over the array elem, passing each object in the array to the block.
  When elem resolves to a value or object instead of an array, Dust sets the current context to the value 
  and renders the block one time.
  */
  //non empty array is truthy, empty array is falsy
  if (dust.isArray(elem)) {
     if (body) {
      var len = elem.length, chunk = this;
      if (len > 0) {
        // any custom helper can blow up the stack 
        // and store a flattened context, guard defensively
        if(context.stack.head) {
         context.stack.head['$len'] = len;
        }
        for (var i=0; i<len; i++) {
          if(context.stack.head) {
           context.stack.head['$idx'] = i;
          }
          chunk = body(chunk, context.push(elem[i], i, len));
        }
        if(context.stack.head) {
         context.stack.head['$idx'] = undefined;
         context.stack.head['$len'] = undefined;
        }
        return chunk;
      } 
      else if (skip) {
         return skip(this, context);
      }
     }
   }
   // true is truthy but does not change context
   else if (elem  === true) {
     if (body) { 
        return body(this, context);
     }
   }
   // everything that evaluates to true are truthy ( e.g. Non-empty strings and Empty objects are truthy. )
   // zero is truthy
   // for anonymous functions that did not returns a chunk, truthiness is evaluated based on the return value
   //
   else if (elem || elem === 0) {
     if (body) return body(this, context.push(elem));
   // nonexistent, scalar false value, scalar empty string, null,
   // undefined are all falsy
  } else if (skip) {
     return skip(this, context);
   }  
  return this;
};

Chunk.prototype.exists = function(elem, context, bodies) {
  var body = bodies.block,
      skip = bodies['else'];

  if (!dust.isEmpty(elem)) {
    if (body) return body(this, context);
  } else if (skip) {
    return skip(this, context);
  }
  return this;
};

Chunk.prototype.notexists = function(elem, context, bodies) {
  var body = bodies.block,
      skip = bodies['else'];

  if (dust.isEmpty(elem)) {
    if (body) return body(this, context);
  } else if (skip) {
    return skip(this, context);
  }
  return this;
};

Chunk.prototype.block = function(elem, context, bodies) {
  var body = bodies.block;

  if (elem) {
    body = elem;
  }

  if (body) {
    return body(this, context);
  }
  return this;
};

Chunk.prototype.partial = function(elem, context, params) {
  var partialContext;
  if (params){
    //put the params context second to match what section does. {.} matches the current context without parameters
    // start with an empty context
    partialContext = dust.makeBase(context.global);
    partialContext.blocks = context.blocks;
    if (context.stack && context.stack.tail){
      // grab the stack(tail) off of the previous context if we have it
      partialContext.stack = context.stack.tail;
    }
    //put params on
    partialContext = partialContext.push(params);
    //reattach the head
    partialContext = partialContext.push(context.stack.head);
  } else {
    partialContext = context;
  }
  if (typeof elem === "function") {
    return this.capture(elem, partialContext, function(name, chunk) {
      dust.load(name, chunk, partialContext).end();
    });
  }
  return dust.load(elem, this, partialContext);
};

Chunk.prototype.helper = function(name, context, bodies, params) {
  // handle invalid helpers, similar to invalid filters
  if( dust.helpers[name]){
   return dust.helpers[name](this, context, bodies, params);
  } else {
    return this;
  }
};

Chunk.prototype.capture = function(body, context, callback) {
  return this.map(function(chunk) {
    var stub = new Stub(function(err, out) {
      if (err) {
        chunk.setError(err);
      } else {
        callback(out, chunk);
      }
    });
    body(stub.head, context).end();
  });
};

Chunk.prototype.setError = function(err) {
  this.error = err;
  this.root.flush();
  return this;
};

function Tap(head, tail) {
  this.head = head;
  this.tail = tail;
}

Tap.prototype.push = function(tap) {
  return new Tap(tap, this);
};

Tap.prototype.go = function(value) {
  var tap = this;

  while(tap) {
    value = tap.head(value);
    tap = tap.tail;
  }
  return value;
};

var HCHARS = new RegExp(/[&<>\"\']/),
    AMP    = /&/g,
    LT     = /</g,
    GT     = />/g,
    QUOT   = /\"/g,
    SQUOT  = /\'/g;

dust.escapeHtml = function(s) {
  if (typeof s === "string") {
    if (!HCHARS.test(s)) {
      return s;
    }
    return s.replace(AMP,'&amp;').replace(LT,'&lt;').replace(GT,'&gt;').replace(QUOT,'&quot;').replace(SQUOT, '&#39;');
  }
  return s;
};

var BS = /\\/g,
    CR = /\r/g,
    LS = /\u2028/g,
    PS = /\u2029/g,
    NL = /\n/g,
    LF = /\f/g,
    SQ = /'/g,
    DQ = /"/g,
    TB = /\t/g;

dust.escapeJs = function(s) {
  if (typeof s === "string") {
    return s
      .replace(BS, '\\\\')
      .replace(DQ, '\\"')
      .replace(SQ, "\\'")
      .replace(CR, '\\r')
      .replace(LS, '\\u2028')
      .replace(PS, '\\u2029')
      .replace(NL, '\\n')
      .replace(LF, '\\f')
      .replace(TB, "\\t");
  }
  return s;
};

})(dust);

if (typeof exports !== "undefined") {
  if (typeof process !== "undefined") {
      require('./server')(dust);
  }
  module.exports = dust;
}
(function(dust){

// Note: all error conditions are logged to console and failed silently

/* make a safe version of console if it is not available
 * currently supporting:
 *   _console.log
 * */
var _console = (typeof console !== 'undefined')? console: {
  log: function(){
     /* a noop*/
   }
};

function isSelect(context) {
  var value = context.current();
  return typeof value === "object" && value.isSelect === true;
}

// Utility method : toString() equivalent for functions
function jsonFilter(key, value) {
  if (typeof value === "function") {
    return value.toString();
  }
  return value;
}

// Utility method: to invoke the given filter operation such as eq/gt etc
function filter(chunk, context, bodies, params, filterOp) {
  params = params || {};
  var body = bodies.block,
      actualKey,
      expectedValue,
      filterOpType = params.filterOpType || '';
  // when @eq, @lt etc are used as standalone helpers, key is required and hence check for defined
  if ( typeof params.key !== "undefined") {
    actualKey = dust.helpers.tap(params.key, chunk, context);
  }
  else if (isSelect(context)) {
    actualKey = context.current().selectKey;
    //  supports only one of the blocks in the select to be selected
    if (context.current().isResolved) {
      filterOp = function() { return false; };
    }
  }
  else {
    _console.log ("No key specified for filter in:" + filterOpType + " helper ");
    return chunk;
  }
  expectedValue = dust.helpers.tap(params.value, chunk, context);
  // coerce both the actualKey and expectedValue to the same type for equality and non-equality compares
  if (filterOp(coerce(expectedValue, params.type, context), coerce(actualKey, params.type, context))) {
    if (isSelect(context)) {
      context.current().isResolved = true;
    }
    // we want helpers without bodies to fail gracefully so check it first
    if(body) {
     return chunk.render(body, context);
    }
    else {
      _console.log( "Missing body block in the " + filterOpType + " helper ");
      return chunk;
    }
   }
   else if (bodies['else']) {
    return chunk.render(bodies['else'], context);
  }
  return chunk;
}

function coerce (value, type, context) {
  if (value) {
    switch (type || typeof(value)) {
      case 'number': return +value;
      case 'string': return String(value);
      case 'boolean': {
        value = (value === 'false' ? false : value);
        return Boolean(value);
      }
      case 'date': return new Date(value);
      case 'context': return context.get(value);
    }
  }

  return value;
}

var helpers = {

  // Utility helping to resolve dust references in the given chunk
  // uses the Chunk.render method to resolve value
  /*
   Reference resolution rules:
   if value exists in JSON:
    "" or '' will evaluate to false, boolean false, null, or undefined will evaluate to false,
    numeric 0 evaluates to true, so does, string "0", string "null", string "undefined" and string "false". 
    Also note that empty array -> [] is evaluated to false and empty object -> {} and non-empty object are evaluated to true
    The type of the return value is string ( since we concatenate to support interpolated references 

   if value does not exist in JSON and the input is a single reference: {x}
     dust render emits empty string, and we then return false   
     
   if values does not exist in JSON and the input is interpolated references : {x} < {y}
     dust render emits <  and we return the partial output 
     
  */
  "tap": function( input, chunk, context ){
    // return given input if there is no dust reference to resolve
    var output = input;
    // dust compiles a string/reference such as {foo} to function, 
    if( typeof input === "function"){
      // just a plain function (a.k.a anonymous functions) in the context, not a dust `body` function created by the dust compiler
      if( input.isFunction === true ){
        output = input();
      } else {
        output = '';
        chunk.tap(function(data){
           output += data;
           return '';
          }).render(input, context).untap();
        if( output === '' ){
          output = false;
        }
      }
    }
   return output;
  },

  "sep": function(chunk, context, bodies) {
    var body = bodies.block;
    if (context.stack.index === context.stack.of - 1) {
      return chunk;
    }
    if(body) {
     return bodies.block(chunk, context);
    }
    else {
     return chunk;
    }
  },

  "idx": function(chunk, context, bodies) {
    var body = bodies.block;
     if(body) {
       return bodies.block(chunk, context.push(context.stack.index));
     }
     else {
       return chunk;
     }
  },

  /**
   * contextDump helper
   * @param key specifies how much to dump.
   * "current" dumps current context. "full" dumps the full context stack.
   * @param to specifies where to write dump output.
   * Values can be "console" or "output". Default is output.
   */
  "contextDump": function(chunk, context, bodies, params) {
    var p = params || {},
      to = p.to || 'output',
      key = p.key || 'current',
      dump;
    to = dust.helpers.tap(to, chunk, context),
    key = dust.helpers.tap(key, chunk, context);
    if (key === 'full') {
      dump = JSON.stringify(context.stack, jsonFilter, 2);
    }
    else {
      dump = JSON.stringify(context.stack.head, jsonFilter, 2);
    }
    if (to === 'console') {
      _console.log(dump);
      return chunk;
    }
    else {
      return chunk.write(dump);
    }
  },
  /**
   if helper for complex evaluation complex logic expressions.
   Note : #1 if helper fails gracefully when there is no body block nor else block
          #2 Undefined values and false values in the JSON need to be handled specially with .length check
             for e.g @if cond=" '{a}'.length && '{b}'.length" is advised when there are chances of the a and b been
             undefined or false in the context
          #3 Use only when the default ? and ^ dust operators and the select fall short in addressing the given logic,
             since eval executes in the global scope
          #4 All dust references are default escaped as they are resolved, hence eval will block malicious scripts in the context
             Be mindful of evaluating a expression that is passed through the unescape filter -> |s
   @param cond, either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. cond="2>3"
                a dust reference is also enclosed in double quotes, e.g. cond="'{val}'' > 3"
    cond argument should evaluate to a valid javascript expression
   **/

  "if": function( chunk, context, bodies, params ){
    var body = bodies.block,
        skip = bodies['else'];
    if( params && params.cond){
      var cond = params.cond;
      cond = dust.helpers.tap(cond, chunk, context);
      // eval expressions with given dust references
      if(eval(cond)){
       if(body) {
        return chunk.render( bodies.block, context );
       }
       else {
         _console.log( "Missing body block in the if helper!" );
         return chunk;
       }
      }
      if(skip){
       return chunk.render( bodies['else'], context );
      }
    }
    // no condition
    else {
      _console.log( "No condition given in the if helper!" );
    }
    return chunk;
  },

  /**
   * math helper
   * @param key is the value to perform math against
   * @param method is the math method,  is a valid string supported by math helper like mod, add, subtract
   * @param operand is the second value needed for operations like mod, add, subtract, etc.
   * @param round is a flag to assure that an integer is returned
   */
  "math": function ( chunk, context, bodies, params ) {
    //key and method are required for further processing
    if( params && typeof params.key !== "undefined" && params.method ){
      var key  = params.key,
          method = params.method,
          // operand can be null for "abs", ceil and floor
          operand = params.operand,
          round = params.round,
          mathOut = null,
          operError = function(){_console.log("operand is required for this math method"); return null;};
      key  = dust.helpers.tap(key, chunk, context);
      operand = dust.helpers.tap(operand, chunk, context);
      //  TODO: handle  and tests for negatives and floats in all math operations
      switch(method) {
        case "mod":
          if(operand === 0 || operand === -0) {
            _console.log("operand for divide operation is 0/-0: expect Nan!");
          }
          mathOut = parseFloat(key) %  parseFloat(operand);
          break;
        case "add":
          mathOut = parseFloat(key) + parseFloat(operand);
          break;
        case "subtract":
          mathOut = parseFloat(key) - parseFloat(operand);
          break;
        case "multiply":
          mathOut = parseFloat(key) * parseFloat(operand);
          break;
        case "divide":
         if(operand === 0 || operand === -0) {
           _console.log("operand for divide operation is 0/-0: expect Nan/Infinity!");
         }
          mathOut = parseFloat(key) / parseFloat(operand);
          break;
        case "ceil":
          mathOut = Math.ceil(parseFloat(key));
          break;
        case "floor":
          mathOut = Math.floor(parseFloat(key));
          break;
        case "round":
          mathOut = Math.round(parseFloat(key));
          break;
        case "abs":
          mathOut = Math.abs(parseFloat(key));
          break;
        default:
          _console.log( "method passed is not supported" );
     }

      if (mathOut !== null){
        if (round) {
          mathOut = Math.round(mathOut);
        }
        if (bodies && bodies.block) {
          // with bodies act like the select helper with mathOut as the key
          // like the select helper bodies['else'] is meaningless and is ignored
          return chunk.render(bodies.block, context.push({ isSelect: true, isResolved: false, selectKey: mathOut }));
        } else {
          // self closing math helper will return the calculated output
          return chunk.write(mathOut);
        }
       } else {
        return chunk;
      }
    }
    // no key parameter and no method
    else {
      _console.log( "Key is a required parameter for math helper along with method/operand!" );
    }
    return chunk;
  },
   /**
   select helperworks with one of the eq/gt/gte/lt/lte/default providing the functionality
   of branching conditions
   @param key,  ( required ) either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   **/
  "select": function(chunk, context, bodies, params) {
    var body = bodies.block;
    // key is required for processing, hence check for defined
    if( params && typeof params.key !== "undefined"){
      // returns given input as output, if the input is not a dust reference, else does a context lookup
      var key = dust.helpers.tap(params.key, chunk, context);
      // bodies['else'] is meaningless and is ignored
      if( body ) {
       return chunk.render(bodies.block, context.push({ isSelect: true, isResolved: false, selectKey: key }));
      }
      else {
       _console.log( "Missing body block in the select helper ");
       return chunk;
      }
    }
    // no key
    else {
      _console.log( "No key given in the select helper!" );
    }
    return chunk;
  },

  /**
   eq helper compares the given key is same as the expected value
   It can be used standalone or in conjunction with select for multiple branching
   @param key,  The actual key to be compared ( optional when helper used in conjunction with select)
                either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param value, The expected value to compare to, when helper is used standalone or in conjunction with select
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   Note : use type="number" when comparing numeric
   **/
  "eq": function(chunk, context, bodies, params) {
    if(params) {
      params.filterOpType = "eq";
    }
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual === expected; });
  },

  /**
   ne helper compares the given key is not the same as the expected value
   It can be used standalone or in conjunction with select for multiple branching
   @param key,  The actual key to be compared ( optional when helper used in conjunction with select)
                either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param value, The expected value to compare to, when helper is used standalone or in conjunction with select
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   Note : use type="number" when comparing numeric
   **/
  "ne": function(chunk, context, bodies, params) {
    if(params) {
      params.filterOpType = "ne";
      return filter(chunk, context, bodies, params, function(expected, actual) { return actual !== expected; });
    }
   return chunk;
  },

  /**
   lt helper compares the given key is less than the expected value
   It can be used standalone or in conjunction with select for multiple branching
   @param key,  The actual key to be compared ( optional when helper used in conjunction with select)
                either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param value, The expected value to compare to, when helper is used standalone  or in conjunction with select
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   Note : use type="number" when comparing numeric
   **/
  "lt": function(chunk, context, bodies, params) {
     if(params) {
       params.filterOpType = "lt";
       return filter(chunk, context, bodies, params, function(expected, actual) { return actual < expected; });
     }
  },

  /**
   lte helper compares the given key is less or equal to the expected value
   It can be used standalone or in conjunction with select for multiple branching
   @param key,  The actual key to be compared ( optional when helper used in conjunction with select)
                either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param value, The expected value to compare to, when helper is used standalone or in conjunction with select
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   Note : use type="number" when comparing numeric
  **/
  "lte": function(chunk, context, bodies, params) {
     if(params) {
       params.filterOpType = "lte";
       return filter(chunk, context, bodies, params, function(expected, actual) { return actual <= expected; });
     }
    return chunk;
  },


  /**
   gt helper compares the given key is greater than the expected value
   It can be used standalone or in conjunction with select for multiple branching
   @param key,  The actual key to be compared ( optional when helper used in conjunction with select)
                either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param value, The expected value to compare to, when helper is used standalone  or in conjunction with select
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   Note : use type="number" when comparing numeric
   **/
  "gt": function(chunk, context, bodies, params) {
    // if no params do no go further
    if(params) {
      params.filterOpType = "gt";
      return filter(chunk, context, bodies, params, function(expected, actual) { return actual > expected; });
    }
    return chunk;
  },

 /**
   gte helper, compares the given key is greater than or equal to the expected value
   It can be used standalone or in conjunction with select for multiple branching
   @param key,  The actual key to be compared ( optional when helper used in conjunction with select)
                either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param value, The expected value to compare to, when helper is used standalone or in conjunction with select
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   Note : use type="number" when comparing numeric
  **/
  "gte": function(chunk, context, bodies, params) {
     if(params) {
      params.filterOpType = "gte";
      return filter(chunk, context, bodies, params, function(expected, actual) { return actual >= expected; });
     }
    return chunk; 
  },

  // to be used in conjunction with the select helper
  // TODO: fix the helper to do nothing when used standalone
  "default": function(chunk, context, bodies, params) {
    // does not require any params
     if(params) {
        params.filterOpType = "default";
      }
     return filter(chunk, context, bodies, params, function(expected, actual) { return true; });
  },

  /**
  * size helper prints the size of the given key
  * Note : size helper is self closing and does not support bodies
  * @param key, the element whose size is returned
  */
  "size": function( chunk, context, bodies, params ) {
    var key, value=0, nr, k;
    params = params || {};
    key = params.key;
    if (!key || key === true) { //undefined, null, "", 0
      value = 0;
    }
    else if(dust.isArray(key)) { //array
      value = key.length;
    }
    else if (!isNaN(parseFloat(key)) && isFinite(key)) { //numeric values
      value = key;
    }
    else if (typeof key  === "object") { //object test
      //objects, null and array all have typeof ojbect...
      //null and array are already tested so typeof is sufficient http://jsperf.com/isobject-tests
      nr = 0;
      for(k in key){
        if(Object.hasOwnProperty.call(key,k)){
          nr++;
        }
      }
      value = nr;
    } else {
      value = (key + '').length; //any other value (strings etc.)
    }
    return chunk.write(value);
  }
  
  
};

dust.helpers = helpers;

})(typeof exports !== 'undefined' ? module.exports = require('dustjs-linkedin') : dust);

define('snap.Registry',function(snap) {

    var Registry = function() {};

    snap.extend(Registry,{

        eidx : 1,
        oidx : 1,

        objects:{},
        aliases:{},
        elements:{},

        eid : function() {
            return 'e0-' + this.eidx++;
        },

        oid : function() {
            return 'o' + this.oidx++;
        },

        //> public Object exists(String oid)
        exists : function(oid) {
            return this.objects[oid];
        },

        //> public Object object(String oid)
        object : function(oid) {
            var self = this,entry = self.objects[oid] || self.aliases[oid];
            return entry?entry.object:null;
        },

        //> public void alias(Object object,String alias)
        alias : function(object,alias) {
            var self = this,oid = object.oid;
            var entry = self.objects[oid] || (self.objects[oid] = {object:object,aliases:[]});
            self.aliases[alias] = entry;entry.aliases.push(alias);
        },

        element : function(element) {
            var elem = element.jquery?element[0]:element;
            if (elem && !elem.id) elem.id = this.eid();
            return elem;
        },

        //> public void register(Object object,Object? element)
        register : function(object,element) {
            var self = this,oid = object.oid || (object.oid = self.oid());
            var entry = self.objects[oid];self.objects[oid] = entry?entry:{object:object,aliases:[]};
            if (element) self.elements[object.oid] = self.element(element);
            if (object.alias) self.alias(object,object.alias);
        },

        //> public void destroy(Object object)
        destroy : function(object) {
            var self = this,oid = object.oid;
            var entry = self.objects[oid],aliases = entry?entry.aliases:[];
            for (var idx = 0,alias;(alias = aliases[idx]);idx++) delete self.aliases[alias];
            delete self.objects[oid];delete self.elements[oid];
            if (object.destroy) object.destroy();
        },

        //> public void update()
        update : function() {
            var self = this;
            var objects = self.objects,elements = self.elements;
            for (var oid in elements) {
                var entry = objects[oid],object = entry.object,element = elements[oid];
                if (!object.detached && element && document.getElementById(element.id) == null) self.destroy(object);
            }
        },

        //> private void unload(Event event)
        unload : function(event) {
            var self = this,objects = self.objects;
            for (var oid in objects) self.destroy(objects[oid].object);
        }

    });

    snap.eid = Registry.eid.bind(Registry);
    snap.oid = Registry.oid.bind(Registry);

    snap.register = Registry.register.bind(Registry);
    snap.destroy = Registry.destroy.bind(Registry);

    //$(window).bind('unload',Registry.unload.bind(Registry));
    //$(document).bind('ajaxComplete',Registry.update.bind(Registry));

    return Registry;

});

snap.require('snap.Registry');

define('snap.Layout',function(snap) {

    //> public Layout(Object? config)
    var Layout = function(config) {

        var self = this;snap.extend(self,config);
        self.container.subscribe('resize',self.resize,self);

        self.target = self.container.getTarget();
        self.children = self.container.children;

        self.render();

    };

    snap.extend(Layout.prototype,{

        //> protected void render()
        render : function() {
        },

        //> public void addComponent(Object component,boolean? defer)
        addComponent : function(component,defer) {

            var self = this,elem = component.elem,parent = elem.parent();
            if (elem.length && !parent.length) self.target.append(elem);
            if (component.autosize) self.auto = component;

            if (self.ready && !defer) self.layout();

        },

        //> public void removeComponent(Object component,boolean? defer)
        removeComponent : function(component,defer) {

            var self = this,target = self.target,elem = component.elem;
            if (target && elem.length) elem.remove();

            if (self.ready && !defer) self.layout();

        },

        template : function(config) {
            return $(snap.fragment(this.constructor,config || {}));
        },

        autosize : function(auto) {
            var self = this,height = self.target.height();
            for (var node = self.children.fwd;(node);node = node.siblings.fwd)
                height -= (node != auto)?node.elem.outerHeight(true):0;
            auto.resize({height:height});
        },

        //> public resize(Object message,Object object) {
        resize : function resize(message,object) {
            this.layout();
        },

        validate : function(force) {

            var self = this,target = self.target,width = target[0].offsetWidth,height = target[0].offsetHeight;
            self.dirty = force || (((width > 0) && (width != self.width)) || ((height > 0) && (height != self.height)));

            self.ready = true;self.width = width;self.height = height;
            if (self.auto) self.autosize(self.auto);

            return self;

        },

        //> public void layout(boolean force)
        layout : function(force) {

            var self = this.validate(force);
            if (!self.dirty || !self.children.fwd) return;

            for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
                node.resize({},force);
            }

        }

    });

    return Layout;

});

(function($){

    var frame = {top:0,right:0,bottom:0,left:0};
    var rules = {margins:'margin-*',borders:'border-*-width',padding:'padding-*'};

    var widths = {left:0,right:0};
    var heights = {top:0,bottom:0};

    var dimens = {width:widths,height:heights};

    $.each(rules,function(rule) {
        var pattern = this,values = rules[rule] = {};
        for (var name in frame) values[name] = pattern.replace('*',name);
    });

    var getFrameValues = function(elem,frame,rules,dimen) {

        frame[dimen] = 0;
        for (var name in dimens[dimen]) {
            var value = elem.css(rules[name]);
            frame[name] = value.match(/px/)?parseInt(value):0;
            frame[dimen] += frame[name];
        }

    };

    var getFrame = function(elem,frame,dimen) {
        for (var name in rules) getFrameValues(elem,frame[name] = frame[name] || {},rules[name],dimen);
        frame[dimen] = frame.borders[dimen] + frame.padding[dimen];
        return frame;
    };

    var frameOffset = function(name,offset) {
        this.css(name,offset);
    };

    var frameSize = function(name,size,margins) {
        var frame = getFrame(this,{},name);
        this.css(name,size - frame[name] - (margins?frame.margins[name]:0));
    };

    $.fn.frame = function() {
        var frame = getFrame(this,{},'width');
        return getFrame(this,frame,'height');
    };

    $.fn.layout = function(dimens,margins) {

        for (var name in dimens) {
            if (name.match(/top|left/)) frameOffset.call(this,name,dimens[name],margins);
            else if (name.match(/width|height/)) frameSize.call(this,name,dimens[name],margins);
        }

        return this;

    };

})($);

define('snap.Observable',function(snap) {

    var Registry = snap.require('snap.Registry');

    //> public Observable(Object? config)
    var Observable = function(config) {
        var self = this;snap.extend(self.config = self.config || {},config);
        snap.extend(self,config);snap.register(self);self.listeners = {'global':[]};
    };

    snap.extend(Observable.prototype,{

        splice : function(listeners,idx) {
            listeners.splice(idx,1);
            return false;
        },

        validate : function(listener) {
            var self = this,scope = listener.scope;
            if (!scope.oid || Registry.exists(scope.oid)) return listener;
            //else snap.log('debug','Remove listener',self.constructor.getName(),scope.constructor.getName(),scope.oid,listener.type);
            return null;
        },

        dispatch : function(key,message,object,bubble) {

            var self = this,type = message.type;
            var listeners = self.listeners[key] || [],result;
            for (var idx = 0,len = listeners.length;(idx < len);idx++) {
                var listener = listeners[idx],scope = listener.scope;
                var valid = self.validate(listener) || self.splice(listeners,idx--,len--);
                var response = (valid && type.match(listener.type))?listener.func.call(scope,message,object):undefined;
                if (snap.isDefined(response)) result = response;
                if (result === false) break;
            }

            if (listeners.length <= 0) delete self.listeners[key];

            var parent = bubble && (result !== false) && self.parent;
            if (parent) result = parent.dispatch(key,message,object,bubble);

            return result;

        },

        //> public Object publish(String type,Object? object,bubble)
        publish : function(type,object,bubble) {
            var self = this,message = {source:self,type:type};
            var result = self.dispatch(type,message,object,bubble);
            return (result === false)?result:self.dispatch('global',message,object,bubble);
        },

        //> public void subscribe(String type,Function func,Object? scope)
        subscribe : function(type,func,scope) {
            var self = this,key = (type instanceof RegExp)?'global':type;
            var listeners = self.listeners[key] || (self.listeners[key] = []);
            listeners.push({type:type,func:func,scope:scope || self});
        },

        //> public void unsubscribe(String type,Function func,Object? scope)
        unsubscribe : function(type,func,scope) {

            var self = this,key = (type instanceof RegExp)?'global':type;
            var listeners = self.listeners[key] || [];

            for (var idx = 0,listener;(listener = listeners[idx]);idx++) {
                if (scope && (listener.scope !== scope)) continue;
                else if (func && (listener.func !== func)) continue;
                else { listeners.splice(idx,1); break;}
            }

            if (listeners.length <= 0) delete self.listeners[key];

        },

        //> public void destroy()
        destroy : function() {
            //snap.log('debug','Destroy',this.constructor.getName(),this.oid);
        }

    });

    return Observable;

});

define('snap.Messaging',function(snap) {

    //> public Messaging(Object? config)
    var Messaging = function(config) {
        var self = this;Messaging.channels[config.name] = self;
        Messaging.superclass.constructor.call(self,config);
    };

    snap.inherit(Messaging,'snap.Observable');
    snap.extend(Messaging.prototype,{

        //> public Object publish(String type,Object object,Object scope)
        publish : function(type,object,scope) {
            var self = this,message = {source:scope,type:type};
            var result = self.dispatch(type,message,object,false);
            return (result === false)?result:self.dispatch('global',message,object,false);
        }

    });

    snap.extend(Messaging,{

        channels : {},

        channel : function(name) {
            return this.channels[name] || (this.channels[name] = new Messaging({name:name}));
        }

    });

    var global = Messaging.channel('*');

    snap.publish = global.publish.bind(global);

    snap.subscribe = global.subscribe.bind(global);
    snap.unsubscribe = global.unsubscribe.bind(global);

    return Messaging;

});

snap.require('snap.Messaging');

window.ebayContent = window.ebayContent || {};

define('snap.Content',function(snap) {

    var pattern = /\$\{([^\}]*)\}/g;

    var Content = snap.extend(function(){},{

        eval : function(context,path) {
            var self = this,keys = path.split('.');
            var key = keys.shift(),context = context[key];
            while (context && (key = keys.shift())) context = context[key];
            return context;
        },

        token : function(context,match,key) {
            return this.eval(context,key);
        },

        render : function(content,context) {
            var self = this,token = self.token.bind(self,context);
            return content?content.replace(pattern,token):'';
        },

        content : function(path) {
            return this.eval(ebayContent,path);
        },

        get : function(path,context) {
            var self = this,content = self.content(path);
            return (content && context)?self.render(content,context):content || '';
        }

    });

    return Content;

});




define('snap.Context',function(snap) {

    var TYPE = 0,EID = 1,CONFIG = 2,CHILDREN = 3;

    var Context = function() {};
    snap.extend(Context.prototype,{

        process : function(type) {

            var self = this,global = self.global,queue = global.queue,current;
            queue.parent = queue.current;queue.push(current = queue.current = [type.getName(),0,0,0]);

            type.template(self.current(),self);

            if (queue.parent || (!current[CONFIG])) queue.pop();
            queue.current = queue.parent;queue.parent = queue[queue.length - 2];

            return global.chunk;

        },

        render : function(template,helpers) {

            var self = this,global = self.global;
            var queue = global.queue,current = queue.current;
            if (helpers) snap.extend(self.global,helpers);

            var config = self.current();current[EID] = config.eid = config.eid || snap.eid();
            if (!document.getElementById(config.eid)) return global.chunk.partial(template?template:current[TYPE],self);

            var nodes = config.children || [],widget = global.widget,chk = global.chunk;
            for (var idx = 0,node;(node = nodes[idx]);idx++) widget(chk,self.rebase(node));

        },

        queue : function(config) {
            var self = this,global = self.global,queue = global.queue,current = queue.current,parent = queue.parent;
            if ((current[CONFIG] = config || self.current()) && parent) (parent[CHILDREN] || (parent[CHILDREN] = [])).push(current);
            delete current[CONFIG].eid;
        }

    });

    var context = dust.makeBase({});
    snap.extend(context.constructor.prototype,Context.prototype);

    return Context;

});




define('snap.Templates',function(snap) {

    var TYPE = 0,EID = 1,CONFIG = 2,CHILDREN = 3;

    var Content = snap.require('snap.Content');
    var Context = snap.require('snap.Context');

    var Registry = snap.require('snap.Registry');

    var Templates = snap.extend(function() {},{

        exists : function(name) {
            return dust.cache[name];
        },

        //> public void register(String name,Function template)
        register : function(name,template) {
            dust.register(name,template);
        },

        widget : function(chk,ctx,bodies,params) {

            var config = ctx.current();
            if (config.elem && config.elem.length) return;
            else if (!config.elem) delete config.oid;

            var tid = (params?params.tid:null) || ctx.get('tid'),type;
            if (type = snap.find(tid)) return ctx.process(type);
            else return chk.partial(tid,ctx);

        },

        widgets : function(chk,ctx,bodies,params) {
            return chk.section(ctx.current(),ctx,{block:ctx.global.widget},params);
        },

        handler : function(ctx,err,out) {
            var global = ctx.global;global.error = err;global.output = out;
            if (global.error) throw new Error(global.error);
        },

        context : function(type,config,helpers) {
            var self = this,tid = snap.isFunction(type)?type.getName():type,context = dust.makeBase({}).push(config);
            snap.extend(context.global,{eid:snap.eid,widget:self.widget.bind(self),widgets:self.widgets.bind(self),content:self.content.bind(self),tid:tid});
            if (helpers) snap.extend(context.global,helpers);
            return context;
        },

        process : function(chk,ctx) {

            var self = this,current = ctx.current();
            ctx.global.chunk = chk;ctx.global.queue = [];
            if (!snap.isArray(current)) return self.widget(chk,ctx);
            else for (var idx = 0;(idx < current.length);idx++) self.widget(chk,ctx.push(current[idx]));

            return chk;

        },

        render : function(type,config,helpers) {

            var self = this,ctx = self.context(type,config,helpers);
            dust.render('snap.Processor',ctx,self.handler.bind(self,ctx));

            var global = ctx.global,queue = global.queue;
            var fragment = $('<div style="display:none"/>').html(global.output).prependTo(document.body);

            var widgets = Templates.load(queue);fragment.children().detach();fragment.remove();
            return (widgets.length > 1)?widgets:widgets[0];

        },

        fragment : function(type,config,helpers) {

            var json = snap.isString(config);
            if (json) config = JSON.parse(config);

            var self = this,ctx = self.context(type,config,helpers);
            dust.render('snap.Processor',ctx,self.handler.bind(self,ctx));

            var global = ctx.global,queue = global.queue,output = global.output;
            return json?{html:output,json:JSON.stringify(queue)}:output;

        },

        content : function(chk,ctx,bodies,params) {
            var path= params.path,context = params.context;
            context = context?ctx.get(context):ctx.current();
            return chk.write(Content.get(path,context));
        },

        load : function(widgets) {

            var self = this,widget,instance;
            for (var idx = 0;(widget = widgets[idx]);idx++) {

                var children = widget[CHILDREN];
                if (children) self.load(children);

                var type = snap.require(widget[TYPE]);
                var config = widget[CONFIG];config.eid = '#' + widget[EID];
                if (children) config.children = children;

                if (instance = Registry.object(config.oid)) instance.elem = $(config.eid);
                else instance = new type(config);

                widgets[idx] = instance;
                delete config.eid;

            }

            return widgets;

        }

    });

    var processor = Templates.process.bind(Templates)
    Templates.register('snap.Processor',processor);

    return Templates;

});

var Templates = snap.require('snap.Templates');

snap.render = Templates.render.bind(Templates);
snap.fragment = Templates.fragment.bind(Templates);

snap.load = Templates.load.bind(Templates);


define('snap.Component',function(snap) {

    var Templates = snap.require('snap.Templates');
    var Draggable = snap.require('snap.Draggable');

    //> public Component(Object? config)
    var Component = function(config) {

        var self = this;self.siblings = {fwd:null,bwd:null};
        Component.superclass.constructor.call(self,config);

        self.render(self.target);

    };

    snap.inherit(Component,'snap.Observable');
    snap.extend(Component.prototype,{

        classes:{},styles:{},draggable:false,

        //> protected void render(Object target)
        render : function(target) {

            var self = this;self.template();
            if (self.draggable) Component.mixin(self,Draggable);

            if (self.classes.elem) self.elem.addClass(self.classes.elem);
            if (self.styles.elem) self.elem.css(self.styles.elem);

            var parent = snap.elem(target);
            if (parent && parent.length) self.elem.appendTo(parent);

            snap.register(self,self.elem);
            self.elem.attr('oid',self.oid);

        },

        template : function() {
            var self = this;self.elem = self.elem || $(self.eid);
            if (self.elem.length <= 0) snap.render(self.constructor,self);
        },

        destroy : function() {
            var self = this;self.elem.remove();
            Component.superclass.destroy.call(self);
        },

        detach : function(detached) {
            this.detached = detached;
        },

        resize : function(size,force) {
            this.elem.layout(size);
            this.layout(force);
        },

        //> public void layout(boolean force)
        layout : function(force) {
            this.publish('layout');
        }

    });

    snap.extend(Component,{

        mixin : function(target,type,config) {
            var mixin = type.prototype;
            for (var name in mixin) if (!target[name]) target[name] = mixin[name];
            mixin.constructor.call(target,config);
        },

        template : function(config,context) {
            var template = this.getName(),exists = Templates.exists(template);
            context.render(exists?template:Component.getName());
            context.queue();
        }

    });

    return Component;

});

define('snap.Draggable',function(snap) {

    //> public Draggable(Object? config)
    var Draggable = function(config) {

        var self = this,draggable = self.elem.attr('draggable');
        if (snap.isDefined(draggable)) return;

        self.elem.attr({draggable:'true'});

        self.elem.bind('dragstart',self.onDragStart.bind(self));
        self.elem.bind('dragmove',self.onDragMove.bind(self));
        self.elem.bind('dragstop',self.onDragStop.bind(self));

    };

    snap.extend(Draggable.prototype,{

        onDragStart : function(event) {
            event.originalEvent.dataTransfer.setData('Text',this.oid);
        },

        onDragMove : function(event) {
        },

        onDragStop : function(event) {
        }

    });

    return Draggable;

});

define('snap.Container',function(snap) {

    var Layout = snap.require('snap.Layout');

    var Registry = snap.require('snap.Registry');
    var Droppable = snap.require('snap.Droppable');

    var createManager = function(self,object) {
        var manager = snap.require(snap.isObject(object)?object.name:object);
        return self.manager = new manager(snap.extend(object.config || {},{container:self}));
    };

    //> public constructs(Object? config)
    var Container = function(config) {

        var self = this;Container.superclass.constructor.call(self,config);
        snap.extend(self.children = self.children || [],{fwd:null,bwd:null,map:{}});
        if (self.droppable) Container.mixin(self,Droppable);

        self.getManager();
        self.appendChildren(self.children);

    };

    snap.inherit(Container,'snap.Component');
    snap.extend(Container.prototype,{

        manager : 'snap.Layout',droppable:false,

        //> public Object getTarget()
        getTarget : function() {
            return this.elem;
        },

        //> public Object getManager()
        getManager : function() {
            return (this.manager instanceof Layout)?this.manager:createManager(this,this.manager);
        },

        //> public void appendChildren(Object[] nodes)
        appendChildren : function(nodes) {

            for (var self = this,idx = 0,node;(node = nodes[idx]);idx++) {
                node = Registry.object(snap.isString(node)?node:node.oid);
                if (node) self.appendChild(nodes[idx] = node,true,true);
            }

            self.layout();

        },

        //> public Object getChild(String cid)
        getChild : function(cid) {
            return this.children.map[cid];
        },

        //> public Object appendChild(Object node,boolean? defer,boolean? render)
        appendChild : function(node,defer,render) {

            var self = this;

            var children = self.children;
            var siblings = node.siblings;

            var bwd = children.bwd;children.bwd = node;
            var fwd = (bwd?bwd.siblings:children).fwd = node;

            if (!render) self.children.push(node);

            children.map[node.cid || node.oid] = node;
            node.parent = self;node.detached = self.detached;
            siblings.bwd = bwd;siblings.fwd = null;

            self.manager.addComponent(node,defer);

            return node;

        },

        //> public Object insertBefore(Object node,Object? before)
        insertBefore : function(node,before) {

            var self = this;

            var children = self.children;
            var siblings = node.siblings;

            var bwd = before.siblings.bwd;
            if (!bwd) return self.appendChild(node);

            var fwd = before.siblings.fwd;
            if (fwd) fwd.siblings.fwd = node;

            var index = $.inArray(before,children);
            if (index >= 0) children.splice(index,0,node);

            children.map[node.cid || node.oid] = node;
            node.parent = self;node.detached = self.detached;
            siblings.bwd = bwd;siblings.fwd = fwd;

            self.manager.addComponent(node);

            return node;

        },

        //> public void removeChildren()
        removeChildren : function() {
            var self = this,children = self.children,node;
            while (node = children.fwd) self.removeChild(node,true);
            self.layout();
        },

        //> public Object removeChild(Object node,boolean? defer)
        removeChild : function(node,defer) {

            var self = this;

            var children = self.children;
            var siblings = node.siblings;

            var index = $.inArray(node,children);
            if (index >= 0) children.splice(index,1);

            (siblings.bwd?siblings.bwd.siblings:children).fwd = siblings.fwd;
            (siblings.fwd?siblings.fwd.siblings:children).bwd = siblings.bwd;

            self.manager.removeComponent(node,defer);

            delete children.map[node.cid || node.oid];
            node.parent = siblings.fwd = siblings.bwd = null;
            delete node.detached;

            return node;

        },

        //> public Object replaceChild(Object replace,Object node)
        replaceChild : function(replace,node) {

            var self = this,children = self.children;
            if (replace.parent !== self) return null;

            var index = $.inArray(replace,children);
            if (index >= 0) self.children[index] = node;

            var siblings = replace.siblings;

            var bwd = siblings.bwd;(bwd?bwd.siblings:children).fwd = node;node.siblings.bwd = bwd;
            var fwd = siblings.fwd;(fwd?fwd.siblings:children).bwd = node;node.siblings.fwd = fwd;

            delete children.map[replace.cid || replace.oid];children.map[node.cid || node.oid] = node;
            node.parent = self;replace.parent = replace.fwd = replace.bwd = null;
            delete replace.detached;

            return replace;

        },

        detach : function(detached) {
            var self = this;self.detached = detached;
            for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
                node.detach(detached);
            }
        },

        //> public void layout(boolean force)
        layout : function(force) {
            this.manager.layout(force);
            this.publish('layout');
        }

    });

    return Container;

});

define('snap.Droppable',function(snap) {

    var Registry = snap.require('snap.Registry');

    //> public constructs(Object? config)
    var Droppable = function(config) {

        var self = this,target = self.getTarget();
        target.bind('dragover',self.onDragOver.bind(self));
        target.bind('dragenter',self.onDragEnter.bind(self));

        target.bind('drop',self.onDrop.bind(self));

    };

    snap.extend(Droppable.prototype,{

        getDropped : function(event) {
            var self = this,dataTransfer = event.originalEvent.dataTransfer;
            return Registry.object(dataTransfer.getData('Text'));
        },

        onDragOver : function(event) {
            event.preventDefault();
            return false;
        },

        onDragEnter : function(event) {
            event.preventDefault();
            return false;
        },

        onDrop : function(event) {
            event.preventDefault();
        }

    });

    return Droppable;

});

define('snap.anchor.Anchor',function(snap) {

    //> public Anchor(Object? config)
    var Anchor = function(config) {
        var self = this;Anchor.superclass.constructor.call(self,config);
        self.elem.bind('click',self.onClick.bind(self));
    };

    snap.inherit(Anchor,'snap.Component');
    snap.extend(Anchor.prototype,{

        onClick : function(event) {
            return this.publish('click');
        }

    });

    return Anchor;

});

define('snap.button.Button',function(snap) {

    //> public Button(Object? config)
    var Button = function(config) {
        var self = this;Button.superclass.constructor.call(self,config);
        if ($.browser.msie && ($.browser.version >= 9)) self.elem.addClass('ie');
        self.elem.bind('click',self.onClick.bind(self));
    };

    snap.inherit(Button,'snap.Component');
    snap.extend(Button.prototype,{

        classes:{elem:'blue lrg'},

        onClick : function(event) {
            if (this.href) window.location = this.href;
            else return this.publish('click');
        }

    });

    return Button;

});

define('snap.calendar.Calendar',function(snap) {

    var Window = snap.require('snap.window.Window');

    var months = 'January,February,March,April,May,June,July,August,September,October,November,December'.split(',');
    var monthdays = '31,28,31,30,31,30,31,31,30,31,30,31'.split(',');

    var dateRegEx = /^\d{1,2}\/\d{1,2}\/\d{2}|\d{4}$/;
    var dateFormat = 'mm/dd/yyyy';

    //> public Calendar(Object? config)
    var Calendar = function(config) {

        var self = this,today = new Date();
        self.today = new Date(today.getFullYear(),today.getMonth(),today.getDate());

        Calendar.superclass.constructor.call(self,config);
        self.elem.bind('mousedown',self.onMouseDown.bind(self));

        self.scroller = $('<div class="scrlr"/>').appendTo(self.elem);
        self.prev = $('<div class="prev"><div class="arrows"/></div>').appendTo(self.elem).bind('click',self.onPrevScroll.bind(self));
        self.next = $('<div class="next"><div class="arrows"/></div>').appendTo(self.elem).bind('click',self.onNextScroll.bind(self));

        self.months = $('<div class="months"/>').appendTo(self.scroller);
        self.months.append(self.buildMonth(self.starting || self.ending || self.today));
        self.months.delegate('td.day','click',self.onDate.bind(self));

    };

    snap.inherit(Calendar,'snap.Component');
    snap.extend(Calendar.prototype,{

        classes:{elem:'calendar'},detached:true,
        
        buildWeek : function(body) {
            var week = $('<tr class="week"/>').appendTo(body);
            for (var day = 0;(day < 7);day++) week.append('<td/>');
            return week;
        },

        buildMonth : function(date) {

            var self = this,year = self.year = date.getFullYear();
            var month = self.month = date.getMonth(),days = monthdays[month];
            if ((month == 1) && ((((year % 4) == 0 && ((year % 100) != 0)) || ((year % 400) == 0)))) days++;

            self.current = new Date(year,month,1);

            var table = $(snap.fragment('snap.calendar.Month',{}));
            self.title = $('div.title',table);self.title.html(months[month].concat(' ',year));

            var body = $('tbody',table),rows = body[0].rows,today = self.today.getTime(),day = self.current.getDay();
            var starting = self.starting?self.starting.getTime():null,ending = self.ending?self.ending.getTime():null;

            for (var idx = 0;(idx < days);idx++) {

                var rdx = Math.floor((idx + day)/7),row = (rdx < rows.length)?rows[rdx]:self.buildWeek(body)[0];
                var cdx = (idx + day) % 7,cell = $(row.cells[cdx]).addClass('day').append((idx + 1).toString());

                var date = new Date(year,month,idx + 1),time = date.getTime();
                if ((starting && (time < starting)) || (ending && (time > ending))) cell.addClass('ds');
                else if (time == today) cell.css({'font-weight':'bold'});

            }

            self.setPrev();
            self.setNext();

            return table;

        },

        onMouseDown : function(event) {
            var self = this,target = event.target;
            return !$.contains(self.elem,target);
        },

        onDate : function(event) {

            var self = this,target = $(event.target);
            if (target.hasClass('ds')) return false;

            var cdx = event.target.cellIndex,rdx = event.target.parentNode.rowIndex - 2;
            var date = new Date(self.current.getTime());date.setDate(rdx*7 + cdx - date.getDay() + 1);
            self.publish('select',date,true);

            return false;

        },

        setPrev : function() {
            var self = this,date = new Date(self.year,self.month,0);
            var starting = self.starting?self.starting.getTime():null;
            self.prev.toggleClass('ds',((starting != null) && (date.getTime() < starting)));
        },

        onPrevScroll : function(event) {

            var self = this,month;
            if (self.prev.hasClass('ds')) return;

            self.months.prepend(month = self.buildMonth(new Date(self.year,self.month - 1,1)));
            self.scroller.prop('scrollLeft',month.width()).animate({scrollLeft:0},{complete:self.onPrevDone.bind(self),duration:400});

            return false;

        },

        onPrevDone : function() {
            var self = this;
            self.months.children().last().remove();
            self.scroller.prop({scrollLeft:1});
        },

        setNext : function() {
            var self = this,date = new Date(self.year,self.month + 1,1);
            var ending = self.ending?self.ending.getTime():null;
            self.next.toggleClass('ds',((ending != null) && (date.getTime() > ending)));
        },

        onNextScroll : function(event) {

            var self = this,month;
            if (self.next.hasClass('ds')) return;

            self.months.append(month = self.buildMonth(new Date(self.year,self.month + 1,1)));
            self.scroller.animate({scrollLeft:month.position().left},{complete:self.onNextDone.bind(self),duration:400});

            return false;
        },

        onNextDone : function() {
            var self = this;
            self.months.children().first().remove();
            self.scroller.prop({scrollLeft:1});
        },

        format : function(date) {
            var year = date.getFullYear(),month = date.getMonth() + 1,day = date.getDate();
            return month.toString().concat('/',day,'/',year);
        },

        show : function(object) {

            var self = this;self.months.children().remove();
            self.months.append(self.buildMonth(object.current));

            $(document).bind('mousedown',self.onhide = self.onHide.bind(self));

            self.popup = self.popup || new Window({fixed:false,closable:false,resizable:false,children:[self]});
            self.popup.show(object);

        },

        onHide : function(event) {
            this.hide();
        },

        hide : function(object) {
            $(document).unbind('mousedown',this.onhide);
            this.popup.hide();
        }

    });

    return Calendar;

});

define('snap.carousel.VerticalCarouselLayout',function(snap) {

    //> public VerticalCarouselLayout(Object? config)
    var VerticalCarouselLayout = function(config) {
        VerticalCarouselLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(VerticalCarouselLayout,'snap.Layout');
    snap.extend(VerticalCarouselLayout.prototype,{

        //> protected void render()
        render : function() {

            var self = this,target = self.target;
            target.append(self.template()).addClass('vcrsl');

            self.body = $('.vcrsl-b',target);
            self.list = $('.vcrsl-ul',target);

            self.head = $('.vcrsl-h',target);
            self.foot = $('.vcrsl-f',target);

            self.head.bind('click',self.onScrollUp.bind(self));
            self.foot.bind('click',self.onScrollDown.bind(self));

        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {
            var self = this,elem = component.elem;
            self.list.append($('<li class="vcrsl-li"/>').append(elem));
            if (self.ready && !defer) self.layout();
        },

        //> public void removeComponent(Object component,boolean defer)
        removeComponent : function(component,defer) {
            var self = this,elem = component.elem;elem.parent().remove();
            if (self.ready && !defer) self.layout();
        },

        item : function(index) {
            var self = this,component = self.children[index];
            return component?component.elem.parent():null;
        },

        layout : function(force) {

            var self = this,target = self.target,body = self.body,height = body.height();
            if (height > self.target.height()) body.height(height = (target.height() - self.head.height() - self.foot.height()));

            var offset = body.prop('scrollTop'),last = self.item(self.children.length - 1);
            var maximum = last?last.position().top + last.height() - height:0;

            var display = (self.container.fixed || (maximum > 0))?'block':'none';
            self.head.css({visibility:(offset > 0)?'visible':'hidden',display:display});
            self.foot.css({visibility:(offset < maximum)?'visible':'hidden',display:display});

            VerticalCarouselLayout.superclass.layout.call(self,force);

        },

        onScrollUp : function() {

            var self = this,body = self.body,top = body.prop('scrollTop');
            for (var idx = 0,item;((item = self.item(idx)) && ((item.position().top + item.height()) < top));idx++);

            var last = self.item(self.children.length - 1);
            var maximum = last?last.position().top + last.height() - body.height():0;
            var position = Math.max(Math.min(item.position().top + item.height() - body.height(),maximum),0);

            body.animate({scrollTop:position},{complete:self.layout.bind(self),duration:500});

        },

        onScrollDown : function() {

            var self = this,body = self.body,bottom = body.prop('scrollTop') + body.height();
            for (var idx = 0,item;((item = self.item(idx)) && ((item.position().top + item.height()) <= bottom));idx++);

            var last = self.item(self.children.length - 1);
            var maximum = last?last.position().top + last.height() - body.height():0;
            var position = Math.max(Math.min(item.position().top,maximum),0);

            body.animate({scrollTop:position},{complete:self.layout.bind(self),duration:500});

        }

    });

    snap.extend(VerticalCarouselLayout,{

        template : function(config,context) {
            context.render(VerticalCarouselLayout.getName());
        }

    });

    return VerticalCarouselLayout;

});

define('snap.carousel.HorizontalCarouselLayout',function(snap) {

    //> public HorizontalCarouselLayout(Object? config)
    var HorizontalCarouselLayout = function(config) {
        HorizontalCarouselLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(HorizontalCarouselLayout,'snap.Layout');
    snap.extend(HorizontalCarouselLayout.prototype,{

        //> protected void render()
        render : function() {

            var self = this,target = self.target;
            target.append(self.template());

            self.body = $('div.hcrsl-b',target);
            self.list = $('.hcrsl-ul',target);

            self.left = $('.hcrsl-l',target);
            self.right = $('.hcrsl-r',target);

            self.left.bind('click',self.onScrollLeft.bind(self));
            self.right.bind('click',self.onScrollRight.bind(self));

        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {
            var self = this,elem = component.elem;
            self.list.append($('<li class="hcrsl-li"/>').append(elem));
            if (self.ready && !defer) self.layout();
        },

        //> public void removeComponent(Object component,boolean defer)
        removeComponent : function(component,defer) {
            var self = this,elem = component.elem;elem.parent().remove();
            if (self.ready && !defer) self.layout();
        },

        item : function(index) {
            var self = this,component = self.children[index];
            return component?component.elem.parent():null;
        },

        layout : function(force) {

            var self = this,target = self.target,body = self.body,width = body.width();
            if (width > self.target.width()) body.width(width = (target.width() - self.left.width() - self.right.width()));
            self.left.height(body.height());self.right.height(body.height());

            var offset = body.prop('scrollLeft'),last = self.item(self.children.length - 1);
            var maximum = last?last.position().left + last.width() - width:0;

            var display = (self.container.fixed || (maximum > 0))?'block':'none';
            self.left.css({visibility:(offset > 0)?'visible':'hidden',display:display});
            self.right.css({visibility:(offset < maximum)?'visible':'hidden',display:display});

            HorizontalCarouselLayout.superclass.layout.call(self,force);

        },

        onScrollLeft : function() {

            var self = this,body = self.body,left = body.prop('scrollLeft');
            for (var idx = 0,item;((item = self.item(idx)) && ((item.position().left + item.width()) < left));idx++);

            var last = self.item(self.children.length - 1);
            var maximum = last?last.position().left + last.width() - body.width():0;
            var position = Math.max(Math.min(item.position().left + item.width() - body.width(),maximum),0);

            body.animate({scrollLeft:position},{complete:self.layout.bind(self),duration:500});

        },

        onScrollRight : function() {

            var self = this,body = self.body,right = body.prop('scrollLeft') + body.width();
            for (var idx = 0,item;((item = self.item(idx)) && ((item.position().left + item.width()) <= right));idx++);

            var last = self.item(self.children.length - 1);
            var maximum = last?last.position().left + last.width() - body.width():0;
            var position = Math.max(Math.min(item.position().left,maximum),0);

            body.animate({scrollLeft:position},{complete:self.layout.bind(self),duration:500});

        }

    });

    snap.extend(HorizontalCarouselLayout,{

        template : function(config,context) {
            context.render(HorizontalCarouselLayout.getName());
        }

    });

    return HorizontalCarouselLayout;

});

define('snap.checkbox.Checkbox',function(snap) {

    //> public Checkbox(Object? config)
    var Checkbox = function(config) {
        var self = this;Checkbox.superclass.constructor.call(self,config);
        self.anchor = $('a',self.elem).bind('click',self.onClick.bind(self));
        self.input = $('input',self.anchor);
    };

    snap.inherit(Checkbox,'snap.Component');
    snap.extend(Checkbox.prototype,{

        onChange : function(checked) {
            var self = this;self.input[0].checked = self.selected = checked;
            self.publish('select',self.anchor.attr('href'),true);
        },

        onClick : function(event) {
            var self = this,input = self.input[0],disabled = input.disabled;
            var checked = (event.target == input)?input.checked:!input.checked;
            if (!disabled) window.setTimeout(self.onChange.bind(self,checked),0);
            return false;
        }

    });

    return Checkbox;

});


define('snap.fingers.FingerTab',function(snap) {

    //> public FingerTab(Object? config)
    var FingerTab = function(config) {
        var self = this;FingerTab.superclass.constructor.call(self,config);
        self.subscribe('show',self.onShow);self.subscribe('hide',self.onHide);
    };

    snap.inherit(FingerTab,'snap.Container');
    snap.extend(FingerTab.prototype,{

        onClick : function(event) {
        },

        onEnter : function(event) {
            this.publish('select',this,true);
        },

        onLeave : function() {
            return true;
        },

        onShow : function(message) {
        },

        onHide : function(message) {
        }

    });

    snap.extend(FingerTab,{

        template : function(config,context) {
            context.render(FingerTab.getName());
            context.queue();
        }

    });

    return FingerTab;

});

define('snap.fingers.FingerTabs',function(snap) {

    //> public FingerTabs(Object? config)
    var FingerTabs = function(config) {
        FingerTabs.superclass.constructor.call(this,config);
    };

    snap.inherit(FingerTabs,'snap.Container');
    snap.extend(FingerTabs.prototype,{

        manager:'snap.fingers.FingerTabsLayout'

    });

    snap.extend(FingerTabs,{

        template : function(config,context) {
            context.render(FingerTabs.getName());
            context.queue();
        }

    });

    return FingerTabs;

});



define('snap.fingers.FingerTabsLayout',function(snap) {

    var VerticalScroller = snap.require('snap.scrollbar.vertical.VerticalScroller');

    //> public FingerTabsLayout(Object? config)
    var FingerTabsLayout = function(config) {
        FingerTabsLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(FingerTabsLayout,'snap.Layout');
    snap.extend(FingerTabsLayout.prototype,{

        render : function() {

            var self = this;self.timestamp = new Date().getTime();
            FingerTabsLayout.superclass.render.call(self);

            self.head = $('.ftabs-h',self.target);self.frame = self.head.frame();
            self.head.delegate('.ftab-h','mouseenter',self.onEnterTab.bind(self));

            self.body = $('.ftabs-b',self.target);

            self.container.subscribe('select',self.selectTab.bind(self),self);
            self.container.subscribe('deselect',self.deselectTab.bind(self),self);

            self.scroller = new VerticalScroller({scrollable:self.container,target:self.head});
            self.scrollbar = self.scroller.scrollbar;

            self.msie = ($.browser.msie && ($.browser.version <= 7));
            if (self.msie) self.body.prependTo(document.body);

            self.head.bind('mouseenter',self.onEnterHead.bind(self));
            self.head.bind('mouseleave',self.onLeaveHead.bind(self));

            self.body.bind('mouseenter',self.onEnterBody.bind(self));
            self.body.bind('mouseleave',self.onLeaveBody.bind(self));

        },

        getHead : function(component) {

            var self = this,head = $('.ftab-h[eid="'.concat(component.eid,'"]'),self.head);
            component.head = (head.length)?head:self.addHead(component);
            component.head.addClass('f',component.finger || false);

            var anchor = $('.ftab-a',component.head);
            anchor.bind('mouseenter',component.onEnter.bind(component));
            anchor.bind('click',component.onClick.bind(component));

        },


        addHead : function(component) {
            var head = $('<div class="ftab-h"><a class="ftab-a"/></div>');
            $('a',head).append(component.title).attr({'href':component.href,eid:component.eid});
            return head;
        },

        getBody : function(component) {
            var self = this,body = $('.ftab-b[oid="'.concat(component.oid,'"]'),self.body);
            return (body.length <= 0)?component.elem:null;
        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {

            var self = this;self.getHead(component);
            self.body.append(component.elem);

            if (self.ready && !defer) self.layout();

        },

        //> public void removeComponent(Object component,boolean defer)
        removeComponent : function(component,defer) {
            var self = this;component.head.remove();
            FingerTabsLayout.superclass.removeComponent.call(self,component,defer);
            if (self.active == component) delete self.active;
        },

        layout : function(force) {

            var self = this;FingerTabsLayout.superclass.layout.call(self,force);
            if (!self.dirty || !self.children.fwd) return;

            for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
                var head = node.head[0],width = head.offsetWidth,scroll = head.scrollWidth;
                node.head.attr({title:(width < scroll)?node.head.text():''});
            }

        },

        onEnterHead: function(event) {
            this.disabled = false;
            this.onHideTimer();
        },

        onLeaveHead: function(event) {
            this.disabled = true;
            this.setHideTimer(400);
            this.cancelShowTimer();
        },

        onEnterTab: function(event) {
            this.setHideTimer(400);
        },

        onEnterBody: function(event) {
            this.cancelHideTimer();
            this.cancelShowTimer();
        },

        onLeaveBody : function(event) {
            var self = this,onleave = self.active?self.active.onLeave():true;
            if (onleave) this.setHideTimer(0);
        },

        setHideTimer : function(ticks) {
            var self = this;self.cancelHideTimer();
            self.hidetimer = window.setTimeout(self.onHideTimer.bind(self),ticks);
        },

        cancelHideTimer : function() {
            window.clearTimeout(this.hidetimer);
        },

        onHideTimer : function() {

            var self = this,active = self.active;
            if (active) self.toggleTab(active,false);

            self.body.css({display:'none'});
            self.scrollbar.show();


            delete self.active;

        },

        setShowTimer : function(message,tab) {
            var self = this;self.cancelShowTimer();
            self.showtimer = window.setTimeout(self.onSelectTab.bind(self,message,tab),250);
        },

        cancelShowTimer : function() {
            window.clearTimeout(this.showtimer);
        },

        item : function(index) {
            var self = this,component = self.children[index];
            return component?component.head.parent():null;
        },

        selectTab : function(message,tab) {
            this.setShowTimer(message,tab);
        },

        onScrollTab : function(delta) {
            var self = this,scrollTop = self.head.prop('scrollTop');
            self.head.prop({scrollTop:scrollTop + delta});
            self.scrollbar.layout();
        },

        onSelectTab : function(message,tab) {

            var self = this,timestamp = new Date().getTime();
            if ((timestamp - self.timestamp) < 250) return self.setShowTimer(message,tab);
            else self.timestamp = timestamp;

            var position = tab.head.position().top;
            if (position < 0) self.onScrollTab(position);
            else if (position > (self.height - 24)) self.onScrollTab(position - (self.height - 24));

            var width = self.head.outerWidth(),offset = self.msie?self.target.offset():{top:-15,left:0};
            self.body.css({top:offset.top,left:offset.left + width - 3,display:'block'});

            if (self.disabled) return;
            else if (self.active) self.toggleTab(self.active,false);
            self.toggleTab(self.active = tab,true);

            self.scrollbar.hide();

            self.cancelShowTimer();
            self.cancelHideTimer();

        },

        deselectTab : function(message,tab) {

            var self = this;self.toggleTab(tab,false);
            if (tab != self.active) return;

            self.body.css({display:'none'});
            delete self.active;

        },

        toggleTab : function(tab,active) {

            tab.head.toggleClass(($.browser.msie && ($.browser.version < 9))?'b':'s',active);
            tab.elem.css({display:active?'block':'none'});

            tab.publish(active?'show':'hide');

        }

    });

    return FingerTabsLayout;

});

define('snap.menu.Item',function(snap) {

    //> public Item(Object? config)
    var Item = function(config) {

        var self = this;Item.superclass.constructor.call(self,config);
        if (self.children.length) self.renderMenu(self.children[0]);

        self.elem.bind('mouseover',self.onMouseOver.bind(self));
        self.elem.bind('mouseout',self.onMouseOut.bind(self));

        self.onshow = self.onShow.bind(self);
        self.onhide = self.onHide.bind(self);

    };

    snap.inherit(Item,'snap.Container');
    snap.extend(Item.prototype,{

        //> protected void render(Object target)
        render : function(target) {

            var self = this;

            Item.superclass.render.call(self,target);

            self.anchor = $('a.i',self.elem);
            if (self.icon) self.anchor.append(self.renderImage(self.icon));
            if (self.text) self.anchor.append(self.renderContent(self.text));

        },

        renderImage : function(icon) {
            var image = snap.isNode(icon)?icon:$('<img/>',{src:icon});
            return image.addClass('i');
        },

        renderContent : function(text) {
            return $('<span/>').append(text);
        },

        renderMenu : function(menu) {
            var self = this;self.menu = menu;
            self.menu.subscribe('mouseover',self.cancelTimer,self);
            self.anchor.addClass("x");
        },

        setTimer : function() {
            this.timeer = window.setTimeout(this.onshow,500);
        },

        cancelTimer : function() {
            window.clearTimeout(this.timer);
        },

        onMouseOver : function(event) {

            var self = this,related = event.relatedTarget;
            if ($.contains(self.elem[0],related)) return;

            self.elem.addClass('h');
            self.publish('mouseover',self,true);
            if (self.menu) self.setTimer();

        },

        onMouseOut : function(event) {

            var self = this,related = event.relatedTarget;
            if ($.contains(self.elem[0],related)) return;

            self.elem.removeClass('h');
            if (self.menu) self.timer = window.setTimeout(self.onhide,500);

        },

        //> private void onShow(Event? event)
        onShow : function(event) {
            var self = this;self.menu.publish('show',{align:'right'});
            window.clearTimeout(self.timer);
        },

        //> private void onHide(Event? event)
        onHide : function(event) {
            var self = this;self.menu.publish('hide');
            window.clearTimeout(self.timer);
        },

        onClick : function(event) {
            return this.publish('click',{text:this.text,href:this.href});
        }

    });

    snap.extend(Item,{

        template : function(config,context) {
            context.render(Item.getName());
            context.queue();
        }

    });

    return Item;

});

define('snap.menu.Menu',function(snap) {

    //> public Menu(Object? config)
    var Menu = function(config) {
        Menu.superclass.constructor.call(this,config);
    };

    snap.inherit(Menu,'snap.Container');
    snap.extend(Menu.prototype,{
        manager:'snap.menu.MenuLayout'
    });

    snap.extend(Menu,{

        template : function(config,context) {
            context.render(Menu.getName());
            context.queue();
        }

    });

    return Menu;

});

define('snap.menu.MenuLayout',function(snap) {

	//> public MenuLayout(Object? config)
	var MenuLayout = function(config) {
		var self = this,container = config.container;
		container.subscribe('show',self.onShow,self);container.subscribe('hide',self.onHide,self);
		MenuLayout.superclass.constructor.call(self,config);
	};

	snap.inherit(MenuLayout,'snap.Layout');
	snap.extend(MenuLayout.prototype,{

		hide : function(menu) {
			menu.parent.elem.append(menu.elem);
			$(document).unbind('click',this.onclick);
		},

		onShow : function(message,object) {

			var self = this,menu = message.source;
			var parent = menu.parent,elem = parent.elem;

			$(document.body).prepend(menu.elem);

			var align = object.align || 'right',offset = elem.offset();
			if (align.match(/right/)) menu.elem.offset({top:offset.top,left:offset.left + elem.outerWidth()});
			else if (align.match(/bottom/)) menu.elem.offset({top:offset.top + elem.outerHeight(),left:offset.left});

			$(document).bind('click',menu,self.onclick = self.onClick.bind(self));

			return false;

		},

		onHide : function(message,object) {
			this.hide(message.source);
			return false;
		},

		onClick : function(event) {
			this.hide(event.data);
			return false;
		}

	});

	return MenuLayout;

});

define('snap.panel.Panel',function(snap) {

    //> public Panel(Object? config)
    var Panel = function(config) {
        Panel.superclass.constructor.call(this,config);
    };

    snap.inherit(Panel,'snap.Container');
    snap.extend(Panel.prototype,{

        closable:false,expandable:true,expanded:true,duration:250,

        svg:'<div class="pnl-s"><svg xmlns="http://www.w3.org/2000/svg" version="1.1"><defs/><text x="0" y="0" text-anchor="start" transform="rotate(90) translate(10,-8)" fill="rgb(128,128,128)"><tspan x="0" dy="3.25"/></text></svg></div>',
        vml:'<div class="pnl-s"><?xml:namespace prefix=v ns="urn:schemas-microsoft-com:vml" /><v:shape style="top:10px;width:20px;height:400px" coordsize="100,100" filled="t" fillcolor="rgb(128,128,128)" stroked="f" path="m 0,10 l 0,100 e"><v:path textpathok="t"></v:path><v:textpath on="t" fitpath="f" fitshape="f"/></v:shape></div>',

        render : function(target) {

            var self = this,content = self.content;
            Panel.superclass.render.call(self,target);

            if (self.title) self.renderHead();
            else if (content) self.elem.append(content);

        },

        renderHead : function(title) {

            var self = this;self.head = $('div.pnl-h',self.elem);
            self.title = $('div.pnl-t',self.elem);
            self.body = $('div.pnl-b',self.elem).append(self.content);
            if (self.styles.body) self.body.css(self.styles.body);

            if (self.closable) self.renderClosable();
            if (self.expandable) self.renderExpandable();

        },

        renderSvg : function() {
            var self = this,svg = $(self.svg);
            $('tspan',svg).append(self.config.title);
            return svg;
        },

        renderVml : function() {
            var self = this,svg = $(self.vml);
            $('textpath',svg).attr({string:self.config.title});
            return svg;
        },

        renderClosable : function() {

            var self = this;self.close = $('<div class="pnl-c"/>');
            self.close.addClass(self.closable.match(/left/)?'l':'r');

            self.close.appendTo(self.head).bind('click',self.onClosable.bind(self));

        },

        renderExpandable : function() {
            var self = this;self.body.css({display:self.expanded?'block':'none'});
            self.subscribe('expand',self.toggle);self.subscribe('collapse',self.toggle);
            self.head.bind('click',self.onExpand.bind(self));
        },

        getTarget : function() {
            return this.body || this.elem;
        },

        onClosable : function(event) {
            var self = this,svg = $('div.pnl-s',self.elem);
            svg.length?self.onOpen(event):self.onClose(event);
            return false;
        },

        onClose : function(event) {

            var self = this,left = self.closable.match(/left/),width = self.body.width();
            self.elem.children().css({width:width,float:left?'right':'left'});

            var options = {duration:self.duration,complete:self.onCloseComplete.bind(self)};
            self.elem.animate(left?{width:20}:{left:width-20,width:20},options);

        },

        onCloseComplete : function() {

            var self = this,left = self.closable.match(/left/);

            var msie = ($.browser.msie && ($.browser.version < 9));
            self.rotator = msie?self.renderVml():self.renderSvg();
            self.rotator.css({top:self.head.outerHeight(),width:20,height:self.body.height()}).appendTo(self.elem);
            self.elem.css({left:''});

            self.publish('resize',{width:22},true);
            self.publish('close',self,true);

            self.close.toggleClass('c');

        },

        onOpen : function(event) {

            var self = this;
            var left = self.closable.match(/left/);

            var width = self.body.width();
            self.elem.css(left?{}:{left:width-20});

            self.publish('resize',{width:width},true);
            self.rotator.remove();

            var options = {duration:self.duration,complete:self.onOpenComplete.bind(self)};
            self.elem.animate(left?{width:width}:{left:0,width:width},options);

        },

        onOpenComplete : function() {

            var self = this;self.close.toggleClass('c');
            self.elem.children().css({width:'',float:''});
            self.elem.css({width:''});

            self.publish('open',self,true);

        },

        onExpand : function(event) {
            var self = this,height = self.body[0].offsetHeight;
            self.publish((height <= 0)?'expand':'collapse',self);
        },

        toggle : function(message,object) {
            var self = this,toggle = self.parent?self.parent.publish(message.type,self):true;
            if (toggle !== false) self.body.slideToggle(self.duration);
        },

        //> public void resize(Object size)
        resize : function(size) {

            var self = this,head = self.head;
            if (head && size.height) self.body.layout({height:size.height -= head.outerHeight(true)});
            else if (size.height) self.elem.layout({height:size.height});

            if (size.width) self.elem.layout({width:size.width});
            if (self.rotator) self.rotator.css({height:self.body.outerHeight()});

            self.layout();

        }

    });

    snap.extend(Panel,{

        template : function(config,context) {
            context.render(Panel.getName());
            context.queue(config);
        }

    });

    return Panel;

});

define('snap.rollup.Rollup',function(snap) {

    //> public Rollup(Object? config)
    var Rollup = function(config) {
        Rollup.superclass.constructor.call(this,config);
    };

    snap.inherit(Rollup,'snap.Container');
    snap.extend(Rollup.prototype,{

        render : function(target) {

            var self = this,content = self.content;
            Rollup.superclass.render.call(self,target);

            self.head = $('div.rlp-h',self.elem).append(self.title);
            self.body = $('div.rlp-b',self.elem);self.body.html(content);
            if (self.styles.body) self.body.css(self.styles.body);

            self.head.bind('click',self.onClick.bind(self));

        },

        getTarget : function() {
            return this.body;
        },

        onClick : function(event) {
            this.body.slideToggle(100);
            this.elem.toggleClass("collapse");
        },

        //> public void resize(Object? size)
        resize : function(size) {

            var self = this,head = self.head;
            if (size.height) size.height -= head.outerHeight();;

            self.body.layout(size);
            self.layout();

        }

    });

    return Rollup;

});



define('snap.window.Mask',function(snap) {

    //> public Mask(Object? config)
    var Mask = function(config) {
        var self = this;self.disabled = [];
        Mask.superclass.constructor.call(self,config);
        self.elem.prependTo(document.body);
        };

    snap.inherit(Mask,'snap.Component');
    snap.extend(Mask.prototype,{

        classes:{elem:'win-m'},detached:true,index:5,opacity:30,

        disableSelects : function(form) {

            var self = this;self.enableSelects();
            var selects = $('select',document.body);

            for (var idx = 0,length = selects.length;(idx < length);idx++) {

                var select = selects[idx];
                if ((select.disabled) || (form && (select.form === form))) continue;

                select.disabled = true;
                self.disabled.push(select);

            }

        },

        enableSelects : function() {
            var self = this,selects = self.disabled;self.disabled = [];
            for (var idx = 0,len = selects.length;(idx < len);idx++) selects[idx].disabled = false;
        },

        show : function(object) {

            var self = this;
            var object = object || {};

            var index = object.index || self.index;
            var opacity = object.opacity || self.opacity;

            if ($.browser.msie && ($.browser.version <= '6')) self.disableSelects();

            self.elem.width($(document).width()).height($(document).height());

            self.elem.css('display','block').prependTo(document.body);
            self.elem.css({'z-index':index,opacity:opacity/100});

        },

        hide : function(object) {

            var self = this;

            if ($.browser.msie && ($.browser.version <= '6')) self.enableSelects();

            self.elem.width(0).height(0);
            self.elem.css('display','none').remove();

        }

    });

    return Mask;

});

define('snap.dragger.Dragger',function(snap) {

    //> public Dragger(Object? config)
    var Dragger = function(config) {

        var self = this;Dragger.superclass.constructor.call(self,config);
        self.dragger.bind('mousedown',self.onDragStart.bind(self)).addClass('drag');

        self.dragger.bind('click',self.onCancel.bind(self));
        self.dragger.bind('dragstart',self.onCancel.bind(self));

        self.ondragstop = self.onDragStop.bind(self);
        self.ondragmove =  self.onDragMove.bind(self);

    };

    snap.inherit(Dragger,'snap.Observable');
    snap.extend(Dragger.prototype,{

        onCancel : function(event) {
            return false;
        },

        onDragStart : function(event) {

            var self = this;
            var target = self.target,offset = target.offset();

            self.clientTop = event.clientY - offset.top;
            self.clientLeft = event.clientX - offset.left;;

            $(document).bind('mouseup',self.ondragstop);
            $(document).bind('mousemove',self.ondragmove);

            $doc.disableSelect($(document.body));

        },

        onDragMove : function(event) {
            var self = this,target = self.target;
            target.offset({top:event.clientY - self.clientTop,left:event.clientX - self.clientLeft});
            return false;
        },

        onDragStop : function(event) {

            var self = this,scope = self.scope,offset = self.target.offset();
            scope.offsetTop = offset.top;scope.offsetLeft = offset.left;

            $(document).unbind('mouseup',self.ondragstop);
            $(document).unbind('mousemove',self.ondragmove);

            $doc.enableSelect($(document.body));

        }

    });

    return Dragger;

});

define('snap.radio.Radio',function(snap) {

    //> public Radio(Object? config)
    var Radio = function(config) {
        var self = this;Radio.superclass.constructor.call(self,config);
        self.input = $('input',self.anchor = $('a',self.elem).bind('click',self.onClick.bind(self)));
        self.anchor.bind('focus',self.onFocus.bind(self));
    };

    snap.inherit(Radio,'snap.Component');
    snap.extend(Radio.prototype,{

        onFocus : function(event) {
            this.selected = this.input[0].checked;
        },

        onClick : function(event) {
            var self = this,input = self.input[0],disabled = input.disabled;
            if (!disabled && !self.selected) window.setTimeout(self.onChange.bind(self,true),0);
            return false;
        },

        onChange : function(checked) {
            var self = this;self.input[0].checked = checked;
            self.publish('select',self.anchor.attr('href'),true);
        }

    });

    return Radio;

});



define('snap.resizer.Resizer',function(snap) {

    var elem,borders;

    //> public Resizer(Object? config)
    var Resizer = function(config) {
        var self = this;Resizer.superclass.constructor.call(self,config);
        self.target.bind('mouseover',self.onMouseOver.bind(self));
        self.target.bind('mousedown',self.onMouseDown.bind(self));
    };

    snap.inherit(Resizer,'snap.Component');
    snap.extend(Resizer.prototype,{

        classes:{elem:'resizer'},

        //> protected void render(Object target)
        render : function(target) {

            var self = this;

            if (self.elem = elem) return;
            else Resizer.superclass.render.call(self);

            $(document.body).prepend(elem = self.elem);
            borders = elem.frame().borders;

        },

        getCursor: function(event,target) {

            var offset = target.offset();

            var eventTop = event.pageY - offset.top;
            var eventLeft = event.pageX - offset.left;

            var top = (Math.abs(eventTop) <= 10),right = (Math.abs(eventLeft - target.width()) <= 10);
            var left = (Math.abs(eventLeft) <= 10),bottom = (Math.abs(eventTop - target.height()) <= 10);

            if (top && left) return 'nw-resize';
            else if (top && right) return 'ne-resize';
            else if (bottom && left) return 'sw-resize';
            else if (bottom && right) return 'se-resize';
            else if (top) return 'n-resize';
            else if (left) return 'w-resize';
            else if (bottom) return 's-resize';
            else if (right) return 'e-resize';

        },

        onMouseOver : function(event) {
            var self = this,cursor = self.getCursor(event,self.target);
            self.target.css('cursor',cursor?cursor:'');
        },

        onMouseDown : function(event) {
            var self = this,cursor = self.getCursor(event,self.target);
            if (self.cursor = cursor) self.onResizeStart(event);
        },

        onResizeStart : function(event) {

            var self = this,elem = self.elem;
            var target = self.target;self.offset = target.offset();

            elem.css({display:'block',cursor:self.cursor,top:0,left:0});
            elem.css({position:target.css('position'),'z-index':parseInt(target.css('z-index') + 1)});

            elem.offset({top:self.offset.top - borders.top,left:self.offset.left - borders.left});
            elem.layout({width:target.width() + borders.width,height:target.height() + borders.height});

            self.clientTop = event.clientY;self.clientLeft = event.clientX;
            self.clientWidth = elem.width();self.clientHeight = elem.height();

            $(document).bind('mouseup',self.onresizestop = self.onResizeStop.bind(self));
            $(document).bind('mousemove',self.onresizemove = self.onResizeMove.bind(self));

            $doc.disableSelect($(document.body));

        },

        onResizeMove : function(event) {

            var self = this,elem = self.elem;
            var cursor = self.cursor,target = self.target,offset = self.offset;

            var top = event.clientY - self.clientTop;
            var left = event.clientX - self.clientLeft;

            var width = self.clientWidth - borders.width;
            var height = self.clientHeight - borders.height;

            if (cursor.match(/(s|se|sw)-resize/)) {
                elem.css({height:Math.max(height + top,2)});
            }
            else if (cursor.match(/(n|ne|nw)-resize/)) {
                elem.offset({top:offset.top + Math.min(top,height - borders.height)});
                elem.css({height:Math.max(height - top - borders.height,2)});
            }

            if (cursor.match(/(e|ne|se)-resize/)) {
                elem.css({width:Math.max(width + left,2)});
            }
            else if (cursor.match(/(w|nw|sw)-resize/)) {
                elem.offset({left:offset.left + Math.min(left,width - borders.width)});
                elem.css({width:Math.max(width - left - borders.width,2)});
            }

            var scope = self.scope,offset = elem.offset();
            target.offset({top:scope.offsetTop = offset.top + borders.top,left:scope.offsetLeft = offset.left + borders.left});
            self.target.layout({width:elem.width() - borders.width,height:elem.height() - borders.height});

            scope.layout();

        },

        onResizeStop : function(event) {

            var self = this,elem = self.elem,offset = elem.offset();
            var scope = self.scope,target = self.target;

            target.offset({top:scope.offsetTop = offset.top + borders.top,left:scope.offsetLeft = offset.left + borders.left});
            self.target.layout({width:elem.width() - borders.width,height:elem.height() - borders.height});

            scope.layout();

            elem.css('display','');

            $(document).unbind('mouseup',self.onresizestop);
            $(document).unbind('mousemove',self.onresizemove);

            $doc.enableSelect($(document.body));

        }

    });

    return Resizer;

});

define('snap.scrollbar.horizontal.HorizontalScrollbar',function(snap) {

    //> public HorizontalScrollbar(Object? config)
    var HorizontalScrollbar = function(config) {

        var self = this;HorizontalScrollbar.superclass.constructor.call(self,config);self.elem.insertAfter(self.target = self.after);
        self.handle = $('.scroll-x-hdl',self.elem).bind('mousedown',self.onDragStart.bind(self));

        self.elem.bind('mousedown',self.onMouseDown.bind(self));
        self.target.bind('mousewheel DOMMouseScroll',self.onScroll.bind(self));

        self.elem.bind('click',self.onCancel.bind(self));
        self.elem.bind('dragstart',self.onCancel.bind(self));

        self.ondragstop = self.onDragStop.bind(self);
        self.ondragmove =  self.onDragMove.bind(self);

        self.layout();

    };

    snap.inherit(HorizontalScrollbar,'snap.Component');
    snap.extend(HorizontalScrollbar.prototype,{

        show : function() {
            var self = this,target = self.target,width = target.innerWidth() + 1;
            self.elem.css({visibility:(width < target.prop('scrollWidth'))?'visible':'hidden'});
        },

        hide : function() {
            var self = this,target = self.target,width = target.innerWidth() + 1;
            if (!self.dragging() && (width < target.prop('scrollWidth'))) self.elem.css({visibility:'hidden'});
        },

        layout : function() {

            var self = this,target = self.target;
            self.elem.css({top:target[0].offsetTop + target[0].offsetHeight - 8,left:target[0].offsetLeft});
            self.elem.css({width:target.innerWidth()});

            var width = self.elem.width(),handle = Math.round(width*(width/target.prop('scrollWidth')));
            var offset = target.prop('scrollLeft'),position = offset*(width - handle)/(target.prop('scrollWidth') - width);

            self.handle.css({left:position,width:Math.max(Math.min(handle,width),16)});

            self.show();

        },

        scroll : function(position) {

            var self = this,target = self.target,width = self.elem.width(),object;
            var scroll = target.prop('scrollWidth') - width,handle = self.handle.width();
            var offset = Math.max(Math.min(Math.round(scroll*position/(width - handle)),scroll),0);

            self.publish('scroll',object = {scrollLeft:offset},true);
            self.target.prop('scrollLeft',object.scrollLeft);

            self.handle.css({left:Math.min(Math.max(position,0),width - handle)});

        },

        position : function() {
            return this.target.prop('scrollLeft');
        },

        dragging : function() {
            return this.handle.hasClass('drag');
        },

        onMouseDown : function(event) {
            var self = this,offset = self.elem.offset();
            var handle = self.handle.width();self.scroll(event.pageX - offset.left - handle/2);
            self.onDragStart(event);
        },

        onCancel : function(event) {
            return false;
        },

        onScroll : function(event) {

            var self = this,original = event.originalEvent;
            var wheelDelta = original.detail?original.detail*-1:original.wheelDelta/40;

            var width = self.elem.width(),position = self.handle.position();
            self.scroll(position.left - Math.round((wheelDelta/100)*width));

            event.preventDefault();

        },

        onDragStart : function(event) {

            var self = this,offset = self.handle.position();
            self.eventLeft = event.clientX - offset.left;self.handle.toggleClass('drag');

            $(document).bind('mouseup',self.ondragstop);
            $(document).bind('mousemove',self.ondragmove);

            $doc.disableSelect($(document.body));

            return false;

        },

        onDragMove : function(event) {
            var self = this;self.scroll(event.clientX - self.eventLeft);
            self.publish('dragmove',{scrollLeft:self.target.prop('scrollLeft')});
            return false;
        },

        onDragStop : function(event) {

            var self = this;

            self.handle.toggleClass('drag');
            self.publish('dragstop',{event:event});

            $(document).unbind('mouseup',self.ondragstop);
            $(document).unbind('mousemove',self.ondragmove);

            $doc.enableSelect($(document.body));

            return false;

        }

    });

    snap.extend(HorizontalScrollbar,{

        template : function(config,context) {
            context.render(HorizontalScrollbar.getName());
            context.queue(config);
        }

    });

    return HorizontalScrollbar;

});



define('snap.scrollbar.horizontal.HorizontalScroller',function(snap) {

    var HorizontalScrollbar = snap.require('snap.scrollbar.horizontal.HorizontalScrollbar');

    //> public HorizontalScroller(Object? config)
    var HorizontalScroller = function(config) {

        var self = this;snap.extend(self,config);self.target.addClass('scroll-x');
        self.scrollbar = new HorizontalScrollbar({after:self.target});
        self.scrollable.subscribe('layout',self.layout.bind(self),self);
        if (!self.auto) return;

        self.scrollbar.elem.css({visibility:'hidden'});
        self.scrollbar.elem.bind('mouseleave',self.onLeave.bind(self));

        self.scrollbar.subscribe('dragstop',self.onDragStop.bind(self),self);

        self.target.bind('mouseenter',self.onEnter.bind(self));
        self.target.bind('mouseleave',self.onLeave.bind(self));

    };

    snap.extend(HorizontalScroller.prototype,{

        show : function() {
            this.scrollbar.show();
        },

        hide : function() {
            this.scrollbar.hide();
        },

        scroll : function(position) {
            this.scrollbar.scroll(position);
        },

        position : function() {
            return this.scrollbar.position();
        },

        layout : function(message) {
            this.scrollbar.layout();
        },

        onEnter : function(event) {
            this.scrollbar.show();
        },

        onLeave : function(event) {
            var self = this,scrollbar = self.scrollbar.elem[0],related = event.relatedTarget;
            if (!((related == scrollbar) || $.contains(scrollbar,related))) self.scrollbar.hide();
        },

        onDragStop : function(message,object) {
            var self = this,event = object.event,target = self.target,scrollbar = self.scrollbar;
            var offset = target.offset(),width = target.outerWidth(),height = target.outerHeight();
            if ((event.clientX < offset.left) || (event.clientX > (offset.left + width))) scrollbar.hide();
            else if ((event.clientY < offset.top) || (event.clientY > (offset.top + height))) scrollbar.hide();
        }

    });

    return HorizontalScroller;

});

define('snap.scrollbar.vertical.VerticalScroller',function(snap) {

    var VerticalScrollbar = snap.require('snap.scrollbar.vertical.VerticalScrollbar');

    //> public VerticalScroller(Object? config)
    var VerticalScroller = function(config) {

        var self = this;snap.extend(self,config);self.target.addClass('scroll-y');
        self.scrollbar = new VerticalScrollbar({after:self.target});
        self.scrollable.subscribe('layout',self.layout.bind(self),self);
        if (!self.auto) return;

        self.scrollbar.elem.css({visibility:'hidden'});
        self.scrollbar.elem.bind('mouseleave',self.onLeave.bind(self));

        self.scrollbar.subscribe('dragstop',self.onDragStop.bind(self),self);

        self.target.bind('mouseenter',self.onEnter.bind(self));
        self.target.bind('mouseleave',self.onLeave.bind(self));

    };

    snap.extend(VerticalScroller.prototype,{

        show : function() {
            this.scrollbar.show();
        },

        hide : function() {
            this.scrollbar.hide();
        },

        scroll : function(position) {
            this.scrollbar.scroll(position);
        },

        position : function() {
            return this.scrollbar.position();
        },

        layout : function(message) {
            this.scrollbar.layout();
        },

        onEnter : function(event) {
            this.scrollbar.show();
        },

        onLeave : function(event) {
            var self = this,scrollbar = self.scrollbar.elem[0],related = event.relatedTarget;
            if (!((related == scrollbar) || $.contains(scrollbar,related))) self.scrollbar.hide();
        },

        onDragStop : function(message,object) {
            var self = this,event = object.event,target = self.target,scrollbar = self.scrollbar;
            var offset = target.offset(),width = target.outerWidth(),height = target.outerHeight();
            if ((event.clientX < offset.left) || (event.clientX > (offset.left + width))) scrollbar.hide();
            else if ((event.clientY < offset.top) || (event.clientY > (offset.top + height))) scrollbar.hide();
        }

    });

    return VerticalScroller;

});

define('snap.scrollbar.vertical.VerticalScrollbar',function(snap) {

    //> public VerticalScrollbar(Object? config)
    var VerticalScrollbar = function(config) {

        var self = this;VerticalScrollbar.superclass.constructor.call(self,config);self.elem.insertAfter(self.target = self.after);
        self.handle = $('.scroll-y-hdl',self.elem).bind('mousedown',self.onDragStart.bind(self));

        self.elem.bind('mousedown',self.onMouseDown.bind(self));
        self.target.bind('mousewheel DOMMouseScroll',self.onScroll.bind(self));

        self.elem.bind('click',self.onCancel.bind(self));
        self.elem.bind('dragstart',self.onCancel.bind(self));

        self.ondragstop = self.onDragStop.bind(self);
        self.ondragmove =  self.onDragMove.bind(self);

        self.layout();

    };

    snap.inherit(VerticalScrollbar,'snap.Component');
    snap.extend(VerticalScrollbar.prototype,{

        show : function() {
            var self = this,target = self.target,height = target.innerHeight() + 1;
            self.elem.css({visibility:(height < target.prop('scrollHeight'))?'visible':'hidden'});
        },

        hide : function() {
            var self = this,target = self.target,height = target.innerHeight() + 1;
            if (!self.dragging() && (height < target.prop('scrollHeight'))) self.elem.css({visibility:'hidden'});
        },

        layout : function() {

            var self = this,target = self.target;
            self.elem.css({top:target[0].offsetTop,left:target[0].offsetLeft + target[0].offsetWidth - 8});
            self.elem.css({height:target.innerHeight()});

            var height = self.elem.height(),handle = Math.round(height*(height/target.prop('scrollHeight')));
            var offset = target.prop('scrollTop'),position = offset*(height - handle)/(target.prop('scrollHeight') - height);

            self.handle.css({top:position,height:Math.max(Math.min(handle,height),16)});

            self.show();

        },

        scroll : function(position) {

            var self = this,target = self.target,height = self.elem.height(),object;
            var scroll = target.prop('scrollHeight') - height,handle = self.handle.height();
            var offset = Math.max(Math.min(Math.round(scroll*position/(height - handle)),scroll),0);

            self.publish('scroll',object = {scrollTop:offset},true);
            self.target.prop('scrollTop',object.scrollTop);

            self.handle.css({top:Math.min(Math.max(position,0),height - handle)});

        },

        position : function() {
            return this.target.prop('scrollTop');
        },

        dragging : function() {
            return this.handle.hasClass('drag');
        },

        onMouseDown : function(event) {
            var self = this,offset = self.elem.offset();
            var handle = self.handle.height();self.scroll(event.pageY - offset.top - handle/2);
            self.onDragStart(event);
        },

        onCancel : function(event) {
            return false;
        },

        onScroll : function(event) {

            var self = this,original = event.originalEvent;
            var wheelDelta = original.detail?original.detail*-1:original.wheelDelta/40;

            var height = self.elem.height(),position = self.handle.position();
            self.scroll(position.top - Math.round((wheelDelta/100)*height));

            event.preventDefault();

        },

        onDragStart : function(event) {

            var self = this,offset = self.handle.position();
            self.eventTop = event.clientY - offset.top;self.handle.toggleClass('drag');

            $(document).bind('mouseup',self.ondragstop);
            $(document).bind('mousemove',self.ondragmove);

            $doc.disableSelect($(document.body));

            return false;

        },

        onDragMove : function(event) {
            var self = this;self.scroll(event.clientY - self.eventTop);
            self.publish('dragmove',{scrollTop:self.target.prop('scrollTop')});
            return false;
        },

        onDragStop : function(event) {

            var self = this;

            self.handle.toggleClass('drag');
            self.publish('dragstop',{event:event});

            $(document).unbind('mouseup',self.ondragstop);
            $(document).unbind('mousemove',self.ondragmove);

            $doc.enableSelect($(document.body));

            return false;

        }

    });

    snap.extend(VerticalScrollbar,{

        template : function(config,context) {
            context.render(VerticalScrollbar.getName());
            context.queue(config);
        }

    });

    return VerticalScrollbar;

});



define('snap.slider.SliderBase',function(snap) {

    //> public SliderBase(Object? config)
    var SliderBase = function(config) {
        SliderBase.superclass.constructor.call(this,config);
    };

    snap.inherit(SliderBase,'snap.Component');
    snap.extend(SliderBase.prototype,{
    });

    snap.extend(SliderBase,{

        template : function(config,context) {
            context.render(SliderBase.getName());
            context.queue(config);
        }

    });

    return SliderBase;

});



define('snap.slider.SliderHandle',function(snap) {

    //> public SliderHandle(Object? config)
    var SliderHandle = function(config) {

        var self = this;self.elem = $('<div class="hdl"/>');
        SliderHandle.superclass.constructor.call(self,config);
        self.elem.toggleClass('ds',config.disabled || false);

        self.ondragstop = self.onDragStop.bind(self);
        self.ondragmove =  self.onDragMove.bind(self);

        self.elem.bind('click',self.onCancel.bind(self));
        self.elem.bind('dragstart',self.onCancel.bind(self));

        self.elem.bind('mousedown',self.onDragStart.bind(self));

    };

    snap.inherit(SliderHandle,'snap.Component');
    snap.extend(SliderHandle.prototype,{

        detached:true,

        move : function(position) {
            var self = this,parent = self.elem.parent(),target = self.elem,half = Math.floor(self.elem.width()/2);
            target.css({left:Math.round((self.position = Math.min(Math.max(0,position),parent.width()))) - half});
            return position;
        },

        onCancel : function(event) {
            return false;
        },

        onDragStart : function(event) {

            var self = this,disabled = self.disabled;
            if (disabled) return false;

            var offset = self.elem.position();
            self.eventLeft = event.clientX - offset.left;;
            self.elem.toggleClass('drag');

            $(document).bind('mouseup',self.ondragstop);
            $(document).bind('mousemove',self.ondragmove);

            $doc.disableSelect($(document.body));

        },

        onDragMove : function(event) {
            var self = this,half = Math.floor(self.elem.width()/2);
            self.move(self.onDrag(event.clientX - self.eventLeft + half));
            return false;
        },

        onDragStop : function(event) {

            var self = this,onStop = self.onStop;
            if (onStop) self.move(onStop(self.position));
            self.elem.toggleClass('drag');

            $(document).unbind('mouseup',self.ondragstop);
            $(document).unbind('mousemove',self.ondragmove);

            $doc.enableSelect($(document.body));

        }

    });

    return SliderHandle;

});



define('snap.slider.range.SliderRange',function(snap) {

    var SliderBase = snap.require('snap.slider.SliderBase');
    var SliderHandle = snap.require('snap.slider.SliderHandle');

    //> public SliderRange(Object? config)
    var SliderRange = function(config) {

            var self = this,disabled = config.disabled || false;
            SliderRange.superclass.constructor.call(self,config);

            self.range = $('.range',self.elem);
            self.bar = $('.bar',self.range).toggleClass('ds',disabled);
            self.range.bind('click',self.onClick.bind(self));

            self.left = new SliderHandle({onDrag:self.onMinDrag.bind(self),onStop:self.onMinStop.bind(self),target:self.range,disabled:disabled});
            self.right = new SliderHandle({onDrag:self.onMaxDrag.bind(self),onStop:self.onMaxStop.bind(self),target:self.range,disabled:disabled});

            self.label  = $('.label',self.elem);
            self.label.text(self.format(self.low) + ' - ' + self.format(self.high));
            self.legend = $('.legend',self.elem);

            if (self.range.width()) self.layout();

    };

    snap.inherit(SliderRange,'snap.slider.SliderBase');
    snap.extend(SliderRange.prototype,{

        layout : function(force) {

            var self = this;

            self.low = Math.max(self.low,self.min);
            self.high = Math.min(self.high,self.max);

            var left = self.position(self.low);self.left.move(left);
            var right = self.position(self.high);self.right.move(right);

            self.bar.css({'margin-left':Math.round(left),'margin-right':Math.round(self.range.width() - right)});

            $('.left',self.legend).html(self.format(self.min));
            $('.right',self.legend).html(self.format(self.max));

        },

        scale : function(position) {
            var self = this,range = self.range.width(),fraction = position/range;
            return Math.round(self.min + fraction*(self.max - self.min));
        },

        position : function(value) {
            var self = this,range = self.range.width();
            return range*((value - self.min)/(self.max - self.min));
        },

        format : function(value) {
            return value;
        },

        onClick : function(event) {

            var self = this,offset = self.range.offset();
            var position = event.pageX - offset.left;

            var left = self.left.position,right = self.right.position;
            if (position < left) self.onMinStop(self.left.move(position));
            else if (position > right) self.onMaxStop(self.right.move(position));
            else if ((position - left) < (right - position)) self.onMinStop(self.left.move(position));
            else self.onMaxStop(self.right.move(position));

        },

        onMinDrag : function(offset) {

            var self = this,range = self.range.width();
            var position = Math.min(Math.max(0,offset),self.right.position);
            self.left.elem.css({'z-index':1});self.right.elem.css({'z-index':0});

            self.label.text(self.format(self.low = self.scale(position)) + ' - ' + self.format(self.high));
            self.bar.css({'margin-left':Math.round(position)});

            return position;

        },

        onMaxDrag : function(offset) {

            var self = this,range = self.range.width();
            var position = Math.min(Math.max(self.left.position,offset),range);
            self.left.elem.css({'z-index':0});self.right.elem.css({'z-index':1});

            self.label.text(self.format(self.low) + ' - ' + self.format(self.high = self.scale(position)));
            self.bar.css({'margin-right':Math.round(range - position)});

            return position;

        },

        onMinStop : function(offset) {
            var self = this,position = self.onMinDrag(offset);
            self.publish('slider',{slider:'low',value:self.scale(position)});
            return position;

        },

        onMaxStop : function(offset) {
            var self = this,position = self.onMaxDrag(offset);
            self.publish('slider',{slider:'high',value:self.scale(position)});
            return position;
        },

        destroy : function() {
            var self = this;snap.destroy(self.left);snap.destroy(self.right);
            SliderRange.superclass.destroy.call(self);
        }

    });

    snap.extend(SliderRange,{

        template : function(config,context) {

            var self = this,format = self.prototype.format.bind(config);

            config.min = parseFloat(config.min || 0);config.max = parseFloat(config.max || 0);
            config.low = parseFloat(config.low || config.min);config.high = parseFloat(config.high || config.max);

            config.label = format(config.low) + ' - ' + format(config.high);
            config.left = format(config.min);config.right = format(config.max);

            context.render(SliderBase.getName());
            context.queue(config);
        }

    });

    return SliderRange;

});



define('snap.slider.currency.SliderCurrency',function(snap) {

    var currency = /(\d*)(\.(\d*))?/;

    var CurrencyFormatter = snap.require('ebay.utils.CurrencyFormatter');

    //> public SliderCurrency(Object? config)
    var SliderCurrency = function(config) {
        var formatter = config.formatter || new CurrencyFormatter({grouping:config.grouping,symbol:config.symbol,pattern:config.pattern});
        SliderCurrency.superclass.constructor.call(this,snap.extend(config,{formatter:formatter}));
    };

    snap.inherit(SliderCurrency,'snap.slider.logarithmic.SliderLogarithmic');
    snap.extend(SliderCurrency.prototype,{

        decimals:2,

        round : function(position) {

            var self = this,minimum = Math.log(Math.max(self.min,0.01));
            var scale = (Math.log(self.max) - minimum)/self.range.width();

            var power = Math.pow(10,Math.max(Math.round(Math.LOG10E*(scale*position + minimum) - 2),-self.decimals));
            return Math.round(Math.pow(10,Math.LOG10E*(scale*position + minimum))/power)*power;

        },

        scale : function(position) {

            var self = this,range = self.range.width();
            var amount = position?(position == range?self.max:self.round(position)):self.min;

            var match = amount.toString().match(currency),dollars = match[1],decimals = match[3]?match[3].concat('00'):'00';
            if ((amount < 10) || ((self.max - self.min) < 10)) dollars = dollars.concat('.',decimals.substring(0,2));

            return parseFloat(dollars);

        },

        format : function(value) {
            var self = this,match = value.toString().match(currency);
            var dollars = match[1],decimals = match[3]?match[3].concat('00'):'00';
            if ((value < 10) || ((self.max - self.min) < 10)) dollars = dollars.concat('.',decimals.substring(0,2));
            return self.formatter?self.formatter.format(dollars):dollars;
        }

    });

    return SliderCurrency;

});



define('snap.slider.enumeration.SliderEnumeration',function(snap) {

    var SliderBase = snap.require('snap.slider.SliderBase');
    var SliderHandle = snap.require('snap.slider.SliderHandle');

    //> public SliderEnumeration(Object? config)
    var SliderEnumeration = function(config) {

            var self = this,disabled = config.disabled || false;
            SliderEnumeration.superclass.constructor.call(self,config);

            self.range = $('.range',self.elem).toggleClass('ds',disabled);
            self.range.bind('click',self.onClick.bind(self));

            self.ticks = $('.ticks',self.range);
            self.bar = $('.bar',self.range).toggleClass('ds',disabled);

            self.handle = new SliderHandle({onDrag:self.onDrag.bind(self),onStop:self.onStop.bind(self),target:self.range});

            self.label  = $('.label',self.elem);
            self.legend = $('.legend');

            if (self.range.width()) self.layout();

    };

    snap.inherit(SliderEnumeration,'snap.slider.SliderBase');
    snap.extend(SliderEnumeration.prototype,{

        layout : function(force) {

            var self = this,range = self.range.width();

            var ticks = self.ticks.children();self.tick = (self.range.outerWidth() - 1)/(ticks.length - 1);
            for (var idx = 0,tick;(tick = ticks[idx]);idx++) $(tick).css({left:Math.round(idx*self.tick)});

            var position = self.tick*self.index;self.handle.move(position);
            self.bar.css({'margin-right':range - position});

        },

        format : function(position) {
            var self = this,len = self.values.length;
            return self.values[Math.round(position/self.tick)];
        },

        onClick : function(event) {

            var self = this,range = self.range.width(),offset = self.range.offset();
            var index = Math.round((event.pageX - offset.left)/self.tick);
            var position = self.tick*index;self.handle.move(position);

            self.label.text(self.format(self.handle.position));
            self.bar.css({'margin-right':range - position});

            self.publish('slider',{index:index});

        },

        onDrag : function(offset) {

            var self = this,range = self.range.width();
            var position = Math.min(Math.max(0,offset),range);

            self.label.text(self.format(self.handle.position));
            self.bar.css({'margin-right':range - position});

            return position;

        },

        onStop : function(offset) {

            var self = this,range = self.range.width();
            var index = Math.round(offset/self.tick),position = self.tick*index;
            self.bar.css({'margin-right':range - position});

            self.publish('slider',{index:index});

            return position;

        },

        destroy : function() {
            var self = this;snap.destroy(self.handle);
            SliderEnumeration.superclass.destroy.call(self);
        }


    });

    snap.extend(SliderEnumeration,{

        template : function(config,context) {

            var values = config.values;config.ticks = true;

            config.label = values[config.index = config.index || 0];
            config.left = values[0];config.right = values[values.length-1];

            context.render(SliderBase.getName());
            context.queue(config);

        }

    });

    return SliderEnumeration;

});



define('snap.slider.logarithmic.SliderLogarithmic',function(snap) {

    //> public SliderLogarithmic(Object? config)
    var SliderLogarithmic = function(config) {
        SliderLogarithmic.superclass.constructor.call(this,config);
    };

    snap.inherit(SliderLogarithmic,'snap.slider.range.SliderRange');
    snap.extend(SliderLogarithmic.prototype,{

        decimals:0,

        scale : function(position) {

            var self = this,minimum = Math.log(Math.max(self.min,0.01));
            var scale = (Math.log(self.max) - minimum)/self.range.width();

            var power = Math.pow(10,Math.max(Math.round(Math.LOG10E*(scale*position + minimum) - 2),-self.decimals));
            var value = Math.round(Math.pow(10,Math.LOG10E*(scale*position + minimum))/power)*power;

            return position?Math.max(Math.min(value,self.max),self.min):self.min;

        },

        position : function(value) {

            var self = this,minimum = Math.log(Math.max(self.min,0.01));
            var scale = (Math.log(self.max) - minimum)/self.range.width();

            var position = (Math.max(Math.log(value) - minimum,-2))/scale;
            return (value > Math.max(self.min,0.01))?position:0;
        },

        format : function(value) {
            return value;
        }

    });

    return SliderLogarithmic;

});



define('snap.progress.ProgressBar',function(snap) {

    //> public ProgressBar(Object? config)
    var ProgressBar = function(config) {
        var self = this;self.elem = $(self.html);
        ProgressBar.superclass.constructor.call(self,config);
    };

    snap.inherit(ProgressBar,'snap.Component');
    snap.extend(ProgressBar.prototype,{
        html:'<div class="progress"><div class="rng"></div></div>'
    });

    return ProgressBar;

});



define('snap.window.Stack',function(snap) {

    //> public Stack(Object? config)
    var Stack = function(config) {
        var self = this;self.windows = [];
        Stack.superclass.constructor.call(self,config);
    };

    snap.inherit(Stack,'snap.Observable');
    snap.extend(Stack.prototype,{

        //> public void register(snap.window.Window window)
        register : function(window) {
            var self = this;self.windows.push(window);window.order = new Date().getTime();
            window.subscribe('pop',self.pop.bind(self,window),self);
            self.order();
        },

        //> public void unregister(snap.window.Window window)
        unregister : function(window) {
        },

        //> private int sort(Object a,Object b)
        sort: function(a,b) {
            return a.order - b.order;
        },

        // private void order()
        order : function() {
            var self = this,windows = self.windows;windows.sort(self.sort);
            for (var idx = 0,window;(window = windows[idx]);idx++) {
                window.elem.css('z-index',new String(100 + 2*idx + 1));
                if (window.mask) window.mask.elem.css('z-index',new String(100 + 2*idx));
            }
        },

        // protected void pop(Object window,Object message)
        pop : function(window,message) {
            window.order = new Date().getTime();
            this.order();
        }

    });

    Stack.register = function(window) {

        var stack = new Stack({name:'Snap Stack'});

        Stack.register = stack.register.bind(stack);
        Stack.unregister = stack.unregister.bind(stack);

        Stack.register(window);

    };

    return Stack;

});

define('snap.window.Window',function(snap) {

    var Mask = snap.require('snap.window.Mask');
    var Stack = snap.require('snap.window.Stack');

    var Dragger = snap.require('snap.dragger.Dragger');
    var Resizer = snap.require('snap.resizer.Resizer');

    var focusable = 'a[tabindex!="-1"],input,select,button,[tabindex="0"]';

    //> public Window(Object? config)
    var Window = function(config) {

        var self = this;Window.superclass.constructor.call(self,config);

        if (self.draggable) self.dragger = new Dragger({scope:self,target:self.elem,dragger:self.title});
        if (self.resizable) self.resizer = new Resizer({scope:self,target:self.elem});

        self.elem.bind('keydown',self.onKeyDown.bind(self));
        self.elem.bind('mousedown',self.onMouseDown.bind(self));
        self.close = $('a.win-c',self.head).bind('click',self.hide.bind(self));

        self.elem.delegate(focusable,'focus',self.onFocus.bind(self));

        Stack.register(self);

    };

    snap.inherit(Window,'snap.Container');
    snap.extend(Window.prototype,{

        classes:{elem:'win'},fixed:true,closable:true,draggable:true,resizable:true,modal:false,

        //> protected void render(Object target)
        render : function(target) {

            var self = this;Window.superclass.render.call(self);
            self.head = $('div.win-h',self.elem);self.body = $('div.win-b',self.elem).append(self.content);
            self.title = $('div.win-t',self.head);self.title.css({display:self.title?'block':'none'});

            self.ie6 = ($.browser.msie && ($.browser.version < 7));
            if (self.ie6) self.elem.prepend($('<iframe class="win-i" frameborder="0" />').css('filter','alpha(opacity=0)'));

            if ($.browser.msie && ($.browser.version <= 8)) $('div.win-f',self.elem).css({border:'solid #ccc','border-width':'1px 0px 0px 1px'});

            $(document.body).prepend(self.elem);

        },

        getTarget : function() {
            return this.body;
        },

        getOffset : function(object) {

            var self = this,elem = self.elem;
            var width = elem.outerWidth(),height = elem.outerHeight();

            var client = {width:$(window).width(),height:$(window).height()};
            var scroll = self.fixed?{top:0,left:0}:{top:$(window).scrollTop(),left:$(window).scrollLeft()};

            var top = self.offsetTop || Math.round(scroll.top + (client.height - height)/2);
            var left = self.offsetLeft || Math.round(scroll.left + (client.width - width)/2);

            return {top:Math.max(top,10),left:Math.max(left,10)};

        },

        load : function(object) {
            var self = this;self.loading = true;
            return $load(object.content,self.loaded.bind(self,object));
        },

        loaded : function(object,loader) {
            var self = this;self.loading = false;self.body.html('');
            Window.prototype.show.call(self,object,loader);
        },

        //> protected void show(Object? object,Object? loader)
        show : function(object,loader) {

            var self = this,loading = self.loading,object = object || {};
            if (object.content && !loading && !loader) return self.load(object);

            var elem = self.elem;elem.css({position:(self.fixed && !self.ie6)?'fixed':'absolute'});
            if (self.modal || object.modal || object.mask) (self.mask || (self.mask = new Mask())).show(object.mask);
            self.close.css('display',(snap.isDefined(object.closable)?object.closable:self.closable)?'block':'none');

            if (object.title) self.title.css({display:'block'}).html(object.title);
            if (object.content) self.body.append(loader.fragment);

            elem.css(object.offset || self.getOffset(object));
            elem.css({visibility:'visible'});

            var focus = $(focusable,self.body).filter(':visible');
            if (focus.length) focus[0].focus();

            self.publish('show');
            self.publish('pop');

        },

        //> protected hide()
        hide : function() {

            var self = this,elem = self.elem;
            if (self.mask) self.mask.hide();

            elem.css({visibility:'hidden'});
            elem.offset({top:-1000,left:-1000});

            self.publish('hide');

        },

        onFocus : function(event) {
            this.focus = event.target;
        },

        setFocus : function(event,element) {
            event.preventDefault();
            element.focus();
        },

        onKeyDown : function(event) {

            if (event.keyCode != 9) return;

            var self = this,focus = $(focusable,self.elem).filter(':visible');
            if (focus.length <= 0) return;

            var first = focus[0],last = focus[focus.length-1],shift = event.shiftKey;
            if (!shift && (self.focus === last)) self.setFocus(event,first);
            else if (shift && (self.focus === first)) self.setFocus(event,last);

        },

        onMouseDown : function(event) {
            this.publish('pop');
        },

        layout : function(force) {

            var self = this;
            if (self.resizable) self.resize({},force);

            self.manager.layout(force);
            self.publish('layout');

        },

        //> private void resize()
        resize : function(size,force) {
            var self = this,elem = self.elem,head = self.head;
            self.body.layout({height:elem.height() - head.height()});
        },

        //> public void destroy()
        destroy : function() {
            Stack.unregister(this);
            Window.superclass.destroy.call(this);
        }

    });

    snap.extend(Window,{

        template : function(config,context) {
            context.render(Window.getName());
            context.queue(config);
        }

    });

    return Window;

});

define('snap.bubble.Bubble',function(snap) {

    //> public Bubble(Object? config)
    var Bubble = function(config) {
        var self = this;Bubble.superclass.constructor.call(self,config);
        self.arrow = $('div.win-a',self.elem);
    };

    snap.inherit(Bubble,'snap.window.Window');
    snap.extend(Bubble.prototype,{

        fixed:false,draggable:false,resizable:false,modal:false,

        getAnchor : function(anchor,offset) {

            var self = this,elem = self.elem;
            var width = elem.outerWidth(),height = elem.outerHeight();

            var client = {width:$(window).width(),height:$(window).height()};
            var scroll = {top:$(window).scrollTop(),left:$(window).scrollLeft()};

            var target = snap.extend(anchor.offset(),{width:anchor.outerWidth(),height:anchor.outerHeight()});

            offset.top = Math.min(offset.top,target.top - 20);
            offset.top = Math.max(offset.top,target.top - height + 40);

            self.arrow.removeClass('l r');

            if (target.left < (scroll.left + client.width/2)) {
                offset.left = target.left + target.width + 20;
                self.arrow.css({display:'block'}).addClass('l');
            }
            else {
                offset.left = target.left - width - 20;
                self.arrow.css({display:'block'}).addClass('r');
            }

            self.arrow.css({top:Math.min(Math.max(target.top - offset.top - 5,10),Math.max(height - self.arrow.outerHeight(),0))});;

            return offset;

        },

        getOffset : function(object) {
            var self = this,anchor = object.anchor;
            var offset = Bubble.superclass.getOffset.call(self,object);
            return anchor?self.getAnchor(snap.elem(anchor),offset):offset;
        }

    });

    snap.extend(Bubble,{

        template : function(config,context) {
            context.render(Bubble.getName());
            context.queue();
        }

    });

    return Bubble;

});

define('snap.console.Console',function(snap) {

    var Tab = snap.require('snap.tabs.Tab');
    var Tabs = snap.require('snap.tabs.Tabs');

    var Button = snap.require('snap.button.Button');
    var Toolbar = snap.require('snap.toolbar.Toolbar');

    var Registry = snap.require('snap.Registry');

    //> public Console(Object? config)
    var Console = function(config) {

        var self = this;self.opts = {debug:true,except:true,attach:false,detach:false,dispatch:false};
        Console.superclass.constructor.call(self,config);
        self.elem.bind('keydown',self.keys.bind(self));

        self.appendChild(self.renderTabs());
        self.appendChild(self.renderToolbar());

        $(document).bind('keydown',self.ctrl.bind(self));
        $(document).bind('contextmenu',self.context.bind(self));

        snap.log = function() { self.log.apply(self,arguments); };

    };

    snap.inherit(Console,'snap.window.Window');
    snap.extend(Console.prototype,{

        classes:{elem:'win con'},draggable:true,resizable:true,modal:false,

        started:new Date().getTime(),

        elapsed : function() {
            return new Date().getTime() - this.started;
        },

        renderToolbar : function() {
            var self = this,toolbar = new Toolbar();
            var clear = toolbar.appendChild(new Button({text:'Clear',classes:{elem:'sml blue'}}));
            clear.subscribe('click',self.clear,self);
            return toolbar;
        },

        renderTabs : function() {

            var self = this;self.tab = {};

            self.tabs = new Tabs({autosize:true});

            self.tab['debug'] = self.tabs.appendChild(self.renderTab('Debug'));
            self.tab['except'] = self.tabs.appendChild(self.renderTab('Errors'));

            self.tabs.subscribe('select',self.selectTab,self);
            self.tabs.publish('select',self.tab['debug']);

            return self.tabs;

        },

        renderTab : function(title) {
            return new Tab({title:title,content:'<div class="con-c" />'});
        },

        selectTab : function(event,tab) {
            this.selected = tab;
        },

        clear : function(event) {
            $('.con-c',this.selected.elem).html('');
            return false;
        },

        ctrl : function(event) {
            if (event.keyCode == 27) return this.hide();
        },

        keys : function(event) {
            if ((event.keyCode == 65) && event.ctrlKey) return this.select();
        },

        select : function() {
            $doc.selectRange(this.selected.elem[0]);
            return false;
        },

        context : function(event) {

            var element = event.ctrlKey?$(event.target).closest('[oid]'):null;
            if (!element || (element.length <= 0)) return;

            var object = Registry.object(element.attr('oid'));
            snap.log('debug',object.constructor.getName(),object.cid || object.oid);

            return false;

        },

        output : function(type) {

            var self = this;
            if (!self.opts[type]) return;

            var log = $('<div class="log"/>').append(self.time());
            var text = $('<div class="text"/>').appendTo(log),data = '['.concat(type,']');

            for (var idx = 1,len = arguments.length;(idx < len);idx++) data = data.concat(' ',arguments[idx]);text.html(data);

            var tab = (self.tab[type] || self.tab['debug']);
            var body = tab.elem[0];$('.con-c',body).append(log);

            body.scrollTop = Math.max(body.scrollHeight - body.offsetHeight,0);
            if (window.console) window.console.log(data);

            return log;

        },

        log : function(type) {

            var self = this;

            if (type instanceof Array) return self.log.apply(self,type);
            else if (type.match(/event/)) return self.event.apply(self,arguments);
            else if (type.match(/except/)) return self.except.apply(self,arguments);
            else self.output.apply(self,arguments);

        },

        event : function(type,action,handler) {
            if (handler.scope == this) return;
            else this.output.apply(this,arguments);
        },

        except : function(type) {
            this.output.apply(this,arguments).addClass('err');
        },

        time : function() {
            var time = $('<div class="time"/>'),elapsed = new String(this.elapsed() + 1000000);
            var seconds = elapsed.substring(1,4),millis = elapsed.substring(4,7);
            return time.html(seconds.concat('.',millis));
        }

    });

    Console.show = function() {

        var console = new Console({title:'Snap Console'});

        Console.show = console.show.bind(console);
        Console.hide = console.hide.bind(console);

        Console.show();

    };

    $(document).bind('keydown',function(event) {
        var key = event.keyCode,ctrl = event.ctrlKey,shift = event.shiftKey;
        if ((key == 68) && ctrl && shift) Console.show();
    }.bind(self));

    return Console;

});

define('snap.splitter.Splitter',function(snap) {

    //> public Splitter(Object? config)
    var Splitter = function(config) {

        var self = this;Splitter.superclass.constructor.call(self,config);
        self.elem.bind('mousedown',self.onDragStart.bind(self));

        self.elem.bind('click',self.onCancel.bind(self));
        self.elem.bind('dragstart',self.onCancel.bind(self));

        self.ondragstop = self.onDragStop.bind(self);
        self.ondragmove =  self.onDragMove.bind(self);

        $(document.body).prepend(self.elem);

    };

    snap.inherit(Splitter,'snap.Component');
    snap.extend(Splitter.prototype,{

        setBounds : function(min,max) {
            this.min = min;this.max = max;
        },

        setStyles : function(rules) {
            this.elem.css(rules);
        },

        onCancel : function(event) {
            return false;
        },

        onDragStart : function(event) {

            var self = this;

            self.elem.css({'background-color':'#ccc'});

            self.offsetTop = event.clientY - self.elem[0].offsetTop;
            self.offsetLeft = event.clientX - self.elem[0].offsetLeft;

            $(document).bind('mouseup',self.ondragstop);
            $(document).bind('mousemove',self.ondragmove);

            return false;

        },

        onDragMove : function(event) {

            var self = this;

            var elem = self.elem;
            var mode = self.mode;

            if (mode.match(/vert/)) {
                var top = event.clientY - self.offsetTop,height = elem[0].offsetHeight;
                elem.css('top',Math.min(Math.max(top,self.min),self.max - height));
            }
            else if (mode.match(/horz/)) {
                var left = event.clientX - self.offsetLeft,width = elem[0].offsetWidth;
                elem.css('left',Math.min(Math.max(left,self.min),self.max - width));
            }

            return false;

        },

        onDragStop : function(event) {

            var self = this;

            self.offsetTop = self.elem[0].offsetTop - $(window).scrollTop();
            self.offsetLeft = self.elem[0].offsetLeft - $(window).scrollLeft();

            self.offsetWidth = self.elem[0].offsetWidth;
            self.offsetHeight = self.elem[0].offsetHeight;

            self.elem.css({'background-color':''});

            $(document).unbind('mouseup',self.ondragstop);
            $(document).unbind('mousemove',self.ondragmove);

            self.publish('drag');

            return false;

        }

    });

    return Splitter;

});

define('snap.throbber.Throbber',function(snap) {

    var Mask = snap.require('snap.window.Mask');

    //> public Throbber(Object? config)
    var Throbber = function(config) {
        var self = this;self.mask = new Mask();
        Throbber.superclass.constructor.call(self,config);
    };

    snap.inherit(Throbber,'snap.Component');
    snap.extend(Throbber.prototype,{

        classes:{elem:'thr'},

        show : function(object) {
            var self = this,parent = self.elem.parent();
            self.elem.css({display:'block',width:parent.width(),height:parent.height()});
            self.mask.show(object);
        },

        hide : function(object) {
            this.mask.hide();
            this.elem.css({display:'none'});
        }

    });

    return Throbber;

});

define('snap.form.Form',function(snap) {

    //> public Form(Object? config)
    var Form = function(config) {
        var self = this;Form.superclass.constructor.call(self,config);
        self.elem.bind('submit',self.onSubmit.bind(self));
    };

    snap.inherit(Form,'snap.Container');
    snap.extend(Form.prototype,{

        method:'get',

        onSubmit : function(event) {
            return this.publish('submit');
        }

    });

    snap.extend(Form,{

        template : function(config,context) {
            context.render(Form.getName());
            context.queue(config);
        }

    });

    return Form;

});

define('snap.form.Input',function(snap) {

    //> public InputButton(Object? config)
    var Input = function(config) {
        Input.superclass.constructor.call(this,config);
    };

    snap.inherit(Input,'snap.Component');

    snap.extend(Input,{

        template : function(config,context) {
            context.render(Input.getName());
            context.queue(config);
        }

    });

    return Input;

});

define('snap.form.InputButton',function(snap) {

	//> public InputButton(Object? config)
	var InputButton = function(config) {
		var self = this;InputButton.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value});
		self.elem.bind('click',self.onClick.bind(self));
	};

	snap.inherit(InputButton,'snap.form.Input');
	snap.extend(InputButton.prototype,{

		type:'button',

		onClick : function(event) {
			return this.publish('click');
		}

	});

	return InputButton;

});

define('snap.form.InputCheckbox',function(snap) {

	//> public InputCheckbox(Object? config)
	var InputCheckbox = function(config) {
		var self = this;InputCheckbox.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value,checked:self.checked});
		if (self.text) self.elem.after(self.text);
		self.elem.bind('click',self.onClick.bind(self));

	};

snap.inherit(InputCheckbox,'snap.form.Input');
	snap.extend(InputCheckbox.prototype,{

		type:'checkbox',checked:false,

		onClick : function(event) {
			return this.publish('click',this.elem[0].checked);
		}

	});

	return InputCheckbox;

});

define('snap.form.InputFile',function(snap) {

	//> public InputFile(Object? config)
	var InputFile = function(config) {
		var self = this;InputFile.superclass.constructor.call(this,config);
		self.elem.attr({name:self.name,method:self.method,enctype:self.enctype});
		self.elem.bind('click',self.onClick.bind(self));
	};

	snap.inherit(InputFile,'snap.form.Input');
	snap.extend(InputFile.prototype,{

		type:'file',method:'post',enctype:'multipart/form-data',
	
		onClick : function(event) {
			return this.publish('click');
		}
	
	});
	
	return InputFile;
	
});

define('snap.form.InputHidden',function(snap) {

	//> public InputHidden(Object? config)
	var InputHidden = function(config) {
		var self = this;InputHidden.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value});
	};

	snap.inherit(InputHidden,'snap.form.Input');
	snap.extend(InputHidden.prototype,{

		type:'hidden'

	});

	return InputHidden;

});

define('snap.form.InputImage',function(snap) {

	//> public InputImage(Object? config)
	var InputImage = function(config) {
		var self = this;InputImage.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,src:self.src});
		self.elem.bind('click',self.onClick.bind(self));
	};

	snap.inherit(InputImage,'snap.form.Input');
	snap.extend(InputImage.prototype,{

		type:'image',

		onClick : function(event) {
			return this.publish('click');
		}

	});

	return InputImage;

});

define('snap.form.InputPassword',function(snap) {

	//> public InputPassword(Object? config)
	var InputPassword = function(config) {
		var self = this;InputPassword.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value});
		self.elem.bind('change',self.onChange.bind(self));
	};

	snap.inherit(InputPassword,'snap.form.Input');
	snap.extend(InputPassword.prototype,{

		type:'password',

		onChange : function(event) {
			return this.publish('change');
		}

	});

	return InputPassword;

});

define('snap.form.InputRadio',function(snap) {

	//> public InputRadio(Object? config)
	var InputRadio = function(config) {

		var self = this;InputRadio.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value,checked:self.checked});
		if (self.text) self.elem.after(self.text);

		self.elem.bind('click',self.onClick.bind(self));

	};

	snap.inherit(InputRadio,'snap.form.Input');
	snap.extend(InputRadio.prototype,{

		type:'radio',checked:false,

		onClick : function(event) {
			return this.publish('click',this.elem[0].checked);
		}

	});

	return InputRadio;

});

define('snap.form.InputReset',function(snap) {

	//> public InputReset(Object? config)
	var InputReset = function(config) {
		var self = this;InputReset.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value});
		self.elem.bind('click',self.onClick.bind(self));
	};

	snap.inherit(InputReset,'snap.form.Input');
	snap.extend(InputReset.prototype,{

		type:'reset',

		onClick : function(event) {
			return this.publish('click');
		}

	});

	return InputReset;

});

define('snap.form.InputSubmit',function(snap) {

	//> public InputSubmit(Object? config)
	var InputSubmit = function(config) {
		var self = this;InputSubmit.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value});
		self.elem.bind('click',self.onClick.bind(self));
	};

	snap.inherit(InputSubmit,'snap.form.Input');
	snap.extend(InputSubmit.prototype,{

		type:'submit',

		onClick : function(event) {
			return this.publish('click');
		}

	});

	return InputSubmit;

});

define('snap.form.InputText',function(snap) {

	//> public InputText(Object? config)
	var InputText = function(config) {
		var self = this;InputText.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value,size:self.size,maxLength:self.maxLength,placeholder:self.placeholder});
		self.elem.bind('change',self.onChange.bind(self));
	};

	snap.inherit(InputText,'snap.form.Input');
	snap.extend(InputText.prototype,{

		type:'text',size:6,maxLength:300,

		onChange : function(event) {
			return this.publish('change');
		}

	});

	return InputText;

});

define('snap.form.Select',function(snap) {

    //> public Select(Object? config)
    var Select = function(config) {

        var self = this;Select.superclass.constructor.call(self,config);
        self.elem.attr({name:self.name,multiple:self.multiple});

        for (var idx = 0,elem = self.elem,options = self.options,option;(option = options[idx]);idx++) {
            elem.append($('<option/>',{value:option.value,selected:option.selected}).append(option.text));
        }

        self.elem.bind('click',self.onClick.bind(self));
        self.elem.bind('change',self.onChange.bind(self));

    };

    snap.inherit(Select,'snap.Component');
    snap.extend(Select.prototype,{

        multiple:false,options:[],

        onClick : function(event) {
            return this.publish('click');
        },

        onChange : function(event) {
            var self = this,options = self.elem[0].options,selected = [];
            for (var idx = 0,option;(option = options[idx]);idx++) {
                if (option.selected) selected.push({value:option.value,text:option.text});
            }
            return this.publish('change',selected);
        }

    });

    snap.extend(Select,{

        template : function(config,context) {
            context.render(Select.getName());
            context.queue(config);
        }

    });

    return Select;

});

define('snap.form.TextArea',function(snap) {

    //> public v(Object? config)
    var TextArea = function(config) {
        var self = this;TextArea.superclass.constructor.call(self,config);
        self.elem.attr({name:self.name,value:self.value});
        self.elem.bind('change',self.onChange.bind(self));
    };

    snap.inherit(TextArea,'snap.Component');
    snap.extend(TextArea.prototype,{

        cols:40,rows:5,

        onChange : function(event) {
            return this.publish('change');
        }

    });

    snap.extend(TextArea,{

        template : function(config,context) {
            context.render(TextArea.getName());
            context.queue(config);
        }

    });

    return TextArea;

});

define('snap.accordion.AccordionLayout',function(snap) {

    //> public AccordionLayout(Object? config)
    var AccordionLayout = function(config) {
        var self = this;AccordionLayout.superclass.constructor.call(self,config);
        self.container.subscribe(/expand|collapse/,self.toggle,self);
    };

    snap.inherit(AccordionLayout,'snap.Layout');
    snap.extend(AccordionLayout.prototype,{

        //> public void layout(boolean force)
        layout : function(force) {

            var self = this.validate(force);
            self.active = self.active || (self.active = self.children.fwd);
            if (!self.dirty || (self.active == null)) return;

            var height = self.height;
            for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
                var target = node.getTarget();height -= node.elem.outerHeight() - target.outerHeight();
                if ((node != self.previous) && (node != self.active)) target.css({height:0});
            }

            var target = self.active.getTarget();target.stop(true,true);
            if (target.height() == height) return self.active.layout();

            target.animate({height:height},{duration:self.active.duration,step:self.animate.bind(self),complete:self.complete.bind(self)});

        },

        animate : function(now,fx) {
            var self = this,previous = self.previous;self.active.layout();
            if (previous) previous.body.css({height:Math.floor(fx.end - now),overflow:'hidden'});
        },

        complete : function(complete) {
            var self = this,previous = self.previous;
            if (previous) previous.body.css({overflow:''});
        },

        toggle : function(message,source) {

            var self = this,type = message.type;
            if (type.match(/collapse/)) return false;

            self.previous = self.active;
            self.active = source;

            self.layout(true);

            return false;

        }

    });

    return AccordionLayout;

});

define('snap.border.BorderLayout',function(snap) {

    var Splitter = snap.require('snap.splitter.Splitter');

    //> public BorderLayout(Object? config)
    var BorderLayout = function(config) {
        var self = this;self.regions = {};self.splitters = {};
        BorderLayout.superclass.constructor.call(self,config);
    };

    snap.inherit(BorderLayout,'snap.Layout');
    snap.extend(BorderLayout.prototype,{

        render : function() {

            var self = this,children = self.children,regions = self.regions;
            var target = self.target.addClass("view");target.append(self.template());
            for (var idx = 0,len = children.length;(idx < len);idx++) regions[children[idx].region] = {};

            self.body = $('div.view-b',self.target);

            if (regions.head) self.addRegion('head',$('div.view-h',self.target));
            if (regions.foot) self.addRegion('foot',$('div.view-f',self.target));

            if (regions.left) self.addRegion('left',$('div.view-l',self.body));
            if (regions.right) self.addRegion('right',$('div.view-r',self.body));
            if (regions.center) self.addRegion('center',$('div.view-c',self.body));

            self.border = self.body.frame().margins.top;

        },

        addRegion : function(name,elem) {
            this.regions[name] = {elem:elem};
        },

        addSplitter : function(name) {

            var self = this,center = self.regions.center;

            var mode = name.match(/head|foot/)?'vert':'horz';
            var split = mode.match(/vert/)?'split-v':'split-h';

            var style = mode.match(/vert/)?{height:self.border}:{width:self.border};
            var config = {name:name,mode:mode,classes:{elem:split},styles:{elem:style}};

            var splitter = self.splitters[name] = new Splitter(config);
            splitter.subscribe('drag',self.onSplitter,self);

        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {

            var self = this,name = component.region;
            var region = self.regions[name];region.object = component;

            region.elem.append(component.elem);region.frame = region.elem.frame();
            if (component.resizable && !name.match(/center/)) self.addSplitter(name);

        },

        layout : function() {

            var self = this;
            for (var name in self.regions) {
                self.regions[name].elem.css({height:''});
            }

            var view = self.target;

            var width = view.outerWidth();
            var height = view.outerHeight();

            var head = self.regions.head;
            if (head) height -= head.elem.outerHeight(true);

            var foot = self.regions.foot;
            if (foot) height -= foot.elem.outerHeight(true);

            var center = self.regions.center;
            center.object.resize({height:height -= 2*self.border});

            var left = self.regions.left;
            if (left) left.object.resize({height:height});

            var right = self.regions.right;
            if (right) right.object.resize({height:height});

            center.elem.css('marginLeft',left?left.elem.outerWidth(true):0);
            center.elem.css('marginRight',right?right.elem.outerWidth(true):0);

            var offset = self.body.offset();

            var offsetTop = self.body[0].offsetTop;

            var offsetWidth = self.body.outerWidth();
            var offsetHeight = self.body.outerHeight();

            var offsetLeft = left?left.elem.outerWidth(true):0;
            var offsetRight = right?(offsetWidth - right.elem.outerWidth(true)):offsetWidth;

            var splitters = self.splitters,splitter;

            if (splitter = splitters.head) {
                splitter.setBounds(self.border,offsetTop + offsetHeight);
                splitter.setStyles({top:offsetTop - self.border});
            }

            if (splitter = splitters.foot) {
                splitter.setBounds(offsetTop,view.outerHeight() - self.border);
                splitter.setStyles({top:offsetTop + offsetHeight});
            }

            if (splitter = splitters.left) {
                splitter.setBounds(self.border,offsetRight);
                splitter.setStyles({top:offsetTop,left:offsetLeft,height:offsetHeight});
            }

            if (splitter = splitters.right) {
                splitter.setBounds(offsetLeft + self.border,width - self.border);
                splitter.setStyles({top:offsetTop,left:offsetRight + self.border,height:offsetHeight});
            }

        },

        //> private void onSplitter(Object message,Object? object)
        onSplitter : function(message,object) {

            var self = this,splitter = message.source,name = splitter.name;
            var region = self.regions[name],object = region.object,frame = region.frame;

            if (name.match(/head/)) object.resize({height:splitter.offsetTop - frame.borders.top});
            else if (name.match(/foot/)) object.resize({height:self.target.outerHeight() - splitter.offsetTop - 2*self.border});

            else if (name.match(/left/)) object.resize({width:splitter.offsetLeft - self.border});
            else if (name.match(/right/)) object.resize({width:self.target.outerWidth() - splitter.offsetLeft - 2*self.border});

            self.layout();

        }

    });

    snap.extend(BorderLayout,{

        template : function(config,context) {
            context.render(BorderLayout.getName());
        }

    });

    return BorderLayout;

});

define('snap.frame.FrameLayout',function(snap) {

    //> public FrameLayout(Object? config)
    var FrameLayout = function(config) {
        var self = this;FrameLayout.superclass.constructor.call(self,config);
        self.container.subscribe('Frame.view',self.view.bind(self),self);
    };

    snap.inherit(FrameLayout,'snap.Layout');
    snap.extend(FrameLayout.prototype,{

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {
            var self = this,selected = component.selected;
            component.elem.css({display:selected?'block':'none'});
            FrameLayout.superclass.addComponent.call(self,component);
        },

        view : function(message,cid) {

            var self = this,frame = self.container.getChild(cid);
            if (frame == null) return;

            self.target.children().css({display:'none'});
            self.target.children('[oid~='.concat(frame.oid,']')).css({display:'block'});

            self.layout();

        }

    });

    return FrameLayout;

});

define('snap.horizontal.HorizontalLayout',function(snap) {

    //> public HorizontalLayout(Object? config)
    var HorizontalLayout = function(config) {
        HorizontalLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(HorizontalLayout,'snap.Layout');
    snap.extend(HorizontalLayout.prototype,{

        //> public void layout(boolean force)
        layout : function(force) {

            var self = this.validate(force);

            var target = self.target,width = target.width(),height = target.height();
            for (var node = self.children.fwd;(node);node = node.siblings.fwd) width -= node.elem.outerWidth();
            if ((self.children.length <= 0) || (width <= 0)) return;

            var frame = target.frame(),padding = frame.padding;
            var center = Math.round(padding.top + height/2),spacing = Math.round(width/(2*self.children.length));

            for (var node = self.children.fwd,left = padding.left + spacing;(node);node = node.siblings.fwd) {
                node.elem.css({position:'absolute',top:center - (node.elem.outerHeight()/2),left:left,margin:0});left += node.elem.outerWidth() + 2*spacing;
            }

        }

    });

    return HorizontalLayout;

});

define('snap.page.Page',function(snap) {

    //> public Page(Object? config)
    var Page = function(config) {
        Page.superclass.constructor.call(this,config);
    };

    snap.inherit(Page,'snap.Container');
    snap.extend(Page.prototype,{

        //> protected void render(Object target)
        render : function(target) {

            var self = this;self.elem = snap.elem(target || document.body);
            if (self.elem[0] == document.body) self.setScroll(self.scroll);

            Page.superclass.render.call(self);

            $(window).bind('resize',self.onWindowResize.bind(self));

        },

        //> protected void onWindowResize(Event event)
        onWindowResize : function(event) {

            if (this.resizing) return;
            else this.resizing = true;

            window.setTimeout(this.resize.bind(this),50);

        },

        //> protected void resize()
        resize : function() {

            var self = this,elem = self.elem;
            if (!self.scroll) elem.height($(window).height());

            self.layout();
            self.resizing = false;

        },

        setScroll : function(scroll) {
            var self = this;self.elem.attr('scroll',scroll?'yes':'no');
            if (!scroll) self.elem.height($(window).height());
        }

    });

    snap.extend(Page,{

        template : function(config,context) {
            context.render(Page.getName());
            context.queue(config);
        }

    });

    return Page;

});

define('snap.page.PageLayout',function(snap) {

    var bits = [25,26,40,41];

    var layouts = [
        {name:'sz760',minWidth:760,maxWidth:940,value:1},
        {name:'sz940',minWidth:940,maxWidth:1200,value:0},
        {name:'sz1200',minWidth:1200,maxWidth:1200,value:5}
    ];

    var Cookies = snap.require('ebay.cookies');

    var Splitter = snap.require('snap.splitter.Splitter');
    var Container = snap.require('snap.Container');

    //> public PageLayout(Object? config)
    var PageLayout = function(config) {
        var self = this;self.regions = {};self.splitters = {};
        PageLayout.superclass.constructor.call(self,config);
    };

    snap.inherit(PageLayout,'snap.Layout');
    snap.extend(PageLayout.prototype,{

        render : function() {
            var self = this,children = self.children,regions = self.regions;
            for (var idx = 0,len = children.length;(idx < len);idx++) regions[children[idx].cid] = {};
            self.target.append(template = self.template(regions));
        },

        addSplitter : function(name) {

            var self = this;

            var mode = name.match(/header|footer/)?'vert':'horz';
            var split = mode.match(/vert/)?'split-v':'split-h';

            var style = mode.match(/vert/)?{height:'5px'}:{width:'5px'};
            var config = {name:name,mode:mode,classes:{elem:split},styles:{elem:style}};

            var splitter = self.splitters[name] = new Splitter(config);
            splitter.subscribe('drag',self.onSplitter,self);

        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {

            var self = this,name = component.cid;
            if (component.resizable) this.addSplitter(name);

            var target = snap.elem(component.target);
            target.append(component.elem.detach());

            self.regions[name] = target;

        },

        setLayout : function(layout) {

            var self = this,cookie = Cookies.readCookie('dp1','pbf') || '#';
            for (var ndx = 0,value = layout.value,num = bits.length;(ndx < num);ndx++,value >>= 1)
                cookie = Cookies.setBitFlag(cookie,bits[ndx],value & 1);

            Cookies.writeCookielet('dp1','pbf',cookie);
            return layout;

        },

        computeLayout : function() {

            var self = this,width = $(window).width(),current = self.current;
            for (var idx = layouts.length - 1;(idx && (width < layouts[idx].minWidth));idx--);
            if (layouts[idx] != current) current = self.setLayout(self.current = layouts[idx]);

            var match = document.body.className.match(current.name);
            if (match == null) document.body.className = current.name;

        },

        //> public void layout(force)
        layout : function(force) {

            var self = this.validate(force);
            if (!self.dirty) return;

            self.computeLayout();

            var view = self.target;

            var width = view.outerWidth();
            var height = view.outerHeight();

            var header = self.regions.header;
            var footer = self.regions.footer;

            var left = self.regions.left;
            var right = self.regions.right;

            var marginLeft = (left)?(left.width() + 15):0;
            var marginRight = (right)?(right.width() + 15):0;

            var center = self.regions.center;

            center.css('margin-left',marginLeft);
            center.css('margin-right',marginRight);

            var offsetTop = center[0].offsetTop;
            var offsetHeight = center[0].offsetHeight;

            var offsetLeft = $doc.offsetLeft(left[0]);
            var offsetRight = $doc.offsetLeft(right[0]);

            var splitters = self.splitters,splitter;

            if (splitter = splitters.left) {
                splitter.setBounds(offsetLeft,$doc.offsetLeft(center[0]) + center.outerWidth());
                splitter.setStyles({top:$doc.offsetTop(left[0]),left:offsetLeft + left[0].offsetWidth - 7,height:left.outerHeight()});
            }

            if (splitter = splitters.right) {
                splitter.setBounds($doc.offsetLeft(center[0]),offsetRight + right[0].offsetWidth);
                splitter.setStyles({top:$doc.offsetTop(right[0]),left:offsetRight,height:right[0].offsetHeight});
            }

            for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
                node.resize({});
            }

        },

        //> public resize(Object message,Object size) {
        resize : function resize(message,size) {
            var self = this,source = message.source;
            self.regions[source.cid].css(size);
            self.layout(true);
        },

        //> private void onSplitter(Object message,Object? object)
        onSplitter : function(message,object) {

            var self = this,splitter = message.source;
            var name = splitter.name,target = self.regions[name];

            if (name.match(/left/)) target.layout({width:splitter.offsetLeft - $doc.offsetLeft(target[0]) + splitter.offsetWidth});
            else if (name.match(/right/)) target.layout({width:$doc.offsetLeft(target[0]) + target[0].offsetWidth - splitter.offsetLeft});

            self.layout(true);

        }

    });

    snap.extend(PageLayout,{

        template : function(config,context) {
            context.render(PageLayout.getName());
            context.queue(config);
        }

    });

    return PageLayout;

});

define('snap.scroller.Scroller',function(snap) {

    //> public Scroller(Object? config)
    var Scroller = function(config) {

        var self = this;self.window = $(window);
        Scroller.superclass.constructor.call(self,config);

        self.window.bind('load',self.onLoad.bind(self));
        self.window.bind('resize',self.onResize.bind(self));
        self.window.bind('scroll',self.onScroll.bind(self));

    };

    snap.inherit(Scroller,'snap.Component');
    snap.extend(Scroller.prototype,{

        classes:{elem:'scroller'},

        onLoad : function(event) {
            var self = this;self.elem.prependTo(document.body);
            self.elem.css({top:Math.round((self.window.height() - self.elem.height())/2)});
            self.elem.bind('click',self.onClick.bind(self));
        },

        onResize : function(event) {
            this.elem.css({top:Math.round((this.window.height() - this.elem.height())/2)});
        },

        onScroll : function(event) {
            var self = this,scrollTop = self.window.scrollTop();
            self.elem.css({visibility:(scrollTop > 0)?'visible':'hidden'});
        },

        onClick : function(event) {
            $('html, body').animate({scrollTop:0},{duration:1000});
            snap.publish('rover',{an:'Dash.BackToTop.click'},self);
        }

    });

    new Scroller();

    return Scroller;

});

define('snap.tabs.Tab',function(snap) {

    //> public Tab(Object? config)
    var Tab = function(config) {
        Tab.superclass.constructor.call(this,config);
    };

    snap.inherit(Tab,'snap.Container');
    snap.extend(Tab.prototype,{

        //> protected void render(Object target)
        render : function(target) {

            var self = this;Tab.superclass.render.call(self,target);
            self.head = $(snap.fragment(Tab,{head:true,title:self.title})).attr('oid',self.oid);
            self.elem.append(self.content);
            if (self.closable) self.renderClose();

            self.head.bind('click',self.onClick.bind(self));

            self.subscribe('show',self.onShow);
            self.subscribe('hide',self.onHide);

        },

        renderClose : function() {
            var self = this;self.head.addClass('x');
            var close = $('<b class="x"/>').appendTo($('div.tab-h',self.head));
            close.bind('click',self.onClose.bind(self));
        },

        //> public void resize(Object size)
        resize : function(size) {
            this.elem.layout(size);
            this.layout();
        },

        onClick : function(event) {
            this.publish('select',this,true);
        },

        onClose : function(message) {
            this.parent.removeChild(this);
        },

        onShow : function(message) {
        },

        onHide : function(message) {
        }

    });

    snap.extend(Tab,{

        template : function(config,context) {
            context.render(Tab.getName());
            context.queue(config);
        }

    });

    return Tab;

});

define('snap.tabs.Tabs',function(snap) {

    //> public Tabs(Object? config)
    var Tabs = function(config) {
        Tabs.superclass.constructor.call(this,config);
        var self = this;self.subscribe('select',self.onSelect);
    };

    snap.inherit(Tabs,'snap.Container');
    snap.extend(Tabs.prototype,{

        manager:'snap.tabs.TabsLayout',

        getTab : function(key) {
            return this.getChild(key);
        },

        scrollTo : function(key) {
            var tab = this.getChild(key);
            if (tab) this.manager.scrollTo(key);
        },

        onSelect : function(message,tab) {
            this.manager.selectTab(tab);
        }

    });

    snap.extend(Tabs,{

        template : function(config,context) {
            context.render(Tabs.getName());
            context.queue(config);
        }

    });

    return Tabs;

});

define('snap.tabs.TabsLayout',function(snap) {

	var Tab = snap.require('snap.tabs.Tab');

	//> public TabsLayout(Object? config)
	var TabsLayout = function(config) {
		TabsLayout.superclass.constructor.call(this,config);
	};

	snap.inherit(TabsLayout,'snap.Layout');
	snap.extend(TabsLayout.prototype,{

		render : function() {

			var self = this;
			var target = self.target;

			self.head = $('div.tabs-h',target);
			self.scroll = $('div.tabs-sc',self.head);

			self.list = $('ul.tabs-ul',self.scroll);
			self.last = $('li',self.list).last();

			self.body = $('div.tabs-b',target);

		},

		renderScrollers : function() {

			var self = this;self.scrollers = {};

			var left = self.scrollers.left = $('<div class="tabs-sl"/>').appendTo(self.head);
			var right = self.scrollers.right = $('<div class="tabs-sr"/>').appendTo(self.head);

			left.bind('mousedown',self.onScrollLeft.bind(self));
			left.bind('mouseup',self.onScrollStop.bind(self));

			right.bind('mousedown',self.onScrollRight.bind(self));
			right.bind('mouseup',self.onScrollStop.bind(self));

			return self.scrollers;

		},

		//> public void addComponent(Object component,boolean defer)
		addComponent : function(component,defer) {

			var self = this;
			var tab = component;

			self.last.before(tab.head);
			self.body.append(tab.elem);

			if (tab.selected) self.selectTab(tab);
			else if (!self.active) self.selectTab(tab);

			if (self.ready && !defer) self.layout();

		},

		//> public void removeComponent(Object component,boolean defer)
		removeComponent : function(component,defer) {

			var self = this,tab = component;
			if (self.active == tab) delete self.active;

			tab.head.remove();
			tab.elem.remove();

			if (self.ready && !defer) self.layout();

		},

		showScrollers : function() {

			var self = this,scrollers = self.scrollers || self.renderScrollers();

			self.scroll.css({margin:'0px 24px'});

			self.scrollers.left.css({display:'block'});
			self.scrollers.right.css({display:'block'});

		},

		hideScrollers : function() {

			var self = this;

			self.scroll[0].scrollLeft = 0;

			self.scrollers.left.css({display:'none'});
			self.scrollers.right.css({display:'none'});

			self.scroll.css({margin:0});

		},

		selectTab : function(tab) {

			var self = this,active = self.active;
			if (active) self.toggleTab(active,false);

			self.toggleTab(self.active = tab,true);
			self.scrollTo(tab);

		},

		toggleTab : function(tab,active) {

			tab.head.toggleClass('s');
			tab.elem.css({display:active?'block':'none'});

			tab.publish(active?'show':'hide');

		},

		scrollTo : function(tab) {

			var self = this,head = tab.head;

			var offsetLeft = head[0].offsetLeft;
			var offsetRight = offsetLeft + head[0].offsetWidth;

			var scrollLeft = self.scroll[0].scrollLeft;
			var scrollWidth = self.scroll[0].offsetWidth;

			if (offsetLeft < scrollLeft) self.scroll[0].scrollLeft = offsetLeft;
			else if (offsetRight > (scrollLeft + scrollWidth)) self.scroll[0].scrollLeft = offsetRight - scrollWidth;

		},

		layout : function(force) {

			var self = this.validate(force);
			if (!self.dirty || (self.active == null)) return;

			var height = self.body.height();
			if (height <= 0) return;

			var autosize = self.container.autosize;
			if (autosize) self.body.layout({height:self.target.height() - self.head.outerHeight(true)});

			var last = self.last[0].previousSibling;
			if (last && ((last.offsetLeft + last.offsetWidth) > self.head.outerWidth())) self.showScrollers();
			else if (self.scrollers) self.hideScrollers();

			for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
				node.resize({});
			}

		},

		onScrollLeft : function(event) {

			var self = this,scroll = self.scroll[0],last = self.last[0].previousSibling;
			var maximum = last.offsetLeft + last.offsetWidth - scroll.offsetWidth;

			self.ticker = window.setInterval(self.onScrollTick.bind(self,maximum,-20),50);

		},

		onScrollRight : function(event) {

			var self = this,scroll = self.scroll[0],last = self.last[0].previousSibling;
			var maximum = last.offsetLeft + last.offsetWidth - scroll.offsetWidth;

			self.ticker = window.setInterval(self.onScrollTick.bind(self,maximum,20),50);

		},

		onScrollTick : function(maximum,tick) {
			var self = this,scrollLeft = self.scroll[0].scrollLeft;
			self.scroll[0].scrollLeft = Math.max(Math.min(scrollLeft + tick,maximum),0);
		},

		onScrollStop : function(event) {
			window.clearInterval(this.ticker);
		}

	});

	return TabsLayout;

});

define('snap.tetris.TetrisLayout',function(snap) {

    //> public TetrisLayout(Object? config)
    var TetrisLayout = function(config) {
        TetrisLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(TetrisLayout,'snap.Layout');
    snap.extend(TetrisLayout.prototype,{

        render : function() {

            var self = this,container = self.container;
            var target = self.target;target.append(self.template());

            self.index = 0;self.table = $('table',target);self.cells = [];
            self.cols = container.cols;self.trow = $('tr',self.target);

            var width = Math.floor(100/self.cols).toString().concat('%');
            for (var idx = 0,cell;(idx < self.cols);idx++) {
                self.cells.push(cell = $('<div class="tetris"/>'));
                self.trow.append($('<td class="tetris"/>').css({width:width}).append(cell));
            }

        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {

            var self = this,cols = self.cols,cells = self.cells;
            var idx = self.index,minimum = cells[idx].height();
            for (var mdx = idx + 1;((minimum > 50) && ((mdx %= cols) != idx));minimum = Math.min(minimum,height),mdx++) {
                var cell = cells[mdx],height = cell.height();
                if (height < minimum) self.index = mdx;
            }

            cells[self.index].append(component.elem);
            if (self.ready && !defer) self.layout();

        },

        layout : function(force) {

            var self = this,row = self.table[0].rows[0],cells = self.cells;
            for (var idx = 0,cols = 0,cell;(cell = cells[idx]);idx++) cols += cell[0].hasChildNodes()?1:0;

            var width = Math.floor(100/cols).toString().concat('%');
            for (var idx = 0,cell;(idx < self.cols);idx++) $(row.cells[idx]).css({width:(idx < cols)?width:'0'});

            TetrisLayout.superclass.layout.call(self,force);

        }

    });

    snap.extend(TetrisLayout,{

        template : function(config,context) {
            context.render(TetrisLayout.getName());
        }

    });

    return TetrisLayout;

});

define('snap.toolbar.Toolbar',function(snap) {

    //> public Toolbar(Object? config)
    var Toolbar = function(config) {
        Toolbar.superclass.constructor.call(this,config);
    };

    snap.inherit(Toolbar,'snap.Container');
    snap.extend(Toolbar.prototype,{
        classes:{elem:'tbar'},
        manager:'snap.toolbar.ToolbarLayout'
    });

    return Toolbar;

});

define('snap.toolbar.ToolButton',function(snap) {

    //> public Button(Object? config)
    var ToolButton = function(config) {
        ToolButton.superclass.constructor.call(this,config);
        if (this.children[0]) this.renderArrow(this.menu = this.children[0]);
    };

    snap.inherit(ToolButton,'snap.Container');
    snap.extend(ToolButton.prototype,{

        //> protected void render(Object target)
        render : function(target) {

            var self = this;ToolButton.superclass.render.call(self,target);
            self.button = $('button',self.elem).attr({value:self.value,title:self.title});

            var before = self.classes.elem.match(/(top|lt)/);
            var icon = self.icon,image = icon?self.renderImage(icon):null;

            if (image && before) self.button.prepend(image);
            else if (image) self.button.append(image);

            self. button.bind('mouseover',self.onMouseOver.bind(self));
            self. button.bind('mouseout',self.onMouseOut.bind(self));

            self. button.bind('mousedown',self.onMouseDown.bind(self));
            self. button.bind('mouseup',self.onMouseUp.bind(self));

            self. button.bind('click',self.onClick.bind(self));

        },

        renderImage : function(icon) {
            return snap.isNode(icon)?icon:$('<img/>').attr({src:icon});
        },

        renderArrow : function(menu) {

            var self = this;
            self.elem.addClass('arrow');

            var arrow = $('<img class="arrow"/>').attr({src:self.arrow}).appendTo(self.elem);
            arrow.bind('click',self.onShow.bind(self));

        },

        onMouseOver : function(event) {

            var self = this,related = event.relatedTarget;
            if ($.contains(self.elem[0],related)) return;

            self.elem.addClass('hover');

        },

        onMouseOut : function(event) {

            var self = this,related = event.relatedTarget;
            if ($.contains(self.elem[0],related)) return;

            self.elem.removeClass('hover');

        },

        onMouseDown : function(event) {
            this.elem.addClass('down');
        },

        onMouseUp : function(event) {
            this.elem.removeClass('down');
        },

        onShow : function(event) {
            this.menu.publish('show',{align:'bottom'});
            return false;
        },

        onClick : function(event) {
            return this.publish('click',{text:this.text,href:this.href});
        }

    });

    return ToolButton;

});

define('snap.toolbar.ToolbarLayout',function(snap) {

	//> public ToolbarLayout(Object? config)
	var ToolbarLayout = function(config) {
		var self = this,container = config.container;
		container.subscribe('show',self.onShow,self);container.subscribe('hide',self.onHide,self);
		ToolbarLayout.superclass.constructor.call(self,config);
	};

	snap.inherit(ToolbarLayout,'snap.Layout');
	
	return ToolbarLayout;
	
});

define('snap.tree.Tree',function(snap) {

    //> public Tree(Object? config)
    var Tree = function(config) {
        Tree.superclass.constructor.call(this,config);
    };

    snap.inherit(Tree,'snap.Container');
    snap.extend(Tree.prototype,{

        classes:{elem:'tree'},manager:'snap.tree.TreeLayout'

    });

    return Tree;

});

define('snap.tree.TreeNode',function(snap) {

    //> public TreeNode(Object? config)
    var TreeNode = function(config) {
        TreeNode.superclass.constructor.call(this,config);
    };

    snap.inherit(TreeNode,'snap.Container');
    snap.extend(TreeNode.prototype,{

        classes:{elem:'node'},

        //> protected void render(Object target)
        render : function(target) {

            var self = this;

            TreeNode.superclass.render.call(self,target);

            var image = self.renderImage(self.icon);
            if (image) self.elem.append(image);

            var anchor = self.renderAnchor(self.text,self.href);
            if (anchor) self.elem.append(anchor);

        },

        renderImage : function(icon) {
            var image = snap.isNode(icon)?icon:$('<img/>').attr({src:icon});
            return image?image.addClass('node-i'):null;
        },

        renderAnchor : function(text,href) {
            var elem = $('<a class="node-a"/>').attr({href:href});
            return elem.bind('click',this.onClick.bind(this)).append(text);
        },

        onClick : function(event) {
            return this.publish('click',{text:this.text,href:this.href},true);
        }

    });

    return TreeNode;

});

define('snap.tree.TreeLayout',function(snap) {

    //> public TreeLayout(Object? config)
    var TreeLayout = function(config) {
        TreeLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(TreeLayout,'snap.Layout');
    snap.extend(TreeLayout.prototype,{

        render : function() {
            var self = this;self.nodes = {};
            self.elem = $('<ul class="tree-ul"/>').appendTo(self.target);
        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {
            this.addNode(this.elem,component);
        },

        //> private Object addNode(Object parent,Object node)
        addNode : function(parent,node) {

            var self = this,elem = $('<li class="tree-li"/>').appendTo(parent),children = node.children;
            elem.append(self.addExpander({src:'data:image/gif;base64,R0lGODlhAQABAJH/AP///wAAAMDAwAAAACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw=='}));
            elem.addClass(children.length?(node.expanded?'x':'c'):'n').append(node.elem);

            self.appendChildren(elem,node);

            return node;

        },

        addExpander : function(attrs) {
            var self = this,image = $('<img class="tree-x"/>').attr(attrs);
            return image.bind('click',self.onExpander.bind(self));
        },

        appendChildren : function(parent,node) {
            var self = this,elem = $('<ul class="tree-ul"/>').appendTo(parent),children = node.children;
            for (var idx = 0,len = children.length;(idx < len);idx++) self.addNode(elem,children[idx]);
        },

        onExpander : function(event) {
            var node = event.target.parentNode,className = node.className;
            if (className.match(/tree-li c/)) node.className = 'tree-li x';
            else if (className.match(/tree-li x/)) node.className = 'tree-li c';
        }

    });

    return TreeLayout;

});

define('snap.tree.TreeLoader',function(snap) {

    var Tree = snap.require('snap.tree.Tree');
    var TreeNode = snap.require('snap.tree.TreeNode');

    var AjaxRequest = snap.require('snap.ajax.AjaxRequest');

    //> public TreeLoader(Object? config)
    var TreeLoader = function(config) {
        TreeLoader.superclass.constructor.call(this,config);
    };

    snap.inherit(TreeLoader,'snap.Observable');
    snap.extend(TreeLoader.prototype,{

        load : function(url,async) {

            var self = this;

            var request = new AjaxRequest();

            request.subscribe('success',self.onSuccess,self);
            request.subscribe('error',self.onError,self);

            request.get(url,async);

        },

        onSuccess : function(event,request) {

            var self = this;

            var root = request.responseXML.firstChild;

            var tree = new Tree({title:root.getAttribute('title')});
            for (var node = root.firstChild;(node);node = node.nextSibling) self.addNode(tree,node);

            self.publish('complete',tree);

        },

        onError : function(event,request) {
            this.publish('complete',null);
        },

        addNode : function(parent,node) {

            var self = this,type = node.nodeType;
            if (type != 1) return null;

            var icon = node.getAttribute('icon');
            var text = node.getAttribute('text');

            var href = node.getAttribute('href');
            var expanded = node.getAttribute('expanded');

            var treeNode = new TreeNode({icon:icon,text:text,href:href,expanded:expanded});
            for (var node = node.firstChild;(node);node = node.nextSibling) self.addNode(treeNode,node);

            return parent.appendChild(treeNode);

        }

    });

    return TreeLoader;

});

define('snap.upgrade.Upgrade',function(snap) {

    var Window = snap.require('snap.window.Window');

    var Cookies = snap.require('ebay.cookies');

    var browsers = {
        explorer:{title:'Explorer',match:/(MSIE)\s*([\d\.]*)/,major:8},
        firefox:{title:'Firefox',match:/(Firefox)\/([\d\.]*)/,major:11},
        safari:{title:'Safari',match:/(Version)\/([\d\.]*).*Safari/,major:5},
        chrome:{title:'Chrome',match:/(Chrome)\/([\d\.]*)/,major:10}
    };

    //> public Upgrade(Object? config)
    var Upgrade = function(config) {

        var self = this,agent = navigator.userAgent;
        Upgrade.superclass.constructor.call(self,config);

        for (var name in browsers) {
            var match = agent.match(browsers[name].match);
            if (match) self.browser = snap.extend(browsers[name],{version:match[2]});
        }

        var cookie = Cookies.readCookie('dp1','pbf') || '#',upgrade;
        if ((upgrade = Cookies.getBitFlag(cookie,93)) && !self.force) return;

        var version = (self.browser && (self.browser.version < self.browser.major) && !agent.match(/compatible/)) ;
        if (version || self.force) $(window).bind('load',self.onLoad.bind(self));

        Cookies.writeCookielet('dp1','pbf',Cookies.setBitFlag(cookie,93,1));

    };

    snap.inherit(Upgrade,'snap.Observable');
    snap.extend(Upgrade.prototype,{

        onLoad : function(event) {

            var self = this;

            self.message = self.message.replace('#browser#',self.browser.title.concat(' ',self.browser.version));
            self.upgrade = new Window({classes:{elem:'upgrd'},modal:true,resizable:false});
            self.upgrade.show({content:snap.fragment(Upgrade,self)});

            $(document).bind('keydown',self.ctrl.bind(self));

        },

        ctrl : function(event) {
            if (event.keyCode == 27) this.upgrade.hide();
        }

    });

    return Upgrade;

});

define('snap.vertical.VerticalLayout',function(snap) {

    //> public VerticalLayout(Object? config)
    var VerticalLayout = function(config) {
        VerticalLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(VerticalLayout,'snap.Layout');
    snap.extend(VerticalLayout.prototype,{

        //> protected void layout(boolean force)
        layout : function(force) {

            var self = this.validate(force);

            var target = self.target,width = target.width(),height = target.height();
            for (var node = self.children.fwd;(node);node = node.siblings.fwd) height -= node.elem.outerHeight();
            if ((self.children.length <= 0) || (height <= 0)) return;

            var frame = target.frame(),padding = frame.padding;
            var center = Math.round(padding.left + width/2),spacing = Math.round(height/(2*self.children.length));

            for (var node = self.children.fwd,top = padding.top + spacing;(node);node = node.siblings.fwd) {
                node.elem.css({position:'absolute',top:top,left:center - (node.elem.outerWidth()/2),margin:0});top += node.elem.outerHeight() + 2*spacing;
            }

        }

    });

    return VerticalLayout;

});

define('ebay.context.Context',function(snap) {

	var Features = snap.require('snap.client.features.Features');

	//> public Context(Object? config)
	var Context = function(config) {
		snap.extend(this,config);
		Features.call(Features,this.features);
	};

	return Context;

});

/**
* Reads and writes cookies for Marketplace domain page.
* <p>
* Note: This class is only used for eBay site.
*
*/
define('ebay.cookies',function(snap) {

	var Cookies = function() {};

	snap.extend(Cookies,{

		//TODO: possibly make this config data
		Default_Cookie_Format : {
			"COOKIELET_DELIMITER":"^",
			"NAME_VALUE_DELIMITER":"/",
			"escapedValue":true
		},

		DP_Cookie_Format : {
			"COOKIELET_DELIMITER":"^",
			"NAME_VALUE_DELIMITER":"/",
			"bUseExp":true,
			"startDelim":"b"
		},

		Session_Cookie_Format : {
			"COOKIELET_DELIMITER":"^",
			"NAME_VALUE_DELIMITER":"=",
			"escapedValue":true,
			"startDelim":"^"
		},

		DS_Cookie_Format : {
			"COOKIELET_DELIMITER":"^",
			"NAME_VALUE_DELIMITER":"/"
		},

		sPath : "/",

		aConversionMap : {
			'reg' : ['dp1','reg'],
			'recent_vi' : ['ebay','lvmn'],
			'ebaysignin' : ['ebay','sin'],
			'p' : ['dp1','p'],
			'etfc' : ['dp1','etfc'],
			'keepmesignin' : ['dp1','kms'],
			'ItemList' : ['ebay','wl'],
			'BackToList' : ['s','BIBO_BACK_TO_LIST']
		},

		aFormatMap : {
		},

		sCOMPAT : "10",
		sCONVER : "01",
		sSTRICT : "00",

		sModesCookie : "ebay",
		sModesCookielet : "cv",

		/**
		* Gets the value of the given cookielet from a specified cookie.
		*
		* @param {String} cookie
		*        a string name of the cookie
		* @param {String} cookielet
		*        a string name of the cookielet in the specified cookie
		* @return {String}
		*        the value of the cookielet
		*/
		//>public String readCookie(String,String);
		readCookie : function (psCookie,psCookielet) {
			var rv = this.readCookieObj(psCookie,psCookielet).value;
			return (rv) ? decodeURIComponent(rv) : "";
		},

		//>private Object createDefaultCookieBean(String, String);
		createDefaultCookieBean : function(psCookie,psCookielet) {
			// define cookie bean
			var cookie = {};
			// string
			cookie.name = psCookie;
			// string
			cookie.cookieletname = psCookielet;
			// string
			cookie.value = "";
			// date in millisecs UTC
			cookie.maxage = 0;
			cookie.rawcookievalue = "";
			cookie.mode = "";
			return cookie;
		},

		// TODO make internal method to return cookie object readCookieObj
		//> private String readCookieObj(String,String);
		readCookieObj : function (psCookie,psCookielet) {
			var cookie = this.createDefaultCookieBean(psCookie,psCookielet);
			this.update();
			this.checkConversionMap(cookie);

			// returns the raw value of the cookie from document.cookie
			// raw value
			cookie.rawcookievalue = this.aCookies[cookie.name];

			// TODO - determine why this is required
			if (!cookie.name || !cookie.rawcookievalue){
				cookie.value = "";
			}
			else if (!cookie.cookieletname){
				// read cookie
				this.readCookieInternal(cookie);
			}
			else {
				// read cookielet
				this.readCookieletInternal(cookie);
			}

			// Check cookie corruption

			var guid = (psCookielet && psCookielet.match(/guid$/));
			var object = (typeof(cookie) != 'undefined')?cookie:'';

			var corrupted = (object && guid && (cookie.value.length > 32));
			if (corrupted) cookie.value = cookie.value.substring(0,32);

			return object;

		},

		//> private void checkConversionMap(Object);
		checkConversionMap : function(cookie) {
			//Check conversion map
			// 2 values returned - 2 values cookie + cookielet
			var cmap = this.aConversionMap[cookie.name];

			// if cookielet is in conversio map then do the following
			// reset cookie and cookielet names to old namesl
			/*
				raw cookies are being converted to cookielets
				this takes care of the moving cookies to cookielets
			*/

			if (cmap) {
				// compatibility mode
				cookie.mode = this.getMode(cookie.name);
				cookie.name = cmap[0];
				cookie.cookieletname = cmap[1];
			}
		},

		//> private Object readCookieInternal(Object);
		readCookieInternal : function(cookie) {
				// read raw cookie with compatibility modes to switch between raw cookie and cookielets
				cookie.value  = cookie.rawcookievalue;
				return cookie;
		},

		//> private Object readCookieletInternal(Object);
		readCookieletInternal : function(cookie){
				var clet = this.getCookielet(cookie.name,cookie.cookieletname,cookie.rawcookievalue);
				// handling formats of cookielets mentiond in aFormatMap
				var format = this.getFormat(cookie.name);
				if (clet && format.bUseExp){
					//do not expire cookie on client
					var cletOrig = clet;
					clet = clet.substring(0,clet.length-8);
					if (cletOrig.length > 8) {
						cookie.maxage = cletOrig.substring(cletOrig.length-8);
					}
				}

				// All other modes and if mode is not available
				cookie.value = clet;
				// COMPAT mode
				if (cookie.mode == this.sCOMPAT){
					cookie.value = cookie.rawcookievalue;
				}
				return cookie;
		},

		/**
		* Gets multiple values from a cookielet. This function splits a cookielet
		* value by predefined delimiter and construct an array stores each value.
		*
		* @param {String} cookie
		*        a string name of the cookie
		* @param {String} cookielet
		*        a string name of the cookielet in the specified cookie
		* @return {Object}
		*        an array that stores the multiples value
		*/
		//> public Object readMultiLineCookie(String,String);
		readMultiLineCookie : function (psCookie,psCookielet) {
			//this.update();
			if (!psCookie || !psCookielet){
				return "";
			}
			var val, r = "";
			var cmap = this.aConversionMap[psCookie];
			if (cmap) {
				val = this.readCookieObj(cmap[0],cmap[1]).value || "";
			}
			if (val) {
				r = this.getCookielet(psCookie,psCookielet,val) || "";
			}
			return (typeof(r)!="undefined")?r:"";
		},

		/**
		* Writes a value String to a given cookie. This function requires setting
		* an exact expire date. You can use {@link writeCookieEx} instead to set
		* the days that the cookie will be avaliable.
		*
		* @param {String} cookie
		*        a string name of the cookie to be written
		* @param {String} value
		*        a string value to be written in cookie
		* @param {String} exp
		*        an exact expired date of the cookie
		* @see #writeCookieEx
		*/
		//> public void writeCookie(String,String,String);
		//> public void writeCookie(String,String,int);
		writeCookie : function (psCookie,psVal,psExp) {
			//@param    pbSecure - secured? (optional)
			//Check conversion map
			var cmap = this.aConversionMap[psCookie];
			if (cmap) {
				this.writeCookielet(cmap[0], cmap[1], psVal, psExp);
				return;
			}
			var format = this.getFormat(psCookie);
			if (psVal && format.escapedValue) {
				psVal = encodeURIComponent(psVal);
			}
			this.writeRawCookie(psCookie,psVal,psExp);

		},

		//> private void writeRawCookie(String, String, String);
		//> private void writeRawCookie(String, String, int);
		writeRawCookie : function (psCookie,psVal,psExp) {
			if (psCookie && (psVal!==undefined)){
		//    Uncomment secure related lines below and
		//    add to param list if it is being used
		//    var secure = pbSecure?"true":"";
		//    check for size limit
				if((isNaN(psVal) && psVal.length<4000) || (psVal+'').length<4000){
					if (typeof psExp == 'number') {
						psExp = this.getExpDate(psExp);
					}
					var expDate = psExp?new Date(psExp):new Date(this.getExpDate(730));
					var format = this.getFormat(psCookie);
					//TODO: refactor domain logic before E513
					var sHost = this.sCookieDomain;
					var dd = document.domain;
					//if (!dd.has(sHost)) {
					if (dd.indexOf(sHost)==-1) {
						var index = dd.indexOf('.ebay.');
						if (index>0) {
							this.sCookieDomain = dd.substring(index);
						}
					}
					//Added check before writing the cookie
					if(document.cookie)
					{
						document.cookie = psCookie + "=" + (psVal||"") +
						((psExp || format.bUseExp)?"; expires=" + expDate.toGMTString():"") +
						"; domain=" + this.sCookieDomain +
						"; path=" + this.sPath;
		//        "; secure=" + secure;
					}
				}
			}
		},

		/**
		* Writes a value String to a given cookie. You can put the days to expired
		* this cookie from the current time.
		*
		* @param {String} cookie
		*        a string name of the cookie to be written
		* @param {String} value
		*        a string value to be written in cookie
		* @param {int} expDays
		*        the number of days that represents how long the cookie will be
		*        expired
		* @see #writeCookie
		*/
		//>public void writeCookieEx(String,String,int);
		writeCookieEx : function (psCookie,psVal,piDays) {
			this.writeCookie(psCookie,psVal,this.getExpDate(piDays));
		},

		/**
		* Writes value to cookielet. You can use {@link writeMultiLineCookie} for
		* some multi-level cookielet.
		*
		* @param {String} cookie
		*        the name of the specified cookie which contains the cookielet to be
		*        write
		* @param {String} cookielet
		*        the name of the cookielet to be write
		* @param {String} val
		*        the value of the cookielet
		* @param {String} exp
		*        an expired date of the cookielet
		* @param {String} contExp
		*        an expired date of the cookie
		* @see #writeMultiLineCookie
		*/
		//> public void writeCookielet(String,String,String,{int|String}?,{int|String}?);
		writeCookielet : function (psCookie,psCookielet,psVal,psExp,psContExp) {
			//@param    pSec - secured? (optional)
			if (psCookie && psCookielet){
				this.update();
				var format = this.getFormat(psCookie);
				if (format.bUseExp && psVal){
					//Set the default exp date to 2 yrs from now
					if (typeof psExp == 'number') {
						psExp = this.getExpDate(psExp);
					}
					var expDate = psExp?new Date(psExp):new Date(this.getExpDate(730)); //<Date
					var expDateUTC = Date.UTC(expDate.getUTCFullYear(),expDate.getUTCMonth(),expDate.getUTCDate(),expDate.getUTCHours(),expDate.getUTCMinutes(),expDate.getUTCSeconds());
					expDateUTC = Math.floor(expDateUTC/1000);
					//psVal += expDateUTC.dec2Hex();
					psVal += parseInt(expDateUTC,10).toString(16);
				}
				var val = this.createCookieValue(psCookie,psCookielet,psVal);
				this.writeRawCookie(psCookie,val,psContExp);
			}
		},

		/**
		* Writes value to some multi-level cookielet. Some cookielet contains sub
		* level, and you can use the name of the cookielet as cookie name and write
		* its sub level value.
		* These cookielet includes:
		* <p>
		* <pre>
		* Name as Cookie | name in cookielet         | upper level cookie
		* -------------- |---------------------------|----------------------
		* reg            | reg                       | dp1
		* recent_vi      | lvmn                      | ebay
		* ebaysignin     | sin                       | ebay
		* p              | p                         | dp1
		* etfc           | etfc                      | dp1
		* keepmesignin   | kms                       | dp1
		* BackToList     | BIBO_BACK_TO_LIST         | s
		* reg            | reg                       | dp1
		* </pre>
		* <p>
		* you need to use {@link writeCookielet} for other cookielet.
		*
		* @param {String} cookie
		*        the name of the specified cookie which contains the cookielet to be write
		* @param {String} cookielet
		*        the mame of the cookielet to be write
		* @param {String} val
		*        the value of the cookielet
		* @param {String} exp
		*        an expired date of the cookielet
		* @param {String} contExp
		*        an expired date of the cookie
		* @see #writeCookielet
		*/
		//> public void writeMultiLineCookie(String,String,String,String,String);
		writeMultiLineCookie : function (psCookie,psCookielet,psVal,psExp,psContExp) {
			this.update();
			var val = this.createCookieValue(psCookie,psCookielet,psVal);
			if (val){
				var cmap = this.aConversionMap[psCookie];
				if (cmap) {
					this.writeCookielet(cmap[0],cmap[1],val,psExp,psContExp);
				}
			}
		},

		/**
		* Gets the bit flag value at a particular position.This function is
		* deprecated, use {@link #getBitFlag} instead.
		*
		* @deprecated
		* @param {String} dec
		*        a bit string that contains series of flags
		* @param {int} pos
		*        the flag position in the bit string
		* @return {int}
		*        the flag value
		* @see #getBitFlag
		*/
		//> public int getBitFlagOldVersion(String, int);
		getBitFlagOldVersion : function(piDec, piPos) {
			//converting to dec
			var dec = parseInt(piDec,10);//<Number
			//getting binary value //getting char at position
			var b = dec.toString(2), r = dec?b.charAt(b.length-piPos-1):"";
			return (r=="1")?1:0;
		},

		/**
		* Sets the bit flag at a particular position. This function is deprecated,
		* use {@link #setBitFlag} instead.
		*
		* @deprecated
		* @param {String} dec
		*        a bit string contains series of flags
		* @param {int} pos
		*        the flag position in the bit string
		* @param {int} val
		*        the flag value to be set. Flag will be set as 1 only if the value of
		*        this parameter is 1
		* @see #setBitFlag
		*/
		 //> public int setBitFlagOldVersion(int, int, int);
		setBitFlagOldVersion : function(piDec, piPos, piVal) {
			var b="",p,i,e,l;
			//converting to dec
			piDec = parseInt(piDec+"",10);
			if(piDec)
			{
				//getting binary value
				b = piDec.toString(2);
			}
			l = b.length;
			if (l<piPos)
			{
				e = piPos-l;
				for(i=0;i<=e;i++)
				{
					b = "0"+b;
				}
			}
			//finding position
			p = b.length-piPos-1;
			//replacing value at pPos with pVal and converting back to decimal
			return parseInt(b.substring(0,p)+piVal+b.substring(p+1),2);
		},

		/**
		* Gets the bit flag value at a particular position.
		*
		* @param {String} dec
		*        a bit string which contains series of flags
		* @param {int} pos
		*        the flag position in the bit string
		* @return {int}
		*        the flag value
		*/
		//> public int getBitFlag(String,int);
		getBitFlag : function(piDec, piPos) {

			if(piDec != null && piDec.length > 0 && piDec.charAt(0) == '#' )
			{
				var length = piDec.length;
				var q = piPos%4;
				var hexPosition = Math.floor(piPos/4) + 1;

				var absHexPosition = length - hexPosition;
				var hexValue = parseInt(piDec.substring(absHexPosition,absHexPosition+1),16);
				var hexFlag = 1 << q;

				return ((hexValue & hexFlag) == hexFlag)?1:0;
			}
			else
			{
				//process by old format
				return this.getBitFlagOldVersion(piDec, piPos);
			}

		},

		/**
		* Set the bit flag at a particular position.
		*
		* @param {String} dec
		*        A bit string that contains series of flags
		* @param {int} pos
		*        the flag position in the bit string
		* @param {int} val
		*        the falg value to be set. Flag will be set as 1 only if the value of
		*        this parameter is 1.
		*/
		//> public int setBitFlag(String,int,int);
		//> public int setBitFlag(int,int,int);
		setBitFlag : function(piDec, piPos, piVal) {

			if(piDec != null && piDec.length > 0 && piDec.charAt(0) == '#' )
			{
				//process by new format
				var length = piDec.length;
				var q = piPos%4;
				var hexPosition = Math.floor(piPos/4) + 1;

				if(length <= hexPosition)
				{
					if(piVal != 1) {
						return piDec;
					}

					var zeroCout = hexPosition - length + 1;
					var tmpString = piDec.substring(1,length);
					while(zeroCout > 0)
					{
						tmpString = '0' + tmpString;
						zeroCout--;
					}

					piDec = '#' + tmpString;
					length = piDec.length;
				}

				var absHexPosition = length - hexPosition;
				var hexValue = parseInt(piDec.substring(absHexPosition,absHexPosition+1),16);
				var hexFlag = 1 << q;

				if(piVal == 1)
				{
					hexValue |= hexFlag;
				}
				else
				{
					hexValue &= ~hexFlag;
				}

				piDec = piDec.substring(0,absHexPosition) + hexValue.toString(16) + piDec.substring(absHexPosition+1,length);

				return piDec;

			}
			else
			{
				if(piPos > 31)
				{
					return piDec;
				}
				//process by old format
				return this.setBitFlagOldVersion(piDec, piPos, piVal);
			}

		},

		//> private String  createCookieValue (String, String, String);
		createCookieValue : function (psName,psKey,psVal) {
			var cmap = this.aConversionMap[psName], format = this.getFormat(psName),
				mode = this.getMode(psName), val;
			if (cmap && (mode == this.sSTRICT || mode ==this.sCONVER)) {
				val = this.readCookieObj(cmap[0],cmap[1]).value || "";
			}
			else {
				val = this.aCookies[psName] || "";
			}

			if (format) {
				var clts = this.getCookieletArray(val,format);
				clts[psKey] = psVal;
				var str = "";
				for (var i in clts) {
					if (clts[i]) {
						str += i + format.NAME_VALUE_DELIMITER + clts[i] + format.COOKIELET_DELIMITER;
					}
				}

				if (str && format.startDelim) {
					str = format.startDelim + str;
				}
				val = str;

				if (format.escapedValue){
					val = encodeURIComponent(val);
				}
			}

			return val;
		},

		//> private void update();
		update : function () {
			//store cookie values
			var aC = document.cookie.split("; ");
			this.aCookies = {};
			var regE = new RegExp('^"(.*)"$');
			for (var i=0;i<aC.length;i++) {
				var sC = aC[i].split("=");

				var format = this.getFormat(sC[0]), cv = sC[1], sd = format.startDelim;
				if (sd && cv && cv.indexOf(sd)===0) {
					sC[1] = cv.substring(sd.length,cv.length);
				}
				// check if the value is enclosed in double-quotes, then strip them
				if (sC[1] && sC[1].match(regE)) {
					sC[1]=sC[1].substring(1, sC[1].length - 1);
				}
				this.aCookies[sC[0]] = sC[1];
			}
		},

		//> private String getCookielet(String, String, String);
		getCookielet : function (psCookie,psCookielet,psVal) {
			var format = this.getFormat(psCookie);
			var clts = this.getCookieletArray(psVal,format);
			return clts[psCookielet] || "";
		},

		//> private Object getFormat(String);
		getFormat : function (psCookie) {
			return this.aFormatMap[psCookie] || Cookies.Default_Cookie_Format;
		},

		//> private Object getCookieletArray(String, Object);
		getCookieletArray : function (psVal,poFormat) {
			var rv = [], val = psVal || "";
			if (poFormat.escapedValue){
				val = decodeURIComponent(val);
			}
			var a = val.split(poFormat.COOKIELET_DELIMITER);
			for (var i=0;i<a.length; i++) { //create cookielet array
				var idx = a[i].indexOf(poFormat.NAME_VALUE_DELIMITER);
				if (idx>0) {
					rv[a[i].substring(0,idx)] = a[i].substring(idx+1);
				}
			}
			return rv;
		},

		/**
		* Gets the date behind a given days from current date. This is used to set
		* the valid time when writing the cookie.
		*
		* @param {int} days
		*        the number of days that cookie is valid
		* @return {String}
		*        the expiration date in GMT format
		*/
		//> public String getExpDate(int);
		getExpDate : function (piDays) {
			var expires;
				if (typeof piDays == "number" && piDays >= 0) {
						var d = new Date();
						d.setTime(d.getTime()+(piDays*24*60*60*1000));
						expires = d.toGMTString();
				}
				return expires;
		},

		//> private Object getMode(String);
		getMode : function (psCookie) {
			var h = this.readCookieObj(this.sModesCookie,this.sModesCookielet).value, b;
			if (!(psCookie in this.aConversionMap)){
				return null;
			}
			if (!h) {
				return "";
			}
			//default mode is STRICT when h is "0"
			if (h===0){
				return this.sSTRICT;
			}

			if(h && h!="0"){
				//checking for h is having "." or not
				//if (h.has(".")){
				if (h.indexOf(".")!=-1){
					//conversion cookie is having more than 15 cookie values
					var a = h.split(".");
					//looping through array
					for(var i=0; i<a.length; i++){
						//taking the first hex nubmer and converting to decimal
						//and converting to binary
						b = parseInt(a[i],16).toString(2) + b;
					}
				}
				else{
					//converting to decimal
					//converting to binary number
					b = parseInt(h,16).toString(2);
				}
				//fill the convArray with appropriate mode values
				i=0;
				//getting total binary string length
				var l = b.length, j;
				//looping through each cookie and filling mode of the cookie
				for(var o in this.aConversionMap)
				{
					//find the position to read
					j = l-(2*(i+1));
					//reading backwards 2 digits at a time
					var f = b.substring(j,j+2).toString(10);
					f = (!f)?this.sSTRICT:f;
					if (psCookie == o)
					{
						return (f.length==1)?"0"+f:f;
					}
					i++;
				}
				return null;
			}

		return null;

		},

		getMulti: function(piDec, piPos, piBits) {
				var r = "",i,CJ=this;
				for(i=0;i<piBits;i++){
						r = CJ.getBitFlag(piDec,piPos+i) + r ;
			 }
				 return parseInt(r,2);
		 },

		setMulti: function(piDec, piPos, piBits, piVal) {
			 var i=0,CJ=this, v, l, e;
			 //convert to binary and take piBits out of it
			 v = piVal.toString(2).substring(0,piBits);
			 l = v.length;
				if(l<piBits){
					 e = piBits-l;
						for(var j=0;j<e;j++){
							 v = "0"+v;
					 }
					 l = l+e;
			 }
			 for(i=0;i<l;i++){
						piDec = CJ.setBitFlag(piDec,piPos+i,v.substring(l-i-1,l-i));
			 }
			 return piDec;
		 },

		getTimezoneCookie : function() {
			return Cookies.readCookie('dp1','tzo');
		},

		setTimezoneCookie : function() {
			var tzo = new Date().getTimezoneOffset();
			Cookies.writeCookielet('dp1','tzo',tzo.toString(16));
		},

		setJsCookie : function(event) {
			Cookies.writeCookielet('ebay','js','1');
		}

	});

	Cookies.aFormatMap = {
		'r':Cookies.Default_Cookie_Format,
		'dp1':Cookies.DP_Cookie_Format,
		'npii':Cookies.DP_Cookie_Format,
		'ebay':Cookies.Session_Cookie_Format,
		'reg':Cookies.Session_Cookie_Format,
		'apcCookies':Cookies.Session_Cookie_Format,
		'ds2':Cookies.DS_Cookie_Format
	};

	// Write GMT Timezone Offset
	Cookies.writeCookielet('dp1','tzo',new Date().getTimezoneOffset().toString(16));

	$(document).bind('ajaxSend',Cookies.setJsCookie.bind(Cookies));
	$(window).bind('beforeunload',Cookies.setJsCookie.bind(Cookies));

	return Cookies;

});

snap.require('ebay.cookies');

define('ebay.errors.Errors',function(snap) {

	//> public Errors(Object? config)
	var Errors = function(config) {
		var self = this;snap.except = function() { self.except.apply(self,arguments); };
		if (self.enabled) window.onerror = function() { return self.error.apply(self,arguments); };
	};

	snap.extend(Errors,{

		excepts:[],
	
		//> public void error(Object msg,Object url,Object line)
		error : function(msg,url,line) {
			snap.log('except',msg,url,'line',line);
		},
	
		//> public void except(Object except)
		except : function(except) {
			this.excepts.push(except);
			throw except;
		}
	
	});
	
	return Errors;
	
});

define('ebay.profiler.Profiler',function(snap) {

	var Cookies = snap.require('ebay.cookies');

	var Profiler = function() {};
	snap.extend(Profiler,{

		getParam : function(key) {
			return this.beacon.params[key];
		},

		addParam : function(key,param) {
			if (key) {
				this.beacon.params[key] = param;
			}
		},

		updateLoad : function () {
			if (typeof(oGaugeInfo)!='undefined' && oGaugeInfo.ld === true) {
				var g = oGaugeInfo;
				var ct = (new Date()).getTime();
				g.wt =  ct;
				g.ex3 = ct;
				g.ct21 =  ct - g.iST;
			}
		},

		// sul=1 for sending on unload, else sending on onload such as Safari and FF3.0
		send : function (sul){
			if (typeof(oGaugeInfo) === 'undefined'){
				return;
			}
			var g = oGaugeInfo;
			if ( g.ld === false ){ // earlier exit
				this.addParam("ex2", (new Date()).getTime() - g.iST);
				this.internal();
			}else{
				if ( g.bf == 1 ){ // cached page
					this.addParam("ex1", "1");
				}else{
					this.addParam("ct21", g.ct21);
					if ( typeof(g.iLoadST)!='undefined' ){
							var ctbend = g.iLoadST - g.iST;
							this.addParam("ctb", ctbend);
					}
				if ( typeof(g.st1a)!='undefined' )
					this.addParam("st1a", g.st1a);
				if ( typeof(g.aChunktimes)!='undefined' && g.aChunktimes.length > 0 ){
					this.addParam("jslcom", g.aChunktimes.length);  // pregressinve rendering chunk counts
					this.addParam("jseo", g.aChunktimes[0]);
					if (g.aChunktimes.length > 1) this.addParam("jsllib1", g.aChunktimes[1]);
					if (g.aChunktimes.length > 2) this.addParam("jsllib2", g.aChunktimes[2]);
					if (g.aChunktimes.length > 3) this.addParam("jsllib3", g.aChunktimes[3]);
					if (g.aChunktimes.length > 4) this.addParam("jslpg", g.aChunktimes[4]);
					if (g.aChunktimes.length > 5) this.addParam("jslss", g.aChunktimes[5]);
					if (g.aChunktimes.length > 6) this.addParam("jslsys", g.aChunktimes[6]);
				}
			}
				if ( sul == 1 ){
						g.wt = (new Date()).getTime()  - g.wt;
						this.addParam("sgwt", g.wt);
				}else{
						g.wt = 0;
				}
				if ( g.wt < 60000*20 ){ // ignore > 20 min to prevent incorrect st21
						this.internal();
				}
			}
		},

		internal : function () {
			if (typeof(oGaugeInfo) === 'undefined'){
				return;
			}
			var g = oGaugeInfo;
			if ( g.sent === true ){
				return;
			}
			g.sent = true;
			var self = this,image = new Image();
			if (g.bf != 1) {  // non-cached or non-cookie page
				image.src = self.beacon.getUrl();
			}else{ // cached, take out st1
			this.addParam("st1", "");
				image.src = self.beacon.getUrl();
			}
		},

		onLoad : function(event) {
			var cookie = Cookies.readCookie("ebay","sbf");
			Cookies.writeCookielet("ebay","sbf",Cookies.setBitFlag(cookie,20,1));

			if (typeof(oGaugeInfo)!='undefined') {
				oGaugeInfo.ld = true;
				// Note in edge cases window onload can be called mutiple times, but the last set the lastest stamps
				this.updateLoad();
				var ua = navigator.userAgent;
				if ( ua.indexOf("Firefox/3.0") > 0 || (ua.indexOf("Safari") > 0 && ua.indexOf("Chrome") < 0)){
					this.send(0);
				}
			}
		},

		onBeforeUnload : function(event) {
			Cookies.writeCookielet("ds2","ssts",(new Date()).getTime());
			this.send(1);
		},

		onUnload : function(event) {
			//this.send(1);  // this way will be sent after next page html download affecting next page speed
		}

	});

	//self.beacon = $uri(self.beacon);
	if (typeof(oGaugeInfo)!='undefined'){
		var g = oGaugeInfo;
		Profiler.beacon = $uri(oGaugeInfo.sUrl);
		var sbf = Cookies.readCookie("ebay","sbf"), b = (sbf) ? Cookies.getBitFlag(sbf,20) : 0;
		Cookies.writeCookielet("ebay","sbf",Cookies.setBitFlag(sbf, 20, 1)); //for earlier exit cases
		g.ut = Cookies.readCookie("ds2","ssts");
		g.bf = b; // 1 for cached page
		//g.bf = 0;  // force to set to uncached page for testing
		g.sent = false;
		g.ld = false;
		g.wt = 0;
		g.ex3 = 0;
		g.ct21 = 0;
	}

	$(window).bind('load',Profiler.onLoad.bind(Profiler));
	$(window).bind('beforeunload',Profiler.onBeforeUnload.bind(Profiler));
	$(window).bind('unload',Profiler.onUnload.bind(Profiler));

	return Profiler;

});

snap.require('ebay.profiler.Profiler');
define('ebay.profiler.Performance',function() {

	var Profiler = snap.require('ebay.profiler.Profiler');

	var Performance = function() {};

	snap.extend(Performance,{
		onLoad : function(event) {

			var e2e = new Date().getTime() - performance.timing.navigationStart;
			Profiler.addParam("ex3", e2e); // end to end at client, also log to cal tx

			var newct21 = new Date().getTime() - performance.timing.responseStart;
			Profiler.addParam("ctidl", newct21);  // client rendering, also log to cal tx

			var req = performance.timing.responseStart - performance.timing.navigationStart;
			Profiler.addParam("jsebca", req);  // first byte time

			var dom = performance.timing.domComplete - performance.timing.responseStart;
			Profiler.addParam("ct1chnk", dom); // dom complete

			var dns = performance.timing.domainLookupEnd - performance.timing.domainLookupStart;
			Profiler.addParam("jsljgr3", dns); // dns lookup time

			var conn = performance.timing.connectEnd - performance.timing.connectStart;
			Profiler.addParam("svo", conn); // connection time, also log to cal tx

			var req = performance.timing.responseStart - performance.timing.requestStart;
			Profiler.addParam("jsljgr1", req);  // request time

			var resp = performance.timing.responseEnd - performance.timing.responseStart;
			Profiler.addParam("slo", resp);  // content download time
		}
	});

	var oGaugeInfo = window.oGaugeInfo;
	if (oGaugeInfo && window.performance) $(window).bind('load',Performance.onLoad.bind(Performance));

	return Performance;

});

snap.require('ebay.profiler.Performance');


define('ebay.resources.Resources',function(snap) {

	//> public Resources(Object? config)
	var Resources = function(config) {

		var self = this;snap.extend(self.tokens,config);

		$(document).bind('ajaxSend',self.setResourceTokens.bind(self));
		$(document).bind('ajaxComplete',self.getResourceTokens.bind(self));

		self.tokens.id = parseInt(config.id);

	};

	snap.extend(Resources,{

		tokens : {},

		setResourceTokens : function(event,request) {
			var tokens = this.tokens;tokens.id++;
			if (tokens.id) request.setRequestHeader('X-Id-Token',tokens.id);
			if (tokens.js) request.setRequestHeader('X-Js-Token',tokens.js);
			if (tokens.css) request.setRequestHeader('X-Css-Token',tokens.css);
			snap.log('debug','Client.setResourceTokens',tokens.js,tokens.css);
		},

		getResourceTokens : function(event,request) {
			var tokens = this.tokens;
			tokens.js = request.getResponseHeader('X-Js-Token');
			tokens.css = request.getResponseHeader('X-Css-Token');
			snap.log('debug','Client.getResourceTokens',tokens.js,tokens.css);
		}

	});

	return Resources;

});

define('ebay.utils.NumberFormatter',function(snap) {

    var NumberFormatter = function(sep) {
        this.sep = sep || ',';this.sub = '$1' + this.sep + '$2$3';
        this.dec = this.sep.match(/,/)?'.':',';this.grp = new RegExp('\\' + this.sep,'g');
        this.exp = new RegExp('(\\d)(\\d{3})' + '(\\.|,|$)');
    };

    snap.extend(NumberFormatter.prototype,{

        parse : function(value) {
            var value = value.toString();
            return parseFloat(value.replace(this.grp,'').replace(this.dec,'.'));
        },

        format : function(num) {
            var self = this,exp = self.exp,sub = self.sub;
            var value = num.toString().replace('.',self.dec);
            while (exp.test(value)) value = value.replace(exp,sub);
            return value;
        }

    });

    return NumberFormatter;

});

define('ebay.utils.CurrencyFormatter',function(snap) {

    var Formatter = snap.require('ebay.utils.NumberFormatter');

    var validator = /^(\d*)(\.(\d*))?$|^$/;

    var CurrencyFormatter = function(config) {
        var self = this;snap.extend(self,config);
        self.formatter = new Formatter(self.grouping);
    };

    snap.extend(CurrencyFormatter.prototype,{

        parse : function(value) {
            return this.formatter.parse(value);
        },

        format: function(price,simple) {

            var self = this,symbol = self.symbol;
            var pattern = self.pattern,formatter = self.formatter;
            if (simple) return formatter.format(price);

            switch(pattern) {
                case 'Nes':   return formatter.format(price).concat(' ',symbol);
                case 'Ns':    return formatter.format(price).concat(symbol);
                case 'Sen':   return symbol.concat(' ',formatter.format(price));
                case 'Sn':    return symbol.concat(formatter.format(price));
                case 'seN':   return symbol.concat(' ',formatter.format(price));
                case 'sN':    return symbol.concat(formatter.format(price));
                default:      return formatter.format(price).concat(' ',symbol);
            }

        },

        validate : function(price) {
            var self = this,value = $.trim(price);
            value = value.replace(self.grouping,'');
            value = value.replace(self.decimal,'.');
            return value.match(self.validator);
        }

    });

    return CurrencyFormatter;

});

define('ebay.user',function(snap) {

    var Utf8 = snap.require('Utf8');
    var Base64 = snap.require('Base64');

    var Cookies = snap.require('ebay.cookies');

    var User = snap.extend(function(){},{

        getUserId : function() {
            var u1p = Utf8.decode(Base64.decode(Cookies.readCookie('dp1','u1p')));
            return !u1p.match(/@@__@@__@@/)?u1p:null;
        },

        isSignedIn : function() {
            var v1 = Cookies.readCookie('ebaysignin');
            var v2 = Cookies.readCookie('keepmesignin');
            return !snap.isNull((v1.match(/in/) || v2.match(/in/)));
        }

    });

    return User;

});

define('snap.ajax.AjaxDefaultTransport',function(snap) {

	var AjaxDefaultTransport = function(request) {
		this.request = request;
	};

	snap.extend(AjaxDefaultTransport.prototype,{

		send : function() {

			var self = this,request = self.request;self.transfer = self.getTransferObject();
			self.transfer.open(request.method,request.uri.getUrl(),request.async,request.user,request.pass);

			self.transfer.setRequestHeader('X-Requested-With','XMLHttpRequest');
			for (var name in request.requestHeaders) self.transfer.setRequestHeader(name,request.requestHeaders[name]);

			if (request.async) self.transfer.onreadystatechange = function() { self.onChange(); };
			if (request.async && request.timeout) self.timer = window.setTimeout(self.onTimeout.bind(self),request.timeout);

			self.transfer.send(request.requestText);
			if (!request.async) self.onReady(self.transfer.status);

		},

		abort : function() {

			var self = this;

			self.transfer.abort();
			self.transfer.onreadystatechange = null;

			self.transfer = null;

		},

		onChange : function() {
			var self = this,readyState = self.transfer.readyState;
			if (readyState == 4) self.onReady(self.transfer.status);
		},

		onTimeout : function()  {

			var self = this;self.abort();
			if (self.request.retries-- > 1) return self.send();

			self.request.onReady(408);

		},

		onReady : function(status)  {

			var self = this;

			window.clearTimeout(self.timer);

			self.transfer.onreadystatechange = null;

			self.request.responseXML = self.transfer.responseXML;
			self.request.responseText = self.transfer.responseText;

			self.request.setResponseHeaders(self.getResponseHeaders());

			self.request.onReady(status);

		},

		getResponseHeaders : function() {

			var headers = {};

			var text = this.transfer.getAllResponseHeaders();
			var lines = text?text.split(/\n|\r\n/):[];

			for (var idx = 0,len = lines.length;(idx < len);idx++) {

				var match = lines[idx].match(/([^:]+):\s*(.*)/);
				if (match == null) continue;

				var name = match[1],value = match[2];
				if (headers[name] == null) headers[name] = value;
				else if (typeof(headers[name]) === 'object') headers[name].push(value);
				else headers[name] = [headers[name],value];

			}

			return headers;

		}

	});

	if (window.XMLHttpRequest) {
		AjaxDefaultTransport.prototype.getTransferObject = function() { return new window.XMLHttpRequest(); };
	}
	else if (window.ActiveXObject) {
		var version = $doc.ActiveXVersion(['Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.3.0','Microsoft.XMLHTTP']);
		AjaxDefaultTransport.prototype.getTransferObject = function() { return new ActiveXObject(version); };
	}

	return AjaxDefaultTransport;

});

define('snap.ajax.AjaxScriptTransport',function(snap) {

	var AjaxScriptTransport = function(request) {
		this.request = request;
	};

	snap.extend(AjaxScriptTransport.prototype,{

		send : function() {

			var self = this,request = self.request,func = request.func;
			if (func) request.uri.params['_jid'] = request.href;

			AjaxScriptTransport.requests[request.href] = request;

			self.script = document.body.appendChild(document.createElement('script'));
			self.script.type = 'text/javascript';self.script.charset = 'utf-8';

			if (request.timeout) self.timer = window.setTimeout(self.onTimeout.bind(self),request.timeout);

			if ($.browser.msie) $(self.script).bind('readystatechange',self.onChange.bind(self));
			else $(self.script).bind('load',self.onLoad.bind(self));

			self.script.src = request.uri.getUrl();

		},

		onTimeout : function()  {

			var self = this;self.script.parentNode.removeChild(self.script);
			delete AjaxScriptTransport.requests[self.request.href];

			return (self.request.retries-- > 1)?self.send():self.onReady(408);

		},

		// Script OnReadyStateChange Event Handler (IE Only)

		onChange : function(event) {
			if (this.script.readyState.match(/loaded/)) this.onLoad(event);
		},

		// Script OnLoad Event Handler

		onLoad : function(event) {
			this.onReady(200);
		},

		// Script OnReady Handler

		onReady : function(status)  {

			var self = this;

			window.clearTimeout(self.timer);

			$(self.script).remove();
			delete AjaxScriptTransport.requests[self.request.href];

			self.request.onReady(status);

		}

	});

	snap.extend(AjaxScriptTransport,{

		// Ajax Requests

		requests : {},

		//> public void load(String id,Object response,Object headers)
		load: function(id,response,headers) {

			var request = this.requests[id];
			if (request == null) return;

			request.responseObject = response;
			request.setResponseHeaders(headers);

		}

	});

	return AjaxScriptTransport;

});

define('snap.ajax.AjaxRequest',function(snap) {

	var AjaxDefaultTransport = snap.require('snap.ajax.AjaxDefaultTransport');
	var AjaxScriptTransport = snap.require('snap.ajax.AjaxScriptTransport');

	//> public AjaxRequest(Object? config)
	var AjaxRequest = function(config) {
		var self = this;self.requestHeaders = {};self.responseHeaders = {};
		AjaxRequest.superclass.constructor.call(self,config);
	};

	snap.inherit(AjaxRequest,'snap.Observable');
	snap.extend(AjaxRequest.prototype,{

		transport:null,timeout:10000,retries:3,async:true,
	
		//> public void get(String url,boolean? async)
		get : function(url,async) {
			this.send(url,'get',null,async);
		},
	
		post : function(url,data,async) {
			this.send(url,'post',data,async);
		},
	
		send : function(url,method,data,async) {
	
			var self = this;
	
			self.uri = $uri(url);
			self.method = method;self.async = async;
	
			if (self.getTargetHost(self.uri).match(self.host)) self.transport = new AjaxDefaultTransport(self);
			else self.transport = new AjaxScriptTransport(self);
	
			self.transport.send();
	
		},
	
		onReady : function(status) {
	
			var self = this;
	
			self.error = ((self.status = status) != 200);
			self.publish(self.error?'error':'success',self);
	
			self.publish('complete',self);
	
		},
	
		deserialize : function() {
	
			var self = this;
	
			self.responseObject = (self.responseObject)?self.responseObject:JSON.parse(self.responseText);
			if (self.responseObject == null) self.responseObject = {};
	
			return self.responseObject;
	
		},
	
		getTargetHost : function(uri) {
			var host = uri.host,port = uri.port;
			return port?host.concat(':',port):host;
		},
	
		getResponse : function() {
			return this.deserialize();
		},
	
		getRequestHeader : function(name) {
			return this.requestHeaders[name];
		},
	
		getRequestHeaders : function() {
			return this.requestHeaders;
		},
	
		setRequestHeader : function(name,value) {
			this.requestHeaders[name] = value;
		},
	
		setRequestHeaders : function(requestHeaders) {
			this.requestHeaders = requestHeaders;
		},
	
		getResponseHeader : function(name) {
			return this.responseHeaders[name];
		},
	
		getResponseHeaders : function() {
			return this.responseHeaders;
		},
	
		setResponseHeaders : function(responseHeaders) {
			this.responseHeaders = responseHeaders;
		}
	
	});
	
	var host = document.location.host.replace(/\./g,'\\.');
	AjaxRequest.prototype.host = new RegExp('^$|^'.concat(host,'$'),'i');

	return AjaxRequest;
	
});

snap.require('snap.ajax.AjaxRequest');

define('snap.client.features.Features',function(snap) {

	//> public Features(Object? config)
	var Features = function(config) {
		snap.extend(this.supported,config);
	};

	snap.extend(Features,{

		supported : {},

		supports : function(name) {
			return this.supported[name];
		}

	});

	return Features;

});

define('snap.client.features.Detector',function(snap) {

	var agents = {

		explorer:/(MSIE)\s*([\d\.]*)/,
		firefox:/(Firefox)\/([\d\.]*)/,
		safari:/(Safari)\/([\d\.]*)/,
		chrome:/(Chrome)\/([\d\.]*)/,
		opera:/(Opera)[\/\s]([\d\.]*)/,

		gecko:/(Gecko)\/([\d\.]*)/,
		mozilla:/(Mozilla)\/([\d\.]*)/,
		webkit:/(WebKit)\/([\d\.]*)/

	};

	var Features = snap.require('snap.client.features.Features');

	//> public Detector(Object? config)
	var Detector = function(config) {

		var self = this,supported = Features.supported;
		var agent = navigator.userAgent,match;self.classes = [];
		for (var name in agents) if (match = agent.match(agents[name])) supported[name] = match[2];

		$(window).bind('load',self.onload.bind(self));

	};

	snap.extend(Detector,{

		//> public boolean detect(String name,Function? func)
		detect : function(name,func) {
			var self = this,supported = Features.supported,feature = func || supported[name];
			var supported = (snap.isFunction(feature))?self.execute(name,feature):feature;
			return Features.supported[name] = snap.isBoolean(supported)?(supported?1:0):supported;
		},

		execute : function(name,feature) {
			try { return feature.call(this,name); }
			catch(except) { return false; }
		},

		onload : function(event) {

			var self = this,supported = JSON.stringify(Features.supported);
			var location = $uri(document.location.href),redirect = location.params.redirect;

			snap.log('debug','Features.supported',supported);

			var href = $uri('/_snap/ClientFeatures');
			href.appendParam('features',supported);href.appendParam('redirect',redirect);
			if (redirect) window.location.href = href.getUrl();

		}

	});

	return Detector;

});

var Detector = snap.require('snap.client.features.Detector');
Detector.call(Detector);



define('snap.client.features.detector.Json',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public Json(String name)
	var Json = function(name) {
		return snap.isDefined(window.JSON);
	};

	Detector.detect('json',Json);
	return Json;

});

snap.require('snap.client.features.detector.Json');
define('snap.client.features.detector.Html5',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public Html5(String name)
	var Html5 = function(name) {
		var div = document.createElement('div');div.innerHTML = '<elem></elem>';
		return (div.childNodes.length > 0);
	};

	Detector.detect('html5',Html5);
	return Html5;

});

snap.require('snap.client.features.detector.Html5');
define('snap.client.features.detector.DataUri',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public DataUri(String name)
	var DataUri = function(name) {

		var self = this,image = new Image(),supported;
		image.onload = image.onerror = function() { Detector.detect('data-uri',((image.width == 4) && (image.height == 4))); }.bind(self);
		image.src = 'data:image/x-png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAEAQMAAACTPww9AAAAA3NCSVQICAjb4U/gAAAABlBMVEX///////9VfPVsAAAACXBIWXMAAAsSAAALEgHS3X78AAAAFnRFWHRDcmVhdGlvbiBUaW1lADA2LzA4LzEyT6yq2AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAAALSURBVAiZY2CAAAAACAABr1PqIgAAAABJRU5ErkJggg==';

		return false;

	};

	Detector.detect('data-uri',DataUri);
	return DataUri;

});

snap.require('snap.client.features.detector.DataUri');
define('snap.client.features.detector.Mutable',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public Mutable(String name)
	var Mutable = function(name) {
		return !!$.browser.msie?($.browser.version >= '9'):true;
	};

	Detector.detect('mutable',Mutable);
	return Mutable;

});

snap.require('snap.client.features.detector.Mutable');

define('snap.client.features.detector.Performance',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public Performance(String name)
	var Performance = function(name) {
		return snap.isDefined(window.performance);
	};

	Detector.detect('performance',Performance);
	return Performance;

});

snap.require('snap.client.features.detector.Performance');

define('snap.client.features.detector.Canvas',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public Canvas(String name)
	var Canvas = function(name) {
		var self = this,canvas = document.createElement('canvas');
		return !!(canvas.getContext && canvas.getContext('2d'));
	};

	Detector.detect('canvas',Canvas);
	return Canvas;

});

snap.require('snap.client.features.detector.Canvas');
define('snap.utils.Document',function(snap) {

	var Document = snap.extend(function() {},{

		// Compute Element Offset Top

		//> public int offsetTop(Object elem,Object? parent)
		offsetTop : function(elem,parent) {
			for (var offsetTop = 0;(elem && (elem !== parent));elem = elem.offsetParent) { offsetTop += elem.offsetTop; }
			return offsetTop;
		},

		// Compute Element Offset Left

		//> public int offsetLeft(Object elem,Object? parent)
		offsetLeft : function(elem,parent) {
			for (var offsetLeft = 0;(elem && (elem !== parent));elem = elem.offsetParent) { offsetLeft += elem.offsetLeft; }
			return offsetLeft;
		},

		// Disable/Enable Text Selection

		//> public void disableSelect(Object elem)
		disableSelect: function(elem) {

			if (document.all) {
				elem.bind('dragstart selectstart',this.cancelSelect.bind(this));
			}
			else {
				elem.css({'-webkit-user-select':'none','-moz-user-select':'none','user-select':'none'});
			}

		},

		//> public void enableSelect(Object elem)
		enableSelect: function(elem) {

			if (document.all) {
				elem.unbind('dragstart selectstart');
			}
			else {
				elem.css({'-webkit-user-select':'','-moz-user-select':'','user-select':''});
			}

		},

		cancelSelect : function(event) {
			return false;
		}

	});

	snap.alias(Document,'$doc');

	// Define Text Range Select Prototype

	if (document.createRange) {
		$doc.selectRange = function(node) { var range = document.createRange(); range.selectNode(node); window.getSelection().addRange(range); };
	}
	else if (document.all) {
		$doc.selectRange = function(node) { var range = document.body.createTextRange(); range.moveToElementText(node); range.select(); };
	}

	// Define ActiveX Version

	if (window.ActiveXObject) {
		$doc.ActiveXVersion = function(versions) {
			for (var idx = 0,len = versions.length;(idx < len);idx++) {
				try { new ActiveXObject(versions[idx]);return versions[idx]; }
				catch(except) {}
			}
		};
	}

	return Document;

});

snap.require('snap.utils.Document');
define('snap.utils.Style',function(snap) {

	//> public Style(Object scope,Object style,Function? handler)
	var Style = function(scope,style,handler) {

		var self = this;self.scope = scope;
		self.style = style;self.handler = handler;

		self.head = $('head',document);
		self.sheets = document.styleSheets;

		if (Style.getStyle(style.href));
		else if (style.href) return self.loadStyle(style);
		else if (style.rules) Style.loadRules(style.rules);

		self.onDone();

	};

	snap.extend(Style,{

		// View Style Loader

		Styles : {},

		// Add New Styles To Cache

		//> public void addStyles(Event? event)
		addStyles : function(event) {
			var self = this,styles = $('link',document);
			for (var idx = 0,len = styles.length;(idx < len);idx++) self.addStyle(styles[idx]);
		},

		// Add New Style To Cache

		addStyle : function(style) {
			var self = this,file = self.getFile(style.href);
			return file?(self.Styles[file] = style):null;
		},

		// Get Style

		getStyle : function(href) {
			var self = this,file = self.getFile(href);
			return file?self.Styles[file]:null;
		},

		// Get File

		getFile : function(href) {
			return href?href.substring(href.lastIndexOf('/') + 1):null;
		},

		// Load Style Rules

		loadRules : function(rules) {

			var head = $('head',document);
			var style = $('<style/>').attr({type:'text/css'}).appendTo(head);

			if (style[0].styleSheet) style[0].styleSheet.cssText = rules;
			else style.html(rules);

		}

	});

	snap.extend(Style.prototype,{

		retries:20,

		loadStyle : function(style) {

			var self = this,href = $uri(style.href);
			if ($.browser.safari && ($.browser.version < 525.28)) href.appendParam('_ts',new Date().valueOf().toString());

			var type = style.type || 'text/css',rel = style.rel || 'stylesheet';
			self.elem = $('<link/>').attr({type:type,rel:rel}).appendTo(self.head);

			snap.log('debug','Style.loadStyle',href.getUrl());

			if ($.browser.msie) self.elem.bind('load',self.onLoaded.bind(self));
			else window.setTimeout(self.onLoaded.bind(self),10);

			self.elem[0].href = href.getUrl();

		},

		onLoaded : function() {

			var self = this,elem = self.elem[0],sheets = self.sheets;
			for (var idx = 0,len = self.sheets.length;(idx < len);idx++) {
				var href = sheets[idx].href,ready = (href && elem.href.indexOf(href) >= 0);
				if (ready) return window.setTimeout(self.onReady.bind(self),10);
			}

			snap.log('debug','Style.onLoaded',self.retries);

			if (self.retries--) return window.setTimeout(self.onLoaded.bind(self),10);
			else return window.setTimeout(self.onReady.bind(self),0);

		},

		onReady : function() {

			var self = this,elem = self.elem.unbind();Style.addStyle(elem[0]);
			snap.log('debug','Style.onReady',elem[0].href);

			self.onDone();

		},

		onDone : function() {
			var self = this,handler = self.handler;
			if (handler) handler.apply(self.scope,[self]);
		}

	});

	Style.addStyles();
	$(window).bind('load',Style.addStyles.bind(Style));
	return Style;

});

snap.require('snap.utils.Style');

define('snap.utils.Script',function(snap) {

	//> public Script(Object scope,Object script,Function? handler)
	var Script = function(scope,script,handler) {

		var self = this;self.scope = scope;
		self.script = script;self.handler = handler;

		self.head = $('head',document);

		if (Script.getScript(script.src));
		else if (script.src) return self.loadScript(script);
		else if (script.text) Script.evalScript(script.text);

		self.onDone();

	};

	snap.extend(Script,{

		// View Script Loader

		Scripts : {},

		// Add Scripts To Cache

		//> public void addScripts(Event? event)
		addScripts : function(event) {
			var self = this,scripts = $('script',document);
			for (var idx = 0,len = scripts.length;(idx < len);idx++) self.addScript(scripts[idx]);
		},

		// Add Script To Cache

		addScript : function(script) {
			var self = this,type = script.type,file = self.getFile(script.src);
			return ((type == 'text/javascript') && file)?(self.Scripts[file] = script):null;
		},

		// Get Script

		getScript : function(src) {
			var self = this,file = self.getFile(src);
			return file?self.Scripts[file]:null;
		},

		// Get File

		getFile : function(src) {
			return src?src.substring(src.lastIndexOf('/') + 1):null;
		},

		// Evaluate Script Text

		evalScript : function(text) {
			window.execScript?window.execScript(text):window.eval.call(window,text);
		}

	});

	snap.extend(Script.prototype,{

		loadScript : function(script) {

			var self = this,href = $uri(script.src);
			if ($.browser.safari && ($.browser.version < 525.28)) href.appendParam('_ts',new Date().valueOf().toString());

			self.elem = $('<script/>').attr({type:'text/javascript'});

			if ($.browser.msie) self.elem.bind('readystatechange',self.onChange.bind(self));
			else self.elem.bind('load error',self.onLoaded.bind(self));

			snap.log('debug','Script.loadScript',href.getUrl());

			self.head[0].appendChild(self.elem[0]);
			self.elem[0].src = href.getUrl();

		},

		onChange : function(event) {
			var self = this,state = self.elem[0].readyState;
			if (state.match(/loaded/)) self.onLoaded(event);
		},

		onLoaded : function(event) {

			var self = this,elem = self.elem.unbind();Script.addScript(elem[0]);
			snap.log('debug','Script.onLoaded',elem[0].src);

			self.onDone();

		},

		onDone : function() {
			var self = this,handler = self.handler;
			if (handler) handler.apply(self.scope,[self]);
		}

	});

	Script.addScripts();
	$(window).bind('load',Script.addScripts.bind(Script));
	return Script;

});

snap.require('snap.utils.Script');
define('snap.utils.Loader',function(snap) {

	var Style = snap.require('snap.utils.Style');
	var Script = snap.require('snap.utils.Script');

	var Loader = function(object,handler) {
		snap.isArray(object)?this.load(object,handler):this.parse(object,handler);
	};

	snap.extend(Loader.prototype,{

		loaded:0,

		parse : function(content,handler) {

			var self = this,resources = [];
			var html = content.jquery?$('<div/>').append(content):self.html(content);

			$('link,style,script[src]',html).each(function() {
				var self = this,tag = self.tagName,elem = $(self);
				if (tag.match(/link/i)) resources.push({type:'text/css',href:self.href});
				else if (tag.match(/style/i)) resources.push({type:'text/css',rules:elem.html()});
				else if (tag.match(/script/i)) resources.push({type:'text/javascript',src:self.src});
				elem.remove();
			});

			self.fragment = html.children();
			self.load(resources,handler);

		},

		html : function(content) {
			var container = document.createElement('div');
			container.innerHTML = 'div<div>' + content + '</div>';
			return $(container.lastChild);
		},

		load : function(resources,handler) {
			var self = this;self.resources = resources;self.handler = handler;self.next();
		},

		next : function() {
			var self = this,resource = self.resources[self.loaded++];
			if (resource && resource.type.match(/css/)) new Style(self,resource,self.next);
			else if (resource && resource.type.match(/javascript/)) new Script(self,resource,self.next);
			else if (self.handler) self.handler(self);
		}

	});

	snap.extend(Loader,{

		//> public Object load(Object object,Function? handler)
		load : function(object,handler) {
			return new Loader(object,handler);
		}

	});

	var loaded = function(event) {

		var deferred = [];
		$('script[type*=defer]',document).each(function() {
			deferred.push({type:'text/javascript',src:this.src,text:this.text});
		});

		if (deferred.length) Loader.load(deferred);

	};

	$load = Loader.load.bind(Loader);
	$(document).bind('ready',loaded.bind(self));

	return Loader;

});

snap.require('snap.utils.Loader');

/**
* Utility class to parse/build eBay specified uri.
*/
define('snap.utils.Uri',function(snap) {

	/**
	* Gets the meta tag with specified attribute name and value.
	*
	* @param {String} name
	*        the attribute name of the meta tag
	* @param {String} value
	*        the value of the specified attribute
	* @return {String}
	*        the reference of the meta tag. If no such meta exists, return
	*        <code>null</code>
	*/
	//> public Object meta(String, String);
	var meta = function(name,value) {
		var tags = document.getElementsByTagName('meta');
		for (var idx = 0,len = tags.length;(idx < len);idx++) {
			if (tags[idx].getAttribute(name) == value) return tags[idx];
		}
		return null;
	};

	var content = meta('http-equiv','Content-Type') || meta('httpEquiv','Content-Type');
	var charset = (content)?content.getAttribute('content'):null;

	var encodeUri = (charset && charset.match(/utf/gi))?encodeURI:window.escape;
	var decodeUri = (charset && charset.match(/utf/gi))?decodeURI:window.unescape;

	var encodeParam = (charset && charset.match(/utf/gi))?encodeURIComponent:window.escape;
	var decodeParam = (charset && charset.match(/utf/gi))?decodeURIComponent:window.unescape;

	var uriMatch = new RegExp('(([^:]*)://([^:/?]*)(:([0-9]+))?)?([^?#]*)([?]([^#]*))?(#(.*))?');
	var seoParam = new RegExp('Q([0-9a-fA-F][0-9a-fA-F])','g');

	/**
	* @construct
	* @param {String} href
	*        a uri string to be parsed
	*/
	//> public void Uri(String href);
	var Uri = function(href) {

		var self = this;self.params = {};
		var match = href.match(uriMatch);
		if (match == null) return;

		self.protocol = self.match(match,2);

		self.host = self.match(match,3);
		self.port = self.match(match,5);

		self.href = self.match(match,6);
		self.query = self.match(match,8);

		if (self.href.match(/eBayISAPI.dll/i)) self.decodeIsapi(self.query);
		else self.decodeParams(self.query);

		self.href = decodeUri(self.href);
		self.hash = self.match(match,10);

	};

	snap.extend(Uri.prototype,{

		//> private String match(Object match,int idx);
		match : function(match,idx) {
			return ((match.length > idx) && match[idx])?match[idx]:'';
		},

		//> private void decodeIsapi(String);
		decodeIsapi : function(query) {
			var params = (query)?query.split('&'):[];
			this.isapi = params.shift();this.query = params.join('&');
			this.decodeParams(this.query);
		},

		/**
		* Adds a name-value pair as a parameter. The function allows duplicate
		* attributes with different values. The name-value pair is registered in a
		* parameter array. You can specify this parameter array and by default this
		* class has a internal array which is used to build the uri.
		*
		* @param {String} name
		*        the name of the parameter
		* @param {String} value
		*        the value of the parameter
		*/
		//> public void appendParam(String name,String value);
		appendParam : function(name,value) {
			var params = this.params;
			if (params[name] == null) params[name] = value;
			else if (typeof(params[name]) == 'object') params[name].push(value);
			else params[name] = [params[name],value];
		},

		/**
		* Adds all paramters from a parameter array to this buider's internal
		* paramter array, which is used to build the uri.
		* <p>
		* Notes: This will not overwrite the existing paramters. If the paramters
		* are duplicate with the existing one, the value will be appended as an
		* other value of the same paramter name.
		*
		* @param {Object} params
		*        the custom parameter array from which the parameter will be added
		*        to the builder's internal array
		*/
		//> public void appendParams(Object);
		appendParams : function(params) {
			for (var name in params) {
				var param = params[name];
				if (typeof(param) != 'object') this.appendParam(name,param);
				else for (var idx = 0;(idx < param.length);idx++) this.appendParam(name,param[idx]);
			}
		},

		/**
		* Parses the paramters from the query string to the builder's internal
		* parameter array.
		*
		* @param {String} query
		*        the qurey string to be parsed
		*/
		//> public void decodeParams(String);
		decodeParams : function(query) {

			var pairs = (query)?query.split('&'):[];
			for (var idx = 0;(idx < pairs.length);idx++) {

				var pair = pairs[idx].split('='),name = decodeParam(pair[0]);
				var value = (pair.length > 1)?decodeParam(pair[1].replace(/\+/g,'%20')):'';

				if (name) this.appendParam(name,value);

			}

		},

		encodeParam : function(name,value) {
			var param = encodeParam(name);
			return value?param.concat('=',encodeParam(value)):param;
		},

		/**
		* Builds the qurey string from a parameter array.
		*
		* @param {Object} params
		*        a specified parameter array. This function will use the builder's
		*        internal parameter array if you leave this parameter as
		*        <code>null</code>
		* @String {String}
		*        the combined query string
		*/
		//> public String encodeParams(Object);
		encodeParams : function(params) {

			var self = this,pairs = [];
			var params = (params)?params:this.params;

			for (var name in params) {
				if (typeof(params[name]) != 'object') pairs.push(self.encodeParam(name,params[name]));
				else for (var idx = 0;(idx < params[name].length);idx++) pairs.push(self.encodeParam(name,params[name][idx]));
			}

			return pairs.join('&');

		},

		/**
		* Parses the paramters from the form element to a parameter array.
		*
		* @param {Object} form
		*        the form element to be parsed
		*/
		//> public Object decodeForm(Object);
		decodeForm : function(form) {

			var self = this,elems = form.elements,params = {};
			for (var idx = 0,len = elems.length;(idx < len);idx++) delete self.params[elems[idx].name];

			for (var idx = 0,len = elems.length;(idx < len);idx++) {

				var elem = elems[idx];
				if (elem.disabled) continue;

				var type = elem.type,name = elem.name,value = elem.value; //<String
				if (type.match(/text|hidden|textarea|password|file/)) self.appendParam(name,value);
				else if (type.match(/radio|checkbox/) && elem.checked) self.appendParam(name,value);
				else if (type.match(/select-one|select-multiple/)) self.appendSelect(elem);

				params[name] = self.params[name];

			}

			return params;

		},

		/**
		* Gets the options from a select HTML control to a parameter array.
		*
		* @param {Object} select
		*        the select HTML control to be parsed
		*/
		//> public void appendSelect(Object, Object);
		appendSelect : function(select) {
				var options = select.options;
				for (var idx = 0,len = options.length;(idx < len);idx++) {
					if (options[idx].selected) this.appendParam(select.name,options[idx].value);
				}
		},

		/**
		* Gets the combined uri from the known information.
		*
		* @return {String}
		*         the combined uri string
		*/
		//> public String getUrl();
		getUrl : function() {

			var self = this;
			var url = (self.protocol)?self.protocol.concat('://'):'';

			if (self.host) url = url.concat(self.host);
			if (self.port) url = url.concat(':',self.port);

			if (self.href) url = url.concat(encodeUri(self.href));
			if (self.isapi) url = url.concat('?',self.isapi);

			var query = self.encodeParams(self.params);
			if (query) url = url.concat(self.isapi?'&':'?',query);
			if (self.hash) url = url.concat('#',self.hash);

			return url;

		}

	});

	$uri = function(href) { return new Uri(href); };
	return Uri;

});

snap.require('snap.utils.Uri');

define('Base64',function(snap) {

    var codes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=*';

    var Base64 = function() {};

    snap.extend(Base64,{

        decode :  function(value) {

            var len = value.length,ret = '';
            if (len <= 0) return ret;

            var test = new RegExp('[^A-Za-z0-9+/=*]');
            if (test.exec(value)) return ret;

            var idx = 0,len = value.length,decoded = '';
            var enc1,enc2,enc3,enc4,dec1,dec2,dec3;

            while (idx < len) {

                var enc1 = codes.indexOf(value.charAt(idx++));
                var enc2 = codes.indexOf(value.charAt(idx++));
                var enc3 = codes.indexOf(value.charAt(idx++));
                var enc4 = codes.indexOf(value.charAt(idx++));

                dec1 = (enc1 << 2) | (enc2 >> 4);
                dec2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                dec3 = ((enc3 & 3) << 6) | enc4;

                decoded += String.fromCharCode(dec1);
                if (!(enc3 >= 64)) decoded += String.fromCharCode(dec2);
                if (!(enc4 >= 64)) decoded += String.fromCharCode(dec3);

            }

            return decoded;

        }

    });

    return Base64;

});

snap.require('Base64');

define('Utf8',function(snap) {

    var Utf8 = function() {};

    snap.extend(Utf8,{

        decode : function(value) {

            var idx = 0,len = value.length,decoded = '',c0,c1,c2;
            while (idx < len) {
                c0 = value.charCodeAt(idx);
                if (c0 < 128) { decoded += String.fromCharCode(c0);idx++; }
                else if ((c0 > 191) && (c < 224)) { c2 = value.charCodeAt(i + 1);decoded += String.fromCharCode(((c0 & 31) << 6) | (c2 & 63));idx += 2; }
                else { c2 = value.charCodeAt(idx + 1);c3 = value.charCodeAt(idx + 2);decoded += String.fromCharCode(((c0 & 15)<< 12) | ((c2 & 63) << 6 ) | (c3 & 63));idx += 3; }
            }
            return decoded;
        }

    });

    return Utf8;

});

snap.require('Utf8');
(function(){dust.register("snap.Component",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" />");}return body_0;})();
(function(){dust.register("snap.Container",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\">").section(ctx.get("widgets"),ctx.rebase(ctx.get("children")),{},null).write("</div>");}return body_0;})();
(function(){dust.register("snap.anchor.Anchor",body_0);function body_0(chk,ctx){return chk.write("<a id=\"").reference(ctx.get("eid"),ctx,"h").write("\" href=\"").reference(ctx.get("href"),ctx,"h").write("\">").reference(ctx.get("text"),ctx,"h").write("</a>");}return body_0;})();
(function(){dust.register("snap.button.Button",body_0);function body_0(chk,ctx){return chk.write("<span id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"btn\"><button type=\"").reference(ctx.get("type"),ctx,"h").write("\"").exists(ctx.get("value"),ctx,{"block":body_1},null).write(">").reference(ctx.get("text"),ctx,"h").write("</button></span>");}function body_1(chk,ctx){return chk.write(" value=\"").reference(ctx.get("value"),ctx,"h").write("\"");}return body_0;})();(function(){dust.register("snap.border.BorderLayout",body_0);function body_0(chk,ctx){return chk.write("<div class=\"view-h\"></div><div class=\"view-b\"><div class=\"view-l\"></div><div class=\"view-r\"></div><div class=\"view-c\"></div></div><div class=\"view-f\"></div>");}return body_0;})();
(function(){dust.register("snap.calendar.Month",body_0);function body_0(chk,ctx){return chk.write("<div class=\"month\"><table><thead><tr><td class=\"head\" colspan=\"7\"><div class=\"title\"></div></td></tr><tr class=\"days\"><td>S</td><td>M</td><td>T</td><td>W</td><td>T</td><td>F</td><td>S</td></tr></thead><tbody></tbody></table></div>");}return body_0;})();(function(){dust.register("snap.carousel.VerticalCarouselLayout",body_0);function body_0(chk,ctx){return chk.write("<div class=\"vcrsl-h\"></div><div class=\"vcrsl-b\"><ul class=\"vcrsl-ul\"/></div><div class=\"vcrsl-f\"></div>");}return body_0;})();
(function(){dust.register("snap.carousel.HorizontalCarouselLayout",body_0);function body_0(chk,ctx){return chk.write("<table class=\"hcrsl\"><tr><td class=\"hcrsl-l\"></td><td class=\"hcrsl-b\"><div class=\"hcrsl-b\"><ul class=\"hcrsl-ul\"/></div></td><td class=\"hcrsl-r\"></td></tr></table>");}return body_0;})();(function(){dust.register("snap.checkbox.Checkbox",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"cbx\"").section(ctx.get("disabled"),ctx,{"block":body_1},null).write("><a class=\"cbx\"").section(ctx.get("href"),ctx,{"block":body_2},null).write("><label><input type=\"checkbox\"").section(ctx.get("name"),ctx,{"block":body_3},null).section(ctx.get("value"),ctx,{"block":body_4},null).write(" class=\"cbx\"").section(ctx.get("selected"),ctx,{"block":body_5},null).section(ctx.get("disabled"),ctx,{"block":body_6},null).write(" /><span class=\"cbx\">").reference(ctx.get("text"),ctx,"h",["s"]).write("</span></label></a></div>");}function body_1(chk,ctx){return chk.write(" d");}function body_2(chk,ctx){return chk.write(" href=\"").reference(ctx.get("href"),ctx,"h").write("\"");}function body_3(chk,ctx){return chk.write(" name=\"").reference(ctx.get("name"),ctx,"h").write("\"");}function body_4(chk,ctx){return chk.write(" value=\"").reference(ctx.get("value"),ctx,"h").write("\"");}function body_5(chk,ctx){return chk.write(" checked=\"true\"");}function body_6(chk,ctx){return chk.write(" disabled=\"true\"");}return body_0;})();
(function(){dust.register("snap.fingers.FingerTab",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"ftab-b\">").section(ctx.get("widgets"),ctx.rebase(ctx.get("children")),{},null).write("</div>");}return body_0;})();(function(){dust.register("snap.fingers.FingerTabs",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"ftabs\"><div class=\"ftabs-b shdw\">").section(ctx.get("widgets"),ctx.rebase(ctx.get("children")),{},null).write("</div><div class=\"ftabs-h\">").section(ctx.get("children"),ctx,{"block":body_1},null).write("</div></div>");}function body_1(chk,ctx){return chk.write("<div class=\"ftab-h\" eid=\"").reference(ctx.get("eid"),ctx,"h").write("\"><a class=\"ftab-a\" href=\"").reference(ctx.get("href"),ctx,"h").write("\">").reference(ctx.get("title"),ctx,"h").write("</a></div>");}return body_0;})();(function(){dust.register("snap.form.Form",body_0);function body_0(chk,ctx){return chk.write("<form id=\"").reference(ctx.get("eid"),ctx,"h").write("\" method=\"").reference(ctx.get("method"),ctx,"h").write("\" action=\"").reference(ctx.get("action"),ctx,"h").write("\"/>");}return body_0;})();
(function(){dust.register("snap.form.Input",body_0);function body_0(chk,ctx){return chk.write("<input id=\"").reference(ctx.get("eid"),ctx,"h").write("\" type=\"").reference(ctx.get("type"),ctx,"h").write("\"/>");}return body_0;})();
(function(){dust.register("snap.form.Select",body_0);function body_0(chk,ctx){return chk.write("<select id=\"").reference(ctx.get("eid"),ctx,"h").write("\">").section(ctx.get("options"),ctx,{"block":body_1},null).write("</select>");}function body_1(chk,ctx){return chk;}return body_0;})();
(function(){dust.register("snap.form.TextArea",body_0);function body_0(chk,ctx){return chk.write("<textarea id=\"").reference(ctx.get("eid"),ctx,"h").write("\" cols=\"").reference(ctx.get("cols"),ctx,"h").write("\" rows=\"").reference(ctx.get("rows"),ctx,"h").write("\"></textarea>");}return body_0;})();
(function(){dust.register("snap.menu.Menu",body_0);function body_0(chk,ctx){return chk.write("<ul id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"menu\">").section(ctx.get("widgets"),ctx.rebase(ctx.get("children")),{},null).write("</ul>");}return body_0;})();
(function(){dust.register("snap.menu.Item",body_0);function body_0(chk,ctx){return chk.write("<li id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"item\"><a class=\"i\">").section(ctx.get("widgets"),ctx.rebase(ctx.get("children")),{},null).write("</a></li>");}return body_0;})();
(function(){dust.register("snap.panel.Panel",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"pnl\">").exists(ctx.get("title"),ctx,{"block":body_1},null).write("</div>");}function body_1(chk,ctx){return chk.write("<div class=\"pnl-h\"><div class=\"pnl-t\">").reference(ctx.get("title"),ctx,"h").write("</div></div><div class=\"pnl-b\">").section(ctx.get("widgets"),ctx.rebase(ctx.get("children")),{},null).write("</div>");}return body_0;})();
(function(){dust.register("snap.radio.Radio",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"rbx\"").section(ctx.get("disabled"),ctx,{"block":body_1},null).write("><a class=\"rbx\"").section(ctx.get("href"),ctx,{"block":body_2},null).write("><label><input type=\"radio\"").section(ctx.get("name"),ctx,{"block":body_3},null).section(ctx.get("value"),ctx,{"block":body_4},null).write(" class=\"rbx\"").section(ctx.get("selected"),ctx,{"block":body_5},null).section(ctx.get("disabled"),ctx,{"block":body_6},null).write(" /><span class=\"rbx\">").reference(ctx.get("text"),ctx,"h",["s"]).write("</span></label></a></div>");}function body_1(chk,ctx){return chk.write(" d");}function body_2(chk,ctx){return chk.write(" href=\"").reference(ctx.get("href"),ctx,"h").write("\"");}function body_3(chk,ctx){return chk.write(" name=\"").reference(ctx.get("name"),ctx,"h").write("\"");}function body_4(chk,ctx){return chk.write(" value=\"").reference(ctx.get("value"),ctx,"h").write("\"");}function body_5(chk,ctx){return chk.write(" checked=\"true\"");}function body_6(chk,ctx){return chk.write(" disabled=\"true\"");}return body_0;})();
(function(){dust.register("snap.rollup.Rollup",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"rlp\"><div class=\"rlp-h\"><b class=\"rlp-i\"></b></div><div class=\"rlp-b\">").section(ctx.get("widgets"),ctx.rebase(ctx.get("children")),{},null).write("</div></div>");}return body_0;})();
(function(){dust.register("snap.slider.SliderBase",body_0);function body_0(chk,ctx){return chk.write("<div id=").reference(ctx.get("eid"),ctx,"h").write(" class=\"slider\"><div class=\"label\">").reference(ctx.get("label"),ctx,"h").write("</div><div class=\"slide\"><div class=\"range\">").exists(ctx.get("ticks"),ctx,{"block":body_1},null).write("<div class=\"bar\"></div></div></div><div class=\"legend\"><div class=\"left\">").reference(ctx.get("left"),ctx,"h").write("</div><div class=\"right\">").reference(ctx.get("right"),ctx,"h").write("</div></div></div>");}function body_1(chk,ctx){return chk.write("<div class=\"ticks\">").section(ctx.get("values"),ctx,{"block":body_2},null).write("</div>");}function body_2(chk,ctx){return chk.write("<div class=\"tick\"></div>");}return body_0;})();
(function(){dust.register("snap.tabs.Tab",body_0);function body_0(chk,ctx){return chk.exists(ctx.get("head"),ctx,{"else":body_1,"block":body_2},null);}function body_1(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"tab-b\">").section(ctx.get("widgets"),ctx.rebase(ctx.get("children")),{},null).write("</div>");}function body_2(chk,ctx){return chk.write("<li class=\"tab\"><a class=\"tab-a\"><div class=\"tab-h\">").reference(ctx.get("title"),ctx,"h",["s"]).write("</div></a></li>");}return body_0;})();
(function(){dust.register("snap.tabs.Tabs",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"tabs\"><div class=\"tabs-h\"><div class=\"tabs-sc\"><ul class=\"tabs-ul\"><li class=\"tab c\"></li></ul></div></div><div class=\"tabs-b\">").section(ctx.get("widgets"),ctx.rebase(ctx.get("children")),{},null).write("</div></div>");}return body_0;})();
(function(){dust.register("snap.tetris.TetrisLayout",body_0);function body_0(chk,ctx){return chk.write("<table id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"tetris\"><tbody><tr></tr></tbody></table>");}return body_0;})();(function(){dust.register("snap.toolbar.ToolButton",body_0);function body_0(chk,ctx){return chk.write("<span id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"tbtn\"><button type=\"").reference(ctx.get("type"),ctx,"h").write("\">").reference(ctx.get("text"),ctx,"h").write("</button></span>");}return body_0;})();
(function(){dust.register("snap.page.Page",body_0);function body_0(chk,ctx){return chk;}return body_0;})();
(function(){dust.register("snap.page.PageLayout",body_0);function body_0(chk,ctx){return chk.exists(ctx.get("header"),ctx,{"block":body_1},null).write("<section id=\"Body\">").exists(ctx.get("top"),ctx,{"block":body_2},null).exists(ctx.get("left"),ctx,{"block":body_3},null).exists(ctx.get("right"),ctx,{"block":body_4},null).exists(ctx.get("center"),ctx,{"block":body_5},null).exists(ctx.get("bottom"),ctx,{"block":body_6},null).write("</section>").exists(ctx.get("footer"),ctx,{"block":body_7},null);}function body_1(chk,ctx){return chk.write("<header id=\"Header\"></header>");}function body_2(chk,ctx){return chk.write("<section id=\"Top\"></section>");}function body_3(chk,ctx){return chk.write("<section id=\"Left\"></section>");}function body_4(chk,ctx){return chk.write("<section id=\"Right\"></section>");}function body_5(chk,ctx){return chk.write("<section id=\"Center\"></section>");}function body_6(chk,ctx){return chk.write("<section id=\"Bottom\"></section>");}function body_7(chk,ctx){return chk.write("<footer id=\"Footer\"></footer>");}return body_0;})();
(function(){dust.register("snap.scrollbar.horizontal.HorizontalScrollbar",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"scroll-x-bar\"><div class=\"scroll-x-hdl\" draggable=\"false\"></div></div>");}return body_0;})();
(function(){dust.register("snap.scrollbar.vertical.VerticalScrollbar",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"scroll-y-bar\"><div class=\"scroll-y-hdl\" draggable=\"false\"></div></div>");}return body_0;})();
(function(){dust.register("snap.window.Window",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"win\" @role=\"dialog\" draggable=\"false\"><div class=\"win-s shdw\"></div><div class=\"win-f\"><div class=\"win-h\"><a class=\"win-c\" tabindex=\"0\"></a><div class=\"win-t\">").reference(ctx.get("title"),ctx,"h").write("</div></div><div class=\"win-b\">").section(ctx.get("widgets"),ctx.rebase(ctx.get("children")),{},null).write("</div></div></div>");}return body_0;})();
(function(){dust.register("snap.bubble.Bubble",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" @role=\"dialog\" draggable=\"false\"><div class=\"win-s shdw\"></div><div class=\"win-f\"><div class=\"win-a\"></div><div class=\"win-h\"><a class=\"win-c\" tabindex=\"0\"></a><div class=\"win-t\"></div></div><div class=\"win-b\"></div></div></div>");}return body_0;})();
(function(){dust.register("snap.upgrade.Upgrade",body_0);function body_0(chk,ctx){return chk.write("<div class=\"upgrd-msg\"><h3 class=\"header\">").reference(ctx.get("title"),ctx,"h").write("</h3><div>").reference(ctx.get("message"),ctx,"h").write("</div><div class=\"upgrd-lnks\"><a class=\"upgrd-lnk firefox\" tabindex=\"-1\" href=\"http://www.mozilla.org/firefox\"></a><a class=\"upgrd-lnk chrome\" tabindex=\"-1\" href=\"https://www.google.com/chrome\"></a><a class=\"upgrd-lnk explorer\" tabindex=\"-1\" href=\"http://windows.microsoft.com/ie\"></a><a class=\"upgrd-lnk safari\" tabindex=\"-1\" href=\"http://www.apple.com/safari\"></a></div></div>");}return body_0;})();
