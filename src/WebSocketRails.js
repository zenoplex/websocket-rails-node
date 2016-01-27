import Channel from './Channel';
import HttpConnection from './HttpConnection';
import WebSocketConnection from './WebSocketConnection';
import Event from './Event';

export default class WebSocketRails {
  constructor(url, use_websockets = true) {
    this.url = url;
    this.use_websockets = use_websockets;
    this.callbacks = {};
    this.channels = {};
    this.queue = {};
    this.connect();
  }

  connect() {
    this.state = 'connecting';
    if (!(this.supports_websockets() && this.use_websockets)) {
      this._conn = new HttpConnection(this.url, this);
    } else {
      this._conn = new WebSocketConnection(this.url, this);
    }
    return (this._conn.new_message = this.new_message);
  }

  disconnect() {
    if (this._conn) {
      this._conn.close();
      delete this._conn._conn;
      delete this._conn;
    }
    return (this.state = 'disconnected');
  }

  reconnect() {
    const old_connection_id = (this._conn && this._conn.connection_id);

    this.disconnect();
    this.connect();

    Object.keys(this.queue).forEach(key => {
      const event = this.queue[key];
      if (event.connection_id === old_connection_id && !event.is_result()) {
        this.trigger_event(event);
      }
    });

    return this.reconnect_channels();
  }

  new_message(data) {
    return data.map(message => {
      const event = new Event(message);

      if (event.is_result()) {
        if (this.queue[event.id]) {
          this.queue[event.id].run_callbacks(event.success, event.data);
        }
        delete this.queue[event.id];
      } else if (event.is_channel()) {
        this.dispatch_channel(event);
      } else if (event.is_ping()) {
        this.pong();
      } else {
        this.dispatch(event);
      }
      if (this.state === 'connecting' && event.name === 'client_connected') {
        return this.connection_established(event.data);
      }
    });
  }

  connection_established(data) {
    this.state = 'connected';
    this._conn.setConnectionId(data.connection_id);
    this._conn.flush_queue();
    if (this.on_open) {
      return this.on_open(data);
    }
  }

  bind(eventName, callback) {
    if (!this.callbacks[eventName]) {
      this.callbacks[eventName] = [];
    }
    return this.callbacks[eventName].push(callback);
  }

  unbind(event_name) {
    return delete this.callbacks[event_name];
  }

  trigger(eventName, data, success, fail) {
    const event = new Event(
      [eventName, data, (this._conn && this._conn.connection_id)], success, fail
    );
    return this.trigger_event(event);
  }

  trigger_event(event) {
    const { id } = event;

    if (!this.queue[id]) {
      this.queue[id] = event;
    }

    if (this._conn) {
      this._conn.trigger(event);
    }
    return event;
  }

  dispatch(event) {
    const { name, data } = event;
    if (this.callbacks[name]) {
      return this.callbacks[name].map(callback => callback(data));
    }
  }

  subscribe(channelName, success, fail) {
    if (!this.channels[channelName]) {
      this.channels[channelName] = new Channel(
        channelName, this, false, success, fail
      );
    }

    return this.channels[channelName];
  }

  subscribe_private(channelName, success, fail) {
    if (!this.channels[channelName]) {
      this.channels[channelName] = new Channel(
        channelName, this, true, success, fail
      );
    }
    return this.channels[channelName];
  }

  unsubscribe(channel_name) {
    if (this.channels[channel_name]) {
      this.channels[channel_name].destroy();
      return delete this.channels[channel_name];
    }
  }

  dispatch_channel(event) {
    if (this.channels[event.channel]) {
      return this.channels[event.channel].dispatch(event.name, event.data);
    }
  }

  supports_websockets() {
    const { WebSocket } = window;
    return typeof WebSocket === 'function' || typeof WebSocket === 'object';
  }

  pong() {
    const pong = new Event(['websocket_rails.pong', {}, (this._conn && this._conn.connection_id)]);
    return this._conn.trigger(pong);
  }

  connection_stale() {
    return this.state !== 'connected';
  }

  reconnect_channels() {
    const { channels } = this;

    return Object.keys(channels).map(key => {
      let channel = channels[key];
      const callbacks = channel._callbacks;
      channel.destroy();
      delete this.channels[key];

      channel = channel.is_private ? this.subscribe_private(key) : this.subscribe(key);
      channel._callbacks = callbacks;

      return channel;
    });
  }
}

WebSocketRails.Event = Event;
