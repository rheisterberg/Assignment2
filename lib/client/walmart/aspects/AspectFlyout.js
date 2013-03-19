
define('walmart.aspects.AspectFlyout',function(snap) {

    var Content = snap.require('snap.Content');
    var Container = snap.require('snap.Container');

    var Button = snap.require('snap.button.Button');
    var Throbber = snap.require('snap.throbber.Throbber');

    var VerticalScroller = snap.require('snap.scrollbar.vertical.VerticalScroller');

    var AspectFlyout = function(panel) {

        var self = this;self.panel = panel;
        self.aspects = panel.children;self.scrollers = {};

        AspectFlyout.superclass.constructor.call(self);
        self.body.html(snap.fragment('walmart.aspects.AspectFlyoutForm',{}));

        self.buildFrame();
        self.buildOthers();

        self.throbber = new Throbber({target:self.frame});
        self.throbber.elem.prependTo($('td.frame',self.body));

        self.form = $('form',self.body);
        self.controls = $('td.controls',self.body);

        var submit = new Button({text:Content.get('srp_snap/Aspects.Submit'),classes:{elem:'med blue'},target:self.controls});
        submit.subscribe('click',self.onSubmit.bind(self));

        var cancel = $('<a class="cancel"/>').append(Content.get('srp_snap/Aspects.Cancel')).appendTo(self.controls);
        cancel.bind('click',self.onCancel.bind(self));

        $('div.asf-c',self.body).bind('click',self.onCancel.bind(self));

    };

    snap.inherit(AspectFlyout,'snap.window.Window');
    snap.extend(AspectFlyout.prototype,{

        classes:{elem:'win asf'},modal:true,resizable:false,

        buildFrame : function() {
            var self = this;self.frame = $('div.frame',self.body);
            var container = self.appendChild(new Container({elem:self.frame}));
            self.scrollers.frame = new VerticalScroller({scrollable:container,target:container.elem});
        },

        buildOthers : function() {

            var self = this;self.others = {};
            self.chevron = $('<div class="chvrn"/>');

            var others = $('div.others',self.body),aspects = self.aspects;
            var container = self.appendChild(new Container({elem:others}));
            self.scrollers.others = new VerticalScroller({scrollable:container,target:container.elem});

            for (var idx = 0,aspect;(aspect = aspects[idx]);idx++) {
                var anchor = $('<a class="other" tabindex="-1" href="#"/>').append(aspect.title);
                var other = self.others[aspect.name] = $('<div class="other"/>').append(anchor).appendTo(others);
                other.bind('click',aspect,self.onOther.bind(self));
            }

        },

        buildFlyout : function(aspect,model) {

            var self = this;
            self.loading = false;

            self.throbber.hide();

            var flyout = self.flyouts[aspect.name] || aspect.buildFlyout(snap.extend(model,{form:self.form,target:self.frame}));
            if (self.flyouts[aspect.name]) self.frame.append(flyout.elem);

            self.flyouts[aspect.name] = self.flyout = flyout;flyout.detach(true);
            self.params = self.encodeParams(self.flyout.encodeState(self.href));

            self.scrollers.frame.scroll(0);
            self.layout(true);

            return false;

        },

        show : function(aspect,model) {

            var self = this;

            self.flyouts = {};
            self.clearErrors();

            self.href = $uri(self.panel.href);
            self.orig = self.encodeParams(self.href);

            self.buildFlyout(aspect,model);
            AspectFlyout.superclass.show.call(self,{mask:{form:self.form}});

            self.selectOther(aspect);

            $("body").trigger("hidePopOvers");

            snap.publish('rover',{an:'Dash.AspectFlyout.show',ex1:aspect.name},self);

        },

        hide : function() {
            var self = this;self.detachFlyouts();
            AspectFlyout.superclass.hide.call(self);

        },

        showError : function(selector) {
            var error = $('div.asp-e.'.concat(selector),this.form);
            if (error.length) error.show();
            return false;
        },

        clearErrors : function() {
            $('div.asp-e',this.form).hide();
            return true;
        },

        encodeParams : function(href) {
            var params = href.encodeParams(href.params).split("&");
            return params.sort().join("&");
        },

        detachFlyouts : function(keep) {
            var self = this,flyouts = self.flyouts;
            for (var name in flyouts) if (name != keep) {
                flyouts[name].detach(false); delete flyouts[name];
            }
        },

        selectOther : function(aspect) {

            var self = this;selected = self.selected;self.selected = aspect;
            if (selected) self.others[selected.name].toggleClass('s');

            var other = self.others[aspect.name];
            other.append(self.chevron).toggleClass('s');

            var height = Math.round(other.outerHeight()/2);
            self.chevron.css({top:'0px','border-top-width':height,'border-bottom-width':height});

        },

        onOther : function(event) {

            var self = this;

            var aspect = event.data;
            if (aspect == self.selected) return;
            else if (self.loading) return;

            self.clearErrors();

            var valid = self.flyout.isValid(self.href);
            if (valid == false) return false;

            self.loading = true;
            self.selectOther(aspect);

            var params = self.encodeParams(self.flyout.encodeState(self.href));
            var flyout = self.flyouts[aspect.name];self.flyout.elem.detach();

            if (flyout && (params == self.params)) return self.buildFlyout(aspect);
            else if (params != self.params) self.detachFlyouts(self.flyout.name);

            self.buildOtherRequest(aspect);

            return false;

        },

        buildOtherRequest : function(aspect) {

            var self = this,request = aspect.buildRequest(self.href.getUrl());
            $.ajax({url:request.getUrl(),success:self.onOtherSuccess.bind(self,aspect),error:self.onOtherError.bind(self,aspect)});

            self.throbber.show();

        },

        onOtherSuccess : function(aspect,model) {
            this.buildFlyout(aspect,model);
        },

        onOtherError : function(aspect,response) {
            var self = this;
            self.loading = false;self.throbber.hide();
            self.showError('system-error');
        },

        onCancel : function(event) {
            var self = this;self.flyout.elem.remove();self.throbber.hide();self.hide();
            if (event) snap.publish('rover',{an:'Dash.AspectFlyout.cancel'},self);
            return false;
        },

        onSubmit : function(event) {

            var self = this;

            var valid = self.flyout.isValid(self.href);
            if (valid == false) return false;

            self.href = self.flyout.encodeState(self.href);
            self.href = self.flyout.cleanParams(self.href);
            self.params = self.encodeParams(self.href);

            if (self.params == self.orig) return self.showError('make-selection');

            snap.publish('query',self.href.getUrl(),self);
            return self.onCancel(false);

        },

        destroy : function() {
            var self = this;self.detachFlyouts();
            AspectFlyout.superclass.destroy.call(self);
        }

    });

    return AspectFlyout;

});

