
setlocal

set root=.\

copy /B^
 %root%\views\header\header.dust.js^
+%root%\views\crumbs\crumbs.dust.js^
+%root%\views\slider\slider.dust.js^
+%root%\views\filter\filter.dust.js^
+%root%\views\items\items.dust.js^
 dust.js

copy /B^
 %root%\views\header\header.js^
+%root%\views\crumbs\crumbs.js^
+%root%\views\slider\handle.js^
+%root%\views\slider\slider.js^
+%root%\views\filter\filter.js^
+%root%\views\filter\type\type.js^
+%root%\views\filter\brand\brand.js^
+%root%\views\filter\sort\sort.js^
+%root%\views\items\items.js^
+dust.js^
 product.js

endlocal

