
define('snap.ajax.AjaxDefaultTransport',function(snap) {

	var AjaxDefaultTransport = function(request) {
		this.request = request;
	};

	snap.extend(AjaxDefaultTransport.prototype,{

		send : function() {

			var self = this,request = self.request;self.transfer = self.getTransferObject();
			self.transfer.open(request.method,request.uri.getUrl(),request.async,request.user,request.pass);

			self.transfer.setRequestHeader('X-Requested-With','XMLHttpRequest');
			for (var name in request.requestHeaders) self.transfer.setRequestHeader(name,request.requestHeaders[name]);

			if (request.async) self.transfer.onreadystatechange = function() { self.onChange(); };
			if (request.async && request.timeout) self.timer = window.setTimeout(self.onTimeout.bind(self),request.timeout);

			self.transfer.send(request.requestText);
			if (!request.async) self.onReady(self.transfer.status);

		},

		abort : function() {

			var self = this;

			self.transfer.abort();
			self.transfer.onreadystatechange = null;

			self.transfer = null;

		},

		onChange : function() {
			var self = this,readyState = self.transfer.readyState;
			if (readyState == 4) self.onReady(self.transfer.status);
		},

		onTimeout : function()  {

			var self = this;self.abort();
			if (self.request.retries-- > 1) return self.send();

			self.request.onReady(408);

		},

		onReady : function(status)  {

			var self = this;

			window.clearTimeout(self.timer);

			self.transfer.onreadystatechange = null;

			self.request.responseXML = self.transfer.responseXML;
			self.request.responseText = self.transfer.responseText;

			self.request.setResponseHeaders(self.getResponseHeaders());

			self.request.onReady(status);

		},

		getResponseHeaders : function() {

			var headers = {};

			var text = this.transfer.getAllResponseHeaders();
			var lines = text?text.split(/\n|\r\n/):[];

			for (var idx = 0,len = lines.length;(idx < len);idx++) {

				var match = lines[idx].match(/([^:]+):\s*(.*)/);
				if (match == null) continue;

				var name = match[1],value = match[2];
				if (headers[name] == null) headers[name] = value;
				else if (typeof(headers[name]) === 'object') headers[name].push(value);
				else headers[name] = [headers[name],value];

			}

			return headers;

		}

	});

	if (window.XMLHttpRequest) {
		AjaxDefaultTransport.prototype.getTransferObject = function() { return new window.XMLHttpRequest(); };
	}
	else if (window.ActiveXObject) {
		var version = $doc.ActiveXVersion(['Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.3.0','Microsoft.XMLHTTP']);
		AjaxDefaultTransport.prototype.getTransferObject = function() { return new ActiveXObject(version); };
	}

	return AjaxDefaultTransport;

});

define('snap.ajax.AjaxScriptTransport',function(snap) {

	var AjaxScriptTransport = function(request) {
		this.request = request;
	};

	snap.extend(AjaxScriptTransport.prototype,{

		send : function() {

			var self = this,request = self.request,func = request.func;
			if (func) request.uri.params['_jid'] = request.href;

			AjaxScriptTransport.requests[request.href] = request;

			self.script = document.body.appendChild(document.createElement('script'));
			self.script.type = 'text/javascript';self.script.charset = 'utf-8';

			if (request.timeout) self.timer = window.setTimeout(self.onTimeout.bind(self),request.timeout);

			if ($.browser.msie) $(self.script).bind('readystatechange',self.onChange.bind(self));
			else $(self.script).bind('load',self.onLoad.bind(self));

			self.script.src = request.uri.getUrl();

		},

		onTimeout : function()  {

			var self = this;self.script.parentNode.removeChild(self.script);
			delete AjaxScriptTransport.requests[self.request.href];

			return (self.request.retries-- > 1)?self.send():self.onReady(408);

		},

		// Script OnReadyStateChange Event Handler (IE Only)

		onChange : function(event) {
			if (this.script.readyState.match(/loaded/)) this.onLoad(event);
		},

		// Script OnLoad Event Handler

		onLoad : function(event) {
			this.onReady(200);
		},

		// Script OnReady Handler

		onReady : function(status)  {

			var self = this;

			window.clearTimeout(self.timer);

			$(self.script).remove();
			delete AjaxScriptTransport.requests[self.request.href];

			self.request.onReady(status);

		}

	});

	snap.extend(AjaxScriptTransport,{

		// Ajax Requests

		requests : {},

		//> public void load(String id,Object response,Object headers)
		load: function(id,response,headers) {

			var request = this.requests[id];
			if (request == null) return;

			request.responseObject = response;
			request.setResponseHeaders(headers);

		}

	});

	return AjaxScriptTransport;

});

