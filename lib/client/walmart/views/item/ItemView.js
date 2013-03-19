
define('walmart.views.item.ItemView',function(snap) {

	var Templates = snap.require('snap.Templates');
	var Registry = snap.require('snap.Registry');

	var ItemDetails = snap.require('walmart.views.item.ItemDetails');
	var ItemTemplatesHelpers = snap.require('walmart.views.item.ItemTemplatesHelpers');


	//> public ItemView(Object? config)
	var ItemView = function(config) {
		var self = this;ItemView.superclass.constructor.call(self,config);
		snap.subscribe('ItemView.view',self.onView.bind(self),self);
	};

	snap.inherit(ItemView,'snap.Container');
	snap.extend(ItemView.prototype,{

		classes:{elem:'iv'},

		onView : function(message,config) {
			var self = this;self.elem.html('');
			config.tid = 'walmart.views.item.ItemDetails';
			self.appendChild(snap.render(ItemDetails,Templates.helpers(ItemTemplatesHelpers,config)));
			self.publish('Frame.view','ItemView',true);
		}

	});

	return ItemView;

});
