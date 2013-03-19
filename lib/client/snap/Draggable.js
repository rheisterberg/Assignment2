
define('snap.Draggable',function(snap) {

    //> public Draggable(Object? config)
    var Draggable = function(config) {

        var self = this,draggable = self.elem.attr('draggable');
        if (snap.isDefined(draggable)) return;

        self.elem.attr({draggable:'true'});

        self.elem.bind('dragstart',self.onDragStart.bind(self));
        self.elem.bind('dragmove',self.onDragMove.bind(self));
        self.elem.bind('dragstop',self.onDragStop.bind(self));

    };

    snap.extend(Draggable.prototype,{

        onDragStart : function(event) {
            event.originalEvent.dataTransfer.setData('Text',this.oid);
        },

        onDragMove : function(event) {
        },

        onDragStop : function(event) {
        }

    });

    return Draggable;

});