define('snap.ajax.AjaxRequest',function(snap) {

	var AjaxDefaultTransport = snap.require('snap.ajax.AjaxDefaultTransport');
	var AjaxScriptTransport = snap.require('snap.ajax.AjaxScriptTransport');

	//> public AjaxRequest(Object? config)
	var AjaxRequest = function(config) {
		var self = this;self.requestHeaders = {};self.responseHeaders = {};
		AjaxRequest.superclass.constructor.call(self,config);
	};

	snap.inherit(AjaxRequest,'snap.Observable');
	snap.extend(AjaxRequest.prototype,{

		transport:null,timeout:10000,retries:3,async:true,
	
		//> public void get(String url,boolean? async)
		get : function(url,async) {
			this.send(url,'get',null,async);
		},
	
		post : function(url,data,async) {
			this.send(url,'post',data,async);
		},
	
		send : function(url,method,data,async) {
	
			var self = this;
	
			self.uri = $uri(url);
			self.method = method;self.async = async;
	
			if (self.getTargetHost(self.uri).match(self.host)) self.transport = new AjaxDefaultTransport(self);
			else self.transport = new AjaxScriptTransport(self);
	
			self.transport.send();
	
		},
	
		onReady : function(status) {
	
			var self = this;
	
			self.error = ((self.status = status) != 200);
			self.publish(self.error?'error':'success',self);
	
			self.publish('complete',self);
	
		},
	
		deserialize : function() {
	
			var self = this;
	
			self.responseObject = (self.responseObject)?self.responseObject:JSON.parse(self.responseText);
			if (self.responseObject == null) self.responseObject = {};
	
			return self.responseObject;
	
		},
	
		getTargetHost : function(uri) {
			var host = uri.host,port = uri.port;
			return port?host.concat(':',port):host;
		},
	
		getResponse : function() {
			return this.deserialize();
		},
	
		getRequestHeader : function(name) {
			return this.requestHeaders[name];
		},
	
		getRequestHeaders : function() {
			return this.requestHeaders;
		},
	
		setRequestHeader : function(name,value) {
			this.requestHeaders[name] = value;
		},
	
		setRequestHeaders : function(requestHeaders) {
			this.requestHeaders = requestHeaders;
		},
	
		getResponseHeader : function(name) {
			return this.responseHeaders[name];
		},
	
		getResponseHeaders : function() {
			return this.responseHeaders;
		},
	
		setResponseHeaders : function(responseHeaders) {
			this.responseHeaders = responseHeaders;
		}
	
	});
	
	var host = document.location.host.replace(/\./g,'\\.');
	AjaxRequest.prototype.host = new RegExp('^$|^'.concat(host,'$'),'i');

	return AjaxRequest;
	
});

snap.require('snap.ajax.AjaxRequest');

define('snap.client.features.Features',function(snap) {

	//> public Features(Object? config)
	var Features = function(config) {
		snap.extend(this.supported,config);
	};

	snap.extend(Features,{

		supported : {},

		supports : function(name) {
			return this.supported[name];
		}

	});

	return Features;

});

