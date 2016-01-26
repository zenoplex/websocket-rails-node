import jsdom from 'jsdom';

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

global.document = doc;
global.window = win;

// output window[key]s' to global so it can be used without window
for (const key in window) {
  if (!window.hasOwnProperty(key)) continue;
  if (key in global) continue;

  global[key] = window[key];
}

window['WebSocket'] = {};
global['WebSocket'] = {};

window.helpers = global.helpers = {
  startConnection: (dispatcher, connection_id = 1) => {
    const message = {
      data: {
        connection_id: connection_id,
      },
    };
    return dispatcher.new_message([['client_connected', message]]);
  },
};
