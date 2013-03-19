
define('snap.utils.Script',function(snap) {

	//> public Script(Object scope,Object script,Function? handler)
	var Script = function(scope,script,handler) {

		var self = this;self.scope = scope;
		self.script = script;self.handler = handler;

		self.head = $('head',document);

		if (Script.getScript(script.src));
		else if (script.src) return self.loadScript(script);
		else if (script.text) Script.evalScript(script.text);

		self.onDone();

	};

	snap.extend(Script,{

		// View Script Loader

		Scripts : {},

		// Add Scripts To Cache

		//> public void addScripts(Event? event)
		addScripts : function(event) {
			var self = this,scripts = $('script',document);
			for (var idx = 0,len = scripts.length;(idx < len);idx++) self.addScript(scripts[idx]);
		},

		// Add Script To Cache

		addScript : function(script) {
			var self = this,type = script.type,file = self.getFile(script.src);
			return ((type == 'text/javascript') && file)?(self.Scripts[file] = script):null;
		},

		// Get Script

		getScript : function(src) {
			var self = this,file = self.getFile(src);
			return file?self.Scripts[file]:null;
		},

		// Get File

		getFile : function(src) {
			return src?src.substring(src.lastIndexOf('/') + 1):null;
		},

		// Evaluate Script Text

		evalScript : function(text) {
			window.execScript?window.execScript(text):window.eval.call(window,text);
		}

	});

	snap.extend(Script.prototype,{

		loadScript : function(script) {

			var self = this,href = $uri(script.src);
			if ($.browser.safari && ($.browser.version < 525.28)) href.appendParam('_ts',new Date().valueOf().toString());

			self.elem = $('<script/>').attr({type:'text/javascript'});

			if ($.browser.msie) self.elem.bind('readystatechange',self.onChange.bind(self));
			else self.elem.bind('load error',self.onLoaded.bind(self));

			snap.log('debug','Script.loadScript',href.getUrl());

			self.head[0].appendChild(self.elem[0]);
			self.elem[0].src = href.getUrl();

		},

		onChange : function(event) {
			var self = this,state = self.elem[0].readyState;
			if (state.match(/loaded/)) self.onLoaded(event);
		},

		onLoaded : function(event) {

			var self = this,elem = self.elem.unbind();Script.addScript(elem[0]);
			snap.log('debug','Script.onLoaded',elem[0].src);

			self.onDone();

		},

		onDone : function() {
			var self = this,handler = self.handler;
			if (handler) handler.apply(self.scope,[self]);
		}

	});

	Script.addScripts();
	$(window).bind('load',Script.addScripts.bind(Script));
	return Script;

});

snap.require('snap.utils.Script');