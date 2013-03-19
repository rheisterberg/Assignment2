
define('walmart.aspects.DefaultAspectFlyout',function(snap) {

    var validator = /^(\d+)$|^$/;

    var Checkbox = snap.require('snap.checkbox.Checkbox');
    var AspectPanel = snap.require('walmart.aspects.AspectPanel');

    var DefaultAspectFlyout = function(config) {

        var self = this;self.models = {};self.checkboxes = {};
        DefaultAspectFlyout.superclass.constructor.call(self,config);
        if (self.values) self.buildValues(self.values);

        $('input[type="checkbox"]',self.form).bind('click',self.onCheckbox.bind(self));

        $('input[type="text"]',self.form).bind('click',self.onTextClick.bind(self));
        $('input[type="text"]',self.form).bind('keypress',self.onTextKey.bind(self));

        $('select',self.form).bind('change',self.onSelect.bind(self));

    };

    snap.inherit(DefaultAspectFlyout,'snap.Container');
    snap.extend(DefaultAspectFlyout.prototype,{

        showError : function(selector) {
            var error = $('div.asp-e.'.concat(selector),this.elem);
            if (error.length) error.show();
            return false;
        },

        clearErrors : function() {
            $('div.asp-e',this.elem).hide();
            return true;
        },

        buildValues : function(values) {

            var self = this;self.formatter = AspectPanel.formatter;
            var length = values.length,half = Math.floor((length + length % 2)/2);
            var trow = $('tr',$('<table class="asv-t"><tbody><tr></tr></table>').appendTo(self.elem));

            var left = $('<td/>').appendTo(trow),spacer = $('<td class="spacer"/>').appendTo(trow),right = $('<td/>').appendTo(trow);
            for (var ldx = 0;(ldx < half);ldx++) self.appendChild(self.buildValue(values[ldx],left),true);
            for (var rdx = half;(rdx < length);rdx++) self.appendChild(self.buildValue(values[rdx],right),true);
            self.layout(true);

            self.buildModels(self.config);

        },

        buildValue : function(value,target) {
            var self = this,name = self.name;
            var checkbox = new Checkbox({name:name,value:value.param,text:value.title,data:value,selected:value.selected,disabled:value.disabled,target:target});
            if (value.count) checkbox.elem.prepend($('<span class="cnt"/>').append(self.formatter.format(value.count)));
            return checkbox;
        },

        buildModels : function(model) {

            var self = this;
            self.elements = self.form[0].elements;

            var element = self.elements[model.name];
            if (element) self.checkboxes[model.name] = element;
            else return;

            self.models[model.name] = model;

            self.setExcludedModels(self.models);
            self.setIncludedModels(self.models);

        },

        setExcludedModels : function(models) {
            for (var name in models) {
                var selected = this.elements[name].checked;
                if (selected) this.setExcludedCheckboxes(models[name],true);
            }
        },

        setIncludedModels : function(models) {
            for (var name in models) {
                var selected = this.checkboxes[name].checked;
                if (selected) this.setIncludedCheckboxes(models[name],true);
            }
        },

        setExcludedCheckboxes : function(model,selected) {
            var self = this,excluded = model.excluded;
            if(!excluded) return;
            for (var idx = 0,len = excluded.length;(idx < len);idx++) {
                var value = self.checkboxes[excluded[idx]];
                if (value) value.disabled = selected;
            }
        },

        setIncludedCheckboxes : function(model,selected) {
            var self = this,included = model.included;
            if(!included) return;
            for (var idx = 0,len = included.length;(idx < len);idx++) {
                var value = self.checkboxes[included[idx]];
                if (value) {
                     value.disabled = selected;
                     value.checked = selected;
                }
            }
        },

        onTextClick : function(event) {
            var target = $(event.target),closest = target.closest('div.cbx,div.rbx');
            closest.find('input[type="checkbox"],input[type="radio"]').prop("checked","checked");
            return false;
        },

        onTextKey : function(event){
            var target = $(event.target),closest = target.closest('div.cbx,div.rbx');
            closest.find('input[type="checkbox"],input[type="radio"]').prop("checked","checked");
        },

        onCheckbox : function(event) {

            var self = this,target = event.target;

            var model = self.models[target.name];
            if (model == null) return;

            self.setExcludedCheckboxes(model,target.checked);
            self.setIncludedCheckboxes(model,target.checked);

            self.setExcludedModels(self.models);

        },

        onSelect: function(event){
            var target = $(event.target);
            target.closest('.asf-v').find('input[type="checkbox"]').attr("checked","checked");
        },

        validateInput : function(input) {
            var self = this, inputValue = $.trim($(input).val());
            return inputValue.match(validator);
        },

        isValid : function(href) {
            var self = this, valid = true;
            self.clearErrors();
            checkboxes = $('input[type="checkbox"]:checked, input[type="radio"]:checked');
            $.each(checkboxes, function(index, elem){
                var inputBoxes = $(elem).closest('div.asf-v').find('input[type="text"]');
                $.each(inputBoxes, function(idx, el){
                    if(!self.validateInput(el)) {
                        self.showError(elem.name);
                        valid = false;
                    }
                });
            });
            return valid;
        },

        cleanParams : function(href){
            var self = this,
                params = $('input[type="checkbox"]:not(:checked) + span, input[type="radio"]:not(:checked) + span').find('input[type="text"] , select, input[type="hidden"]');
                $.each(params ,  function(index, elem){
                    delete href.params[elem.name];
                });
            if (href.params['LH_Distance']) delete href.params['LH_Distance'];
            return href;
        },

        encodeState : function(href) {
            var self = this,elems = self.elements,params = href.decodeForm(self.form[0]);
            for (var name in params) self.encodeParam(href,name,params[name]);
            return href;
        },

        encodeParam : function(href,name,value) {
            if (value) href.params[name] = (typeof(value) == "object")?value.join("|"):value;
        }

    });

    return DefaultAspectFlyout;

});

