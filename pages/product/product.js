
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

define('com.walmart.product.slider.handle',function() {

    var Handle = function(config) {

        var self = this;self.elem = $('<div class="hdl"/>');
        Handle.superclass.constructor.call(self,config);
        self.elem.toggleClass('ds',config.disabled || false);

        self.ondragstop = self.onDragStop.bind(self);
        self.ondragmove =  self.onDragMove.bind(self);

        self.elem.bind('click',self.onCancel.bind(self));
        self.elem.bind('dragstart',self.onCancel.bind(self));

        self.elem.bind('mousedown',self.onDragStart.bind(self));

    };

    snap.inherit(Handle,'snap.Component');
    snap.extend(Handle.prototype,{

        detached:true,

        move : function(position) {
            var self = this,parent = self.elem.parent(),target = self.elem,half = Math.floor(self.elem.width()/2);
            target.css({left:Math.round((self.position = Math.min(Math.max(0,position),parent.width()))) - half});
            return position;
        },

        onCancel : function(event) {
            return false;
        },

        onDragStart : function(event) {

            var self = this,disabled = self.disabled;
            if (disabled) return false;

            var offset = self.elem.position();
            self.eventLeft = event.clientX - offset.left;;
            self.elem.toggleClass('drag');

            $(document).bind('mouseup',self.ondragstop);
            $(document).bind('mousemove',self.ondragmove);

            self.disableSelect($(document.body));

        },

        onDragMove : function(event) {
            var self = this,half = Math.floor(self.elem.width()/2);
            self.move(self.onDrag(event.clientX - self.eventLeft + half));
            return false;
        },

        onDragStop : function(event) {

            var self = this,onStop = self.onStop;
            if (onStop) self.move(onStop(self.position));
            self.elem.toggleClass('drag');

            $(document).unbind('mouseup',self.ondragstop);
            $(document).unbind('mousemove',self.ondragmove);

            self.enableSelect($(document.body));

        },

        //> public void disableSelect(Object elem)
        disableSelect: function(elem) {

            if (document.all) {
                elem.bind('dragstart selectstart',this.cancelSelect.bind(this));
            }
            else {
                elem.css({'-webkit-user-select':'none','-moz-user-select':'none','user-select':'none'});
            }

        },

        //> public void enableSelect(Object elem)
        enableSelect: function(elem) {

            if (document.all) {
                elem.unbind('dragstart selectstart');
            }
            else {
                elem.css({'-webkit-user-select':'','-moz-user-select':'','user-select':''});
            }

        },

        cancelSelect : function(event) {
            return false;
        }

    });

    return Handle;

});


