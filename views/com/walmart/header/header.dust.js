(function(){
    dust.register("com.walmart.header",body_0);
    function body_0(chk,ctx){
        return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" style=\"height:100px;text-align:center\">Header</div>");
    }
    return body_0;
})();