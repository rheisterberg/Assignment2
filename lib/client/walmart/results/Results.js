
define('walmart.results.Results',function(snap) {

    var Registry = snap.require('snap.Registry');

    var ListView = snap.require('walmart.views.list.ListView');
    var GalleryView = snap.require('walmart.views.gallery.GalleryView');

    var ItemTemplatesHelpers = snap.require('walmart.views.item.ItemTemplatesHelpers');

    //> public Results(Object? config)
    var Results = function(config) {

        var self = this;self.uri = $uri(document.location.href);
        Results.superclass.constructor.call(self,config);

        snap.subscribe('query',self.onQuery.bind(self),self);
        snap.subscribe('search',self.onSearch.bind(self),self);

        snap.subscribe('view',self.onView.bind(self),self);

        $(window).bind('statechange',self.onState.bind(self));
        $(window).bind('resize',self.onResize.bind(self));

        var data = window.History.getState().data;
        if (data.results) self.onState();

    };

    snap.inherit(Results,'snap.Container');
    snap.extend(Results.prototype,{

        onState : function(event) {

            var self = this;window.scrollTo(0,0);
            var state = window.History.getState();

            snap.log('debug','onState',state.url);

            self.loadView(self.config = state.data.results);
            snap.publish('state',state,self);

            Registry.update();

        },

        onScroll : function(offset) {
            window.scrollTo(offset.left,offset.top);
        },

        onQuery : function(message,href) {
            this.load(href);
        },

        onResize : function(event) {
            this.layout();
        },

        onSearch : function(message,object) {
            var self = this,uri = self.uri;
            uri.params['_nkw'] = object.nkw;uri.params['_pgn'] = 1;
            self.load(uri.getUrl());
        },

        loadView : function(config,type) {

            var self = this;self.type = type || config.type;
            self.removeChildren();$('.cb .rcnt').html(config.count);

            var started = new Date().getTime();
            var view = self.appendChild(new (self.type.match(/list/)?ListView:GalleryView));
            view.load(config.models);

            snap.log('debug','results ',new Date().getTime() - started);

            Registry.update();

        },

        onView : function(message,type) {

            var self = this,models = self.config.models;
            if (models) return self.loadView(self.config,type);

            self.uri.params['_dmd'] = type.match(/list/)?'1':'2';
            self.load(self.uri.getUrl());

        },

        load : function(href) {

            var self = this;self.uri = $uri(href);
            delete self.uri.params['callback'];

            var success = self.success.bind(self),error = self.error.bind(self);
            $.ajax({url:self.uri.getUrl().replace('i.html','results.json'),success:success,error:error,dataType:'json'});

        },

        success : function(response) {
            var self = this,scroller = $(window);
            snap.extend(response,{scroll:{top:scroller.scrollTop(),left:scroller.scrollLeft()}});
            window.History.pushState(response,response.title,self.uri.getUrl());
        },

        error : function(request,status,error) {
            snap.log('debug','Results status',status,'error',error);
        }

    });

    snap.extend(Results,{

        template : function(config,context) {

            var tid = config.type.match(/list/)?'walmart.views.list.ListView':'walmart.views.gallery.GalleryView';
            var models = config.models,eid = config.children?config.children[0].eid:null;
            config.children = [{tid:tid,eid:eid,type:config.type,children:models}];

            context.render(Results.getName());

            delete config.children;
            if (snap.isServer()) delete config.models;

            context.queue(config);

        }

    });

    return Results;

});
