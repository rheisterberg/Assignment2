
define('snap.tetris.TetrisLayout',function(snap) {

    //> public TetrisLayout(Object? config)
    var TetrisLayout = function(config) {
        TetrisLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(TetrisLayout,'snap.Layout');
    snap.extend(TetrisLayout.prototype,{

        render : function() {

            var self = this,container = self.container;
            var target = self.target;target.append(self.template());

            self.index = 0;self.table = $('table',target);self.cells = [];
            self.cols = container.cols;self.trow = $('tr',self.target);

            var width = Math.floor(100/self.cols).toString().concat('%');
            for (var idx = 0,cell;(idx < self.cols);idx++) {
                self.cells.push(cell = $('<div class="tetris"/>'));
                self.trow.append($('<td class="tetris"/>').css({width:width}).append(cell));
            }

        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {

            var self = this,cols = self.cols,cells = self.cells;
            var idx = self.index,minimum = cells[idx].height();
            for (var mdx = idx + 1;((minimum > 50) && ((mdx %= cols) != idx));minimum = Math.min(minimum,height),mdx++) {
                var cell = cells[mdx],height = cell.height();
                if (height < minimum) self.index = mdx;
            }

            cells[self.index].append(component.elem);
            if (self.ready && !defer) self.layout();

        },

        layout : function(force) {

            var self = this,row = self.table[0].rows[0],cells = self.cells;
            for (var idx = 0,cols = 0,cell;(cell = cells[idx]);idx++) cols += cell[0].hasChildNodes()?1:0;

            var width = Math.floor(100/cols).toString().concat('%');
            for (var idx = 0,cell;(idx < self.cols);idx++) $(row.cells[idx]).css({width:(idx < cols)?width:'0'});

            TetrisLayout.superclass.layout.call(self,force);

        }

    });

    snap.extend(TetrisLayout,{

        template : function(config,context) {
            context.render(TetrisLayout.getName());
        }

    });

    return TetrisLayout;

});
