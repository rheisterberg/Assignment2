
define('snap.page.PageLayout',function(snap) {

    var bits = [25,26,40,41];

    var layouts = [
        {name:'sz760',minWidth:760,maxWidth:940,value:1},
        {name:'sz940',minWidth:940,maxWidth:1200,value:0},
        {name:'sz1200',minWidth:1200,maxWidth:1200,value:5}
    ];

    var Cookies = snap.require('ebay.cookies');

    var Splitter = snap.require('snap.splitter.Splitter');
    var Container = snap.require('snap.Container');

    //> public PageLayout(Object? config)
    var PageLayout = function(config) {
        var self = this;self.regions = {};self.splitters = {};
        PageLayout.superclass.constructor.call(self,config);
    };

    snap.inherit(PageLayout,'snap.Layout');
    snap.extend(PageLayout.prototype,{

        render : function() {
            var self = this,children = self.children,regions = self.regions;
            for (var idx = 0,len = children.length;(idx < len);idx++) regions[children[idx].cid] = {};
            self.target.append(template = self.template(regions));
        },

        addSplitter : function(name) {

            var self = this;

            var mode = name.match(/header|footer/)?'vert':'horz';
            var split = mode.match(/vert/)?'split-v':'split-h';

            var style = mode.match(/vert/)?{height:'5px'}:{width:'5px'};
            var config = {name:name,mode:mode,classes:{elem:split},styles:{elem:style}};

            var splitter = self.splitters[name] = new Splitter(config);
            splitter.subscribe('drag',self.onSplitter,self);

        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {

            var self = this,name = component.cid;
            if (component.resizable) this.addSplitter(name);

            var target = snap.elem(component.target);
            target.append(component.elem.detach());

            self.regions[name] = target;

        },

        setLayout : function(layout) {

            var self = this,cookie = Cookies.readCookie('dp1','pbf') || '#';
            for (var ndx = 0,value = layout.value,num = bits.length;(ndx < num);ndx++,value >>= 1)
                cookie = Cookies.setBitFlag(cookie,bits[ndx],value & 1);

            Cookies.writeCookielet('dp1','pbf',cookie);
            return layout;

        },

        computeLayout : function() {

            var self = this,width = $(window).width(),current = self.current;
            for (var idx = layouts.length - 1;(idx && (width < layouts[idx].minWidth));idx--);
            if (layouts[idx] != current) current = self.setLayout(self.current = layouts[idx]);

            var match = document.body.className.match(current.name);
            if (match == null) document.body.className = current.name;

        },

        //> public void layout(force)
        layout : function(force) {

            var self = this.validate(force);
            if (!self.dirty) return;

            self.computeLayout();

            var view = self.target;

            var width = view.outerWidth();
            var height = view.outerHeight();

            var header = self.regions.header;
            var footer = self.regions.footer;

            var left = self.regions.left;
            var right = self.regions.right;

            var marginLeft = (left)?(left.width() + 15):0;
            var marginRight = (right)?(right.width() + 15):0;

            var center = self.regions.center;

            center.css('margin-left',marginLeft);
            center.css('margin-right',marginRight);

            var offsetTop = center[0].offsetTop;
            var offsetHeight = center[0].offsetHeight;

            var offsetLeft = $doc.offsetLeft(left[0]);
            var offsetRight = $doc.offsetLeft(right[0]);

            var splitters = self.splitters,splitter;

            if (splitter = splitters.left) {
                splitter.setBounds(offsetLeft,$doc.offsetLeft(center[0]) + center.outerWidth());
                splitter.setStyles({top:$doc.offsetTop(left[0]),left:offsetLeft + left[0].offsetWidth - 7,height:left.outerHeight()});
            }

            if (splitter = splitters.right) {
                splitter.setBounds($doc.offsetLeft(center[0]),offsetRight + right[0].offsetWidth);
                splitter.setStyles({top:$doc.offsetTop(right[0]),left:offsetRight,height:right[0].offsetHeight});
            }

            for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
                node.resize({});
            }

        },

        //> public resize(Object message,Object size) {
        resize : function resize(message,size) {
            var self = this,source = message.source;
            self.regions[source.cid].css(size);
            self.layout(true);
        },

        //> private void onSplitter(Object message,Object? object)
        onSplitter : function(message,object) {

            var self = this,splitter = message.source;
            var name = splitter.name,target = self.regions[name];

            if (name.match(/left/)) target.layout({width:splitter.offsetLeft - $doc.offsetLeft(target[0]) + splitter.offsetWidth});
            else if (name.match(/right/)) target.layout({width:$doc.offsetLeft(target[0]) + target[0].offsetWidth - splitter.offsetLeft});

            self.layout(true);

        }

    });

    snap.extend(PageLayout,{

        template : function(config,context) {
            context.render(PageLayout.getName());
            context.queue(config);
        }

    });

    return PageLayout;

});
