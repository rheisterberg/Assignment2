
define('walmart.aspects.AspectPanel',function(snap) {

    var Content = snap.require('snap.Content');
    var Registry = snap.require('snap.Registry');

    var AspectType = snap.require('walmart.aspects.AspectType');
    var AspectFlyout = snap.require('walmart.aspects.AspectFlyout');

    var NumberFormatter = snap.require('ebay.utils.NumberFormatter');

    //> public AspectPanel(Object? config)
    var AspectPanel = function(config) {

        var self = this;

        AspectPanel.decimal = config.decimal;
        AspectPanel.grouping = config.grouping;

        AspectPanel.superclass.constructor.call(self,config);
        AspectPanel.formatter = new NumberFormatter(config.grouping);

        snap.subscribe('state',self.onState.bind(self),self);
        snap.subscribe('AspectFlyout',self.showFlyout.bind(self),self);

        $('div.refine a',self.elem).bind('click',self.onRefine.bind(self));

    };

    snap.inherit(AspectPanel,'snap.Container');
    snap.extend(AspectPanel.prototype,{

        onState : function(message,state) {
            var panel = snap.render(AspectPanel,state.data.aspects);
            this.elem.replaceWith(panel.elem);
            panel.layout(true);
        },

        onRefine : function(event) {
            var self = this,aspect = self.children[0];
            snap.publish('rover',{an:'Dash.MoreRefinements.click'},self);
            snap.publish('AspectFlyout',aspect,self);
        },

        showFlyout : function(message,aspect) {

            if (AspectPanel.loading) return false;
            else AspectPanel.loading = true;

            var self = this,uri = aspect.buildRequest(self.href);
            $.ajax({url:uri.getUrl(),success:self.onFlyoutSuccess.bind(self,aspect),error:self.onFlyoutError.bind(self,aspect)});

        },

        onFlyoutSuccess : function(aspect,model) {
            AspectPanel.loading = false;
            var self = this;self.flyout = self.flyout || new AspectFlyout(self);
            self.flyout.show(aspect,model);
        },

        onFlyoutError: function(aspect,response,error,status) {
            AspectPanel.loading = false;
            snap.log('debug','onFlyoutError',status);
        },

        destroy : function() {
            AspectPanel.superclass.destroy.call(this);
            if (this.flyout) snap.destroy(this.flyout);
        }

    });

    snap.extend(AspectPanel,{

        template : function(config,context) {

            var aspects = config.children;
            for (var idx = 0,aspect;(aspect = aspects[idx]);idx++) {
                aspect.cid = aspect.name;aspect.tid = AspectType.type(aspect);
            }

            context.render(AspectPanel.getName());

            delete config.children;
            context.queue(config);

        }

    });

    return AspectPanel;

});

