
define('snap.form.Select',function(snap) {

    //> public Select(Object? config)
    var Select = function(config) {

        var self = this;Select.superclass.constructor.call(self,config);
        self.elem.attr({name:self.name,multiple:self.multiple});

        for (var idx = 0,elem = self.elem,options = self.options,option;(option = options[idx]);idx++) {
            elem.append($('<option/>',{value:option.value,selected:option.selected}).append(option.text));
        }

        self.elem.bind('click',self.onClick.bind(self));
        self.elem.bind('change',self.onChange.bind(self));

    };

    snap.inherit(Select,'snap.Component');
    snap.extend(Select.prototype,{

        multiple:false,options:[],

        onClick : function(event) {
            return this.publish('click');
        },

        onChange : function(event) {
            var self = this,options = self.elem[0].options,selected = [];
            for (var idx = 0,option;(option = options[idx]);idx++) {
                if (option.selected) selected.push({value:option.value,text:option.text});
            }
            return this.publish('change',selected);
        }

    });

    snap.extend(Select,{

        template : function(config,context) {
            context.render(Select.getName());
            context.queue(config);
        }

    });

    return Select;

});
