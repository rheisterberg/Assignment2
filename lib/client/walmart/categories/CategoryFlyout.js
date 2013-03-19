
define('walmart.categories.CategoryFlyout',function(snap) {

    var Container = snap.require('snap.Container');
    var CategoryPanel = snap.require('walmart.categories.CategoryPanel');

    var NumberFormatter = snap.require('ebay.utils.NumberFormatter');
    var VerticalScroller = snap.require('snap.scrollbar.vertical.VerticalScroller');

    //> public CategoryFlyout(Object? config)
    var CategoryFlyout = function(config) {

        var self = this;self.formatter = new NumberFormatter(',');
        CategoryFlyout.superclass.constructor.call(self,config);
        self.elem.append(self.buildTitle(self.config));

        self.subscribe('more',self.onMore.bind(self));
        self.subscribe('fewer',self.onFewer.bind(self));

    };

    snap.inherit(CategoryFlyout,'snap.Container');
    snap.extend(CategoryFlyout.prototype,{

        classes:{elem:'cat-f'},

        buildTitle : function(config) {
            var self = this,title = $('<div class="ttl"/>');
            title.append($('<a class="lnk"/>').append(config.name).attr({href:config.url}));
            title.append($('<span class="cnt"/>').append(self.formatter.format(config.count)));
            return title;
        },

        buildTetris : function(target) {
            var self = this,tetris = new Container({classes:{elem:'ttrs'},cols:3,manager:'snap.tetris.TetrisLayout',target:target});
            self.scroller = new VerticalScroller({scrollable:tetris,target:tetris.elem});
            self.scroller.scrollbar.subscribe('scroll',self.onScroll.bind(self));
            return tetris;
        },

        buildCategories : function(categories) {
            var self = this;self.tetris = self.appendChild(self.buildTetris(self.elem));
            for (var idx = 0,category;(category = categories[idx]);idx++) {
                self.tetris.appendChild(new CategoryPanel(snap.extend(category,{formatter:self.formatter})));
            }
        },

        onScroll: function(message,object) {

            var self = this,date = new Date();time = date.getTime();
            if (time < (self.throttle + 5000)) return;
            else self.throttle = time;

            var scrollTop = object.scrollTop,publish = (scrollTop > 0);
            if (publish) snap.publish('rover',{an:'Dash.CategoryFlyout.scroll',ex1:self.config.id},self);

        },

        onMore : function(message,object) {
            var self = this;self.tetris.layout(true);self.scroller.show();
            snap.publish('rover',{an:'Dash.CategoryFlyout.more',ex1:message.source.config.id},self);
        },

        onFewer : function(message,object) {
            var self = this;self.tetris.layout(true);
            self.scroller.scroll(self.scroller.position() - object.scroll);self.scroller.show();
            snap.publish('rover',{an:'Dash.CategoryFlyout.fewer',ex1:message.source.config.id},self);
        },

        show : function() {
            this.tetris.layout(true);
            this.scroller.scroll(0);
        }

    });

    return CategoryFlyout;

});
