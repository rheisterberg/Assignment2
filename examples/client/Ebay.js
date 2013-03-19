
define('ebay.context.Context',function(snap) {

	var Features = snap.require('snap.client.features.Features');

	//> public Context(Object? config)
	var Context = function(config) {
		snap.extend(this,config);
		Features.call(Features,this.features);
	};

	return Context;

});

/**
* Reads and writes cookies for Marketplace domain page.
* <p>
* Note: This class is only used for eBay site.
*
*/
define('ebay.cookies',function(snap) {

	var Cookies = function() {};

	snap.extend(Cookies,{

		//TODO: possibly make this config data
		Default_Cookie_Format : {
			"COOKIELET_DELIMITER":"^",
			"NAME_VALUE_DELIMITER":"/",
			"escapedValue":true
		},

		DP_Cookie_Format : {
			"COOKIELET_DELIMITER":"^",
			"NAME_VALUE_DELIMITER":"/",
			"bUseExp":true,
			"startDelim":"b"
		},

		Session_Cookie_Format : {
			"COOKIELET_DELIMITER":"^",
			"NAME_VALUE_DELIMITER":"=",
			"escapedValue":true,
			"startDelim":"^"
		},

		DS_Cookie_Format : {
			"COOKIELET_DELIMITER":"^",
			"NAME_VALUE_DELIMITER":"/"
		},

		sPath : "/",

		aConversionMap : {
			'reg' : ['dp1','reg'],
			'recent_vi' : ['ebay','lvmn'],
			'ebaysignin' : ['ebay','sin'],
			'p' : ['dp1','p'],
			'etfc' : ['dp1','etfc'],
			'keepmesignin' : ['dp1','kms'],
			'ItemList' : ['ebay','wl'],
			'BackToList' : ['s','BIBO_BACK_TO_LIST']
		},

		aFormatMap : {
		},

		sCOMPAT : "10",
		sCONVER : "01",
		sSTRICT : "00",

		sModesCookie : "ebay",
		sModesCookielet : "cv",

		/**
		* Gets the value of the given cookielet from a specified cookie.
		*
		* @param {String} cookie
		*        a string name of the cookie
		* @param {String} cookielet
		*        a string name of the cookielet in the specified cookie
		* @return {String}
		*        the value of the cookielet
		*/
		//>public String readCookie(String,String);
		readCookie : function (psCookie,psCookielet) {
			var rv = this.readCookieObj(psCookie,psCookielet).value;
			return (rv) ? decodeURIComponent(rv) : "";
		},

		//>private Object createDefaultCookieBean(String, String);
		createDefaultCookieBean : function(psCookie,psCookielet) {
			// define cookie bean
			var cookie = {};
			// string
			cookie.name = psCookie;
			// string
			cookie.cookieletname = psCookielet;
			// string
			cookie.value = "";
			// date in millisecs UTC
			cookie.maxage = 0;
			cookie.rawcookievalue = "";
			cookie.mode = "";
			return cookie;
		},

		// TODO make internal method to return cookie object readCookieObj
		//> private String readCookieObj(String,String);
		readCookieObj : function (psCookie,psCookielet) {
			var cookie = this.createDefaultCookieBean(psCookie,psCookielet);
			this.update();
			this.checkConversionMap(cookie);

			// returns the raw value of the cookie from document.cookie
			// raw value
			cookie.rawcookievalue = this.aCookies[cookie.name];

			// TODO - determine why this is required
			if (!cookie.name || !cookie.rawcookievalue){
				cookie.value = "";
			}
			else if (!cookie.cookieletname){
				// read cookie
				this.readCookieInternal(cookie);
			}
			else {
				// read cookielet
				this.readCookieletInternal(cookie);
			}

			// Check cookie corruption

			var guid = (psCookielet && psCookielet.match(/guid$/));
			var object = (typeof(cookie) != 'undefined')?cookie:'';

			var corrupted = (object && guid && (cookie.value.length > 32));
			if (corrupted) cookie.value = cookie.value.substring(0,32);

			return object;

		},

		//> private void checkConversionMap(Object);
		checkConversionMap : function(cookie) {
			//Check conversion map
			// 2 values returned - 2 values cookie + cookielet
			var cmap = this.aConversionMap[cookie.name];

			// if cookielet is in conversio map then do the following
			// reset cookie and cookielet names to old namesl
			/*
				raw cookies are being converted to cookielets
				this takes care of the moving cookies to cookielets
			*/

			if (cmap) {
				// compatibility mode
				cookie.mode = this.getMode(cookie.name);
				cookie.name = cmap[0];
				cookie.cookieletname = cmap[1];
			}
		},

		//> private Object readCookieInternal(Object);
		readCookieInternal : function(cookie) {
				// read raw cookie with compatibility modes to switch between raw cookie and cookielets
				cookie.value  = cookie.rawcookievalue;
				return cookie;
		},

		//> private Object readCookieletInternal(Object);
		readCookieletInternal : function(cookie){
				var clet = this.getCookielet(cookie.name,cookie.cookieletname,cookie.rawcookievalue);
				// handling formats of cookielets mentiond in aFormatMap
				var format = this.getFormat(cookie.name);
				if (clet && format.bUseExp){
					//do not expire cookie on client
					var cletOrig = clet;
					clet = clet.substring(0,clet.length-8);
					if (cletOrig.length > 8) {
						cookie.maxage = cletOrig.substring(cletOrig.length-8);
					}
				}

				// All other modes and if mode is not available
				cookie.value = clet;
				// COMPAT mode
				if (cookie.mode == this.sCOMPAT){
					cookie.value = cookie.rawcookievalue;
				}
				return cookie;
		},

		/**
		* Gets multiple values from a cookielet. This function splits a cookielet
		* value by predefined delimiter and construct an array stores each value.
		*
		* @param {String} cookie
		*        a string name of the cookie
		* @param {String} cookielet
		*        a string name of the cookielet in the specified cookie
		* @return {Object}
		*        an array that stores the multiples value
		*/
		//> public Object readMultiLineCookie(String,String);
		readMultiLineCookie : function (psCookie,psCookielet) {
			//this.update();
			if (!psCookie || !psCookielet){
				return "";
			}
			var val, r = "";
			var cmap = this.aConversionMap[psCookie];
			if (cmap) {
				val = this.readCookieObj(cmap[0],cmap[1]).value || "";
			}
			if (val) {
				r = this.getCookielet(psCookie,psCookielet,val) || "";
			}
			return (typeof(r)!="undefined")?r:"";
		},

		/**
		* Writes a value String to a given cookie. This function requires setting
		* an exact expire date. You can use {@link writeCookieEx} instead to set
		* the days that the cookie will be avaliable.
		*
		* @param {String} cookie
		*        a string name of the cookie to be written
		* @param {String} value
		*        a string value to be written in cookie
		* @param {String} exp
		*        an exact expired date of the cookie
		* @see #writeCookieEx
		*/
		//> public void writeCookie(String,String,String);
		//> public void writeCookie(String,String,int);
		writeCookie : function (psCookie,psVal,psExp) {
			//@param    pbSecure - secured? (optional)
			//Check conversion map
			var cmap = this.aConversionMap[psCookie];
			if (cmap) {
				this.writeCookielet(cmap[0], cmap[1], psVal, psExp);
				return;
			}
			var format = this.getFormat(psCookie);
			if (psVal && format.escapedValue) {
				psVal = encodeURIComponent(psVal);
			}
			this.writeRawCookie(psCookie,psVal,psExp);

		},

		//> private void writeRawCookie(String, String, String);
		//> private void writeRawCookie(String, String, int);
		writeRawCookie : function (psCookie,psVal,psExp) {
			if (psCookie && (psVal!==undefined)){
		//    Uncomment secure related lines below and
		//    add to param list if it is being used
		//    var secure = pbSecure?"true":"";
		//    check for size limit
				if((isNaN(psVal) && psVal.length<4000) || (psVal+'').length<4000){
					if (typeof psExp == 'number') {
						psExp = this.getExpDate(psExp);
					}
					var expDate = psExp?new Date(psExp):new Date(this.getExpDate(730));
					var format = this.getFormat(psCookie);
					//TODO: refactor domain logic before E513
					var sHost = this.sCookieDomain;
					var dd = document.domain;
					//if (!dd.has(sHost)) {
					if (dd.indexOf(sHost)==-1) {
						var index = dd.indexOf('.ebay.');
						if (index>0) {
							this.sCookieDomain = dd.substring(index);
						}
					}
					//Added check before writing the cookie
					if(document.cookie)
					{
						document.cookie = psCookie + "=" + (psVal||"") +
						((psExp || format.bUseExp)?"; expires=" + expDate.toGMTString():"") +
						"; domain=" + this.sCookieDomain +
						"; path=" + this.sPath;
		//        "; secure=" + secure;
					}
				}
			}
		},

		/**
		* Writes a value String to a given cookie. You can put the days to expired
		* this cookie from the current time.
		*
		* @param {String} cookie
		*        a string name of the cookie to be written
		* @param {String} value
		*        a string value to be written in cookie
		* @param {int} expDays
		*        the number of days that represents how long the cookie will be
		*        expired
		* @see #writeCookie
		*/
		//>public void writeCookieEx(String,String,int);
		writeCookieEx : function (psCookie,psVal,piDays) {
			this.writeCookie(psCookie,psVal,this.getExpDate(piDays));
		},

		/**
		* Writes value to cookielet. You can use {@link writeMultiLineCookie} for
		* some multi-level cookielet.
		*
		* @param {String} cookie
		*        the name of the specified cookie which contains the cookielet to be
		*        write
		* @param {String} cookielet
		*        the name of the cookielet to be write
		* @param {String} val
		*        the value of the cookielet
		* @param {String} exp
		*        an expired date of the cookielet
		* @param {String} contExp
		*        an expired date of the cookie
		* @see #writeMultiLineCookie
		*/
		//> public void writeCookielet(String,String,String,{int|String}?,{int|String}?);
		writeCookielet : function (psCookie,psCookielet,psVal,psExp,psContExp) {
			//@param    pSec - secured? (optional)
			if (psCookie && psCookielet){
				this.update();
				var format = this.getFormat(psCookie);
				if (format.bUseExp && psVal){
					//Set the default exp date to 2 yrs from now
					if (typeof psExp == 'number') {
						psExp = this.getExpDate(psExp);
					}
					var expDate = psExp?new Date(psExp):new Date(this.getExpDate(730)); //<Date
					var expDateUTC = Date.UTC(expDate.getUTCFullYear(),expDate.getUTCMonth(),expDate.getUTCDate(),expDate.getUTCHours(),expDate.getUTCMinutes(),expDate.getUTCSeconds());
					expDateUTC = Math.floor(expDateUTC/1000);
					//psVal += expDateUTC.dec2Hex();
					psVal += parseInt(expDateUTC,10).toString(16);
				}
				var val = this.createCookieValue(psCookie,psCookielet,psVal);
				this.writeRawCookie(psCookie,val,psContExp);
			}
		},

		/**
		* Writes value to some multi-level cookielet. Some cookielet contains sub
		* level, and you can use the name of the cookielet as cookie name and write
		* its sub level value.
		* These cookielet includes:
		* <p>
		* <pre>
		* Name as Cookie | name in cookielet         | upper level cookie
		* -------------- |---------------------------|----------------------
		* reg            | reg                       | dp1
		* recent_vi      | lvmn                      | ebay
		* ebaysignin     | sin                       | ebay
		* p              | p                         | dp1
		* etfc           | etfc                      | dp1
		* keepmesignin   | kms                       | dp1
		* BackToList     | BIBO_BACK_TO_LIST         | s
		* reg            | reg                       | dp1
		* </pre>
		* <p>
		* you need to use {@link writeCookielet} for other cookielet.
		*
		* @param {String} cookie
		*        the name of the specified cookie which contains the cookielet to be write
		* @param {String} cookielet
		*        the mame of the cookielet to be write
		* @param {String} val
		*        the value of the cookielet
		* @param {String} exp
		*        an expired date of the cookielet
		* @param {String} contExp
		*        an expired date of the cookie
		* @see #writeCookielet
		*/
		//> public void writeMultiLineCookie(String,String,String,String,String);
		writeMultiLineCookie : function (psCookie,psCookielet,psVal,psExp,psContExp) {
			this.update();
			var val = this.createCookieValue(psCookie,psCookielet,psVal);
			if (val){
				var cmap = this.aConversionMap[psCookie];
				if (cmap) {
					this.writeCookielet(cmap[0],cmap[1],val,psExp,psContExp);
				}
			}
		},

		/**
		* Gets the bit flag value at a particular position.This function is
		* deprecated, use {@link #getBitFlag} instead.
		*
		* @deprecated
		* @param {String} dec
		*        a bit string that contains series of flags
		* @param {int} pos
		*        the flag position in the bit string
		* @return {int}
		*        the flag value
		* @see #getBitFlag
		*/
		//> public int getBitFlagOldVersion(String, int);
		getBitFlagOldVersion : function(piDec, piPos) {
			//converting to dec
			var dec = parseInt(piDec,10);//<Number
			//getting binary value //getting char at position
			var b = dec.toString(2), r = dec?b.charAt(b.length-piPos-1):"";
			return (r=="1")?1:0;
		},

		/**
		* Sets the bit flag at a particular position. This function is deprecated,
		* use {@link #setBitFlag} instead.
		*
		* @deprecated
		* @param {String} dec
		*        a bit string contains series of flags
		* @param {int} pos
		*        the flag position in the bit string
		* @param {int} val
		*        the flag value to be set. Flag will be set as 1 only if the value of
		*        this parameter is 1
		* @see #setBitFlag
		*/
		 //> public int setBitFlagOldVersion(int, int, int);
		setBitFlagOldVersion : function(piDec, piPos, piVal) {
			var b="",p,i,e,l;
			//converting to dec
			piDec = parseInt(piDec+"",10);
			if(piDec)
			{
				//getting binary value
				b = piDec.toString(2);
			}
			l = b.length;
			if (l<piPos)
			{
				e = piPos-l;
				for(i=0;i<=e;i++)
				{
					b = "0"+b;
				}
			}
			//finding position
			p = b.length-piPos-1;
			//replacing value at pPos with pVal and converting back to decimal
			return parseInt(b.substring(0,p)+piVal+b.substring(p+1),2);
		},

		/**
		* Gets the bit flag value at a particular position.
		*
		* @param {String} dec
		*        a bit string which contains series of flags
		* @param {int} pos
		*        the flag position in the bit string
		* @return {int}
		*        the flag value
		*/
		//> public int getBitFlag(String,int);
		getBitFlag : function(piDec, piPos) {

			if(piDec != null && piDec.length > 0 && piDec.charAt(0) == '#' )
			{
				var length = piDec.length;
				var q = piPos%4;
				var hexPosition = Math.floor(piPos/4) + 1;

				var absHexPosition = length - hexPosition;
				var hexValue = parseInt(piDec.substring(absHexPosition,absHexPosition+1),16);
				var hexFlag = 1 << q;

				return ((hexValue & hexFlag) == hexFlag)?1:0;
			}
			else
			{
				//process by old format
				return this.getBitFlagOldVersion(piDec, piPos);
			}

		},

		/**
		* Set the bit flag at a particular position.
		*
		* @param {String} dec
		*        A bit string that contains series of flags
		* @param {int} pos
		*        the flag position in the bit string
		* @param {int} val
		*        the falg value to be set. Flag will be set as 1 only if the value of
		*        this parameter is 1.
		*/
		//> public int setBitFlag(String,int,int);
		//> public int setBitFlag(int,int,int);
		setBitFlag : function(piDec, piPos, piVal) {

			if(piDec != null && piDec.length > 0 && piDec.charAt(0) == '#' )
			{
				//process by new format
				var length = piDec.length;
				var q = piPos%4;
				var hexPosition = Math.floor(piPos/4) + 1;

				if(length <= hexPosition)
				{
					if(piVal != 1) {
						return piDec;
					}

					var zeroCout = hexPosition - length + 1;
					var tmpString = piDec.substring(1,length);
					while(zeroCout > 0)
					{
						tmpString = '0' + tmpString;
						zeroCout--;
					}

					piDec = '#' + tmpString;
					length = piDec.length;
				}

				var absHexPosition = length - hexPosition;
				var hexValue = parseInt(piDec.substring(absHexPosition,absHexPosition+1),16);
				var hexFlag = 1 << q;

				if(piVal == 1)
				{
					hexValue |= hexFlag;
				}
				else
				{
					hexValue &= ~hexFlag;
				}

				piDec = piDec.substring(0,absHexPosition) + hexValue.toString(16) + piDec.substring(absHexPosition+1,length);

				return piDec;

			}
			else
			{
				if(piPos > 31)
				{
					return piDec;
				}
				//process by old format
				return this.setBitFlagOldVersion(piDec, piPos, piVal);
			}

		},

		//> private String  createCookieValue (String, String, String);
		createCookieValue : function (psName,psKey,psVal) {
			var cmap = this.aConversionMap[psName], format = this.getFormat(psName),
				mode = this.getMode(psName), val;
			if (cmap && (mode == this.sSTRICT || mode ==this.sCONVER)) {
				val = this.readCookieObj(cmap[0],cmap[1]).value || "";
			}
			else {
				val = this.aCookies[psName] || "";
			}

			if (format) {
				var clts = this.getCookieletArray(val,format);
				clts[psKey] = psVal;
				var str = "";
				for (var i in clts) {
					if (clts[i]) {
						str += i + format.NAME_VALUE_DELIMITER + clts[i] + format.COOKIELET_DELIMITER;
					}
				}

				if (str && format.startDelim) {
					str = format.startDelim + str;
				}
				val = str;

				if (format.escapedValue){
					val = encodeURIComponent(val);
				}
			}

			return val;
		},

		//> private void update();
		update : function () {
			//store cookie values
			var aC = document.cookie.split("; ");
			this.aCookies = {};
			var regE = new RegExp('^"(.*)"$');
			for (var i=0;i<aC.length;i++) {
				var sC = aC[i].split("=");

				var format = this.getFormat(sC[0]), cv = sC[1], sd = format.startDelim;
				if (sd && cv && cv.indexOf(sd)===0) {
					sC[1] = cv.substring(sd.length,cv.length);
				}
				// check if the value is enclosed in double-quotes, then strip them
				if (sC[1] && sC[1].match(regE)) {
					sC[1]=sC[1].substring(1, sC[1].length - 1);
				}
				this.aCookies[sC[0]] = sC[1];
			}
		},

		//> private String getCookielet(String, String, String);
		getCookielet : function (psCookie,psCookielet,psVal) {
			var format = this.getFormat(psCookie);
			var clts = this.getCookieletArray(psVal,format);
			return clts[psCookielet] || "";
		},

		//> private Object getFormat(String);
		getFormat : function (psCookie) {
			return this.aFormatMap[psCookie] || Cookies.Default_Cookie_Format;
		},

		//> private Object getCookieletArray(String, Object);
		getCookieletArray : function (psVal,poFormat) {
			var rv = [], val = psVal || "";
			if (poFormat.escapedValue){
				val = decodeURIComponent(val);
			}
			var a = val.split(poFormat.COOKIELET_DELIMITER);
			for (var i=0;i<a.length; i++) { //create cookielet array
				var idx = a[i].indexOf(poFormat.NAME_VALUE_DELIMITER);
				if (idx>0) {
					rv[a[i].substring(0,idx)] = a[i].substring(idx+1);
				}
			}
			return rv;
		},

		/**
		* Gets the date behind a given days from current date. This is used to set
		* the valid time when writing the cookie.
		*
		* @param {int} days
		*        the number of days that cookie is valid
		* @return {String}
		*        the expiration date in GMT format
		*/
		//> public String getExpDate(int);
		getExpDate : function (piDays) {
			var expires;
				if (typeof piDays == "number" && piDays >= 0) {
						var d = new Date();
						d.setTime(d.getTime()+(piDays*24*60*60*1000));
						expires = d.toGMTString();
				}
				return expires;
		},

		//> private Object getMode(String);
		getMode : function (psCookie) {
			var h = this.readCookieObj(this.sModesCookie,this.sModesCookielet).value, b;
			if (!(psCookie in this.aConversionMap)){
				return null;
			}
			if (!h) {
				return "";
			}
			//default mode is STRICT when h is "0"
			if (h===0){
				return this.sSTRICT;
			}

			if(h && h!="0"){
				//checking for h is having "." or not
				//if (h.has(".")){
				if (h.indexOf(".")!=-1){
					//conversion cookie is having more than 15 cookie values
					var a = h.split(".");
					//looping through array
					for(var i=0; i<a.length; i++){
						//taking the first hex nubmer and converting to decimal
						//and converting to binary
						b = parseInt(a[i],16).toString(2) + b;
					}
				}
				else{
					//converting to decimal
					//converting to binary number
					b = parseInt(h,16).toString(2);
				}
				//fill the convArray with appropriate mode values
				i=0;
				//getting total binary string length
				var l = b.length, j;
				//looping through each cookie and filling mode of the cookie
				for(var o in this.aConversionMap)
				{
					//find the position to read
					j = l-(2*(i+1));
					//reading backwards 2 digits at a time
					var f = b.substring(j,j+2).toString(10);
					f = (!f)?this.sSTRICT:f;
					if (psCookie == o)
					{
						return (f.length==1)?"0"+f:f;
					}
					i++;
				}
				return null;
			}

		return null;

		},

		getMulti: function(piDec, piPos, piBits) {
				var r = "",i,CJ=this;
				for(i=0;i<piBits;i++){
						r = CJ.getBitFlag(piDec,piPos+i) + r ;
			 }
				 return parseInt(r,2);
		 },

		setMulti: function(piDec, piPos, piBits, piVal) {
			 var i=0,CJ=this, v, l, e;
			 //convert to binary and take piBits out of it
			 v = piVal.toString(2).substring(0,piBits);
			 l = v.length;
				if(l<piBits){
					 e = piBits-l;
						for(var j=0;j<e;j++){
							 v = "0"+v;
					 }
					 l = l+e;
			 }
			 for(i=0;i<l;i++){
						piDec = CJ.setBitFlag(piDec,piPos+i,v.substring(l-i-1,l-i));
			 }
			 return piDec;
		 },

		getTimezoneCookie : function() {
			return Cookies.readCookie('dp1','tzo');
		},

		setTimezoneCookie : function() {
			var tzo = new Date().getTimezoneOffset();
			Cookies.writeCookielet('dp1','tzo',tzo.toString(16));
		},

		setJsCookie : function(event) {
			Cookies.writeCookielet('ebay','js','1');
		}

	});

	Cookies.aFormatMap = {
		'r':Cookies.Default_Cookie_Format,
		'dp1':Cookies.DP_Cookie_Format,
		'npii':Cookies.DP_Cookie_Format,
		'ebay':Cookies.Session_Cookie_Format,
		'reg':Cookies.Session_Cookie_Format,
		'apcCookies':Cookies.Session_Cookie_Format,
		'ds2':Cookies.DS_Cookie_Format
	};

	// Write GMT Timezone Offset
	Cookies.writeCookielet('dp1','tzo',new Date().getTimezoneOffset().toString(16));

	$(document).bind('ajaxSend',Cookies.setJsCookie.bind(Cookies));
	$(window).bind('beforeunload',Cookies.setJsCookie.bind(Cookies));

	return Cookies;

});