define('snap.client.features.Detector',function(snap) {

	var agents = {

		explorer:/(MSIE)\s*([\d\.]*)/,
		firefox:/(Firefox)\/([\d\.]*)/,
		safari:/(Safari)\/([\d\.]*)/,
		chrome:/(Chrome)\/([\d\.]*)/,
		opera:/(Opera)[\/\s]([\d\.]*)/,

		gecko:/(Gecko)\/([\d\.]*)/,
		mozilla:/(Mozilla)\/([\d\.]*)/,
		webkit:/(WebKit)\/([\d\.]*)/

	};

	var Features = snap.require('snap.client.features.Features');

	//> public Detector(Object? config)
	var Detector = function(config) {

		var self = this,supported = Features.supported;
		var agent = navigator.userAgent,match;self.classes = [];
		for (var name in agents) if (match = agent.match(agents[name])) supported[name] = match[2];

		$(window).bind('load',self.onload.bind(self));

	};

	snap.extend(Detector,{

		//> public boolean detect(String name,Function? func)
		detect : function(name,func) {
			var self = this,supported = Features.supported,feature = func || supported[name];
			var supported = (snap.isFunction(feature))?self.execute(name,feature):feature;
			return Features.supported[name] = snap.isBoolean(supported)?(supported?1:0):supported;
		},

		execute : function(name,feature) {
			try { return feature.call(this,name); }
			catch(except) { return false; }
		},

		onload : function(event) {

			var self = this,supported = JSON.stringify(Features.supported);
			var location = $uri(document.location.href),redirect = location.params.redirect;

			snap.log('debug','Features.supported',supported);

			var href = $uri('/_snap/ClientFeatures');
			href.appendParam('features',supported);href.appendParam('redirect',redirect);
			if (redirect) window.location.href = href.getUrl();

		}

	});

	return Detector;

});

var Detector = snap.require('snap.client.features.Detector');
Detector.call(Detector);



define('snap.client.features.detector.Json',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public Json(String name)
	var Json = function(name) {
		return snap.isDefined(window.JSON);
	};

	Detector.detect('json',Json);
	return Json;

});

snap.require('snap.client.features.detector.Json');
define('snap.client.features.detector.Html5',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public Html5(String name)
	var Html5 = function(name) {
		var div = document.createElement('div');div.innerHTML = '<elem></elem>';
		return (div.childNodes.length > 0);
	};

	Detector.detect('html5',Html5);
	return Html5;

});

snap.require('snap.client.features.detector.Html5');
define('snap.client.features.detector.DataUri',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public DataUri(String name)
	var DataUri = function(name) {

		var self = this,image = new Image(),supported;
		image.onload = image.onerror = function() { Detector.detect('data-uri',((image.width == 4) && (image.height == 4))); }.bind(self);
		image.src = 'data:image/x-png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAEAQMAAACTPww9AAAAA3NCSVQICAjb4U/gAAAABlBMVEX///////9VfPVsAAAACXBIWXMAAAsSAAALEgHS3X78AAAAFnRFWHRDcmVhdGlvbiBUaW1lADA2LzA4LzEyT6yq2AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAAALSURBVAiZY2CAAAAACAABr1PqIgAAAABJRU5ErkJggg==';

		return false;

	};

	Detector.detect('data-uri',DataUri);
	return DataUri;

});

snap.require('snap.client.features.detector.DataUri');
define('snap.client.features.detector.Mutable',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public Mutable(String name)
	var Mutable = function(name) {
		return !!$.browser.msie?($.browser.version >= '9'):true;
	};

	Detector.detect('mutable',Mutable);
	return Mutable;

});

snap.require('snap.client.features.detector.Mutable');

define('snap.client.features.detector.Performance',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public Performance(String name)
	var Performance = function(name) {
		return snap.isDefined(window.performance);
	};

	Detector.detect('performance',Performance);
	return Performance;

});

snap.require('snap.client.features.detector.Performance');

define('snap.client.features.detector.Canvas',function(snap) {

	var Detector = snap.require('snap.client.features.Detector');

	//> public Canvas(String name)
	var Canvas = function(name) {
		var self = this,canvas = document.createElement('canvas');
		return !!(canvas.getContext && canvas.getContext('2d'));
	};

	Detector.detect('canvas',Canvas);
	return Canvas;

});

