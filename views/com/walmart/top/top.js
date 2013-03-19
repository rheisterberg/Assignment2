
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