snap.require('ebay.cookies');

define('ebay.errors.Errors',function(snap) {

	//> public Errors(Object? config)
	var Errors = function(config) {
		var self = this;snap.except = function() { self.except.apply(self,arguments); };
		if (self.enabled) window.onerror = function() { return self.error.apply(self,arguments); };
	};

	snap.extend(Errors,{

		excepts:[],
	
		//> public void error(Object msg,Object url,Object line)
		error : function(msg,url,line) {
			snap.log('except',msg,url,'line',line);
		},
	
		//> public void except(Object except)
		except : function(except) {
			this.excepts.push(except);
			throw except;
		}
	
	});
	
	return Errors;
	
});

define('ebay.profiler.Profiler',function(snap) {

	var Cookies = snap.require('ebay.cookies');

	var Profiler = function() {};
	snap.extend(Profiler,{

		getParam : function(key) {
			return this.beacon.params[key];
		},

		addParam : function(key,param) {
			if (key) {
				this.beacon.params[key] = param;
			}
		},

		updateLoad : function () {
			if (typeof(oGaugeInfo)!='undefined' && oGaugeInfo.ld === true) {
				var g = oGaugeInfo;
				var ct = (new Date()).getTime();
				g.wt =  ct;
				g.ex3 = ct;
				g.ct21 =  ct - g.iST;
			}
		},

		// sul=1 for sending on unload, else sending on onload such as Safari and FF3.0
		send : function (sul){
			if (typeof(oGaugeInfo) === 'undefined'){
				return;
			}
			var g = oGaugeInfo;
			if ( g.ld === false ){ // earlier exit
				this.addParam("ex2", (new Date()).getTime() - g.iST);
				this.internal();
			}else{
				if ( g.bf == 1 ){ // cached page
					this.addParam("ex1", "1");
				}else{
					this.addParam("ct21", g.ct21);
					if ( typeof(g.iLoadST)!='undefined' ){
							var ctbend = g.iLoadST - g.iST;
							this.addParam("ctb", ctbend);
					}
				if ( typeof(g.st1a)!='undefined' )
					this.addParam("st1a", g.st1a);
				if ( typeof(g.aChunktimes)!='undefined' && g.aChunktimes.length > 0 ){
					this.addParam("jslcom", g.aChunktimes.length);  // pregressinve rendering chunk counts
					this.addParam("jseo", g.aChunktimes[0]);
					if (g.aChunktimes.length > 1) this.addParam("jsllib1", g.aChunktimes[1]);
					if (g.aChunktimes.length > 2) this.addParam("jsllib2", g.aChunktimes[2]);
					if (g.aChunktimes.length > 3) this.addParam("jsllib3", g.aChunktimes[3]);
					if (g.aChunktimes.length > 4) this.addParam("jslpg", g.aChunktimes[4]);
					if (g.aChunktimes.length > 5) this.addParam("jslss", g.aChunktimes[5]);
					if (g.aChunktimes.length > 6) this.addParam("jslsys", g.aChunktimes[6]);
				}
			}
				if ( sul == 1 ){
						g.wt = (new Date()).getTime()  - g.wt;
						this.addParam("sgwt", g.wt);
				}else{
						g.wt = 0;
				}
				if ( g.wt < 60000*20 ){ // ignore > 20 min to prevent incorrect st21
						this.internal();
				}
			}
		},

		internal : function () {
			if (typeof(oGaugeInfo) === 'undefined'){
				return;
			}
			var g = oGaugeInfo;
			if ( g.sent === true ){
				return;
			}
			g.sent = true;
			var self = this,image = new Image();
			if (g.bf != 1) {  // non-cached or non-cookie page
				image.src = self.beacon.getUrl();
			}else{ // cached, take out st1
			this.addParam("st1", "");
				image.src = self.beacon.getUrl();
			}
		},

		onLoad : function(event) {
			var cookie = Cookies.readCookie("ebay","sbf");
			Cookies.writeCookielet("ebay","sbf",Cookies.setBitFlag(cookie,20,1));

			if (typeof(oGaugeInfo)!='undefined') {
				oGaugeInfo.ld = true;
				// Note in edge cases window onload can be called mutiple times, but the last set the lastest stamps
				this.updateLoad();
				var ua = navigator.userAgent;
				if ( ua.indexOf("Firefox/3.0") > 0 || (ua.indexOf("Safari") > 0 && ua.indexOf("Chrome") < 0)){
					this.send(0);
				}
			}
		},

		onBeforeUnload : function(event) {
			Cookies.writeCookielet("ds2","ssts",(new Date()).getTime());
			this.send(1);
		},

		onUnload : function(event) {
			//this.send(1);  // this way will be sent after next page html download affecting next page speed
		}

	});

	//self.beacon = $uri(self.beacon);
	if (typeof(oGaugeInfo)!='undefined'){
		var g = oGaugeInfo;
		Profiler.beacon = $uri(oGaugeInfo.sUrl);
		var sbf = Cookies.readCookie("ebay","sbf"), b = (sbf) ? Cookies.getBitFlag(sbf,20) : 0;
		Cookies.writeCookielet("ebay","sbf",Cookies.setBitFlag(sbf, 20, 1)); //for earlier exit cases
		g.ut = Cookies.readCookie("ds2","ssts");
		g.bf = b; // 1 for cached page
		//g.bf = 0;  // force to set to uncached page for testing
		g.sent = false;
		g.ld = false;
		g.wt = 0;
		g.ex3 = 0;
		g.ct21 = 0;
	}

	$(window).bind('load',Profiler.onLoad.bind(Profiler));
	$(window).bind('beforeunload',Profiler.onBeforeUnload.bind(Profiler));
	$(window).bind('unload',Profiler.onUnload.bind(Profiler));

	return Profiler;

});

