
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
