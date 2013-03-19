
define('snap.toolbar.ToolbarLayout',function(snap) {

	//> public ToolbarLayout(Object? config)
	var ToolbarLayout = function(config) {
		var self = this,container = config.container;
		container.subscribe('show',self.onShow,self);container.subscribe('hide',self.onHide,self);
		ToolbarLayout.superclass.constructor.call(self,config);
	};

	snap.inherit(ToolbarLayout,'snap.Layout');
	
	return ToolbarLayout;
	
});
