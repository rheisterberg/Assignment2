
define('snap.tree.Tree',function(snap) {

    //> public Tree(Object? config)
    var Tree = function(config) {
        Tree.superclass.constructor.call(this,config);
    };

    snap.inherit(Tree,'snap.Container');
    snap.extend(Tree.prototype,{

        classes:{elem:'tree'},manager:'snap.tree.TreeLayout'

    });

    return Tree;

});
