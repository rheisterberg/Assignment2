
define('snap.rollup.Rollup',function(snap) {

    //> public Rollup(Object? config)
    var Rollup = function(config) {
        Rollup.superclass.constructor.call(this,config);
    };

    snap.inherit(Rollup,'snap.Container');
    snap.extend(Rollup.prototype,{

        render : function(target) {

            var self = this,content = self.content;
            Rollup.superclass.render.call(self,target);

            self.head = $('div.rlp-h',self.elem).append(self.title);
            self.body = $('div.rlp-b',self.elem);self.body.html(content);
            if (self.styles.body) self.body.css(self.styles.body);

            self.head.bind('click',self.onClick.bind(self));

        },

        getTarget : function() {
            return this.body;
        },

        onClick : function(event) {
            this.body.slideToggle(100);
            this.elem.toggleClass("collapse");
        },

        //> public void resize(Object? size)
        resize : function(size) {

            var self = this,head = self.head;
            if (size.height) size.height -= head.outerHeight();;

            self.body.layout(size);
            self.layout();

        }

    });

    return Rollup;

});


