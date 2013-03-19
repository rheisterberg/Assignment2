
define('com.walmart.product.filter.type',function() {

    var Type = function(config) {
        Type.superclass.constructor.call(this,config);
    };

    snap.inherit(Type,'com.walmart.product.filter');
    snap.extend(Type.prototype,{

    });

    snap.extend(Type,{

        template : function(config,context) {

            context.render('com.walmart.product.filter');
            context.queue(config);

        }

    });

    return Type;

});
