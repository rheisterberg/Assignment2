
define('walmart.aspects.LocationAspect',function(snap) {

	var SliderEnumeration = snap.require('snap.slider.SliderEnumeration');

	//> public LocationAspect(Object? config)
	var LocationAspect = function(config) {
		var self = this;LocationAspect.superclass.constructor.call(self,config);
		self.slider = self.appendChild(new SliderEnumeration({index:self.index,values:self.ticks,target:self.body}));
		self.slider.subscribe('slider',self.onSelect.bind(self));
	};

	snap.inherit(LocationAspect,'walmart.aspects.DefaultAspect');
	snap.extend(LocationAspect.prototype,{

		classes:{elem:'loc'},index:0,

		buildValues : function(values) {
			var self = this;self.ticks = [];
			for (var idx = 0,value;(value = values[idx]);idx++) {
				if (value.selected) self.index = idx;
				self.ticks.push(value.title);
			}
		},

		onSelect : function(message,object) {

			var self = this,index = object.index;
			if (index == self.index) return;

			var href = $uri(self.values[self.index = index].url);
			window.location.href = href.getUrl();

		},

		buildFlyout : function(config) {
			var LocationAspectFlyout = snap.require('walmart.aspects.LocationAspectFlyout');
			return new LocationAspectFlyout(config);
		}

	});

	return LocationAspect;

});

