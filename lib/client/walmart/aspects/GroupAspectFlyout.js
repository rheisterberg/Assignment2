
define('walmart.aspects.GroupAspectFlyout',function(snap) {

    var Container = snap.require('snap.Container');
    var Checkbox = snap.require('snap.checkbox.Checkbox');

    var ContentTemplates = {
        'MultiListingAspectModel':'walmart.aspects.MultiListingAspectFlyout'
    };

    var GroupAspectFlyout = function(config) {
        GroupAspectFlyout.superclass.constructor.call(this,config);
    };

    snap.inherit(GroupAspectFlyout,'walmart.aspects.DefaultAspectFlyout');
    snap.extend(GroupAspectFlyout.prototype,{

        buildValue : function(value,target) {
            var self = this,template = ContentTemplates[value.type];
            return template?self.buildTemplate(template,value,target):self.buildCheckbox(value,target);
        },

        buildCheckbox : function(value,target) {
            var checkbox = new Checkbox({name:value.name,value:value.param,text:value.title,data:value,selected:value.selected,disabled:value.disabled,target:target});
            if (value.count) checkbox.elem.append($('<span class="cnt"/>').append(value.count));
            return checkbox;
        },

        buildTemplate : function(template,value,target) {
            var type = snap.require(template);
            return snap.render(type,snap.extend(value,{target:target}));
        }

    });

    snap.extend(GroupAspectFlyout,{

        template : function(config,context) {

            config.values = config.children;delete config.children;

            context.render(Container.getName());
            context.queue(config);

        }

    });

    return GroupAspectFlyout;

});

