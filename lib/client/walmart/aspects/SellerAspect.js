
define('walmart.aspects.SellerAspect',function(snap) {

	var Radio = snap.require('snap.radio.Radio');
	var Checkbox = snap.require('snap.checkbox.Checkbox');

	//> public SellerAspect(Object? config)
	var SellerAspect = function(config) {
		SellerAspect.superclass.constructor.call(this,config);
	};

	snap.inherit(SellerAspect,'walmart.aspects.GroupAspect');
	snap.extend(SellerAspect.prototype,{

		buildSpecific : function(value) {
			var self = this,name = self.name;
			var type = value.specificType.match(/INCLUDE/)?'Include':'Exclude',title = type.concat(':',value.specificNames.join(','));
			return new Checkbox({name:name,text:title,value:value.param,data:value,selected:value.selected});
		},
		
		buildParam : function(param) {
			return (param)?((typeof(param) == "string")?param:param.join("|")):null;
		},

		buildRequest : function(url) {

			var self = this,name = this.name;
			var href = $uri(url);href.appendParam('_ssan',name);

			var param = self.buildParam(href.params['_ssav']);
			if (param) href.params['_ssav'] = param;

			self.buildSeller(href);
			self.buildSellerType(href);

			delete href.params[name];

			return href;

		},

		buildSeller : function(href) {

			if (href.params['LH_SpecificSeller']) href.appendParam('_ssav','LH_SpecificSeller='.concat(href.params['LH_SpecificSeller']));
			else if (href.params['LH_SellerWithStore']) href.appendParam('_ssav','LH_SellerWithStore='.concat(href.params['LH_SellerWithStore']));
			else if (href.params['LH_FavSellers']) href.appendParam('_ssav','LH_FavSellers='.concat(href.params['LH_FavSellers']));
			else if (href.params['LH_TopRatedSellers']) href.appendParam('_ssav','LH_TopRatedSellers='.concat(href.params['LH_TopRatedSellers']));
			else if (href.params['LH_OUTLETMALLSELLERS']) href.appendParam('_ssav','LH_OUTLETMALLSELLERS='.concat(href.params['LH_OUTLETMALLSELLERS']));

			delete href.params['LH_SpecificSeller'];
			delete href.params['LH_SellerWithStore'];
			delete href.params['LH_FavSellers'];
			delete href.params['LH_TopRatedSellers'];
			delete href.params['LH_OUTLETMALLSELLERS'];

		},

		buildSellerType : function(href) {

			var type = href.params['LH_SellerType'];
			if (type) href.appendParam('_ssav','LH_SellerType='.concat(type));

			delete href.params['LH_SellerType'];

		},

		buildFlyout : function(config) {
			var SellerAspectFlyout = snap.require('walmart.aspects.SellerAspectFlyout');
			return new SellerAspectFlyout(config);
		}

	});

	return SellerAspect;

});
