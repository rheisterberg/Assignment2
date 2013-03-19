
define('snap.tabs.TabsLayout',function(snap) {

	var Tab = snap.require('snap.tabs.Tab');

	//> public TabsLayout(Object? config)
	var TabsLayout = function(config) {
		TabsLayout.superclass.constructor.call(this,config);
	};

	snap.inherit(TabsLayout,'snap.Layout');
	snap.extend(TabsLayout.prototype,{

		render : function() {

			var self = this;
			var target = self.target;

			self.head = $('div.tabs-h',target);
			self.scroll = $('div.tabs-sc',self.head);

			self.list = $('ul.tabs-ul',self.scroll);
			self.last = $('li',self.list).last();

			self.body = $('div.tabs-b',target);

		},

		renderScrollers : function() {

			var self = this;self.scrollers = {};

			var left = self.scrollers.left = $('<div class="tabs-sl"/>').appendTo(self.head);
			var right = self.scrollers.right = $('<div class="tabs-sr"/>').appendTo(self.head);

			left.bind('mousedown',self.onScrollLeft.bind(self));
			left.bind('mouseup',self.onScrollStop.bind(self));

			right.bind('mousedown',self.onScrollRight.bind(self));
			right.bind('mouseup',self.onScrollStop.bind(self));

			return self.scrollers;

		},

		//> public void addComponent(Object component,boolean defer)
		addComponent : function(component,defer) {

			var self = this;
			var tab = component;

			self.last.before(tab.head);
			self.body.append(tab.elem);

			if (tab.selected) self.selectTab(tab);
			else if (!self.active) self.selectTab(tab);

			if (self.ready && !defer) self.layout();

		},

		//> public void removeComponent(Object component,boolean defer)
		removeComponent : function(component,defer) {

			var self = this,tab = component;
			if (self.active == tab) delete self.active;

			tab.head.remove();
			tab.elem.remove();

			if (self.ready && !defer) self.layout();

		},

		showScrollers : function() {

			var self = this,scrollers = self.scrollers || self.renderScrollers();

			self.scroll.css({margin:'0px 24px'});

			self.scrollers.left.css({display:'block'});
			self.scrollers.right.css({display:'block'});

		},

		hideScrollers : function() {

			var self = this;

			self.scroll[0].scrollLeft = 0;

			self.scrollers.left.css({display:'none'});
			self.scrollers.right.css({display:'none'});

			self.scroll.css({margin:0});

		},

		selectTab : function(tab) {

			var self = this,active = self.active;
			if (active) self.toggleTab(active,false);

			self.toggleTab(self.active = tab,true);
			self.scrollTo(tab);

		},

		toggleTab : function(tab,active) {

			tab.head.toggleClass('s');
			tab.elem.css({display:active?'block':'none'});

			tab.publish(active?'show':'hide');

		},

		scrollTo : function(tab) {

			var self = this,head = tab.head;

			var offsetLeft = head[0].offsetLeft;
			var offsetRight = offsetLeft + head[0].offsetWidth;

			var scrollLeft = self.scroll[0].scrollLeft;
			var scrollWidth = self.scroll[0].offsetWidth;

			if (offsetLeft < scrollLeft) self.scroll[0].scrollLeft = offsetLeft;
			else if (offsetRight > (scrollLeft + scrollWidth)) self.scroll[0].scrollLeft = offsetRight - scrollWidth;

		},

		layout : function(force) {

			var self = this.validate(force);
			if (!self.dirty || (self.active == null)) return;

			var height = self.body.height();
			if (height <= 0) return;

			var autosize = self.container.autosize;
			if (autosize) self.body.layout({height:self.target.height() - self.head.outerHeight(true)});

			var last = self.last[0].previousSibling;
			if (last && ((last.offsetLeft + last.offsetWidth) > self.head.outerWidth())) self.showScrollers();
			else if (self.scrollers) self.hideScrollers();

			for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
				node.resize({});
			}

		},

		onScrollLeft : function(event) {

			var self = this,scroll = self.scroll[0],last = self.last[0].previousSibling;
			var maximum = last.offsetLeft + last.offsetWidth - scroll.offsetWidth;

			self.ticker = window.setInterval(self.onScrollTick.bind(self,maximum,-20),50);

		},

		onScrollRight : function(event) {

			var self = this,scroll = self.scroll[0],last = self.last[0].previousSibling;
			var maximum = last.offsetLeft + last.offsetWidth - scroll.offsetWidth;

			self.ticker = window.setInterval(self.onScrollTick.bind(self,maximum,20),50);

		},

		onScrollTick : function(maximum,tick) {
			var self = this,scrollLeft = self.scroll[0].scrollLeft;
			self.scroll[0].scrollLeft = Math.max(Math.min(scrollLeft + tick,maximum),0);
		},

		onScrollStop : function(event) {
			window.clearInterval(this.ticker);
		}

	});

	return TabsLayout;

});
