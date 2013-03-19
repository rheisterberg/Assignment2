
define('snap.border.BorderLayout',function(snap) {

    var Splitter = snap.require('snap.splitter.Splitter');

    //> public BorderLayout(Object? config)
    var BorderLayout = function(config) {
        var self = this;self.regions = {};self.splitters = {};
        BorderLayout.superclass.constructor.call(self,config);
    };

    snap.inherit(BorderLayout,'snap.Layout');
    snap.extend(BorderLayout.prototype,{

        render : function() {

            var self = this,children = self.children,regions = self.regions;
            var target = self.target.addClass("view");target.append(self.template());
            for (var idx = 0,len = children.length;(idx < len);idx++) regions[children[idx].region] = {};

            self.body = $('div.view-b',self.target);

            if (regions.head) self.addRegion('head',$('div.view-h',self.target));
            if (regions.foot) self.addRegion('foot',$('div.view-f',self.target));

            if (regions.left) self.addRegion('left',$('div.view-l',self.body));
            if (regions.right) self.addRegion('right',$('div.view-r',self.body));
            if (regions.center) self.addRegion('center',$('div.view-c',self.body));

            self.border = self.body.frame().margins.top;

        },

        addRegion : function(name,elem) {
            this.regions[name] = {elem:elem};
        },

        addSplitter : function(name) {

            var self = this,center = self.regions.center;

            var mode = name.match(/head|foot/)?'vert':'horz';
            var split = mode.match(/vert/)?'split-v':'split-h';

            var style = mode.match(/vert/)?{height:self.border}:{width:self.border};
            var config = {name:name,mode:mode,classes:{elem:split},styles:{elem:style}};

            var splitter = self.splitters[name] = new Splitter(config);
            splitter.subscribe('drag',self.onSplitter,self);

        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {

            var self = this,name = component.region;
            var region = self.regions[name];region.object = component;

            region.elem.append(component.elem);region.frame = region.elem.frame();
            if (component.resizable && !name.match(/center/)) self.addSplitter(name);

        },

        layout : function() {

            var self = this;
            for (var name in self.regions) {
                self.regions[name].elem.css({height:''});
            }

            var view = self.target;

            var width = view.outerWidth();
            var height = view.outerHeight();

            var head = self.regions.head;
            if (head) height -= head.elem.outerHeight(true);

            var foot = self.regions.foot;
            if (foot) height -= foot.elem.outerHeight(true);

            var center = self.regions.center;
            center.object.resize({height:height -= 2*self.border});

            var left = self.regions.left;
            if (left) left.object.resize({height:height});

            var right = self.regions.right;
            if (right) right.object.resize({height:height});

            center.elem.css('marginLeft',left?left.elem.outerWidth(true):0);
            center.elem.css('marginRight',right?right.elem.outerWidth(true):0);

            var offset = self.body.offset();

            var offsetTop = self.body[0].offsetTop;

            var offsetWidth = self.body.outerWidth();
            var offsetHeight = self.body.outerHeight();

            var offsetLeft = left?left.elem.outerWidth(true):0;
            var offsetRight = right?(offsetWidth - right.elem.outerWidth(true)):offsetWidth;

            var splitters = self.splitters,splitter;

            if (splitter = splitters.head) {
                splitter.setBounds(self.border,offsetTop + offsetHeight);
                splitter.setStyles({top:offsetTop - self.border});
            }

            if (splitter = splitters.foot) {
                splitter.setBounds(offsetTop,view.outerHeight() - self.border);
                splitter.setStyles({top:offsetTop + offsetHeight});
            }

            if (splitter = splitters.left) {
                splitter.setBounds(self.border,offsetRight);
                splitter.setStyles({top:offsetTop,left:offsetLeft,height:offsetHeight});
            }

            if (splitter = splitters.right) {
                splitter.setBounds(offsetLeft + self.border,width - self.border);
                splitter.setStyles({top:offsetTop,left:offsetRight + self.border,height:offsetHeight});
            }

        },

        //> private void onSplitter(Object message,Object? object)
        onSplitter : function(message,object) {

            var self = this,splitter = message.source,name = splitter.name;
            var region = self.regions[name],object = region.object,frame = region.frame;

            if (name.match(/head/)) object.resize({height:splitter.offsetTop - frame.borders.top});
            else if (name.match(/foot/)) object.resize({height:self.target.outerHeight() - splitter.offsetTop - 2*self.border});

            else if (name.match(/left/)) object.resize({width:splitter.offsetLeft - self.border});
            else if (name.match(/right/)) object.resize({width:self.target.outerWidth() - splitter.offsetLeft - 2*self.border});

            self.layout();

        }

    });

    snap.extend(BorderLayout,{

        template : function(config,context) {
            context.render(BorderLayout.getName());
        }

    });

    return BorderLayout;

});
