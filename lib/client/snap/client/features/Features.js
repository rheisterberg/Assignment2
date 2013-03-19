
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
