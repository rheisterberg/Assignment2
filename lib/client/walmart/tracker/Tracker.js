
define('walmart.tracker.Tracker',function(snap) {

	var Cookies = snap.require('ebay.cookies');

	var Tracker = function(percentage) {
		var self = this;self.enabled = self.isEnabled(percentage);
		Tracker.superclass.constructor.call(self,{percentage:percentage});
		snap.subscribe('rover',self.onRover.bind(self),self);
	};

	snap.inherit(Tracker,'snap.Observable');
	snap.extend(Tracker.prototype,{

		isEnabled : function(percentage) {
			var cookie = Cookies.readCookie('npii','cguid');
			var modulo = parseInt(cookie.slice(-8),16) % 100;
			return (modulo < percentage);
		},

		onRover : function(message,object) {
			var self = this,enabled = self.enabled;
			if (enabled) $(document.body).trigger('rover',snap.extend(object,{sid:'p2045573'}));
		}

	});

	return Tracker;

});


