//import Event from './Event';
//import Channel from './Channel';
//import WebSocketConnection from './WebSocketConnection';
//import HttpConnection from './HttpConnection';
//
//export default class WebSocketRails {
//  constructor(url, use_websockets) {
//    this.url = url;
//    this.use_websockets = use_websockets;
//    this.callbacks = {};
//    this.channels = {};
//    this.queue = {};
//    this.connect();
//  }
//
//  connect() {
//    this.state = 'connecting';
//    if (!(this.supports_websockets() && this.use_websockets)) {
//      this._conn = new HttpConnection(this.url, this);
//    } else {
//      this._conn = new WebSocketConnection(this.url, this);
//    }
//    return this._conn.new_message = this.new_message;
//  }
//
//  disconnect() {
//    if (this._conn) {
//      this._conn.close();
//      delete this._conn._conn;
//      delete this._conn;
//    }
//    return this.state = 'disconnected';
//  }
//
//  reconnect() {
//    var event, id, old_connection_id, ref, ref1;
//    old_connection_id = (ref = this._conn) != null ? ref.connection_id : void 0;
//    this.disconnect();
//    this.connect();
//    ref1 = this.queue;
//
//    for (id in ref1) {
//      event = ref1[id];
//      if (event.connection_id === old_connection_id && !event.is_result()) {
//        this.trigger_event(event);
//      }
//    }
//    return this.reconnect_channels();
//  }
//
//  new_message(data) {
//    var event, i, len, ref, results, socket_message;
//    results = [];
//    for (i = 0, len = data.length; i < len; i++) {
//      socket_message = data[i];
//      event = new Event(socket_message);
//      if (event.is_result()) {
//        if ((ref = this.queue[event.id]) != null) {
//          ref.run_callbacks(event.success, event.data);
//        }
//        delete this.queue[event.id];
//      } else if (event.is_channel()) {
//        this.dispatch_channel(event);
//      } else if (event.is_ping()) {
//        this.pong();
//      } else {
//        this.dispatch(event);
//      }
//      if (this.state === 'connecting' && event.name === 'client_connected') {
//        results.push(this.connection_established(event.data));
//      } else {
//        results.push(void 0);
//      }
//    }
//    return results;
//  }
//
//  connection_established(data) {
//    this.state = 'connected';
//    this._conn.setConnectionId(data.connection_id);
//    this._conn.flush_queue();
//
//    if (this.on_open != null) {
//      return this.on_open(data);
//    }
//  }
//
//  bind(event_name, callback) {
//    var base;
//    if ((base = this.callbacks)[event_name] == null) {
//      base[event_name] = [];
//    }
//    return this.callbacks[event_name].push(callback);
//  }
//
//  trigger(event_name, data, success_callback, failure_callback) {
//    var event, ref;
//    event = new WebSocketRails.Event([event_name, data, (ref = this._conn) != null ? ref.connection_id : void 0], success_callback, failure_callback);
//    return this.trigger_event(event);
//  }
//
//  trigger_event(event) {
//    var base, name1;
//    if ((base = this.queue)[name1 = event.id] == null) {
//      base[name1] = event;
//    }
//    if (this._conn) {
//      this._conn.trigger(event);
//    }
//    return event;
//  }
//
//  dispatch(event) {
//    if (this.callbacks[event.name]) {
//      const callbacks = this.callbacks[event.name];
//      const results = [];
//
//      callbacks.forEach(item => {
//        results.push(item(event.data));
//      });
//
//      return results;
//    }
//  }
//
//  subscribe(channel_name, success_callback, failure_callback) {
//    if (!this.channels[channel_name]) {
//      const channel = new Channel(channel_name, this, false, success_callback, failure_callback);
//      this.channels[channel_name] = channel;
//      return channel;
//    }
//    return this.channels[channel_name];
//  }
//
//  subscribe_private(channel_name, success_callback, failure_callback) {
//    let channel;
//
//    if (this.channels[channel_name] == null) {
//      channel = new Channel(channel_name, this, true, success_callback, failure_callback);
//      this.channels[channel_name] = channel;
//      return channel;
//    } else {
//      return this.channels[channel_name];
//    }
//  }
//
//  unsubscribe(channel_name) {
//    if (this.channels[channel_name]) {
//      this.channels[channel_name].destroy();
//      return delete this.channels[channel_name];
//    }
//  }
//
//  dispatch_channel(event) {
//    if (this.channels[event.channel]) {
//      return this.channels[event.channel].dispatch(event.name, event.data);
//    }
//  }
//
//  supports_websockets() {
//    return typeof WebSocket === 'function' || typeof WebSocket === 'object';
//  }
//
//  pong() {
//    const p = new Event(['websocket_rails.pong', {},
//      this._conn ? this._conn.connection_id : null]);
//
//    return this._conn.trigger(p);
//  }
//
//  connection_stale() {
//    return this.state !== 'connected';
//  }
//
//  reconnect_channels() {
//    let callbacks;
//    let channel;
//    const ref = this.channels;
//    const results = [];
//
//    Object.keys(ref).forEach(name => {
//      channel = ref[name];
//      callbacks = channel._callbacks;
//      channel.destroy();
//      delete this.channels[name];
//      channel = channel.is_private ? this.subscribe_private(name) : this.subscribe(name);
//      channel._callbacks = callbacks;
//      results.push(channel);
//    });
//
//    return results;
//  }
//}
//
//WebSocketRails.Channel = Channel;
//WebSocketRails.Event = Event;


