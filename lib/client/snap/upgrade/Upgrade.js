
define('snap.upgrade.Upgrade',function(snap) {

    var Window = snap.require('snap.window.Window');

    var Cookies = snap.require('ebay.cookies');

    var browsers = {
        explorer:{title:'Explorer',match:/(MSIE)\s*([\d\.]*)/,major:8},
        firefox:{title:'Firefox',match:/(Firefox)\/([\d\.]*)/,major:11},
        safari:{title:'Safari',match:/(Version)\/([\d\.]*).*Safari/,major:5},
        chrome:{title:'Chrome',match:/(Chrome)\/([\d\.]*)/,major:10}
    };

    //> public Upgrade(Object? config)
    var Upgrade = function(config) {

        var self = this,agent = navigator.userAgent;
        Upgrade.superclass.constructor.call(self,config);

        for (var name in browsers) {
            var match = agent.match(browsers[name].match);
            if (match) self.browser = snap.extend(browsers[name],{version:match[2]});
        }

        var cookie = Cookies.readCookie('dp1','pbf') || '#',upgrade;
        if ((upgrade = Cookies.getBitFlag(cookie,93)) && !self.force) return;

        var version = (self.browser && (self.browser.version < self.browser.major) && !agent.match(/compatible/)) ;
        if (version || self.force) $(window).bind('load',self.onLoad.bind(self));

        Cookies.writeCookielet('dp1','pbf',Cookies.setBitFlag(cookie,93,1));

    };

    snap.inherit(Upgrade,'snap.Observable');
    snap.extend(Upgrade.prototype,{

        onLoad : function(event) {

            var self = this;

            self.message = self.message.replace('#browser#',self.browser.title.concat(' ',self.browser.version));
            self.upgrade = new Window({classes:{elem:'upgrd'},modal:true,resizable:false});
            self.upgrade.show({content:snap.fragment(Upgrade,self)});

            $(document).bind('keydown',self.ctrl.bind(self));

        },

        ctrl : function(event) {
            if (event.keyCode == 27) this.upgrade.hide();
        }

    });

    return Upgrade;

});
