(function(){dust.register("searchviews.item.ItemDetails",body_0);function body_0(chk,ctx){return chk.write("<table id=").reference(ctx.get("eid"),ctx,"h").write(" class=\"details\"><tbody><tr><td colspan=\"2\" style=\"padding:10px; text-align:right\"><img class=\"iv-c\" src=\"http://pics.ebaystatic.com/aw/pics/cmp/ds2/iconClose.png\"></td></tr><tr><td colspan=\"2\" style=\"padding:10px; text-align:center\">").exists(ctx.get("hasImage"),ctx,{"else":body_1,"block":body_2},null).write("</td></tr><tr><td class=\"lbl\">Title</td><td class=\"val\">").reference(ctx.get("title"),ctx,"h").write("</td></tr><tr><td class=\"lbl\">Subtitle</td><td class=\"val\">").reference(ctx.get("subtitle"),ctx,"h").write("</td></tr><tr><td class=\"lbl\">Category</td><td class=\"val\">").reference(ctx.get("category"),ctx,"h").write("</td></tr><tr><td class=\"lbl\">Bid Price</td><td class=\"val\">").reference(ctx.get("bidprice"),ctx,"h").write("</td></tr><tr><td class=\"lbl\">Bin Price</td><td class=\"val\">").reference(ctx.get("binprice"),ctx,"h").write("</td></tr><tr><td class=\"lbl\">Condition</td><td class=\"val\">").reference(ctx.get("condition"),ctx,"h").write("</td></tr><tr><td class=\"lbl\">Payment Method</td><td class=\"val\">").reference(ctx.get("paymentMethod"),ctx,"h").write("</td></tr><tr><td class=\"lbl\">Location</td><td class=\"val\">").reference(ctx.get("location"),ctx,"h").write("</td></tr><tr><td class=\"lbl\">Country</td><td class=\"val\">").reference(ctx.get("country"),ctx,"h").write("</td></tr></tr></tbody></table>");}function body_1(chk,ctx){return chk.write("No Photo");}function body_2(chk,ctx){return chk.write("<a class=\"img\" href=\"").reference(ctx.get("viewItemURL"),ctx,"h").write("\"><img alt=\"Item image\" class=\"").reference(ctx.get("getImageClass"),ctx,"h").write("\" src=\"").reference(ctx.get("getImageSrc"),ctx,"h").write("\"></a>");}return body_0;})();