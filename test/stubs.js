import AbstractConnection from '../src/AbstractConnection';

export class WebSocketConnectionStub extends AbstractConnection {
  constructor(url, dispatch) {
    super(url, dispatch);
    this.connection_type = 'websocket';
  }
}

export class HttpConnectionStub extends AbstractConnection {
  constructor(url, dispatch) {
    super(url, dispatch);
    this.connection_type = 'http';
  }
}

export class WebSocketRailsStub {
  constructor() {
    this.state = 'connected';
    this._conn = {
      connection_id: 12345,
    };
  }

  new_message() {
    return true;
  }

  dispatch() {
    return true;
  }

  trigger_event() {
    return true;
  }
}

export class WebSocketStub {
  constructor(url, dispatcher) {
    this.url = url;
    this.dispatcher = dispatcher;
  }

  send() {
    return true;
  }

  close() {
    this.onclose(null);
  }
}

