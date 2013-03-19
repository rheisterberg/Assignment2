
document = require('jsdom').jsdom('<html><head></head><body></body></html>');
window = document.createWindow();

$ = require('jquery').create(window);

dust = require('dustjs-linkedin');
require('dustjs-helpers');

require('./Bootstrap');
require('./Registry');

require('./Observable.js');
require('./Messaging.js');
require('./Layout.js');

require('./Draggable.js');
require('./Droppable.js');

require('./Content.js');
require('./Context.js');

require('./Templates.js');

require('./Component.js');
require('./Component.dust.js');

require('./Container.js');
require('./Container.dust.js');



