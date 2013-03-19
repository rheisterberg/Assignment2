
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

