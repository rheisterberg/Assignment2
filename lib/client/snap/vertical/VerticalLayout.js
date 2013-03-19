
define('snap.vertical.VerticalLayout',function(snap) {

    //> public VerticalLayout(Object? config)
    var VerticalLayout = function(config) {
        VerticalLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(VerticalLayout,'snap.Layout');
    snap.extend(VerticalLayout.prototype,{

        //> protected void layout(boolean force)
        layout : function(force) {

            var self = this.validate(force);

            var target = self.target,width = target.width(),height = target.height();
            for (var node = self.children.fwd;(node);node = node.siblings.fwd) height -= node.elem.outerHeight();
            if ((self.children.length <= 0) || (height <= 0)) return;

            var frame = target.frame(),padding = frame.padding;
            var center = Math.round(padding.left + width/2),spacing = Math.round(height/(2*self.children.length));

            for (var node = self.children.fwd,top = padding.top + spacing;(node);node = node.siblings.fwd) {
                node.elem.css({position:'absolute',top:top,left:center - (node.elem.outerWidth()/2),margin:0});top += node.elem.outerHeight() + 2*spacing;
            }

        }

    });

    return VerticalLayout;

});
