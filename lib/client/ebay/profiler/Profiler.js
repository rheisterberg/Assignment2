
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
