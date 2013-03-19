
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
