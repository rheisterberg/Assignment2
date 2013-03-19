
setlocal

set root=..\..\lib\client

copy /B^
 %root%\snap\Bootstrap.js^
 Base.js

copy /B^
 %root%\snap\Component.dust.js^
+%root%\snap\Container.dust.js^
+%root%\snap\anchor\Anchor.dust.js^
+%root%\snap\button\Button.dust.js^
+%root%\snap\border\BorderLayout.dust.js^
+%root%\snap\calendar\Month.dust.js^
+%root%\snap\carousel\VerticalCarouselLayout.dust.js^
+%root%\snap\carousel\HorizontalCarouselLayout.dust.js^
+%root%\snap\checkbox\Checkbox.dust.js^
+%root%\snap\fingers\FingerTab.dust.js^
+%root%\snap\fingers\FingerTabs.dust.js^
+%root%\snap\form\Form.dust.js^
+%root%\snap\form\Input.dust.js^
+%root%\snap\form\Select.dust.js^
+%root%\snap\form\TextArea.dust.js^
+%root%\snap\menu\Menu.dust.js^
+%root%\snap\menu\Item.dust.js^
+%root%\snap\panel\Panel.dust.js^
+%root%\snap\radio\Radio.dust.js^
+%root%\snap\rollup\Rollup.dust.js^
+%root%\snap\slider\SliderBase.dust.js^
+%root%\snap\tabs\Tab.dust.js^
+%root%\snap\tabs\Tabs.dust.js^
+%root%\snap\tetris\TetrisLayout.dust.js^
+%root%\snap\toolbar\ToolButton.dust.js^
+%root%\snap\page\Page.dust.js^
+%root%\snap\page\PageLayout.dust.js^
+%root%\snap\scrollbar\horizontal\HorizontalScrollbar.dust.js^
+%root%\snap\scrollbar\vertical\VerticalScrollbar.dust.js^
+%root%\snap\window\Window.dust.js^
+%root%\snap\bubble\Bubble.dust.js^
+%root%\snap\upgrade\Upgrade.dust.js^
 Templates.js


copy /B^
 %root%\snap\Templates.js^
 Templating.js

copy /B^
 Base.js^
