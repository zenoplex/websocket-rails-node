export default class Event {
  constructor(data, success_callback, failure_callback) {
    this.success_callback = success_callback;
    this.failure_callback = failure_callback;
    this.name = data[0];
    const attr = data[1];

    if (attr) {
      this.id = attr.id ? attr.id : ((1 + Math.random()) * 0x10000) | 0;
      this.channel = attr.channel ? attr.channel : undefined;
      this.data = attr.data ? attr.data : attr;
      this.token = attr.token ? attr.token : undefined;
      this.connection_id = data[2];
      if (attr.success) {
        this.result = true;
        this.success = attr.success;
      }
    }
  }

  is_channel() {
    return !!this.channel;
  }

  is_result() {
    return typeof this.result !== 'undefined';
  }

  is_ping() {
    return this.name === 'websocket_rails.ping';
  }

  serialize() {
    return JSON.stringify([this.name, this.attributes()]);
  }

  attributes() {
    return {
      id:      this.id,
      channel: this.channel,
      data:    this.data,
      token:   this.token,
    };
  }

  run_callbacks(success, result) {
    this.success = success;
    this.result = result;
    if (this.success) {
      return typeof this.success_callback === 'function' ?
        this.success_callback(this.result) : undefined;
    }
    return typeof this.failure_callback === 'function' ?
      this.failure_callback(this.result) : undefined;
  }
}
