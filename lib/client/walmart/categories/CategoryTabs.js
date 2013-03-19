
define('walmart.categories.CategoryTabs',function(snap) {

    var Content = snap.require('snap.Content');
    var Registry = snap.require('snap.Registry');

    var CategoryTab = snap.require('walmart.categories.CategoryTab');

    //> public CategoryTabs(Object? config)
    var CategoryTabs = function(config) {

        var self = this;self.categories = {};
        CategoryTabs.superclass.constructor.call(self,config);

        self.subscribe('load',self.loadCategories.bind(self));
        snap.subscribe('state',self.onState.bind(self),self);

    };

    snap.inherit(CategoryTabs,'snap.Container');
    snap.extend(CategoryTabs.prototype,{

        manager:'walmart.categories.CategoryTabsLayout',

        onState : function(message,state) {
            var categories = snap.render(CategoryTabs,state.data.categories);
            this.elem.replaceWith(categories.elem);
            categories.layout(true);
        },

        loadCategories : function(message,object) {

            var self = this,category = self.categories[object.name];
            if (category != null) return object.onload(category);

            var success = self.onSuccess.bind(self,object),error = self.onError.bind(self);
            $.ajax({url:$uri(self.ajax).getUrl(),success:success,error:error,dataType:'json'});

        },

        onSuccess : function(object,response) {
            var self = this,categories = response.categories.children,category;
            for (var idx = 0,category;(category = categories[idx]);idx++) {
                self.categories[category.name] = category;
            }
            object.onload(self.categories[object.name]);
        },

        onError : function(request,status,error) {
            snap.log('debug','CategoryTabs.loadCategories status',status,'error',error);
        },

        onBackLink : function(event) {
            var self = this,target = $(event.target);uri = $uri(target.attr('href'));
            snap.publish('query',uri.getUrl(),self);
            return false;
        }

    });

    snap.extend(CategoryTabs,{

        template : function(config,context) {

            var categories = config.children,content = Content.get('srp_snap/Categories');
            config.title = config.current?config.current:Content.render(content['Categories']);
            config.backtext = Content.render(content[config.previous?'BackToName':'BackToAll'],{name:config.previous});
            for (var idx = 0,category;(category = categories[idx]);idx++) category.tid = 'walmart.categories.CategoryTab';

            context.render(CategoryTabs.getName());

            delete config.children;
            context.queue(config);

        }

    });

    return CategoryTabs;

});