+%root%\snap\ecma\Json.js^
+%root%\snap\html5\Html5.js^
+%root%\thirdparty\jquery\JQueryNoMin.js^
+%root%\thirdparty\history\history.adapter.jquery.js^
+%root%\thirdparty\history\history.html4.js^
+%root%\thirdparty\history\history.js^
+%root%\thirdparty\linkedin\dust.js^
+%root%\thirdparty\linkedin\dust-helpers.js^
+%root%\snap\Registry.js^
+%root%\snap\Layout.js^
+%root%\snap\Observable.js^
+%root%\snap\Messaging.js^
+%root%\snap\Content.js^
+%root%\snap\Context.js^
+Templating.js^
+%root%\snap\Component.js^
+%root%\snap\Draggable.js^
+%root%\snap\Container.js^
+%root%\snap\Droppable.js^
+%root%\snap\anchor\Anchor.js^
+%root%\snap\button\Button.js^
+%root%\snap\calendar\Calendar.js^
+%root%\snap\carousel\VerticalCarouselLayout.js^
+%root%\snap\carousel\HorizontalCarouselLayout.js^
+%root%\snap\checkbox\Checkbox.js^
+%root%\snap\fingers\FingerTab.js^
+%root%\snap\fingers\FingerTabs.js^
+%root%\snap\fingers\FingerTabsLayout.js^
+%root%\snap\menu\Item.js^
+%root%\snap\menu\Menu.js^
+%root%\snap\menu\MenuLayout.js^
+%root%\snap\panel\Panel.js^
+%root%\snap\rollup\Rollup.js^
+%root%\snap\window\Mask.js^
+%root%\snap\dragger\Dragger.js^
+%root%\snap\radio\Radio.js^
+%root%\snap\resizer\Resizer.js^
+%root%\snap\scrollbar\horizontal\HorizontalScrollbar.js^
+%root%\snap\scrollbar\horizontal\HorizontalScroller.js^
+%root%\snap\scrollbar\vertical\VerticalScroller.js^
+%root%\snap\scrollbar\vertical\VerticalScrollbar.js^
+%root%\snap\slider\SliderBase.js^
+%root%\snap\slider\SliderHandle.js^
+%root%\snap\slider\range\SliderRange.js^
+%root%\snap\slider\currency\SliderCurrency.js^
+%root%\snap\slider\enumeration\SliderEnumeration.js^
+%root%\snap\slider\logarithmic\SliderLogarithmic.js^
+%root%\snap\progress\ProgressBar.js^
+%root%\snap\window\Stack.js^
+%root%\snap\window\Window.js^
+%root%\snap\bubble\Bubble.js^
+%root%\snap\console\Console.js^
+%root%\snap\splitter\Splitter.js^
+%root%\snap\throbber\Throbber.js^
+%root%\snap\form\Form.js^
+%root%\snap\form\Input.js^
+%root%\snap\form\InputButton.js^
+%root%\snap\form\InputCheckbox.js^
+%root%\snap\form\InputFile.js^
+%root%\snap\form\InputHidden.js^
+%root%\snap\form\InputImage.js^
+%root%\snap\form\InputPassword.js^
+%root%\snap\form\InputRadio.js^
+%root%\snap\form\InputReset.js^
+%root%\snap\form\InputSubmit.js^
+%root%\snap\form\InputText.js^
+%root%\snap\form\Select.js^
+%root%\snap\form\TextArea.js^
+%root%\snap\accordion\AccordionLayout.js^
+%root%\snap\border\BorderLayout.js^
+%root%\snap\frame\FrameLayout.js^
+%root%\snap\horizontal\HorizontalLayout.js^
+%root%\snap\page\Page.js^
+%root%\snap\page\PageLayout.js^
+%root%\snap\scroller\Scroller.js^
+%root%\snap\tabs\Tab.js^
+%root%\snap\tabs\Tabs.js^
+%root%\snap\tabs\TabsLayout.js^
+%root%\snap\tetris\TetrisLayout.js^
+%root%\snap\toolbar\ToolBar.js^
+%root%\snap\toolbar\ToolButton.js^
+%root%\snap\toolbar\ToolBarLayout.js^
+%root%\snap\tree\Tree.js^
+%root%\snap\tree\TreeNode.js^
+%root%\snap\tree\TreeLayout.js^
+%root%\snap\tree\TreeLoader.js^
+%root%\snap\upgrade\Upgrade.js^
+%root%\snap\vertical\VerticalLayout.js^
+Ebay.js^
+Client.js^
+Templates.js^
 Snap.js

del Base.js
del Templates.js
del Templating.js

 copy /B^
 %root%\snap\Reset.css^
+%root%\snap\Global.css^
+%root%\snap\border\Border.css^
+%root%\snap\button\Button.css^
+%root%\snap\calendar\Calendar.css^
+%root%\snap\carousel\VerticalCarousel.css^
+%root%\snap\carousel\HorizontalCarousel.css^
+%root%\snap\checkbox\Checkbox.css^
+%root%\snap\fingers\FingerTabs.css^
+%root%\snap\menu\Menu.css^
+%root%\snap\page\PageLayout.css^
+%root%\snap\panel\Panel.css^
+%root%\snap\rollup\Rollup.css^
+%root%\snap\scroller\Scroller.css^
+%root%\snap\tabs\Tabs.css^
+%root%\snap\tetris\TetrisLayout.css^
+%root%\snap\throbber\Throbber.css^
+%root%\snap\toolbar\ToolBar.css^
+%root%\snap\toolbar\ToolButton.css^
+%root%\snap\tree\Tree.css^
+%root%\snap\window\Window.css^
+%root%\snap\bubble\Bubble.css^
+%root%\snap\console\Console.css^
+%root%\snap\radio\Radio.css^
+%root%\snap\resizer\Resizer.css^
+%root%\snap\scrollbar\horizontal\HorizontalScrollbar.css^
+%root%\snap\scrollbar\horizontal\HorizontalScrollbarLayout.css^
+%root%\snap\scrollbar\vertical\VerticalScrollbar.css^
+%root%\snap\scrollbar\vertical\VerticalScrollbarLayout.css^
+%root%\snap\slider\Slider.css^
+%root%\snap\sprites\Sprites.css^
+%root%\snap\progress\ProgressBar.css^
+%root%\snap\splitter\Splitter.css^
+%root%\snap\upgrade\Upgrade.css^
 Snap.css

endlocal
