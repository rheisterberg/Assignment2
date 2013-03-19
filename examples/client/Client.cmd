
setlocal
set root=..\..\lib\client

copy /B^
 %root%\snap\ajax\AjaxDefaultTransport.js^
+%root%\snap\ajax\AjaxScriptTransport.js^
+%root%\snap\ajax\AjaxRequest.js^
+%root%\snap\client\features\Features.js^
+%root%\snap\client\features\detector\Detector.js^
+%root%\snap\client\features\detector\Json.js^
+%root%\snap\client\features\detector\Html5.js^
+%root%\snap\client\features\detector\DataUri.js^
+%root%\snap\client\features\detector\Mutable.js^
+%root%\snap\client\features\detector\Performance.js^
+%root%\snap\client\features\detector\Canvas.js^
+%root%\snap\utils\Document.js^
+%root%\snap\utils\Style.js^
+%root%\snap\utils\Script.js^
+%root%\snap\utils\Loader.js^
+%root%\snap\utils\Uri.js^
+%root%\snap\utils\Base64.js^
+%root%\snap\utils\Utf8.js^
 Client.js
 
endlocal