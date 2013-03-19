
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