/*
 WebsocketRails JavaScript Client

 Setting up the dispatcher:
 var dispatcher = new WebSocketRails('localhost:3000/websocket');
 dispatcher.on_open = function() {
 // trigger a server event immediately after opening connection
 dispatcher.trigger('new_user',{user_name: 'guest'});
 })

 Triggering a new event on the server
 dispatcherer.trigger('event_name',object_to_be_serialized_to_json);

 Listening for new events from the server
 dispatcher.bind('event_name', function(data) {
 console.log(data.user_name);
 });
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.WebSocketRails = (function() {
    function WebSocketRails(url, use_websockets) {
      this.url = url;
      this.use_websockets = use_websockets != null ? use_websockets : true;
      this.connection_stale = bind(this.connection_stale, this);
      this.pong = bind(this.pong, this);
      this.supports_websockets = bind(this.supports_websockets, this);
      this.dispatch_channel = bind(this.dispatch_channel, this);
      this.unsubscribe = bind(this.unsubscribe, this);
      this.subscribe_private = bind(this.subscribe_private, this);
      this.subscribe = bind(this.subscribe, this);
      this.dispatch = bind(this.dispatch, this);
      this.trigger_event = bind(this.trigger_event, this);
      this.trigger = bind(this.trigger, this);
      this.bind = bind(this.bind, this);
      this.connection_established = bind(this.connection_established, this);
      this.new_message = bind(this.new_message, this);
      this.reconnect = bind(this.reconnect, this);
      this.callbacks = {};
      this.channels = {};
      this.queue = {};
      this.connect();
    }

    WebSocketRails.prototype.connect = function() {
      this.state = 'connecting';
      if (!(this.supports_websockets() && this.use_websockets)) {
        this._conn = new WebSocketRails.HttpConnection(this.url, this);
      } else {
        this._conn = new WebSocketRails.WebSocketConnection(this.url, this);
      }
      return this._conn.new_message = this.new_message;
    };

    WebSocketRails.prototype.disconnect = function() {
      if (this._conn) {
        this._conn.close();
        delete this._conn._conn;
        delete this._conn;
      }
      return this.state = 'disconnected';
    };

    WebSocketRails.prototype.reconnect = function() {
      var event, id, old_connection_id, ref, ref1;
      old_connection_id = (ref = this._conn) != null ? ref.connection_id : void 0;
      this.disconnect();
      this.connect();
      ref1 = this.queue;
      for (id in ref1) {
        event = ref1[id];
        if (event.connection_id === old_connection_id && !event.is_result()) {
          this.trigger_event(event);
        }
      }
      return this.reconnect_channels();
    };

    WebSocketRails.prototype.new_message = function(data) {
      var event, i, len, ref, results, socket_message;
      results = [];
      for (i = 0, len = data.length; i < len; i++) {
        socket_message = data[i];
        event = new WebSocketRails.Event(socket_message);
        if (event.is_result()) {
          if ((ref = this.queue[event.id]) != null) {
            ref.run_callbacks(event.success, event.data);
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
          results.push(this.connection_established(event.data));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    WebSocketRails.prototype.connection_established = function(data) {
      this.state = 'connected';
      this._conn.setConnectionId(data.connection_id);
      this._conn.flush_queue();
      if (this.on_open != null) {
        return this.on_open(data);
      }
    };

    WebSocketRails.prototype.bind = function(event_name, callback) {
      var base;
      if ((base = this.callbacks)[event_name] == null) {
        base[event_name] = [];
      }
      return this.callbacks[event_name].push(callback);
    };

    WebSocketRails.prototype.trigger = function(event_name, data, success_callback, failure_callback) {
      var event, ref;
      event = new WebSocketRails.Event([event_name, data, (ref = this._conn) != null ? ref.connection_id : void 0], success_callback, failure_callback);
      return this.trigger_event(event);
    };

    WebSocketRails.prototype.trigger_event = function(event) {
      var base, name1;
      if ((base = this.queue)[name1 = event.id] == null) {
        base[name1] = event;
      }
      if (this._conn) {
        this._conn.trigger(event);
      }
      return event;
    };

    WebSocketRails.prototype.dispatch = function(event) {
      var callback, i, len, ref, results;
      if (this.callbacks[event.name] == null) {
        return;
      }
      ref = this.callbacks[event.name];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        callback = ref[i];
        results.push(callback(event.data));
      }
      return results;
    };

    WebSocketRails.prototype.subscribe = function(channel_name, success_callback, failure_callback) {
      var channel;
      if (this.channels[channel_name] == null) {
        channel = new WebSocketRails.Channel(channel_name, this, false, success_callback, failure_callback);
        this.channels[channel_name] = channel;
        return channel;
      } else {
        return this.channels[channel_name];
      }
    };

    WebSocketRails.prototype.subscribe_private = function(channel_name, success_callback, failure_callback) {
      var channel;
      if (this.channels[channel_name] == null) {
        channel = new WebSocketRails.Channel(channel_name, this, true, success_callback, failure_callback);
        this.channels[channel_name] = channel;
        return channel;
      } else {
        return this.channels[channel_name];
      }
    };

    WebSocketRails.prototype.unsubscribe = function(channel_name) {
      if (this.channels[channel_name] == null) {
        return;
      }
      this.channels[channel_name].destroy();
      return delete this.channels[channel_name];
    };

    WebSocketRails.prototype.dispatch_channel = function(event) {
      if (this.channels[event.channel] == null) {
        return;
      }
      return this.channels[event.channel].dispatch(event.name, event.data);
    };

    WebSocketRails.prototype.supports_websockets = function() {
      return typeof WebSocket === "function" || typeof WebSocket === "object";
    };

    WebSocketRails.prototype.pong = function() {
      var pong, ref;
      pong = new WebSocketRails.Event(['websocket_rails.pong', {}, (ref = this._conn) != null ? ref.connection_id : void 0]);
      return this._conn.trigger(pong);
    };

    WebSocketRails.prototype.connection_stale = function() {
      return this.state !== 'connected';
    };

    WebSocketRails.prototype.reconnect_channels = function() {
      var callbacks, channel, name, ref, results;
      ref = this.channels;
      results = [];
      for (name in ref) {
        channel = ref[name];
        callbacks = channel._callbacks;
        channel.destroy();
        delete this.channels[name];
        channel = channel.is_private ? this.subscribe_private(name) : this.subscribe(name);
        channel._callbacks = callbacks;
        results.push(channel);
      }
      return results;
    };

    return WebSocketRails;

  })();

}).call(this);

/*
 The Event object stores all the relevant event information.
 */

