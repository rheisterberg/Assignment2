
define('snap.tabs.Tab',function(snap) {

    //> public Tab(Object? config)
    var Tab = function(config) {
        Tab.superclass.constructor.call(this,config);
    };

    snap.inherit(Tab,'snap.Container');
    snap.extend(Tab.prototype,{

        //> protected void render(Object target)
        render : function(target) {

            var self = this;Tab.superclass.render.call(self,target);
            self.head = $(snap.fragment(Tab,{head:true,title:self.title})).attr('oid',self.oid);
            self.elem.append(self.content);
            if (self.closable) self.renderClose();

            self.head.bind('click',self.onClick.bind(self));

            self.subscribe('show',self.onShow);
            self.subscribe('hide',self.onHide);

        },

        renderClose : function() {
            var self = this;self.head.addClass('x');
            var close = $('<b class="x"/>').appendTo($('div.tab-h',self.head));
            close.bind('click',self.onClose.bind(self));
        },

        //> public void resize(Object size)
        resize : function(size) {
            this.elem.layout(size);
            this.layout();
        },

        onClick : function(event) {
            this.publish('select',this,true);
        },

        onClose : function(message) {
            this.parent.removeChild(this);
        },

        onShow : function(message) {
        },

        onHide : function(message) {
        }

    });

    snap.extend(Tab,{

        template : function(config,context) {
            context.render(Tab.getName());
            context.queue(config);
        }

    });

    return Tab;

});
