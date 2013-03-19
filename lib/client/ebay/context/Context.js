
define('ebay.context.Context',function(snap) {

	var Features = snap.require('snap.client.features.Features');

	//> public Context(Object? config)
	var Context = function(config) {
		snap.extend(this,config);
		Features.call(Features,this.features);
	};

	return Context;

});
