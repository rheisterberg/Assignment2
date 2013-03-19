
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