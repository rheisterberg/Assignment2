
define('walmart.aspects.AspectType',function(snap) {

	var AspectTypes = {

		'DefaultAspectModel':'walmart.aspects.DefaultAspect',
		'GroupAspectModel':'walmart.aspects.GroupAspect',

		'DateAspectModel':'walmart.aspects.DateAspect',
		'BooleanAspectModel':'snap.checkbox.Checkbox',

		'PriceAspectModel':'walmart.aspects.PriceFormAspect',
		'PricePlusShippingAspectModel':'walmart.aspects.PriceSliderAspect',

		'LocationAspectModelDash':'walmart.aspects.LocationAspect',

		'SellerAspectModel':'walmart.aspects.SellerAspect',
		'DistanceAspectModel':'walmart.aspects.DefaultAspect',

		'ItemConditionAspectModel':'walmart.aspects.DefaultAspect',

		'FashionNavigationModel': {
			'Brand':'walmart.aspects.FashionBrandAspect',
			'Theme':'walmart.aspects.FashionBrandAspect',
			'Color':'walmart.aspects.FashionColorAspect'
		}

	};

	var AspectType = snap.extend(function(){},{

		type : function(config) {
			var type = AspectTypes[config.type];
			if (snap.isObject(type)) type = type[config.name];
			return type?type:'walmart.aspects.DefaultAspect';
		}

	});

	return AspectType;

});


