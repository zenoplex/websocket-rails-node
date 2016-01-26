import Event from './Event';

export default class Channel {
  constructor(name, _dispatcher, is_private, on_success, on_failure) {
    let event_name;
    let ref;

    this.name = name;
    this._dispatcher = _dispatcher;
    this.is_private = is_private != null ? is_private : false;
    this.on_success = on_success;
    this.on_failure = on_failure;
    this._failure_launcher = this._failure_launcher.bind(this);
    this._success_launcher = this._success_launcher.bind(this);
    this._callbacks = {};
    this._token = void 0;
    this._queue = [];

    if (this.is_private) {
      event_name = 'websocket_rails.subscribe_private';
    } else {
      event_name = 'websocket_rails.subscribe';
    }
    this.connection_id = (ref = this._dispatcher._conn) != null ? ref.connection_id : void 0;

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
    let ref;

    if (this.connection_id === ((ref = this._dispatcher._conn) != null ? ref.connection_id : void 0)) {
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
    return this._callbacks = {};
  }

  bind(event_name, callback) {
    let base;
    if ((base = this._callbacks)[event_name] == null) {
      base[event_name] = [];
    }
    return this._callbacks[event_name].push(callback);
  }

  unbind(event_name) {
    return delete this._callbacks[event_name];
  }

  trigger(event_name, message) {
    const event = new Event([
      event_name, {
        channel: this.name,
        data:    message,
        token:   this._token,
      }, this.connection_id,
    ]);
    if (!this._token) {
      return this._queue.push(event);
    } else {
      return this._dispatcher.trigger_event(event);
    }
  }

  dispatch(event_name, message) {
    var callback, i, len, ref, ref1, results;
    if (event_name === 'websocket_rails.channel_token') {
      this.connection_id = (ref = this._dispatcher._conn) != null ? ref.connection_id : void 0;
      this._token = message['token'];
      return this.flush_queue();
    } else {
      if (this._callbacks[event_name] == null) {
        return;
      }
      ref1 = this._callbacks[event_name];
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        callback = ref1[i];
        results.push(callback(message));
      }
      return results;
    }
  }

  _success_launcher(data) {
    if (this.on_success != null) {
      return this.on_success(data);
    }
  }

  _failure_launcher(data) {
    if (this.on_failure != null) {
      return this.on_failure(data);
    }
  }

  flush_queue() {
    var event, i, len, ref;
    ref = this._queue;
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      this._dispatcher.trigger_event(event);
    }
    return this._queue = [];
  }
}
