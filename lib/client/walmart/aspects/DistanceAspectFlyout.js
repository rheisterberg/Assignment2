
define('walmart.aspects.DistanceAspectFlyout',function(snap) {

    var Content = snap.require('snap.Content');

    //> public DistanceAspectFlyout(Object? config)
    var DistanceAspectFlyout = function(config) {

        var self = this;DistanceAspectFlyout.superclass.constructor.call(self,config);

        self.elems = config.form[0].elements;self.zip =  self.elems['_fpos'];self.city =  self.elems['_fsct'];
        self.select = $('select',self.elem);self.select.prop({selectedIndex:self.RadiusModel.selectedValueIndex});

        self.checkbox = $('input[type=checkbox]',self.elem);
        self.checkbox.prop({checked:self.selected});

        self.checkbox.bind('change',self.onEnable.bind(self));

        $(self.zip).bind('keypress',self.resetCity.bind(self));
        $(self.zip).bind('focus',self.clearZip.bind(self));
        $(self.city).bind('change',self.resetZip.bind(self));

        self.onEnable();

    };

    snap.inherit(DistanceAspectFlyout,'walmart.aspects.DefaultAspectFlyout');
    snap.extend(DistanceAspectFlyout.prototype,{

        resetZip : function(event) {
            if (this.zip != null){
                this.zip.value = '';
            }
        },

        clearZip : function(event) {
            if (this.zip && this.zip.className.match(/ziptext/)) {
                this.zip.value = '';this.zip.className = 'zipcode';
            }
        },

        resetCity : function(event) {
            if (this.city != null){
                this.city.selectedIndex = 0;
            }
        },

        onEnable : function() {
            var self = this,disabled = !self.checkbox.prop('checked');
            $('select.radius',self.elem).prop({disabled:disabled});
            $('input.zipcode',self.elem).prop({disabled:disabled});
        },

        isValid : function(href) {

            var selected = this.checkbox.checked;
            if (!selected) return true;

            var zipcode =  $.trim(this.zip.value);
            if (this.zip != null &&  this.city != null){
            var selectedCity = this.city.selectedIndex;
                if  (zipcode.length <= 0 && selectedCity == 0){
                     return this.showError('zipcity');
                }

                return true;
            }

            if (this.zip != null && this.city == null){
                if (zipcode.length <= 0 ){
                    return this.showError('zipcode');
                }
            }

             return true;
        }
    });

    snap.extend(DistanceAspectFlyout,{

        template : function(config,context) {

            var units = Content.get('srp_snap/DistanceAspect.Units')[config.RadiusModel.unit];
            var radius = snap.fragment('walmart.aspects.DistanceAspectRadius',config.RadiusModel);
            var zipholder = Content.get('srp_snap/Aspects.ZipCodePlaceholder'),zipcode = config.zipcode || '';
            var ziptext = Content.render('<input type="text" name="_fpos" value="${zipcode}" class="zipcode" placeholder="${placeholder}" size="7">',{zipcode:zipcode,placeholder:zipholder});
            config.within = {Radius:radius,Units:units,Zip:ziptext,ZipPos:'',Break:''};

            context.render(DistanceAspectFlyout.getName());
            context.queue(config);

        }

    });

    return DistanceAspectFlyout;

});

