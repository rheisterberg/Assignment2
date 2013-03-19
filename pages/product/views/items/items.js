
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
