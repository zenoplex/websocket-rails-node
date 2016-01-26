import AbstractConnection from './AbstractConnection';

export default class WebSocketConnection extends AbstractConnection {
  constructor(url, dispatcher) {
    super(url, dispatcher);

    this.url = url;
    this.connection_type = 'websocket';

    if (this.url.match(/^wss?:\/\//)) {
      console.log('WARNING: Using connection urls with protocol specified is depricated');
    } else if (window.location.protocol === 'https:') {
      this.url = 'wss://' + this.url;
    } else {
      this.url = 'ws://' + this.url;
    }

    this._conn = new WebSocket(this.url);
    this._conn.onmessage = (() => {
      return event => {
        const event_data = JSON.parse(event.data);
        return this.on_message(event_data);
      };
    })();

    this._conn.onmessage = (() => {
      return event => {
        const event_data = JSON.parse(event.data);
        return this.on_message(event_data);
      };
    })();

    this._conn.onclose = (() => {
      return event => {
        return this.on_close(event);
      };
    })();

    this._conn.onerror = (() => {
      return event => {
        return this.on_error(event);
      };
    })();
  }

  close() {
    return this._conn.close();
  }

  send_event(event) {
    super.send_event(event);
    return this._conn.send(event.serialize());
  }
}
