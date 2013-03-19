
define('snap.Layout',function(snap) {

    //> public Layout(Object? config)
    var Layout = function(config) {

        var self = this;snap.extend(self,config);
        self.container.subscribe('resize',self.resize,self);

        self.target = self.container.getTarget();
        self.children = self.container.children;

        self.render();

    };

    snap.extend(Layout.prototype,{

        //> protected void render()
        render : function() {
        },

        //> public void addComponent(Object component,boolean? defer)
        addComponent : function(component,defer) {

            var self = this,elem = component.elem,parent = elem.parent();
            if (elem.length && !parent.length) self.target.append(elem);
            if (component.autosize) self.auto = component;

            if (self.ready && !defer) self.layout();

        },

        //> public void removeComponent(Object component,boolean? defer)
        removeComponent : function(component,defer) {

            var self = this,target = self.target,elem = component.elem;
            if (target && elem.length) elem.remove();

            if (self.ready && !defer) self.layout();

        },

        template : function(config) {
            return $(snap.fragment(this.constructor,config || {}));
        },

        autosize : function(auto) {
            var self = this,height = self.target.height();
            for (var node = self.children.fwd;(node);node = node.siblings.fwd)
                height -= (node != auto)?node.elem.outerHeight(true):0;
            auto.resize({height:height});
        },

        //> public resize(Object message,Object object) {
        resize : function resize(message,object) {
            this.layout();
        },

        validate : function(force) {

            var self = this,target = self.target,width = target[0].offsetWidth,height = target[0].offsetHeight;
            self.dirty = force || (((width > 0) && (width != self.width)) || ((height > 0) && (height != self.height)));

            self.ready = true;self.width = width;self.height = height;
            if (self.auto) self.autosize(self.auto);

            return self;

        },

        //> public void layout(boolean force)
        layout : function(force) {

            var self = this.validate(force);
            if (!self.dirty || !self.children.fwd) return;

            for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
                node.resize({},force);
            }

        }

    });

    return Layout;

});

(function($){

    var frame = {top:0,right:0,bottom:0,left:0};
    var rules = {margins:'margin-*',borders:'border-*-width',padding:'padding-*'};

    var widths = {left:0,right:0};
    var heights = {top:0,bottom:0};

    var dimens = {width:widths,height:heights};

    $.each(rules,function(rule) {
        var pattern = this,values = rules[rule] = {};
        for (var name in frame) values[name] = pattern.replace('*',name);
    });

    var getFrameValues = function(elem,frame,rules,dimen) {

        frame[dimen] = 0;
        for (var name in dimens[dimen]) {
            var value = elem.css(rules[name]);
            frame[name] = value.match(/px/)?parseInt(value):0;
            frame[dimen] += frame[name];
        }

    };

    var getFrame = function(elem,frame,dimen) {
        for (var name in rules) getFrameValues(elem,frame[name] = frame[name] || {},rules[name],dimen);
        frame[dimen] = frame.borders[dimen] + frame.padding[dimen];
        return frame;
    };

    var frameOffset = function(name,offset) {
        this.css(name,offset);
    };

    var frameSize = function(name,size,margins) {
        var frame = getFrame(this,{},name);
        this.css(name,size - frame[name] - (margins?frame.margins[name]:0));
    };

    $.fn.frame = function() {
        var frame = getFrame(this,{},'width');
        return getFrame(this,frame,'height');
    };

    $.fn.layout = function(dimens,margins) {

        for (var name in dimens) {
            if (name.match(/top|left/)) frameOffset.call(this,name,dimens[name],margins);
            else if (name.match(/width|height/)) frameSize.call(this,name,dimens[name],margins);
        }

        return this;

    };

})($);