snap.require('snap.client.features.detector.Canvas');
define('snap.utils.Document',function(snap) {

	var Document = snap.extend(function() {},{

		// Compute Element Offset Top

		//> public int offsetTop(Object elem,Object? parent)
		offsetTop : function(elem,parent) {
			for (var offsetTop = 0;(elem && (elem !== parent));elem = elem.offsetParent) { offsetTop += elem.offsetTop; }
			return offsetTop;
		},

		// Compute Element Offset Left

		//> public int offsetLeft(Object elem,Object? parent)
		offsetLeft : function(elem,parent) {
			for (var offsetLeft = 0;(elem && (elem !== parent));elem = elem.offsetParent) { offsetLeft += elem.offsetLeft; }
			return offsetLeft;
		},

		// Disable/Enable Text Selection

		//> public void disableSelect(Object elem)
		disableSelect: function(elem) {

			if (document.all) {
				elem.bind('dragstart selectstart',this.cancelSelect.bind(this));
			}
			else {
				elem.css({'-webkit-user-select':'none','-moz-user-select':'none','user-select':'none'});
			}

		},

		//> public void enableSelect(Object elem)
		enableSelect: function(elem) {

			if (document.all) {
				elem.unbind('dragstart selectstart');
			}
			else {
				elem.css({'-webkit-user-select':'','-moz-user-select':'','user-select':''});
			}

		},

		cancelSelect : function(event) {
			return false;
		}

	});

	snap.alias(Document,'$doc');

	// Define Text Range Select Prototype

	if (document.createRange) {
		$doc.selectRange = function(node) { var range = document.createRange(); range.selectNode(node); window.getSelection().addRange(range); };
	}
	else if (document.all) {
		$doc.selectRange = function(node) { var range = document.body.createTextRange(); range.moveToElementText(node); range.select(); };
	}

	// Define ActiveX Version

	if (window.ActiveXObject) {
		$doc.ActiveXVersion = function(versions) {
			for (var idx = 0,len = versions.length;(idx < len);idx++) {
				try { new ActiveXObject(versions[idx]);return versions[idx]; }
				catch(except) {}
			}
		};
	}

	return Document;

});

snap.require('snap.utils.Document');
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

