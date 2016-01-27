import Event from './Event';

export default class Channel {
  constructor(name, _dispatcher, is_private = false, on_success, on_failure) {
    let event_name;

    this.name = name;
    this._dispatcher = _dispatcher;
    this.is_private = is_private;
    this.on_success = on_success;
    this.on_failure = on_failure;
    this._callbacks = {};
    this._token = void 0;
    this._queue = [];

    if (this.is_private) {
      event_name = 'websocket_rails.subscribe_private';
    } else {
      event_name = 'websocket_rails.subscribe';
    }

    if (this._dispatcher._conn) {
      this.connection_id = this._dispatcher._conn.connection_id;
    }

    const event = new Event([
      event_name, {
        data: {
          channel: this.name,
        },
      }, this.connection_id,
    ], this._success_launcher, this._failure_launcher);
    this._dispatcher.trigger_event(event);
  }

  destroy() {
    if (this.connection_id === (this._dispatcher._conn && this._dispatcher._conn.connection_id)) {
      const event_name = 'websocket_rails.unsubscribe';
      const event = new Event([
        event_name, {
          data: {
            channel: this.name,
          },
        }, this.connection_id,
      ]);
      this._dispatcher.trigger_event(event);
    }

    return (this._callbacks = {});
  }

  bind(eventName, callback) {
    const { _callbacks } = this;

    if (!_callbacks[eventName]) {
      _callbacks[eventName] = [];
    }

    return _callbacks[eventName].push(callback);
  }

  unbind(eventName) {
    return delete this._callbacks[eventName];
  }

  trigger(eventName, message) {
    const { name, _token, connection_id, _queue, _dispatcher } = this;

    const event = new Event([
      eventName, {
        channel: name,
        data:    message,
        token:   _token,
      }, connection_id,
    ]);
    if (!_token) {
      return _queue.push(event);
    }
    return _dispatcher.trigger_event(event);
  }

  dispatch(eventName, message) {
    if (eventName === 'websocket_rails.channel_token') {
      this.connection_id = (this._dispatcher._conn && this._dispatcher._conn.connection_id);
      this._token = message.token;
      return this.flush_queue();
    }

    if (this._callbacks[eventName]) {
      return this._callbacks[eventName].map(item => item(message));
    }
  }

  _success_launcher(data) {
    const { on_success } = this;

    if (on_success) {
      return on_success(data);
    }
  }

  _failure_launcher(data) {
    const { on_failure } = this;

    if (on_failure) {
      return on_failure(data);
    }
  }

  flush_queue() {
    this._queue.forEach(item => {
      this._dispatcher.trigger_event(item);
    });

    return (this._queue = []);
  }
}
