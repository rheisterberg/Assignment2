
define('snap.Droppable',function(snap) {

    var Registry = snap.require('snap.Registry');

    //> public constructs(Object? config)
    var Droppable = function(config) {

        var self = this,target = self.getTarget();
        target.bind('dragover',self.onDragOver.bind(self));
        target.bind('dragenter',self.onDragEnter.bind(self));

        target.bind('drop',self.onDrop.bind(self));

    };

    snap.extend(Droppable.prototype,{

        getDropped : function(event) {
            var self = this,dataTransfer = event.originalEvent.dataTransfer;
            return Registry.object(dataTransfer.getData('Text'));
        },

        onDragOver : function(event) {
            event.preventDefault();
            return false;
        },

        onDragEnter : function(event) {
            event.preventDefault();
            return false;
        },

        onDrop : function(event) {
            event.preventDefault();
        }

    });

    return Droppable;

});
