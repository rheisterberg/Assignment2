
define('com.walmart.product.crumbs',function() {

    var Crumbs = function(config) {
        Crumbs.superclass.constructor.call(this,config);
    };

    snap.inherit(Crumbs,'snap.Component');
    snap.extend(Crumbs.prototype,{

    });

    snap.extend(Crumbs,{

        template : function(config,context) {

            snap.extend(config,config.models.crumbs);
            delete config.models;

            context.render(Crumbs.getName());
            context.queue(config);

        }

    });

    return Crumbs;

});