snap.require('ebay.profiler.Profiler');
define('ebay.profiler.Performance',function() {

	var Profiler = snap.require('ebay.profiler.Profiler');

	var Performance = function() {};

	snap.extend(Performance,{
		onLoad : function(event) {

			var e2e = new Date().getTime() - performance.timing.navigationStart;
			Profiler.addParam("ex3", e2e); // end to end at client, also log to cal tx

			var newct21 = new Date().getTime() - performance.timing.responseStart;
			Profiler.addParam("ctidl", newct21);  // client rendering, also log to cal tx

			var req = performance.timing.responseStart - performance.timing.navigationStart;
			Profiler.addParam("jsebca", req);  // first byte time

			var dom = performance.timing.domComplete - performance.timing.responseStart;
			Profiler.addParam("ct1chnk", dom); // dom complete

			var dns = performance.timing.domainLookupEnd - performance.timing.domainLookupStart;
			Profiler.addParam("jsljgr3", dns); // dns lookup time

			var conn = performance.timing.connectEnd - performance.timing.connectStart;
			Profiler.addParam("svo", conn); // connection time, also log to cal tx

			var req = performance.timing.responseStart - performance.timing.requestStart;
			Profiler.addParam("jsljgr1", req);  // request time

			var resp = performance.timing.responseEnd - performance.timing.responseStart;
			Profiler.addParam("slo", resp);  // content download time
		}
	});

	var oGaugeInfo = window.oGaugeInfo;
	if (oGaugeInfo && window.performance) $(window).bind('load',Performance.onLoad.bind(Performance));

	return Performance;

});

