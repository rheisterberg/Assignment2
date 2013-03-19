
define('walmart.aspects.SellerAspectFlyout',function(snap) {

    var validator = /[()<>"'&@]/;

    var cookies = snap.require('ebay.cookies');
    var Radio = snap.require('snap.radio.Radio');

    //> public SellerAspectFlyout(Object? config)
    var SellerAspectFlyout = function(config) {
        SellerAspectFlyout.superclass.constructor.call(this,config);
    };

    snap.inherit(SellerAspectFlyout,'walmart.aspects.GroupAspectFlyout');
    snap.extend(SellerAspectFlyout.prototype,{

        buildValues : function(values) {

            var self = this;
            self.elems = self.form[0].elements;

            var seller = self.elems['_fss'];
            if (seller) self.buildSeller();

            var sellerType = self.elems['_fslt'];
            if (sellerType) self.buildSellerType();

        },

        buildSeller : function() {

            var self = this;

            self.seller = self.elems['seller'];
            self.specific = self.values[0];

            for (var idx = 0,len = self.seller.length;(idx < len);idx++) {
                self.appendChild(new Radio({elem:$(self.seller[idx]).closest('div.rbx')}));
                self.seller[idx].checked = self.values[idx].selected;
                $(self.seller[idx]).bind('change',self.onSeller.bind(self));
            }

            self.disableSeller(!(self.elems['_fss'].checked = self.selected));
            if (!self.elems['_fss'].checked) self.seller[0].checked = true;

            $(self.elems['_fss']).bind('click',self.onSellers.bind(self));

            self.elems['_saslop'].selectedIndex = self.specific.specificType.match(/INCLUDE/)?0:1;
            $(self.elems['_saslop']).bind('change',self.onSpecific.bind(self));

            self.elems['_sasl'].value = self.specific.specificNames.join(',');
            $(self.elems['_sasl']).bind('change',self.onSpecific.bind(self));

        },

        disableSeller : function(disabled) {

            var self = this;self.elems['_saslop'].disabled = disabled;self.elems['_sasl'].disabled = disabled;
            for (var idx = 0,len = self.seller.length;(idx < len);idx++) self.seller[idx].disabled = disabled;

            if (disabled) $('.sellers',self.elem).addClass('disabled');
            else $('.sellers',self.elem).removeClass('disabled');

        },

        onSeller : function(event) {
            var self = this;self.clearErrors(),disabled = !self.seller[0].checked;
            self.elems['_saslop'].disabled = self.elems['_sasl'].disabled = disabled;
        },

        onSellers : function(event) {
            this.clearErrors();
            this.disableSeller(!this.elems['_fss'].checked);
        },

        onSpecific : function(event) {
            this.seller[0].checked = true;
        },

        validateSeller : function(state) {

            var self = this;
            self.clearErrors();

            var seller = state['seller'];delete state['seller'];state[seller] = '1';
            if (seller == 'LH_FavSellers') return (self.isUserSignedIn())?true:self.showError('favorite-sellers');
            else if (state['LH_SpecificSeller'] == null) return true;

            var specific = state['_sasl'];
            if (specific.length <= 0) return self.showError('specify-sellers');
            else return (validator.exec(specific) || specific.match(/\{2,}/))?self.showError('invalid-characters'):true;

        },

        isUserSignedIn : function(){
            var v1 = cookies.readCookie('ebaysignin');
            var v2 = cookies.readCookie('keepmesignin');
            return ((v1.indexOf("in")!= -1) || (v2.indexOf("in")!= -1));
        },

        buildSellerType : function() {

            var self = this,sellerTypes = self.elems['_saslt'];
            self.disableSellerType(!self.elems['_fslt'].checked);
            $(self.elems['_fslt']).bind('click',self.onSellerType.bind(self));

            for (var idx = 0,len = sellerTypes.length;(idx < len);idx++) {
                self.appendChild(new Radio({elem:$(sellerTypes[idx]).closest('div.rbx')}));
                sellerTypes[idx].checked = self.sellerTypeModel.children[idx].selected;
                $(sellerTypes[idx]).bind('change',self.onSellerType.bind(self));
            }

        },

        disableSellerType : function(disabled) {
            var self = this;sellerTypes = self.elems['_saslt'];
            for (var idx = 0,len = sellerTypes.length;(idx < len);idx++) sellerTypes[idx].disabled = disabled;
            if (disabled) $('div.type',self.elem).addClass('disabled');
            else $('div.type',self.elem).addClass('disabled');
        },

        onSellerType : function(event) {
            this.disableSellerType(!this.elems['_fslt'].checked);
        },

        isValid : function(href) {
            var self = this,state = href.decodeForm(self.form[0]);
            return (self.elems['_fss'].checked)?self.validateSeller(state):true;
        },

        getSeller : function(href) {

            var self = this;

            for (var idx = 0,len = self.seller.length;(idx < len);idx++)
                delete href.params[self.seller[idx].value];

            var seller = href.params['seller'];delete href.params['seller'];
            if (seller == 'LH_SpecificSeller') href.params[seller] = self.getSellerSpecific(href);
            else if (seller) href.params[seller] = 1;

        },

        getSellerSpecific : function(href) {
            return href.params['_saslop'].concat('..',href.params['_sasl']);
        },

        getSellerType : function(href) {
            var type = href.params['_fslt'];delete href.params['LH_SellerType'];
            if (type) href.params['LH_SellerType'] = href.params['_saslt'];
        },

        encodeState : function(href) {

            var self = this;

            self.getSeller(href);
            self.getSellerType(href);

            delete href.params[self.name];

            return href;

        }

    });

    snap.extend(SellerAspectFlyout,{

        template : function(config,context) {

            config.values = config.children;delete config.children;
            config.outletSellers = (config.values.length > 4)?true:false;

            context.render(SellerAspectFlyout.getName());
            context.queue(config);

        }

    });

    return SellerAspectFlyout;

});

