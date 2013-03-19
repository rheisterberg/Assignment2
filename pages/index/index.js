
define('com.walmart.header',function() {

    var Header = function(config) {
        Header.superclass.constructor.call(this,config);
    };

    snap.inherit(Header,'snap.Component');
    snap.extend(Header.prototype,{

        classes:{elem:'head'}

    });

    return Header;

});


snap.define('com.walmart.top',function(snap) {

    var Top = function(config) {
        Top.superclass.constructor.call(this,config);
    };

    snap.inherit(Top,'snap.Component');
    snap.extend(Top.prototype,{

        classes:{elem:'top'}

    });

    return Top;

});


snap.define('com.walmart.left',function(snap) {

    var Left = function(config) {
        Left.superclass.constructor.call(this,config);
    };

    snap.inherit(Left,'snap.Component');
    snap.extend(Left.prototype,{

        classes:{elem:'left'}

    });

    return Left;

});


snap.define('com.walmart.right',function(snap) {

    var Right = function(config) {
        Right.superclass.constructor.call(this,config);
    };

    snap.inherit(Right,'snap.Component');
    snap.extend(Right.prototype,{

        classes:{elem:'right'}

    });

    return Right;

});


snap.define('com.walmart.center',function(snap) {

    var Center = function(config) {
        Center.superclass.constructor.call(this,config);
    };

    snap.inherit(Center,'snap.Component');
    snap.extend(Center.prototype,{

        classes:{elem:'center'}

    });

    return Center;

});


snap.define('com.walmart.bottom',function(snap) {

    var Bottom = function(config) {
        Bottom.superclass.constructor.call(this,config);
    };

    snap.inherit(Bottom,'snap.Component');
    snap.extend(Bottom.prototype,{

        classes:{elem:'bottom'}

    });

    return Bottom;

});


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

