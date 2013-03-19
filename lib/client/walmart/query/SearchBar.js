
define('search.query.SearchBar',function(snap) {

    var AutoFillInput = snap.require('walmart.autofill.AutoFillInput');

    var SearchBar = function(config) {

        var self = this;self.elem = snap.elem(config.eid);
        SearchBar.superclass.constructor.call(self,config);
        snap.subscribe('state',self.onState.bind(self),self);

        self.autofill = new AutoFillInput(self.model.autofill);
        self.autofill.layer.elem.bind('submit',self.onSubmit.bind(self));

        self.form = $('form',self.elem).bind('submit',self.onSubmit.bind(self));

    };

    snap.inherit(SearchBar,'snap.Component');
    snap.extend(SearchBar.prototype,{

        onState : function(message,state) {
        },

        onSubmit : function(event,object) {

            var self = this,trksid = object?object.trksid:self.model.trksid;
            if (trksid) $(document).trigger('track',{trksid:trksid});
            self.autofill.hide();

            var elements = self.form[0].elements;
            snap.publish('search',{nkw:elements['_nkw'].value},self);
            return false;

        }

    });

    return SearchBar;

});
