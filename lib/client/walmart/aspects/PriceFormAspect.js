
define('walmart.aspects.PriceFormAspect',function(snap) {

    //> public PriceFormAspect(Object? config)
    var PriceFormAspect = function(config) {

        PriceFormAspect.superclass.constructor.call(this,config);

        var self = this;self.form = $('form',self.elem);
        self.udlo = $('input[name=_udlo]',self.elem);self.udlo.val(self.range.lowerBound);
        self.udhi = $('input[name=_udhi]',self.elem);self.udhi.val(self.range.upperBound);

        self.submit = $('input[type=button]',self.elem);
        if (self.submit.length) self.buildControls();

    };

    snap.inherit(PriceFormAspect,'walmart.aspects.GroupAspect');
    snap.extend(PriceFormAspect.prototype,{

        blank:/^$/,validator:/^(\d*)(\.(\d*))?$|^$/,

        buildControls : function() {

            var self = this;

            self.udlo.bind('paste',self.onChange.bind(self));
            self.udhi.bind('paste',self.onChange.bind(self));

            self.udlo.bind('keypress',self.onKeyPress.bind(self));
            self.udhi.bind('keypress',self.onKeyPress.bind(self));

            self.udlo.bind('propertychange',self.onChange.bind(self));
            self.udhi.bind('propertychange',self.onChange.bind(self));

            self.submit.bind('click',self.onSubmit.bind(self));

            //if (!self.isValidInit()) self.setEnabled(false);

        },

        setEnabled : function(enabled) {
            var self = this;self.submit.attr({disabled:!enabled});
            self.submit.attr({'class':enabled?'submit':'submit disabled'});
        },

        onKeyPress : function(event) {
            var self = this;self.onChange(event);
            if (event.keyCode == 13) self.onSubmit(event);
        },

        onChange : function(event) {
            this.setEnabled(true);
        },

        onSubmit : function(event) {

            var valid = this.isValid();
            if (valid) return this.sendRequest();

            this.setEnabled(false);
            return false;

        },

        sendRequest : function() {
            var self = this,href = $uri(self.range.baseUrl);
            window.location = self.encodeState(href).getUrl();
        },

        encodeState : function(href) {

            var self = this;

            self.udlo.val(self.formatPrice(self.udlo));
            self.udhi.val(self.formatPrice(self.udhi));

            href.decodeForm(self.form[0]);
            delete href.params['LH_Price'];

            return href;

        },

        formatPrice : function(input) {
            var self = this,price = $.trim(input.val());
            if (price.match(self.blank)) return price;
            return price;
        },

        validatePrice : function(input) {

            var self = this;

            var price = $.trim(input.val());
            price = price.replace(self.range.decimal,'.');
            price = price.replace(self.range.grouping,'');

            return price.match(self.validator);

        },

        swapPrices : function(low,high) {
            this.udlo.val(low);
            this.udhi.val(high);
            return this.clearErrors();
        },

        isBlank : function(input) {
            return (input.match(this.blank) != null);
        },

        isValidInit : function() {

            var self = this;

            var udlo = self.validatePrice(self.udlo);
            if (udlo == null) return self.showError('enter-price');

            var udhi = self.validatePrice(self.udhi);
            if (udhi == null) return self.showError('enter-price');

            if((self.udhi.hasClass('hasInitVal')) || (self.udlo.hasClass('hasInitVal'))) return false;

            var minPrice = parseFloat(udlo = self.udlo.val());
            var maxPrice = parseFloat(udhi = self.udhi.val());

            if (!isNaN(minPrice) && self.isBlank(udhi)) return self.clearErrors();
            else if (self.isBlank(udlo) && !isNaN(maxPrice)) return self.clearErrors();
            else if (self.isBlank(udlo) && self.isBlank(udhi)) return false;

            return (minPrice > maxPrice)?self.swapPrices(udhi,udlo):self.clearErrors();

        },

        isValid : function() {

            var self = this;

            var udlo = self.validatePrice(self.udlo);
            if (udlo == null) return self.showError('enter-price');

            var udhi = self.validatePrice(self.udhi);
            if (udhi == null) return self.showError('enter-price');

            var minPrice = parseFloat(udlo = self.udlo.val());
            var maxPrice = parseFloat(udhi = self.udhi.val());

            if (!isNaN(minPrice) && self.isBlank(udhi)) return self.clearErrors();
            else if (self.isBlank(udlo) && !isNaN(maxPrice)) return self.clearErrors();
            else if (self.isBlank(udlo) && self.isBlank(udhi)) return self.showError('enter-price');

            return (minPrice > maxPrice)?self.swapPrices(udhi,udlo):self.clearErrors();

        },

        buildRequest : function(url) {

            var self = this,name = self.name;
            var uri = $uri(url);uri.appendParam("_ssan",name);

            var param = uri.params[name];
            if (param) uri.params['_ssav'] = param.replace('@c','').concat('|c');

            var udlo = self.buildPrice(uri,'_udlo'),udhi = self.buildPrice(uri,'_udhi');
            if (udlo || udhi) uri.params['_ssav'] = udlo.concat('..',udhi,'|c');

            delete uri.params['_udlo'];delete uri.params['_udhi'];
            delete uri.params[name];

            return uri;

        },

        buildPrice : function(href,name) {
            return (href.params[name])?href.params[name]:'';
        },

        buildFlyout : function(config) {
            var PriceFormAspectFlyout = snap.require('walmart.aspects.PriceFormAspectFlyout');
            return new PriceFormAspectFlyout(config);
        }

    });

    snap.extend(PriceFormAspect,{

        template : function(config,context) {

            config.udloid = snap.eid();
            config.udhiid = snap.eid();
            config.submitid = snap.eid();

            context.render(PriceFormAspect.getName());
            context.queue(config);

        }

    });

    return PriceFormAspect;

});

