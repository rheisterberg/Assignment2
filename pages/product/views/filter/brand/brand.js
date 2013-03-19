
define('com.walmart.product.filter.brand',function() {

    var Brand = function(config) {
        Brand.superclass.constructor.call(this,config);
    };

    snap.inherit(Brand,'com.walmart.product.filter');
    snap.extend(Brand.prototype,{

    });

    snap.extend(Brand,{

        template : function(config,context) {

            context.render('com.walmart.product.filter');
            context.queue(config);

        }

    });

    return Brand;

});
