
snap.define('com.walmart.footer',function(snap) {

    var Footer = function(config) {
        Footer.superclass.constructor.call(this,config);
    };

    snap.inherit(Footer,'snap.Component');
    snap.extend(Footer.prototype,{

        classes:{elem:'footer'}

    });

    return Footer;

});

