
define('walmart.aspects.LocationAspectFlyout',function(snap) {

	var Radio = snap.require('snap.radio.Radio');

	//> public LocationAspectFlyout(Object? config)
	var LocationAspectFlyout = function(config) {
		LocationAspectFlyout.superclass.constructor.call(this,config);
	};

	snap.inherit(LocationAspectFlyout,'walmart.aspects.GroupAspectFlyout');
	snap.extend(LocationAspectFlyout.prototype,{

		classes:{elem:'location'},

		buildValues : function(values) {
			var self = this;
			self.buildLocation(values[0],self.elem);
			self.buildDistance(values[1],self.elem);
		},

		buildLocation : function(aspect,target) {
			var self = this,name = aspect.name,values = aspect.values;
			for (var idx = 0,value;(value = values[idx]);idx++) {
				self.appendChild(new Radio({name:name,text:value.title,value:value.param,data:value,selected:value.selected,disabled:value.disabled,target:target}));
			}
		},

		buildDistance : function(aspect,target) {
			var self = this;snap.extend(aspect,{form:self.form,target:target});
			var DistanceAspectFlyout = snap.require('walmart.aspects.DistanceAspectFlyout');
			self.appendChild(snap.render(DistanceAspectFlyout,aspect));
		}

	});

	return LocationAspectFlyout;

});

