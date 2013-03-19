
define('com.walmart.product.filter',function() {

    var Filter = function(config) {
        var self = this;Filter.superclass.constructor.call(self,config);
        $('.button',self.elem).on('click',self.click.bind(self));
        $('.option',self.elem).on('click',self.select.bind(self));
        $('.layer',self.elem).on('mouseleave',self.mouseleave.bind(self));
    };

    snap.inherit(Filter,'snap.Component');
    snap.extend(Filter.prototype,{

        click : function(event) {
            this.elem.find('.layer').css({visibility:'visible'});
        },

        select : function(event) {
            var context = this.model.attributes;
            this.elem.find('.button .text').text($(event.target).text());
            this.elem.find('.layer').css({visibility:'hidden'});
            event.stopPropagation();
        },
        
        mouseleave : function(event) {
            this.elem.find('.layer').css({visibility:'hidden'});
            event.stopPropagation();
        },

        reset : function() {
            var self = this;self.value = self.options[0].name;
            this.elem.find('.button .text').text(self.value);
        }

    });

    snap.extend(Filter,{

        template : function(config,context) {

            context.render(Filter.getName());
            context.queue(config);

        }

    });

    return Filter;

});
