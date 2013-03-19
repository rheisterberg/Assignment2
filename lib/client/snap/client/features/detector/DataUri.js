
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