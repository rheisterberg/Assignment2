
define('snap.horizontal.HorizontalLayout',function(snap) {

    //> public HorizontalLayout(Object? config)
    var HorizontalLayout = function(config) {
        HorizontalLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(HorizontalLayout,'snap.Layout');
    snap.extend(HorizontalLayout.prototype,{

        //> public void layout(boolean force)
        layout : function(force) {

            var self = this.validate(force);

            var target = self.target,width = target.width(),height = target.height();
            for (var node = self.children.fwd;(node);node = node.siblings.fwd) width -= node.elem.outerWidth();
            if ((self.children.length <= 0) || (width <= 0)) return;

            var frame = target.frame(),padding = frame.padding;
            var center = Math.round(padding.top + height/2),spacing = Math.round(width/(2*self.children.length));

            for (var node = self.children.fwd,left = padding.left + spacing;(node);node = node.siblings.fwd) {
                node.elem.css({position:'absolute',top:center - (node.elem.outerHeight()/2),left:left,margin:0});left += node.elem.outerWidth() + 2*spacing;
            }

        }

    });

    return HorizontalLayout;

});