(function() {
  WebSocketRails.Event = (function() {
    function Event(data, success_callback, failure_callback) {
      var attr;
      this.success_callback = success_callback;
      this.failure_callback = failure_callback;
      this.name = data[0];
      attr = data[1];
      if (attr != null) {
        this.id = attr['id'] != null ? attr['id'] : ((1 + Math.random()) * 0x10000) | 0;
        this.channel = attr.channel != null ? attr.channel : void 0;
        this.data = attr.data != null ? attr.data : attr;
        this.token = attr.token != null ? attr.token : void 0;
        this.connection_id = data[2];
        if (attr.success != null) {
          this.result = true;
          this.success = attr.success;
        }
      }
    }

    Event.prototype.is_channel = function() {
      return this.channel != null;
    };

    Event.prototype.is_result = function() {
      return typeof this.result !== 'undefined';
    };

    Event.prototype.is_ping = function() {
      return this.name === 'websocket_rails.ping';
    };

    Event.prototype.serialize = function() {
      return JSON.stringify([this.name, this.attributes()]);
    };

    Event.prototype.attributes = function() {
      return {
        id: this.id,
        channel: this.channel,
        data: this.data,
        token: this.token
      };
    };

    Event.prototype.run_callbacks = function(success, result) {
      this.success = success;
      this.result = result;
      if (this.success === true) {
        return typeof this.success_callback === "function" ? this.success_callback(this.result) : void 0;
      } else {
        return typeof this.failure_callback === "function" ? this.failure_callback(this.result) : void 0;
      }
    };

    return Event;

  })();

}).call(this);

