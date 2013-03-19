
window.ebayContent = window.ebayContent || {};

define('snap.Content',function(snap) {

    var pattern = /\$\{([^\}]*)\}/g;

    var Content = snap.extend(function(){},{

        eval : function(context,path) {
            var self = this,keys = path.split('.');
            var key = keys.shift(),context = context[key];
            while (context && (key = keys.shift())) context = context[key];
            return context;
        },

        token : function(context,match,key) {
            return this.eval(context,key);
        },

        render : function(content,context) {
            var self = this,token = self.token.bind(self,context);
            return content?content.replace(pattern,token):'';
        },

        content : function(path) {
            return this.eval(ebayContent,path);
        },

        get : function(path,context) {
            var self = this,content = self.content(path);
            return (content && context)?self.render(content,context):content || '';
        }

    });

    return Content;

});



