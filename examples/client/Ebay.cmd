
setlocal

set root=..\..\lib\client

copy /B^
 %root%\ebay\context\Context.js^
+%root%\ebay\cookies\Cookies.js^
+%root%\ebay\errors\Errors.js^
+%root%\ebay\profiler\Profiler.js^
+%root%\ebay\profiler\Performance.js^
+%root%\ebay\resources\Resources.js^
+%root%\ebay\utils\NumberFormatter.js^
+%root%\ebay\utils\CurrencyFormatter.js^
+%root%\ebay\user\User.js^
 Ebay.js
 
endlocal