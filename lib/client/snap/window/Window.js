
define('snap.window.Window',function(snap) {

    var Mask = snap.require('snap.window.Mask');
    var Stack = snap.require('snap.window.Stack');

    var Dragger = snap.require('snap.dragger.Dragger');
    var Resizer = snap.require('snap.resizer.Resizer');

    var focusable = 'a[tabindex!="-1"],input,select,button,[tabindex="0"]';

    //> public Window(Object? config)
    var Window = function(config) {

        var self = this;Window.superclass.constructor.call(self,config);

        if (self.draggable) self.dragger = new Dragger({scope:self,target:self.elem,dragger:self.title});
        if (self.resizable) self.resizer = new Resizer({scope:self,target:self.elem});

        self.elem.bind('keydown',self.onKeyDown.bind(self));
        self.elem.bind('mousedown',self.onMouseDown.bind(self));
        self.close = $('a.win-c',self.head).bind('click',self.hide.bind(self));

        self.elem.delegate(focusable,'focus',self.onFocus.bind(self));

        Stack.register(self);

    };

    snap.inherit(Window,'snap.Container');
    snap.extend(Window.prototype,{

        classes:{elem:'win'},fixed:true,closable:true,draggable:true,resizable:true,modal:false,

        //> protected void render(Object target)
        render : function(target) {

            var self = this;Window.superclass.render.call(self);
            self.head = $('div.win-h',self.elem);self.body = $('div.win-b',self.elem).append(self.content);
            self.title = $('div.win-t',self.head);self.title.css({display:self.title?'block':'none'});

            self.ie6 = ($.browser.msie && ($.browser.version < 7));
            if (self.ie6) self.elem.prepend($('<iframe class="win-i" frameborder="0" />').css('filter','alpha(opacity=0)'));

            if ($.browser.msie && ($.browser.version <= 8)) $('div.win-f',self.elem).css({border:'solid #ccc','border-width':'1px 0px 0px 1px'});

            $(document.body).prepend(self.elem);

        },

        getTarget : function() {
            return this.body;
        },

        getOffset : function(object) {

            var self = this,elem = self.elem;
            var width = elem.outerWidth(),height = elem.outerHeight();

            var client = {width:$(window).width(),height:$(window).height()};
            var scroll = self.fixed?{top:0,left:0}:{top:$(window).scrollTop(),left:$(window).scrollLeft()};

            var top = self.offsetTop || Math.round(scroll.top + (client.height - height)/2);
            var left = self.offsetLeft || Math.round(scroll.left + (client.width - width)/2);

            return {top:Math.max(top,10),left:Math.max(left,10)};

        },

        load : function(object) {
            var self = this;self.loading = true;
            return $load(object.content,self.loaded.bind(self,object));
        },

        loaded : function(object,loader) {
            var self = this;self.loading = false;self.body.html('');
            Window.prototype.show.call(self,object,loader);
        },

        //> protected void show(Object? object,Object? loader)
        show : function(object,loader) {

            var self = this,loading = self.loading,object = object || {};
            if (object.content && !loading && !loader) return self.load(object);

            var elem = self.elem;elem.css({position:(self.fixed && !self.ie6)?'fixed':'absolute'});
            if (self.modal || object.modal || object.mask) (self.mask || (self.mask = new Mask())).show(object.mask);
            self.close.css('display',(snap.isDefined(object.closable)?object.closable:self.closable)?'block':'none');

            if (object.title) self.title.css({display:'block'}).html(object.title);
            if (object.content) self.body.append(loader.fragment);

            elem.css(object.offset || self.getOffset(object));
            elem.css({visibility:'visible'});

            var focus = $(focusable,self.body).filter(':visible');
            if (focus.length) focus[0].focus();

            self.publish('show');
            self.publish('pop');

        },

        //> protected hide()
        hide : function() {

            var self = this,elem = self.elem;
            if (self.mask) self.mask.hide();

            elem.css({visibility:'hidden'});
            elem.offset({top:-1000,left:-1000});

            self.publish('hide');

        },

        onFocus : function(event) {
            this.focus = event.target;
        },

        setFocus : function(event,element) {
            event.preventDefault();
            element.focus();
        },

        onKeyDown : function(event) {

            if (event.keyCode != 9) return;

            var self = this,focus = $(focusable,self.elem).filter(':visible');
            if (focus.length <= 0) return;

            var first = focus[0],last = focus[focus.length-1],shift = event.shiftKey;
            if (!shift && (self.focus === last)) self.setFocus(event,first);
            else if (shift && (self.focus === first)) self.setFocus(event,last);

        },

        onMouseDown : function(event) {
            this.publish('pop');
        },

        layout : function(force) {

            var self = this;
            if (self.resizable) self.resize({},force);

            self.manager.layout(force);
            self.publish('layout');

        },

        //> private void resize()
        resize : function(size,force) {
            var self = this,elem = self.elem,head = self.head;
            self.body.layout({height:elem.height() - head.height()});
        },

        //> public void destroy()
        destroy : function() {
            Stack.unregister(this);
            Window.superclass.destroy.call(this);
        }

    });

    snap.extend(Window,{

        template : function(config,context) {
            context.render(Window.getName());
            context.queue(config);
        }

    });

    return Window;

});
