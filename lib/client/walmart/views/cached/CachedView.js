
define('walmart.views.cached.CachedView',function(snap) {

	var Registry = snap.require('snap.Registry');
	var CachedItem = snap.require('walmart.views.cached.CachedItem');

	//> public CachedView(Object? config)
	var CachedView = function(config) {
		CachedView.superclass.constructor.call(this,config);
	};

	snap.inherit(CachedView,'snap.Container');
	snap.extend(CachedView.prototype,{

	classes:{elem:'cv'},autosize:true,droppable:true,
		
		onDrop : function(event) {

			var self = this,item = self.getDropped(event);
			var config = snap.extend({},item.config);delete config.oid;delete config.elem;
			self.appendChild(snap.render(CachedItem,config));
			
			return false;
			
		}
						
	});

	return CachedView;

});
