
define('snap.window.Mask',function(snap) {

    //> public Mask(Object? config)
    var Mask = function(config) {
        var self = this;self.disabled = [];
        Mask.superclass.constructor.call(self,config);
        self.elem.prependTo(document.body);
        };

    snap.inherit(Mask,'snap.Component');
    snap.extend(Mask.prototype,{

        classes:{elem:'win-m'},detached:true,index:5,opacity:30,

        disableSelects : function(form) {

            var self = this;self.enableSelects();
            var selects = $('select',document.body);

            for (var idx = 0,length = selects.length;(idx < length);idx++) {

                var select = selects[idx];
                if ((select.disabled) || (form && (select.form === form))) continue;

                select.disabled = true;
                self.disabled.push(select);

            }

        },

        enableSelects : function() {
            var self = this,selects = self.disabled;self.disabled = [];
            for (var idx = 0,len = selects.length;(idx < len);idx++) selects[idx].disabled = false;
        },

        show : function(object) {

            var self = this;
            var object = object || {};

            var index = object.index || self.index;
            var opacity = object.opacity || self.opacity;

            if ($.browser.msie && ($.browser.version <= '6')) self.disableSelects();

            self.elem.width($(document).width()).height($(document).height());

            self.elem.css('display','block').prependTo(document.body);
            self.elem.css({'z-index':index,opacity:opacity/100});

        },

        hide : function(object) {

            var self = this;

            if ($.browser.msie && ($.browser.version <= '6')) self.enableSelects();

            self.elem.width(0).height(0);
            self.elem.css('display','none').remove();

        }

    });

    return Mask;

});
