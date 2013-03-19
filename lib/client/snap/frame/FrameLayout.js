
define('snap.frame.FrameLayout',function(snap) {

    //> public FrameLayout(Object? config)
    var FrameLayout = function(config) {
        var self = this;FrameLayout.superclass.constructor.call(self,config);
        self.container.subscribe('Frame.view',self.view.bind(self),self);
    };

    snap.inherit(FrameLayout,'snap.Layout');
    snap.extend(FrameLayout.prototype,{

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {
            var self = this,selected = component.selected;
            component.elem.css({display:selected?'block':'none'});
            FrameLayout.superclass.addComponent.call(self,component);
        },

        view : function(message,cid) {

            var self = this,frame = self.container.getChild(cid);
            if (frame == null) return;

            self.target.children().css({display:'none'});
            self.target.children('[oid~='.concat(frame.oid,']')).css({display:'block'});

            self.layout();

        }

    });

    return FrameLayout;

});
