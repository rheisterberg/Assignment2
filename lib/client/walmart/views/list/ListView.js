
define('walmart.views.list.ListView',function(snap) {

    var Registry = snap.require('snap.Registry');
    var Templates = snap.require('snap.Templates');

    var Container = snap.require('snap.Container');

    var ItemTemplatesHelpers = snap.require('walmart.views.item.ItemTemplatesHelpers');
    var ItemTemplatingHelpers = snap.require('walmart.views.item.ItemTemplatingHelpers');

    //> public ListView(Object? config)
    var ListView = function(config) {
        ListView.superclass.constructor.call(this,config);
    };

    snap.inherit(ListView,'snap.Container');
    snap.extend(ListView.prototype,{

        classes:{elem:'lv'},

        load : function(models) {

            for (var idx = 0,model;(model = models[idx]);idx++) model.tid = model.catid?'walmart.views.list.ListProduct':'walmart.views.list.ListItem';

            var helpers = snap.find('snap.Templating')?ItemTemplatingHelpers:ItemTemplatesHelpers;
            this.elem.html(snap.fragment(null,models,helpers));

        }

    });

    snap.extend(ListView,{

        template : function(config,context) {

            var nodes = config.children || [];
            for (var idx = 0,node;(node = nodes[idx]);idx++) {
                node.tid = node.catid?'walmart.views.list.ListProduct':'walmart.views.list.ListItem';
            }

            var helpers = snap.find('snap.Templating')?ItemTemplatingHelpers:ItemTemplatesHelpers;
            context.render(Container.getName(),helpers);

            delete config.children;
            context.queue(config);

        }

    });

    return ListView;

});
