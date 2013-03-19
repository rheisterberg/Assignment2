
define('snap.panel.Panel',function(snap) {

    //> public Panel(Object? config)
    var Panel = function(config) {
        Panel.superclass.constructor.call(this,config);
    };

    snap.inherit(Panel,'snap.Container');
    snap.extend(Panel.prototype,{

        closable:false,expandable:true,expanded:true,duration:250,

        svg:'<div class="pnl-s"><svg xmlns="http://www.w3.org/2000/svg" version="1.1"><defs/><text x="0" y="0" text-anchor="start" transform="rotate(90) translate(10,-8)" fill="rgb(128,128,128)"><tspan x="0" dy="3.25"/></text></svg></div>',
        vml:'<div class="pnl-s"><?xml:namespace prefix=v ns="urn:schemas-microsoft-com:vml" /><v:shape style="top:10px;width:20px;height:400px" coordsize="100,100" filled="t" fillcolor="rgb(128,128,128)" stroked="f" path="m 0,10 l 0,100 e"><v:path textpathok="t"></v:path><v:textpath on="t" fitpath="f" fitshape="f"/></v:shape></div>',

        render : function(target) {

            var self = this,content = self.content;
            Panel.superclass.render.call(self,target);

            if (self.title) self.renderHead();
            else if (content) self.elem.append(content);

        },

        renderHead : function(title) {

            var self = this;self.head = $('div.pnl-h',self.elem);
            self.title = $('div.pnl-t',self.elem);
            self.body = $('div.pnl-b',self.elem).append(self.content);
            if (self.styles.body) self.body.css(self.styles.body);

            if (self.closable) self.renderClosable();
            if (self.expandable) self.renderExpandable();

        },

        renderSvg : function() {
            var self = this,svg = $(self.svg);
            $('tspan',svg).append(self.config.title);
            return svg;
        },

        renderVml : function() {
            var self = this,svg = $(self.vml);
            $('textpath',svg).attr({string:self.config.title});
            return svg;
        },

        renderClosable : function() {

            var self = this;self.close = $('<div class="pnl-c"/>');
            self.close.addClass(self.closable.match(/left/)?'l':'r');

            self.close.appendTo(self.head).bind('click',self.onClosable.bind(self));

        },

        renderExpandable : function() {
            var self = this;self.body.css({display:self.expanded?'block':'none'});
            self.subscribe('expand',self.toggle);self.subscribe('collapse',self.toggle);
            self.head.bind('click',self.onExpand.bind(self));
        },

        getTarget : function() {
            return this.body || this.elem;
        },

        onClosable : function(event) {
            var self = this,svg = $('div.pnl-s',self.elem);
            svg.length?self.onOpen(event):self.onClose(event);
            return false;
        },

        onClose : function(event) {

            var self = this,left = self.closable.match(/left/),width = self.body.width();
            self.elem.children().css({width:width,float:left?'right':'left'});

            var options = {duration:self.duration,complete:self.onCloseComplete.bind(self)};
            self.elem.animate(left?{width:20}:{left:width-20,width:20},options);

        },

        onCloseComplete : function() {

            var self = this,left = self.closable.match(/left/);

            var msie = ($.browser.msie && ($.browser.version < 9));
            self.rotator = msie?self.renderVml():self.renderSvg();
            self.rotator.css({top:self.head.outerHeight(),width:20,height:self.body.height()}).appendTo(self.elem);
            self.elem.css({left:''});

            self.publish('resize',{width:22},true);
            self.publish('close',self,true);

            self.close.toggleClass('c');

        },

        onOpen : function(event) {

            var self = this;
            var left = self.closable.match(/left/);

            var width = self.body.width();
            self.elem.css(left?{}:{left:width-20});

            self.publish('resize',{width:width},true);
            self.rotator.remove();

            var options = {duration:self.duration,complete:self.onOpenComplete.bind(self)};
            self.elem.animate(left?{width:width}:{left:0,width:width},options);

        },

        onOpenComplete : function() {

            var self = this;self.close.toggleClass('c');
            self.elem.children().css({width:'',float:''});
            self.elem.css({width:''});

            self.publish('open',self,true);

        },

        onExpand : function(event) {
            var self = this,height = self.body[0].offsetHeight;
            self.publish((height <= 0)?'expand':'collapse',self);
        },

        toggle : function(message,object) {
            var self = this,toggle = self.parent?self.parent.publish(message.type,self):true;
            if (toggle !== false) self.body.slideToggle(self.duration);
        },

        //> public void resize(Object size)
        resize : function(size) {

            var self = this,head = self.head;
            if (head && size.height) self.body.layout({height:size.height -= head.outerHeight(true)});
            else if (size.height) self.elem.layout({height:size.height});

            if (size.width) self.elem.layout({width:size.width});
            if (self.rotator) self.rotator.css({height:self.body.outerHeight()});

            self.layout();

        }

    });

    snap.extend(Panel,{

        template : function(config,context) {
            context.render(Panel.getName());
            context.queue(config);
        }

    });

    return Panel;

});
