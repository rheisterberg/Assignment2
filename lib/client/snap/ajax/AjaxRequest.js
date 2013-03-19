
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
