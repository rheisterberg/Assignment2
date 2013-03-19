
define('snap.utils.Style',function(snap) {

	//> public Style(Object scope,Object style,Function? handler)
	var Style = function(scope,style,handler) {

		var self = this;self.scope = scope;
		self.style = style;self.handler = handler;

		self.head = $('head',document);
		self.sheets = document.styleSheets;

		if (Style.getStyle(style.href));
		else if (style.href) return self.loadStyle(style);
		else if (style.rules) Style.loadRules(style.rules);

		self.onDone();

	};

	snap.extend(Style,{

		// View Style Loader

		Styles : {},

		// Add New Styles To Cache

		//> public void addStyles(Event? event)
		addStyles : function(event) {
			var self = this,styles = $('link',document);
			for (var idx = 0,len = styles.length;(idx < len);idx++) self.addStyle(styles[idx]);
		},

		// Add New Style To Cache

		addStyle : function(style) {
			var self = this,file = self.getFile(style.href);
			return file?(self.Styles[file] = style):null;
		},

		// Get Style

		getStyle : function(href) {
			var self = this,file = self.getFile(href);
			return file?self.Styles[file]:null;
		},

		// Get File

		getFile : function(href) {
			return href?href.substring(href.lastIndexOf('/') + 1):null;
		},

		// Load Style Rules

		loadRules : function(rules) {

			var head = $('head',document);
			var style = $('<style/>').attr({type:'text/css'}).appendTo(head);

			if (style[0].styleSheet) style[0].styleSheet.cssText = rules;
			else style.html(rules);

		}

	});

	snap.extend(Style.prototype,{

		retries:20,

		loadStyle : function(style) {

			var self = this,href = $uri(style.href);
			if ($.browser.safari && ($.browser.version < 525.28)) href.appendParam('_ts',new Date().valueOf().toString());

			var type = style.type || 'text/css',rel = style.rel || 'stylesheet';
			self.elem = $('<link/>').attr({type:type,rel:rel}).appendTo(self.head);

			snap.log('debug','Style.loadStyle',href.getUrl());

			if ($.browser.msie) self.elem.bind('load',self.onLoaded.bind(self));
			else window.setTimeout(self.onLoaded.bind(self),10);

			self.elem[0].href = href.getUrl();

		},

		onLoaded : function() {

			var self = this,elem = self.elem[0],sheets = self.sheets;
			for (var idx = 0,len = self.sheets.length;(idx < len);idx++) {
				var href = sheets[idx].href,ready = (href && elem.href.indexOf(href) >= 0);
				if (ready) return window.setTimeout(self.onReady.bind(self),10);
			}

			snap.log('debug','Style.onLoaded',self.retries);

			if (self.retries--) return window.setTimeout(self.onLoaded.bind(self),10);
			else return window.setTimeout(self.onReady.bind(self),0);

		},

		onReady : function() {

			var self = this,elem = self.elem.unbind();Style.addStyle(elem[0]);
			snap.log('debug','Style.onReady',elem[0].href);

			self.onDone();

		},

		onDone : function() {
			var self = this,handler = self.handler;
			if (handler) handler.apply(self.scope,[self]);
		}

	});

	Style.addStyles();
	$(window).bind('load',Style.addStyles.bind(Style));
	return Style;

});

snap.require('snap.utils.Style');
