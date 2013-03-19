
define('walmart.views.gallery.GalleryView',function(snap) {

    var Templates = snap.require('snap.Templates');
    var Registry = snap.require('snap.Registry');

    var Container = snap.require('snap.Container');

    var ItemTemplatesHelpers = snap.require('walmart.views.item.ItemTemplatesHelpers');
    var ItemTemplatingHelpers = snap.require('walmart.views.item.ItemTemplatingHelpers');

    //> public GalleryView(Object? config)
    var GalleryView = function(config) {
        GalleryView.superclass.constructor.call(this,config);
    };

    snap.inherit(GalleryView,'snap.Container');
    snap.extend(GalleryView.prototype,{

        classes:{elem:'gv'},

        load : function(models) {

            var self = this;self.models = models;self.removeChildren();
            for (var idx = 0,model;(model = models[idx]);idx++) model.tid = model.catid?'walmart.views.gallery.GalleryProduct':'walmart.views.gallery.GalleryItem';

            var helpers = snap.find('snap.Templating')?ItemTemplatingHelpers:ItemTemplatesHelpers;
            var widgets = $(snap.fragment(null,models,helpers));

            var size = widgets.length;self.elem.html('').css({height:''});
            var width = self.elem.width(),cols = Math.floor(width/225);

            var rows = Math.floor((size + cols - 1)/cols),width = String(Math.floor(100/cols)).concat('%');
            for (var rdx = 0;(rdx < rows);rdx++) self.elem.append(self.renderRow(widgets,cols,rdx*cols,width));

        },

        renderRow : function(widgets,cols,fdx,width) {
            var self = this,table = $('<table class="gv-ic fgdt"></table>');
            var tbody = $('<tbody/>').appendTo(table),trow = $('<tr/>').appendTo(tbody);
            for (var cdx = 0;(cdx < cols);cdx++) {
                var widget = widgets[fdx + cdx],element = widget?$(widget):$('<td><br/></td>'),last = (!widget || (cdx == (cols - 1)));
                trow.append(element.attr({'class':last?'ic last':'ic',width:width}));
            }
            return table;
        },

        //> public void resize(Object size)
        resize : function(size) {

            var self = this;self.elem.layout(size);
            if (self.models) self.load(self.models);

            self.layout();

        }

    });

    snap.extend(GalleryView,{

        template : function(config,context) {

            var nodes = config.children || [];
            for (var idx = 0,node;(node = nodes[idx]);idx++) {
                node.tid = node.catid?'walmart.views.gallery.GalleryProduct':'walmart.views.gallery.GalleryItem';
            }

            var helpers = snap.find('snap.Templating')?ItemTemplatingHelpers:ItemTemplatesHelpers;
            context.render(Container.getName(),helpers);

            delete config.children;
            context.queue(config);

        }

    });

    return GalleryView;

});
