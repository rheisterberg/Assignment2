
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
