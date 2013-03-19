
define('ebay.resources.Resources',function(snap) {

	//> public Resources(Object? config)
	var Resources = function(config) {

		var self = this;snap.extend(self.tokens,config);

		$(document).bind('ajaxSend',self.setResourceTokens.bind(self));
		$(document).bind('ajaxComplete',self.getResourceTokens.bind(self));

		self.tokens.id = parseInt(config.id);

	};

	snap.extend(Resources,{

		tokens : {},

		setResourceTokens : function(event,request) {
			var tokens = this.tokens;tokens.id++;
			if (tokens.id) request.setRequestHeader('X-Id-Token',tokens.id);
			if (tokens.js) request.setRequestHeader('X-Js-Token',tokens.js);
			if (tokens.css) request.setRequestHeader('X-Css-Token',tokens.css);
			snap.log('debug','Client.setResourceTokens',tokens.js,tokens.css);
		},

		getResourceTokens : function(event,request) {
			var tokens = this.tokens;
			tokens.js = request.getResponseHeader('X-Js-Token');
			tokens.css = request.getResponseHeader('X-Css-Token');
			snap.log('debug','Client.getResourceTokens',tokens.js,tokens.css);
		}

	});

	return Resources;

});
