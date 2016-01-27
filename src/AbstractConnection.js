import Event from './Event';

export default class AbstractConnection {
  constructor(url, dispatcher) {
    this.dispatcher = dispatcher;
    this.message_queue = [];
  }

  close() {}

  trigger(event) {
    if (this.dispatcher.state !== 'connected') {
      return this.message_queue.push(event);
    }
    return this.send_event(event);
  }

  send_event(event) {
    if (this.connection_id) {
      return (event.connection_id = this.connection_id);
    }
  }

  on_close(event) {
    if (this.dispatcher && this.dispatcher._conn === this) {
      const close_event = new Event(['connection_closed', event]);
      this.dispatcher.state = 'disconnected';
      return this.dispatcher.dispatch(close_event);
    }
  }

  on_error(event) {
    if (this.dispatcher && this.dispatcher._conn === this) {
      const error_event = new Event(['connection_error', event]);
      this.dispatcher.state = 'disconnected';
      return this.dispatcher.dispatch(error_event);
    }
  }

  on_message(event_data) {
    if (this.dispatcher && this.dispatcher._conn === this) {
      return this.dispatcher.new_message(event_data);
    }
  }

  setConnectionId(connection_id) {
    this.connection_id = connection_id;
  }

  flush_queue() {
    this.message_queue.forEach(item => {
      this.trigger(item);
    });

    return (this.message_queue = []);
  }
}