/*
 Abstract Interface for the WebSocketRails client.
 */

(function() {
  WebSocketRails.AbstractConnection = (function() {
    function AbstractConnection(url, dispatcher) {
      this.dispatcher = dispatcher;
      this.message_queue = [];
    }

    AbstractConnection.prototype.close = function() {};

    AbstractConnection.prototype.trigger = function(event) {
      if (this.dispatcher.state !== 'connected') {
        return this.message_queue.push(event);
      } else {
        return this.send_event(event);
      }
    };

    AbstractConnection.prototype.send_event = function(event) {
      if (this.connection_id != null) {
        return event.connection_id = this.connection_id;
      }
    };

    AbstractConnection.prototype.on_close = function(event) {
      var close_event;
      if (this.dispatcher && this.dispatcher._conn === this) {
        close_event = new WebSocketRails.Event(['connection_closed', event]);
        this.dispatcher.state = 'disconnected';
        return this.dispatcher.dispatch(close_event);
      }
    };

    AbstractConnection.prototype.on_error = function(event) {
      var error_event;
      if (this.dispatcher && this.dispatcher._conn === this) {
        error_event = new WebSocketRails.Event(['connection_error', event]);
        this.dispatcher.state = 'disconnected';
        return this.dispatcher.dispatch(error_event);
      }
    };

    AbstractConnection.prototype.on_message = function(event_data) {
      if (this.dispatcher && this.dispatcher._conn === this) {
        return this.dispatcher.new_message(event_data);
      }
    };

    AbstractConnection.prototype.setConnectionId = function(connection_id) {
      this.connection_id = connection_id;
    };

    AbstractConnection.prototype.flush_queue = function() {
      var event, i, len, ref;
      ref = this.message_queue;
      for (i = 0, len = ref.length; i < len; i++) {
        event = ref[i];
        this.trigger(event);
      }
      return this.message_queue = [];
    };

    return AbstractConnection;

  })();

}).call(this);

