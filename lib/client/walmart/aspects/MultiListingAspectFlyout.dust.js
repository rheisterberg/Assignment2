(function(){dust.register("walmart.aspects.MultiListingAspectFlyout",body_0);function body_0(chk,ctx){return chk.write("<div id=\"").reference(ctx.get("eid"),ctx,"h").write("\" class=\"cbx listing\"><div class=\"asp-e LH_MIL\"><b class=\"sprIconStatusMsg\"/>").section(ctx.get("content"),ctx,{},{"path":"srp_snap/Aspects.enterValidNumber"}).write("</div><a class=\"cbx\"><input type=\"checkbox\" class=\"cbx\" name=\"LH_MIL\" value=\"1\"><span class=\"cbx\">").section(ctx.get("content"),ctx,{},{"path":"srp_snap/Aspects.multipleItemListing"}).write("</span></a></div>");}return body_0;})();