/**
* Utility class to parse/build eBay specified uri.
*/
define('snap.utils.Uri',function(snap) {

	/**
	* Gets the meta tag with specified attribute name and value.
	*
	* @param {String} name
	*        the attribute name of the meta tag
	* @param {String} value
	*        the value of the specified attribute
	* @return {String}
	*        the reference of the meta tag. If no such meta exists, return
	*        <code>null</code>
	*/
	//> public Object meta(String, String);
	var meta = function(name,value) {
		var tags = document.getElementsByTagName('meta');
		for (var idx = 0,len = tags.length;(idx < len);idx++) {
			if (tags[idx].getAttribute(name) == value) return tags[idx];
		}
		return null;
	};

	var content = meta('http-equiv','Content-Type') || meta('httpEquiv','Content-Type');
	var charset = (content)?content.getAttribute('content'):null;

	var encodeUri = (charset && charset.match(/utf/gi))?encodeURI:window.escape;
	var decodeUri = (charset && charset.match(/utf/gi))?decodeURI:window.unescape;

	var encodeParam = (charset && charset.match(/utf/gi))?encodeURIComponent:window.escape;
	var decodeParam = (charset && charset.match(/utf/gi))?decodeURIComponent:window.unescape;

	var uriMatch = new RegExp('(([^:]*)://([^:/?]*)(:([0-9]+))?)?([^?#]*)([?]([^#]*))?(#(.*))?');
	var seoParam = new RegExp('Q([0-9a-fA-F][0-9a-fA-F])','g');

	/**
	* @construct
	* @param {String} href
	*        a uri string to be parsed
	*/
	//> public void Uri(String href);
	var Uri = function(href) {

		var self = this;self.params = {};
		var match = href.match(uriMatch);
		if (match == null) return;

		self.protocol = self.match(match,2);

		self.host = self.match(match,3);
		self.port = self.match(match,5);

		self.href = self.match(match,6);
		self.query = self.match(match,8);

		if (self.href.match(/eBayISAPI.dll/i)) self.decodeIsapi(self.query);
		else self.decodeParams(self.query);

		self.href = decodeUri(self.href);
		self.hash = self.match(match,10);

	};

	snap.extend(Uri.prototype,{

		//> private String match(Object match,int idx);
		match : function(match,idx) {
			return ((match.length > idx) && match[idx])?match[idx]:'';
		},

		//> private void decodeIsapi(String);
		decodeIsapi : function(query) {
			var params = (query)?query.split('&'):[];
			this.isapi = params.shift();this.query = params.join('&');
			this.decodeParams(this.query);
		},

		/**
		* Adds a name-value pair as a parameter. The function allows duplicate
		* attributes with different values. The name-value pair is registered in a
		* parameter array. You can specify this parameter array and by default this
		* class has a internal array which is used to build the uri.
		*
		* @param {String} name
		*        the name of the parameter
		* @param {String} value
		*        the value of the parameter
		*/
		//> public void appendParam(String name,String value);
		appendParam : function(name,value) {
			var params = this.params;
			if (params[name] == null) params[name] = value;
			else if (typeof(params[name]) == 'object') params[name].push(value);
			else params[name] = [params[name],value];
		},

		/**
		* Adds all paramters from a parameter array to this buider's internal
		* paramter array, which is used to build the uri.
		* <p>
		* Notes: This will not overwrite the existing paramters. If the paramters
		* are duplicate with the existing one, the value will be appended as an
		* other value of the same paramter name.
		*
		* @param {Object} params
		*        the custom parameter array from which the parameter will be added
		*        to the builder's internal array
		*/
		//> public void appendParams(Object);
		appendParams : function(params) {
			for (var name in params) {
				var param = params[name];
				if (typeof(param) != 'object') this.appendParam(name,param);
				else for (var idx = 0;(idx < param.length);idx++) this.appendParam(name,param[idx]);
			}
		},

		/**
		* Parses the paramters from the query string to the builder's internal
		* parameter array.
		*
		* @param {String} query
		*        the qurey string to be parsed
		*/
		//> public void decodeParams(String);
		decodeParams : function(query) {

			var pairs = (query)?query.split('&'):[];
			for (var idx = 0;(idx < pairs.length);idx++) {

				var pair = pairs[idx].split('='),name = decodeParam(pair[0]);
				var value = (pair.length > 1)?decodeParam(pair[1].replace(/\+/g,'%20')):'';

				if (name) this.appendParam(name,value);

			}

		},

		encodeParam : function(name,value) {
			var param = encodeParam(name);
			return value?param.concat('=',encodeParam(value)):param;
		},

		/**
		* Builds the qurey string from a parameter array.
		*
		* @param {Object} params
		*        a specified parameter array. This function will use the builder's
		*        internal parameter array if you leave this parameter as
		*        <code>null</code>
		* @String {String}
		*        the combined query string
		*/
		//> public String encodeParams(Object);
		encodeParams : function(params) {

			var self = this,pairs = [];
			var params = (params)?params:this.params;

			for (var name in params) {
				if (typeof(params[name]) != 'object') pairs.push(self.encodeParam(name,params[name]));
				else for (var idx = 0;(idx < params[name].length);idx++) pairs.push(self.encodeParam(name,params[name][idx]));
			}

			return pairs.join('&');

		},

		/**
		* Parses the paramters from the form element to a parameter array.
		*
		* @param {Object} form
		*        the form element to be parsed
		*/
		//> public Object decodeForm(Object);
		decodeForm : function(form) {

			var self = this,elems = form.elements,params = {};
			for (var idx = 0,len = elems.length;(idx < len);idx++) delete self.params[elems[idx].name];

			for (var idx = 0,len = elems.length;(idx < len);idx++) {

				var elem = elems[idx];
				if (elem.disabled) continue;

				var type = elem.type,name = elem.name,value = elem.value; //<String
				if (type.match(/text|hidden|textarea|password|file/)) self.appendParam(name,value);
				else if (type.match(/radio|checkbox/) && elem.checked) self.appendParam(name,value);
				else if (type.match(/select-one|select-multiple/)) self.appendSelect(elem);

				params[name] = self.params[name];

			}

			return params;

		},

		/**
		* Gets the options from a select HTML control to a parameter array.
		*
		* @param {Object} select
		*        the select HTML control to be parsed
		*/
		//> public void appendSelect(Object, Object);
		appendSelect : function(select) {
				var options = select.options;
				for (var idx = 0,len = options.length;(idx < len);idx++) {
					if (options[idx].selected) this.appendParam(select.name,options[idx].value);
				}
		},

		/**
		* Gets the combined uri from the known information.
		*
		* @return {String}
		*         the combined uri string
		*/
		//> public String getUrl();
		getUrl : function() {

			var self = this;
			var url = (self.protocol)?self.protocol.concat('://'):'';

			if (self.host) url = url.concat(self.host);
			if (self.port) url = url.concat(':',self.port);

			if (self.href) url = url.concat(encodeUri(self.href));
			if (self.isapi) url = url.concat('?',self.isapi);

			var query = self.encodeParams(self.params);
			if (query) url = url.concat(self.isapi?'&':'?',query);
			if (self.hash) url = url.concat('#',self.hash);

			return url;

		}

	});

	$uri = function(href) { return new Uri(href); };
	return Uri;

});

