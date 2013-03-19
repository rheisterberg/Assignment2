
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


