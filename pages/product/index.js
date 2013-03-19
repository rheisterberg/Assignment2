
define('com.walmart.product.header',function() {

    var Header = function(config) {
        Header.superclass.constructor.call(this,config);
    };

    snap.inherit(Header,'snap.Component');
    snap.extend(Header.prototype,{
    });

    return Header;

});

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


define('com.walmart.product.filter',function() {

    var Filter = function(config) {
        Filter.superclass.constructor.call(this,config);
    };

    snap.inherit(Filter,'snap.Component');
    snap.extend(Filter.prototype,{

    });

    snap.extend(Filter,{

        template : function(config,context) {

            context.render(Filter.getName());
            context.queue(config);

        }

    });

    return Filter;

});

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


define('com.walmart.product.items',function() {

    var Items = function(config) {
        Items.superclass.constructor.call(this,config);
    };

    snap.inherit(Items,'snap.Component');
    snap.extend(Items.prototype,{
    });
    
    snap.extend(Items,{
    
        template : function(config,context) {

            var items = config.models.items;
            
            items.types = {},items.brands = {};items.sizes = {};
            items.forEach(function(item) {
    
                items.types[item.type] = item.type;
                items.brands[item.brand] = item.brand;
                items.sizes[item.size] = item.size;
                
                item.descrip = item.description.split(/<li>/i).slice(1).join(', ');
                
                item.dollars = Math.floor(item.price);
                item.cents = Math.floor(100 + Math.round(100*(item.price - item.dollars))).toString().substring(1);
                
                item.stars = Math.floor(Math.max(0,(Math.min(5,parseFloat(item.rating)))*20)).toString().concat('px');
    
            });
            
            items.types = Object.keys(items.types).sort();
            items.brands = Object.keys(items.brands).sort();
            items.sizes = Object.keys(items.sizes).sort(function(a,b) { return parseInt(a) - parseInt(b); });
    
            config.items = items;

            context.render(Items.getName());
            context.queue(config);

        }

    });

    return Items;

});
