
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
