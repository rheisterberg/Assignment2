
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