snap.require('snap.utils.Uri');

define('Base64',function(snap) {

    var codes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=*';

    var Base64 = function() {};

    snap.extend(Base64,{

        decode :  function(value) {

            var len = value.length,ret = '';
            if (len <= 0) return ret;

            var test = new RegExp('[^A-Za-z0-9+/=*]');
            if (test.exec(value)) return ret;

            var idx = 0,len = value.length,decoded = '';
            var enc1,enc2,enc3,enc4,dec1,dec2,dec3;

            while (idx < len) {

                var enc1 = codes.indexOf(value.charAt(idx++));
                var enc2 = codes.indexOf(value.charAt(idx++));
                var enc3 = codes.indexOf(value.charAt(idx++));
                var enc4 = codes.indexOf(value.charAt(idx++));

                dec1 = (enc1 << 2) | (enc2 >> 4);
                dec2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                dec3 = ((enc3 & 3) << 6) | enc4;

                decoded += String.fromCharCode(dec1);
                if (!(enc3 >= 64)) decoded += String.fromCharCode(dec2);
                if (!(enc4 >= 64)) decoded += String.fromCharCode(dec3);

            }

            return decoded;

        }

    });

    return Base64;

});

snap.require('Base64');

define('Utf8',function(snap) {

    var Utf8 = function() {};

    snap.extend(Utf8,{

        decode : function(value) {

            var idx = 0,len = value.length,decoded = '',c0,c1,c2;
            while (idx < len) {
                c0 = value.charCodeAt(idx);
                if (c0 < 128) { decoded += String.fromCharCode(c0);idx++; }
                else if ((c0 > 191) && (c < 224)) { c2 = value.charCodeAt(i + 1);decoded += String.fromCharCode(((c0 & 31) << 6) | (c2 & 63));idx += 2; }
                else { c2 = value.charCodeAt(idx + 1);c3 = value.charCodeAt(idx + 2);decoded += String.fromCharCode(((c0 & 15)<< 12) | ((c2 & 63) << 6 ) | (c3 & 63));idx += 3; }
            }
            return decoded;
        }

    });

    return Utf8;

});

snap.require('Utf8');