snap.require('ebay.profiler.Performance');


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

define('ebay.utils.NumberFormatter',function(snap) {

    var NumberFormatter = function(sep) {
        this.sep = sep || ',';this.sub = '$1' + this.sep + '$2$3';
        this.dec = this.sep.match(/,/)?'.':',';this.grp = new RegExp('\\' + this.sep,'g');
        this.exp = new RegExp('(\\d)(\\d{3})' + '(\\.|,|$)');
    };

    snap.extend(NumberFormatter.prototype,{

        parse : function(value) {
            var value = value.toString();
            return parseFloat(value.replace(this.grp,'').replace(this.dec,'.'));
        },

        format : function(num) {
            var self = this,exp = self.exp,sub = self.sub;
            var value = num.toString().replace('.',self.dec);
            while (exp.test(value)) value = value.replace(exp,sub);
            return value;
        }

    });

    return NumberFormatter;

});

define('ebay.utils.CurrencyFormatter',function(snap) {

    var Formatter = snap.require('ebay.utils.NumberFormatter');

    var validator = /^(\d*)(\.(\d*))?$|^$/;

    var CurrencyFormatter = function(config) {
        var self = this;snap.extend(self,config);
        self.formatter = new Formatter(self.grouping);
    };

    snap.extend(CurrencyFormatter.prototype,{

        parse : function(value) {
            return this.formatter.parse(value);
        },

        format: function(price,simple) {

            var self = this,symbol = self.symbol;
            var pattern = self.pattern,formatter = self.formatter;
            if (simple) return formatter.format(price);

            switch(pattern) {
                case 'Nes':   return formatter.format(price).concat(' ',symbol);
                case 'Ns':    return formatter.format(price).concat(symbol);
                case 'Sen':   return symbol.concat(' ',formatter.format(price));
                case 'Sn':    return symbol.concat(formatter.format(price));
                case 'seN':   return symbol.concat(' ',formatter.format(price));
                case 'sN':    return symbol.concat(formatter.format(price));
                default:      return formatter.format(price).concat(' ',symbol);
            }

        },

        validate : function(price) {
            var self = this,value = $.trim(price);
            value = value.replace(self.grouping,'');
            value = value.replace(self.decimal,'.');
            return value.match(self.validator);
        }

    });

    return CurrencyFormatter;

});

define('ebay.user',function(snap) {

    var Utf8 = snap.require('Utf8');
    var Base64 = snap.require('Base64');

    var Cookies = snap.require('ebay.cookies');

    var User = snap.extend(function(){},{

        getUserId : function() {
            var u1p = Utf8.decode(Base64.decode(Cookies.readCookie('dp1','u1p')));
            return !u1p.match(/@@__@@__@@/)?u1p:null;
        },

        isSignedIn : function() {
            var v1 = Cookies.readCookie('ebaysignin');
            var v2 = Cookies.readCookie('keepmesignin');
            return !snap.isNull((v1.match(/in/) || v2.match(/in/)));
        }

    });

    return User;

});