/*
 HTTP Interface for the WebSocketRails client.
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
      hasProp = {}.hasOwnProperty;

  WebSocketRails.HttpConnection = (function(superClass) {
    extend(HttpConnection, superClass);

    HttpConnection.prototype.connection_type = 'http';

    HttpConnection.prototype._httpFactories = function() {
      return [
        function() {
          return new XDomainRequest();
        }, function() {
          return new XMLHttpRequest();
        }, function() {
          return new ActiveXObject("Msxml2.XMLHTTP");
        }, function() {
          return new ActiveXObject("Msxml3.XMLHTTP");
        }, function() {
          return new ActiveXObject("Microsoft.XMLHTTP");
        }
      ];
    };

    function HttpConnection(url, dispatcher) {
      var e, error;
      this.dispatcher = dispatcher;
      HttpConnection.__super__.constructor.apply(this, arguments);
      this._url = "http://" + url;
      this._conn = this._createXMLHttpObject();
      this.last_pos = 0;
      try {
        this._conn.onreadystatechange = (function(_this) {
          return function() {
            return _this._parse_stream();
          };
        })(this);
        this._conn.addEventListener("load", this.on_close, false);
      } catch (error) {
        e = error;
        this._conn.onprogress = (function(_this) {
          return function() {
            return _this._parse_stream();
          };
        })(this);
        this._conn.onload = this.on_close;
        this._conn.readyState = 3;
      }
      this._conn.open("GET", this._url, true);
      this._conn.send();
    }

    HttpConnection.prototype.close = function() {
      return this._conn.abort();
    };

    HttpConnection.prototype.send_event = function(event) {
      HttpConnection.__super__.send_event.apply(this, arguments);
      return this._post_data(event.serialize());
    };

    HttpConnection.prototype._post_data = function(payload) {
      return $.ajax(this._url, {
        type: 'POST',
        data: {
          client_id: this.connection_id,
          data: payload
        },
        success: function() {}
      });
    };

    HttpConnection.prototype._createXMLHttpObject = function() {
      var e, error, factories, factory, i, len, xmlhttp;
      xmlhttp = false;
      factories = this._httpFactories();
      for (i = 0, len = factories.length; i < len; i++) {
        factory = factories[i];
        try {
          xmlhttp = factory();
        } catch (error) {
          e = error;
          continue;
        }
        break;
      }
      return xmlhttp;
    };

    HttpConnection.prototype._parse_stream = function() {
      var data, e, error, event_data;
      if (this._conn.readyState === 3) {
        data = this._conn.responseText.substring(this.last_pos);
        this.last_pos = this._conn.responseText.length;
        data = data.replace(/\]\]\[\[/g, "],[");
        try {
          event_data = JSON.parse(data);
          return this.on_message(event_data);
        } catch (error) {
          e = error;
        }
      }
    };

    return HttpConnection;

  })(WebSocketRails.AbstractConnection);

}).call(this);

/*
 WebSocket Interface for the WebSocketRails client.
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
      hasProp = {}.hasOwnProperty;

  WebSocketRails.WebSocketConnection = (function(superClass) {
    extend(WebSocketConnection, superClass);

    WebSocketConnection.prototype.connection_type = 'websocket';

    function WebSocketConnection(url, dispatcher) {
      this.url = url;
      this.dispatcher = dispatcher;
      WebSocketConnection.__super__.constructor.apply(this, arguments);
      if (this.url.match(/^wss?:\/\//)) {
        console.log("WARNING: Using connection urls with protocol specified is depricated");
      } else if (window.location.protocol === 'https:') {
        this.url = "wss://" + this.url;
      } else {
        this.url = "ws://" + this.url;
      }
      this._conn = new WebSocket(this.url);
      this._conn.onmessage = (function(_this) {
        return function(event) {
          var event_data;
          event_data = JSON.parse(event.data);
          return _this.on_message(event_data);
        };
      })(this);
      this._conn.onclose = (function(_this) {
        return function(event) {
          return _this.on_close(event);
        };
      })(this);
      this._conn.onerror = (function(_this) {
        return function(event) {
          return _this.on_error(event);
        };
      })(this);
    }

    WebSocketConnection.prototype.close = function() {
      return this._conn.close();
    };

    WebSocketConnection.prototype.send_event = function(event) {
      WebSocketConnection.__super__.send_event.apply(this, arguments);
      return this._conn.send(event.serialize());
    };

    return WebSocketConnection;

  })(WebSocketRails.AbstractConnection);

}).call(this);

/*
 The channel object is returned when you subscribe to a channel.

 For instance:
 var dispatcher = new WebSocketRails('localhost:3000/websocket');
 var awesome_channel = dispatcher.subscribe('awesome_channel');
 awesome_channel.bind('event', function(data) { console.log('channel event!'); });
 awesome_channel.trigger('awesome_event', awesome_object);
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  WebSocketRails.Channel = (function() {
    function Channel(name, _dispatcher, is_private, on_success, on_failure) {
      var event, event_name, ref;
      this.name = name;
      this._dispatcher = _dispatcher;
      this.is_private = is_private != null ? is_private : false;
      this.on_success = on_success;
      this.on_failure = on_failure;
      this._failure_launcher = bind(this._failure_launcher, this);
      this._success_launcher = bind(this._success_launcher, this);
      this._callbacks = {};
      this._token = void 0;
      this._queue = [];
      if (this.is_private) {
        event_name = 'websocket_rails.subscribe_private';
      } else {
        event_name = 'websocket_rails.subscribe';
      }
      this.connection_id = (ref = this._dispatcher._conn) != null ? ref.connection_id : void 0;
      event = new WebSocketRails.Event([
        event_name, {
          data: {
            channel: this.name
          }
        }, this.connection_id
      ], this._success_launcher, this._failure_launcher);
      this._dispatcher.trigger_event(event);
    }

    Channel.prototype.destroy = function() {
      var event, event_name, ref;
      if (this.connection_id === ((ref = this._dispatcher._conn) != null ? ref.connection_id : void 0)) {
        event_name = 'websocket_rails.unsubscribe';
        event = new WebSocketRails.Event([
          event_name, {
            data: {
              channel: this.name
            }
          }, this.connection_id
        ]);
        this._dispatcher.trigger_event(event);
      }
      return this._callbacks = {};
    };

    Channel.prototype.bind = function(event_name, callback) {
      var base;
      if ((base = this._callbacks)[event_name] == null) {
        base[event_name] = [];
      }
      return this._callbacks[event_name].push(callback);
    };

    Channel.prototype.trigger = function(event_name, message) {
      var event;
      event = new WebSocketRails.Event([
        event_name, {
          channel: this.name,
          data: message,
          token: this._token
        }, this.connection_id
      ]);
      if (!this._token) {
        return this._queue.push(event);
      } else {
        return this._dispatcher.trigger_event(event);
      }
    };

    Channel.prototype.dispatch = function(event_name, message) {
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
    };

    Channel.prototype._success_launcher = function(data) {
      if (this.on_success != null) {
        return this.on_success(data);
      }
    };

    Channel.prototype._failure_launcher = function(data) {
      if (this.on_failure != null) {
        return this.on_failure(data);
      }
    };

    Channel.prototype.flush_queue = function() {
      var event, i, len, ref;
      ref = this._queue;
      for (i = 0, len = ref.length; i < len; i++) {
        event = ref[i];
        this._dispatcher.trigger_event(event);
      }
      return this._queue = [];
    };

    return Channel;

  })();

}).call(this);






