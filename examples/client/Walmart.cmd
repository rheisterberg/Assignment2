
setlocal

set root=..\..\lib\client

copy /B^
 %root%\walmart\autofill\AutoFillLayer.4cc.js^
+%root%\walmart\aspects\Aspects.4cc.js^
+%root%\walmart\aspects\GlobalAspects.4cc.js^
+%root%\walmart\aspects\SellerAspect.4cc.js^
+%root%\walmart\aspects\DistanceAspect.4cc.js^
+%root%\walmart\categories\Categories.4cc.js^
+%root%\walmart\controls\ControlBar.4cc.js^
+%root%\walmart\controls\Pagination.4cc.js^
+%root%\walmart\related\Related.4cc.js^
+%root%\walmart\results\Results.4cc.js^
 Content.js

copy /B^
 %root%\walmart\autofill\AutoFillLayer.dust.js^
+%root%\walmart\aspects\AspectPanel.dust.js^
+%root%\walmart\aspects\AspectFlyout.dust.js^
+%root%\walmart\aspects\DateAspect.dust.js^
+%root%\walmart\aspects\DateAspectFlyout.dust.js^
+%root%\walmart\aspects\DefaultAspect.dust.js^
+%root%\walmart\aspects\DistanceAspectRadius.dust.js^
+%root%\walmart\aspects\DistanceAspectFlyout.dust.js^
+%root%\walmart\aspects\FashionBrandAspect.dust.js^
+%root%\walmart\aspects\FashionColorAspect.dust.js^
+%root%\walmart\aspects\FashionColorAspectValue.dust.js^
+%root%\walmart\aspects\MultiListingAspectFlyout.dust.js^
+%root%\walmart\aspects\PriceAspect.dust.js^
+%root%\walmart\aspects\PriceFormAspect.dust.js^
+%root%\walmart\aspects\PriceFormAspectFlyout.dust.js^
+%root%\walmart\aspects\PriceSliderAspect.dust.js^
+%root%\walmart\aspects\SellerAspectFlyout.dust.js^
+%root%\walmart\aspects\TiledAspectValue.dust.js^
+%root%\walmart\categories\CategoryTab.dust.js^
+%root%\walmart\categories\CategoryTabs.dust.js^
+%root%\walmart\constraints\Constraints.dust.js^
+%root%\walmart\controls\Items.dust.js^
+%root%\walmart\controls\Pager.dust.js^
+%root%\walmart\controls\SortBy.dust.js^
+%root%\walmart\controls\ViewAs.dust.js^
+%root%\walmart\controls\Listings.dust.js^
+%root%\walmart\related\Related.dust.js^
+%root%\walmart\views\list\ListItem.dust.js^
+%root%\walmart\views\list\ListProduct.dust.js^
+%root%\walmart\views\gallery\GalleryItem.dust.js^
+%root%\walmart\views\gallery\GalleryProduct.dust.js^
+%root%\walmart\results\Results.dust.js^
 Templates.js

copy /B^
 %root%\walmart\autofill\AutoFillInput.js^
+%root%\walmart\autofill\AutoFillLayer.js^
+%root%\walmart\aspects\AspectType.js^
+%root%\walmart\aspects\AspectPanel.js^
+%root%\walmart\aspects\AspectFlyout.js^
+%root%\walmart\aspects\DateAspect.js^
+%root%\walmart\aspects\DateAspectFlyout.js^
+%root%\walmart\aspects\DateAspectCalendar.js^
+%root%\walmart\aspects\DefaultAspect.js^
+%root%\walmart\aspects\DefaultAspectFlyout.js^
+%root%\walmart\aspects\DistanceAspectFlyout.js^
+%root%\walmart\aspects\GroupAspect.js^
+%root%\walmart\aspects\GroupAspectFlyout.js^
+%root%\walmart\aspects\FashionBrandAspect.js^
+%root%\walmart\aspects\FashionColorAspect.js^
+%root%\walmart\aspects\PriceFormAspect.js^
+%root%\walmart\aspects\PriceFormAspectFlyout.js^
+%root%\walmart\aspects\PriceSliderAspect.js^
+%root%\walmart\aspects\PriceSliderAspectFlyout.js^
+%root%\walmart\aspects\LocationAspect.js^
+%root%\walmart\aspects\LocationAspectFlyout.js^
+%root%\walmart\aspects\SellerAspect.js^
+%root%\walmart\aspects\SellerAspectFlyout.js^
+%root%\walmart\categories\CategoryTab.js^
+%root%\walmart\categories\CategoryTabs.js^
+%root%\walmart\categories\CategoryTabsLayout.js^
+%root%\walmart\categories\CategoryFlyout.js^
+%root%\walmart\categories\CategoryPanel.js^
+%root%\walmart\constraints\Constraints.js^
+%root%\walmart\related\Related.js^
+%root%\walmart\results\Results.js^
+%root%\walmart\controls\Items.js^
+%root%\walmart\controls\Pager.js^
+%root%\walmart\controls\SortBy.js^
+%root%\walmart\controls\ViewAs.js^
+%root%\walmart\controls\Listings.js^
+%root%\walmart\views\item\ItemView.js^
+%root%\walmart\views\item\ItemDetails.js^
+%root%\walmart\views\item\ItemTemplatesHelpers.js^
+%root%\walmart\views\item\ItemTemplatingHelpers.js^
+%root%\walmart\views\list\ListView.js^
+%root%\walmart\views\gallery\GalleryView.js^
+%root%\walmart\tracker\Tracker.js^
+Content.js^
+Templates.js^
 Walmart.js

 copy /B^
 %root%\walmart\autofill\AutoFillInput.css^
+%root%\walmart\autofill\AutoFillLayer.css^
+%root%\walmart\aspects\AspectPanel.css^
+%root%\walmart\aspects\AspectFlyout.css^
+%root%\walmart\aspects\DateAspect.css^
+%root%\walmart\aspects\DateAspectFlyout.css^
+%root%\walmart\aspects\DistanceAspectFlyout.css^
+%root%\walmart\aspects\FashionBrandAspect.css^
+%root%\walmart\aspects\FashionColorAspect.css^
+%root%\walmart\aspects\LocationAspectFlyout.css^
+%root%\walmart\aspects\PriceFormAspect.css^
+%root%\walmart\aspects\PriceFormAspectFlyout.css^
+%root%\walmart\aspects\PriceSliderAspect.css^
+%root%\walmart\aspects\PriceSliderAspectFlyout.css^
+%root%\walmart\aspects\SellerAspectFlyout.css^
+%root%\walmart\categories\CategoryTabs.css^
+%root%\walmart\categories\CategoryFlyout.css^
+%root%\walmart\constraints\Constraints.css^
+%root%\walmart\controls\Controls.css^
+%root%\walmart\related\Related.css^
+%root%\walmart\result\Results.css^
+%root%\walmart\views\item\ItemView.css^
+%root%\walmart\views\list\ListView.css^
+%root%\walmart\views\gallery\GalleryItem.css^
+%root%\walmart\controls\Items.css^
+%root%\walmart\controls\Pager.css^
+%root%\walmart\controls\SortBy.css^
+%root%\walmart\controls\ViewAs.css^
+%root%\walmart\controls\Listings.css^
 Walmart.css

 del Content.js
 del Templates.js

 endlocal
