
define('snap.menu.MenuLayout',function(snap) {

	//> public MenuLayout(Object? config)
	var MenuLayout = function(config) {
		var self = this,container = config.container;
		container.subscribe('show',self.onShow,self);container.subscribe('hide',self.onHide,self);
		MenuLayout.superclass.constructor.call(self,config);
	};

	snap.inherit(MenuLayout,'snap.Layout');
	snap.extend(MenuLayout.prototype,{

		hide : function(menu) {
			menu.parent.elem.append(menu.elem);
			$(document).unbind('click',this.onclick);
		},

		onShow : function(message,object) {

			var self = this,menu = message.source;
			var parent = menu.parent,elem = parent.elem;

			$(document.body).prepend(menu.elem);

			var align = object.align || 'right',offset = elem.offset();
			if (align.match(/right/)) menu.elem.offset({top:offset.top,left:offset.left + elem.outerWidth()});
			else if (align.match(/bottom/)) menu.elem.offset({top:offset.top + elem.outerHeight(),left:offset.left});

			$(document).bind('click',menu,self.onclick = self.onClick.bind(self));

			return false;

		},

		onHide : function(message,object) {
			this.hide(message.source);
			return false;
		},

		onClick : function(event) {
			this.hide(event.data);
			return false;
		}

	});

	return MenuLayout;

});
