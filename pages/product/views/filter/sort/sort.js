
define('com.walmart.product.filter.sort',function() {

    var Sort = function(config) {
        Sort.superclass.constructor.call(this,config);
    };

    snap.inherit(Sort,'com.walmart.product.filter');
    snap.extend(Sort.prototype,{

    });

    snap.extend(Sort,{

        template : function(config,context) {

            context.render('com.walmart.product.filter');
            context.queue(config);

        }

    });

    return Sort;

});
