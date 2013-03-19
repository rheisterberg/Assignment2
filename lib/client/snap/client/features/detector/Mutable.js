
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