define('com.walmart.product.slider',function() {

    var SliderHandle = snap.require('com.walmart.product.slider.handle');

    var Slider = function(config) {
    
    	var self = this,disabled = config.disabled || false;
        Slider.superclass.constructor.call(self,config);

        self.range = $('.range',self.elem);
        self.bar = $('.bar',self.range).toggleClass('ds',disabled);
        self.range.bind('click',self.onClick.bind(self));

        self.left = new SliderHandle({onDrag:self.onMinDrag.bind(self),onStop:self.onMinStop.bind(self),target:self.range,disabled:disabled});
        self.left.bubble = $('<div class="bubble"><div class="text"></div><div class="tip"></div></div>').appendTo(self.left.elem);

        self.right = new SliderHandle({onDrag:self.onMaxDrag.bind(self),onStop:self.onMaxStop.bind(self),target:self.range,disabled:disabled});
        self.right.bubble = $('<div class="bubble"><div class="text"></div><div class="tip"></div></div>').appendTo(self.right.elem);

        self.label  = $('.label',self.elem);

        self.min = config.min;self.max = config.max;
        self.low = config.low;self.high = config.high;

        if (self.range.width()) self.layout();

    };

    snap.inherit(Slider,'snap.Component');
    snap.extend(Slider.prototype,{

        layout : function(force) {

            var self = this;

            self.low = Math.max(self.low,self.min);
            self.high = Math.min(self.high,self.max);

            var left = self.position(self.low);self.left.move(left);
            var right = self.position(self.high);self.right.move(right);

            $('.text',self.left.bubble).text(self.format(self.low));
            self.left.bubble.css({left:-Math.round(self.left.bubble.width()/2)});

            $('.text',self.right.bubble).text(self.format(self.high));
            self.right.bubble.css({left:-Math.round(self.right.bubble.width()/2)});

            self.bar.css({'margin-left':Math.round(left),'margin-right':Math.round(self.range.width() - right)});

        },

        scale : function(position) {
            var self = this,range = self.range.width(),fraction = position/range;
            return Math.round(self.min + fraction*(self.max - self.min));
        },

        position : function(value) {
            var self = this,range = self.range.width();
            return range*((value - self.min)/(self.max - self.min));
        },

        format : function(value) {
            return value.toString() + '"';
        },

        onClick : function(event) {

            var self = this,offset = self.range.offset();
            var position = event.pageX - offset.left;

            var left = self.left.position,right = self.right.position;
            if (position < left) self.onMinStop(self.left.move(position));
            else if (position > right) self.onMaxStop(self.right.move(position));
            else if ((position - left) < (right - position)) self.onMinStop(self.left.move(position));
            else self.onMaxStop(self.right.move(position));

        },

        onMinDrag : function(offset) {

            var self = this,range = self.range.width();
            var position = Math.min(Math.max(0,offset),self.right.position);
            self.left.elem.css({'z-index':1});self.right.elem.css({'z-index':0});

            $('.text',self.left.bubble).text(self.format(self.low = self.scale(position)));
            self.left.bubble.css({left:-Math.round(self.left.bubble.width()/2)});

            self.bar.css({'margin-left':Math.round(position)});

            return position;

        },

        onMaxDrag : function(offset) {

            var self = this,range = self.range.width();
            var position = Math.min(Math.max(self.left.position,offset),range);
            self.left.elem.css({'z-index':0});self.right.elem.css({'z-index':1});

            $('.text',self.right.bubble).text(self.format(self.high = self.scale(position)));
            self.right.bubble.css({left:-Math.round(self.right.bubble.width()/2)});

            self.bar.css({'margin-right':Math.round(range - position)});

            return position;

        },

        onMinStop : function(offset) {
            var self = this,position = self.onMinDrag(offset);
            self.publish('slider',{slider:'low',value:self.scale(position)});
            return position;

        },

        onMaxStop : function(offset) {
            var self = this,position = self.onMaxDrag(offset);
            self.publish('slider',{slider:'high',value:self.scale(position)});
            return position;
        },

        reset : function() {
            var self = this,config = self.config;
            self.min = config.min;self.max = config.max;
            self.low = config.low;self.high = config.high;
            self.layout();
        }

    });

    snap.extend(Slider,{

        template : function(config,context) {

            var self = this,format = self.prototype.format.bind(config);

            config.min = parseFloat(config.min || 0);config.max = parseFloat(config.max || 0);
            config.low = parseFloat(config.low || config.min);config.high = parseFloat(config.high || config.max);

            config.label = config.label;
            config.left = format(config.min);config.right = format(config.max);

            context.render(Slider.getName());
            context.queue(config);

        }

    });

    return Slider;

});


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
(function(){dust.register("com.walmart.product.header",body_0);function body_0(chk,ctx){return chk.write("<header id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"gh-head clearfix\"><div class=\"gh-logo\"><span class=\"text\">Walmart</span><img class=\"spark\" src=\"/pages/product/images/spark.png\"/></div><div class=\"gh-srch\"></div><div class=\"gh-links\"><div class=\"gh-link bd\"><span class=\"create\">Create</span><br/><span class=\"text\">a new wish list</span></div><div class=\"gh-link bd\"><span class=\"signin\">Sign In</span><br/><span class=\"text\">to your account</span></div><div class=\"gh-link\"><span class=\"cart\">0 Items</span><br/><span class=\"text\">a new wish list</span></div></div></header>");}return body_0;})();(function(){dust.register("com.walmart.product.crumbs",body_0);function body_0(chk,ctx){return chk.write("<nav id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"gh-crumbs\"><span class=\"crumb\"><a href=\"").reference(ctx.get("home"),ctx,"h").write("\"><img src=\"/pages/product/images/home.png\" class=\"home\"></a></span><span class=\"arrow\">&gt;</span>").section(ctx.get("crumbs"),ctx,{"block":body_1},null).write("</nav>");}function body_1(chk,ctx){return chk.write("<span class=\"crumb\"><a href=\"").reference(ctx.get("href"),ctx,"h").write("\">").reference(ctx.get("name"),ctx,"h").write("</a></span><span class=\"arrow\">&gt;</span>");}return body_0;})();(function(){dust.register("com.walmart.product.slider",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"slider\"><div class=\"label\">").reference(ctx.get("label"),ctx,"h").write("</div><div class=\"slide\"><div class=\"range\"><div class=\"bar\"></div></div></div></div>");}return body_0;})();(function(){dust.register("com.walmart.product.filter",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"filter\"><label class=\"label\">").reference(ctx.get("label"),ctx,"h").write("</label><div class=\"button\"><span class=\"text\">").reference(ctx.get("value"),ctx,"h").write("</span><b class=\"arrow\"></b><div class=\"layer\">").section(ctx.get("options"),ctx,{"block":body_1},null).write("</div></div></div>");}function body_1(chk,ctx){return chk.write("<a class=\"option\">").reference(ctx.get("name"),ctx,"h").write("</a>");}return body_0;})();(function(){dust.register("com.walmart.product.items",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"items\">").section(ctx.get("items"),ctx,{"block":body_1},null).write("</div>");}function body_1(chk,ctx){return chk.write("<div class=\"item\"><div class=\"image\"><img src=\"").reference(ctx.get("image"),ctx,"h").write("\" /></div><div class=\"title\" title=\"").reference(ctx.get("name"),ctx,"h").write("\">").reference(ctx.get("name"),ctx,"h").write("</div><div class=\"descrip\" title=\"").reference(ctx.get("descrip"),ctx,"h").write("\">").reference(ctx.get("descrip"),ctx,"h").write("</div><div class=\"price\">$").reference(ctx.get("dollars"),ctx,"h").write("<sup>.").reference(ctx.get("cents"),ctx,"h").write("</sup></div><div class=\"rating\"><span class=\"gray\"><span class=\"gold\" style=\"width:").reference(ctx.get("stars"),ctx,"h").write("\"></span></span></div></div>");}return body_0;})();