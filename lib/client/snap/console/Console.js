
define('snap.console.Console',function(snap) {

    var Tab = snap.require('snap.tabs.Tab');
    var Tabs = snap.require('snap.tabs.Tabs');

    var Button = snap.require('snap.button.Button');
    var Toolbar = snap.require('snap.toolbar.Toolbar');

    var Registry = snap.require('snap.Registry');

    //> public Console(Object? config)
    var Console = function(config) {

        var self = this;self.opts = {debug:true,except:true,attach:false,detach:false,dispatch:false};
        Console.superclass.constructor.call(self,config);
        self.elem.bind('keydown',self.keys.bind(self));

        self.appendChild(self.renderTabs());
        self.appendChild(self.renderToolbar());

        $(document).bind('keydown',self.ctrl.bind(self));
        $(document).bind('contextmenu',self.context.bind(self));

        snap.log = function() { self.log.apply(self,arguments); };

    };

    snap.inherit(Console,'snap.window.Window');
    snap.extend(Console.prototype,{

        classes:{elem:'win con'},draggable:true,resizable:true,modal:false,

        started:new Date().getTime(),

        elapsed : function() {
            return new Date().getTime() - this.started;
        },

        renderToolbar : function() {
            var self = this,toolbar = new Toolbar();
            var clear = toolbar.appendChild(new Button({text:'Clear',classes:{elem:'sml blue'}}));
            clear.subscribe('click',self.clear,self);
            return toolbar;
        },

        renderTabs : function() {

            var self = this;self.tab = {};

            self.tabs = new Tabs({autosize:true});

            self.tab['debug'] = self.tabs.appendChild(self.renderTab('Debug'));
            self.tab['except'] = self.tabs.appendChild(self.renderTab('Errors'));

            self.tabs.subscribe('select',self.selectTab,self);
            self.tabs.publish('select',self.tab['debug']);

            return self.tabs;

        },

        renderTab : function(title) {
            return new Tab({title:title,content:'<div class="con-c" />'});
        },

        selectTab : function(event,tab) {
            this.selected = tab;
        },

        clear : function(event) {
            $('.con-c',this.selected.elem).html('');
            return false;
        },

        ctrl : function(event) {
            if (event.keyCode == 27) return this.hide();
        },

        keys : function(event) {
            if ((event.keyCode == 65) && event.ctrlKey) return this.select();
        },

        select : function() {
            $doc.selectRange(this.selected.elem[0]);
            return false;
        },

        context : function(event) {

            var element = event.ctrlKey?$(event.target).closest('[oid]'):null;
            if (!element || (element.length <= 0)) return;

            var object = Registry.object(element.attr('oid'));
            snap.log('debug',object.constructor.getName(),object.cid || object.oid);

            return false;

        },

        output : function(type) {

            var self = this;
            if (!self.opts[type]) return;

            var log = $('<div class="log"/>').append(self.time());
            var text = $('<div class="text"/>').appendTo(log),data = '['.concat(type,']');

            for (var idx = 1,len = arguments.length;(idx < len);idx++) data = data.concat(' ',arguments[idx]);text.html(data);

            var tab = (self.tab[type] || self.tab['debug']);
            var body = tab.elem[0];$('.con-c',body).append(log);

            body.scrollTop = Math.max(body.scrollHeight - body.offsetHeight,0);
            if (window.console) window.console.log(data);

            return log;

        },

        log : function(type) {

            var self = this;

            if (type instanceof Array) return self.log.apply(self,type);
            else if (type.match(/event/)) return self.event.apply(self,arguments);
            else if (type.match(/except/)) return self.except.apply(self,arguments);
            else self.output.apply(self,arguments);

        },

        event : function(type,action,handler) {
            if (handler.scope == this) return;
            else this.output.apply(this,arguments);
        },

        except : function(type) {
            this.output.apply(this,arguments).addClass('err');
        },

        time : function() {
            var time = $('<div class="time"/>'),elapsed = new String(this.elapsed() + 1000000);
            var seconds = elapsed.substring(1,4),millis = elapsed.substring(4,7);
            return time.html(seconds.concat('.',millis));
        }

    });

    Console.show = function() {

        var console = new Console({title:'Snap Console'});

        Console.show = console.show.bind(console);
        Console.hide = console.hide.bind(console);

        Console.show();

    };

    $(document).bind('keydown',function(event) {
        var key = event.keyCode,ctrl = event.ctrlKey,shift = event.shiftKey;
        if ((key == 68) && ctrl && shift) Console.show();
    }.bind(self));

    return Console;

});
