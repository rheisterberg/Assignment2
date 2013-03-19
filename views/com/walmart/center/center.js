
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

