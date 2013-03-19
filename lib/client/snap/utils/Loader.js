
define('snap.utils.Loader',function(snap) {

	var Style = snap.require('snap.utils.Style');
	var Script = snap.require('snap.utils.Script');

	var Loader = function(object,handler) {
		snap.isArray(object)?this.load(object,handler):this.parse(object,handler);
	};

	snap.extend(Loader.prototype,{

		loaded:0,

		parse : function(content,handler) {

			var self = this,resources = [];
			var html = content.jquery?$('<div/>').append(content):self.html(content);

			$('link,style,script[src]',html).each(function() {
				var self = this,tag = self.tagName,elem = $(self);
				if (tag.match(/link/i)) resources.push({type:'text/css',href:self.href});
				else if (tag.match(/style/i)) resources.push({type:'text/css',rules:elem.html()});
				else if (tag.match(/script/i)) resources.push({type:'text/javascript',src:self.src});
				elem.remove();
			});

			self.fragment = html.children();
			self.load(resources,handler);

		},

		html : function(content) {
			var container = document.createElement('div');
			container.innerHTML = 'div<div>' + content + '</div>';
			return $(container.lastChild);
		},

		load : function(resources,handler) {
			var self = this;self.resources = resources;self.handler = handler;self.next();
		},

		next : function() {
			var self = this,resource = self.resources[self.loaded++];
			if (resource && resource.type.match(/css/)) new Style(self,resource,self.next);
			else if (resource && resource.type.match(/javascript/)) new Script(self,resource,self.next);
			else if (self.handler) self.handler(self);
		}

	});

	snap.extend(Loader,{

		//> public Object load(Object object,Function? handler)
		load : function(object,handler) {
			return new Loader(object,handler);
		}

	});

	var loaded = function(event) {

		var deferred = [];
		$('script[type*=defer]',document).each(function() {
			deferred.push({type:'text/javascript',src:this.src,text:this.text});
		});

		if (deferred.length) Loader.load(deferred);

	};

	$load = Loader.load.bind(Loader);
	$(document).bind('ready',loaded.bind(self));

	return Loader;

});

snap.require('snap.utils.Loader');
