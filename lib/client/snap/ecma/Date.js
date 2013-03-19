//
// Date
// ====
//

// ES5 15.9.5.43
// Format a Date object as a string according to a subset of the ISO-8601 standard.
// Useful in Atom, among other things.
if (!Date.prototype.toISOString) {
		Date.prototype.toISOString = function toISOString() {
				return (
						this.getUTCFullYear() + "-" +
						(this.getUTCMonth() + 1) + "-" +
						this.getUTCDate() + "T" +
						this.getUTCHours() + ":" +
						this.getUTCMinutes() + ":" +
						this.getUTCSeconds() + "Z"
				);
		};
}

// ES5 15.9.4.4
if (!Date.now) {
		Date.now = function now() {
				return new Date().getTime();
		};
}

// ES5 15.9.5.44
if (!Date.prototype.toJSON) {
		Date.prototype.toJSON = function toJSON(key) {
				// This function provides a String representation of a Date object for
				// use by JSON.stringify (15.12.3). When the toJSON method is called
				// with argument key, the following steps are taken:

				// 1.  Let O be the result of calling ToObject, giving it the this
				// value as its argument.
				// 2. Let tv be ToPrimitive(O, hint Number).
				// 3. If tv is a Number and is not finite, return null.
				// XXX
				// 4. Let toISO be the result of calling the [[Get]] internal method of
				// O with argument "toISOString".
				// 5. If IsCallable(toISO) is false, throw a TypeError exception.
				if (typeof this.toISOString !== "function")
						throw new TypeError();
				// 6. Return the result of calling the [[Call]] internal method of
				// toISO with O as the this value and an empty argument list.
				return this.toISOString();

				// NOTE 1 The argument is ignored.

				// NOTE 2 The toJSON function is intentionally generic; it does not
				// require that its this value be a Date object. Therefore, it can be
				// transferred to other kinds of objects for use as a method. However,
				// it does require that any such object have a toISOString method. An
				// object is free to use the argument key to filter its
				// stringification.
		};
}

// 15.9.4.2 Date.parse (string)
// 15.9.1.15 Date Time String Format
// Date.parse
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
if (isNaN(Date.parse("T00:00"))) {
		// XXX global assignment won't work in embeddings that use
		// an alternate object for the context.
		Date = (function(NativeDate) {

				// Date.length === 7
				var Date = function(Y, M, D, h, m, s, ms) {
						var length = arguments.length;
						if (this instanceof NativeDate) {
								var date = length === 1 && String(Y) === Y ? // isString(Y)
										// We explicitly pass it through parse:
										new NativeDate(Date.parse(Y)) :
										// We have to manually make calls depending on argument
										// length here
										length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
										length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
										length >= 5 ? new NativeDate(Y, M, D, h, m) :
										length >= 4 ? new NativeDate(Y, M, D, h) :
										length >= 3 ? new NativeDate(Y, M, D) :
										length >= 2 ? new NativeDate(Y, M) :
										length >= 1 ? new NativeDate(Y) :
																	new NativeDate();
								// Prevent mixups with unfixed Date object
								date.constructor = Date;
								return date;
						}
						return NativeDate.apply(this, arguments);
				};

				// 15.9.1.15 Date Time String Format
				var isoDateExpression = new RegExp("^" +
						"(?:" + // optional year-month-day
								"(" + // year capture
										"(?:[+-]\\d\\d)?" + // 15.9.1.15.1 Extended years
										"\\d\\d\\d\\d" + // four-digit year
								")" +
								"(?:-" + // optional month-day
										"(\\d\\d)" + // month capture
										"(?:-" + // optional day
												"(\\d\\d)" + // day capture
										")?" +
								")?" +
						")?" +
						"(?:T" + // hour:minute:second.subsecond
								"(\\d\\d)" + // hour capture
								":(\\d\\d)" + // minute capture
								"(?::" + // optional :second.subsecond
										"(\\d\\d)" + // second capture
										"(?:\\.(\\d\\d\\d))?" + // milisecond capture
								")?" +
						")?" +
						"(?:" + // time zone
								"Z|" + // UTC capture
								"([+-])(\\d\\d):(\\d\\d)" + // timezone offset
								// capture sign, hour, minute
						")?" +
				"$");

				// Copy any custom methods a 3rd party library may have added
				for (var key in NativeDate)
						Date[key] = NativeDate[key];

				// Copy "native" methods explicitly; they may be non-enumerable
				Date.now = NativeDate.now;
				Date.UTC = NativeDate.UTC;
				Date.prototype = NativeDate.prototype;
				Date.prototype.constructor = Date;

				// Upgrade Date.parse to handle the ISO dates we use
				// TODO review specification to ascertain whether it is
				// necessary to implement partial ISO date strings.
				Date.parse = function parse(string) {
						var match = isoDateExpression.exec(string);
						if (match) {
								match.shift(); // kill match[0], the full match
								// recognize times without dates before normalizing the
								// numeric values, for later use
								var timeOnly = match[0] === undefined;
								// parse numerics
								for (var i = 0; i < 10; i++) {
										// skip + or - for the timezone offset
										if (i === 7)
												continue;
										// Note: parseInt would read 0-prefix numbers as
										// octal.  Number constructor or unary + work better
										// here:
										match[i] = +(match[i] || (i < 3 ? 1 : 0));
										// match[1] is the month. Months are 0-11 in JavaScript
										// Date objects, but 1-12 in ISO notation, so we
										// decrement.
										if (i === 1)
												match[i]--;
								}
								// if no year-month-date is provided, return a milisecond
								// quantity instead of a UTC date number value.
								if (timeOnly)
										return ((match[3] * 60 + match[4]) * 60 + match[5]) * 1000 + match[6];

								// account for an explicit time zone offset if provided
								var offset = (match[8] * 60 + match[9]) * 60 * 1000;
								if (match[6] === "-")
										offset = -offset;

								return NativeDate.UTC.apply(this, match.slice(0, 7)) + offset;
						}
						return NativeDate.parse.apply(this, arguments);
				};

				return Date;
		})(Date);
}
