
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