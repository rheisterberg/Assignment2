if (typeof window.localStorage == 'undefined'){
	(function(){
		var ie7storage = document.createElement('link');
		if(ie7storage.addBehavior){
			ie7storage.style.behavior = 'url(#default#userData)';
			document.getElementsByTagName('head')[0].appendChild(ie7storage);
			
			localStorage = {
				snap: true,
				
				getItem: function(key){
					ie7storage.load("ie7storage");
					var storageAsString = ie7storage.getAttribute("ie7storage"),
						storageAsJSON = JSON.parse(storageAsString);
					return storageAsJSON[key];
				},
				
				setItem: function(key, value){
					ie7storage.load("ie7storage");
					var storageAsString = ie7storage.getAttribute("ie7storage"),
						storageAsJSON = JSON.parse(storageAsString);
					storageAsJSON[key] = value;
					storageAsString = JSON.stringify(storageAsJSON);
					
					try{
						ie7storage.setAttribute("ie7storage", storageAsString);
						ie7storage.save("ie7storage");
					}
					catch(ex){
						throw ex;
						//TODO mimic storage exception
					}
				}
			};
		}
		else{//dummy empty storage
			localStorage = {
				snap: true,
				
				getItem: function(key){
					return null;
				},
				setItem: function(key, value){
					
				}
			};
		}
	})();
}
