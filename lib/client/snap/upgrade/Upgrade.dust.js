(function(){dust.register("snap.upgrade.Upgrade",body_0);function body_0(chk,ctx){return chk.write("<div class=\"upgrd-msg\"><h3 class=\"header\">").reference(ctx.get("title"),ctx,"h").write("</h3><div>").reference(ctx.get("message"),ctx,"h").write("</div><div class=\"upgrd-lnks\"><a class=\"upgrd-lnk firefox\" tabindex=\"-1\" href=\"http://www.mozilla.org/firefox\"></a><a class=\"upgrd-lnk chrome\" tabindex=\"-1\" href=\"https://www.google.com/chrome\"></a><a class=\"upgrd-lnk explorer\" tabindex=\"-1\" href=\"http://windows.microsoft.com/ie\"></a><a class=\"upgrd-lnk safari\" tabindex=\"-1\" href=\"http://www.apple.com/safari\"></a></div></div>");}return body_0;})();