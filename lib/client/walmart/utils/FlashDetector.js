/*
	jquery.flashplayer.js - 08/04/2011
	Flash Player Utility to return the major version of installed flash player plugin.
	if Flash player is not installed in browser returns -1.
	Use: $.FlashPlayer.version();
*/
$.FlashPlayer = (function(){ 
	
	var Cookies = snap.require('ebay.cookies');

	var flash = {
		getVersion: function(){
			var b = $.browser, v = -1;
			if (b.msie && !b.opera){
				var vs = [10,9]; // We are only interested in 10 or 9 flash player versions, none of the modern flash functionality work on older browsers.
				for (var i=0;i<vs.length;i++){
					try{
						var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+vs[i]);
						v =  vs[i];
						break;
					} catch(e){
						// This version is not supported.
					}
				}
			} else {
				p = navigator.plugins;
				if (p && p.length) {
		            var f = p['Shockwave Flash'];
		            if (f) {
		                var pd = f.description, id = pd.indexOf("Flash")+5;
						v = parseInt(pd.substr(id,pd.length));
		            }
		        }
			}
			return v;
		},
		
		readWrite: function(write, value){
		var C = Cookies;
	        //40,41,42,43,44 bits in ebay.sbf are used to store flash version
	        var cl = C.readCookie("ebay","sbf");
	        if(!write){
	             return C.getMulti(cl,40,5);
	        } else if(write){
	            //storing cookielet value as 1 in case of zero 
	             value=(value==0)?1:value;
	             C.writeCookielet("ebay","sbf",C.setMulti(cl, 40, 5, value));
	        }
		}
	};
   
	return {
		version : function(){
			var cv = flash.readWrite(false);
	        if(cv){
	            return (cv==1)?0:cv;
	        } else{
	        	var ver = flash.getVersion();
	        	flash.readWrite(true, ver);
	        	return ver;
	        }
		}
	};
}());