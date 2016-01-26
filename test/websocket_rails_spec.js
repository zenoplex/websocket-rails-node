//import sinon from 'sinon';
//import assert from 'power-assert';
//import WebSocketRails from '../src/WebSocketRails';
//import AbstractConnection from '../src/AbstractConnection';
//import WebSocketConnection from '../src/WebSocketConnection';
//
////var extend  = function (child, parent) {
////      for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; }
////      function ctor() { this.constructor = child; }
////
////      ctor.prototype = parent.prototype;
////      child.prototype = new ctor();
////      child.__super__ = parent.prototype;
////      child;
////    },
////    hasProp = {}.hasOwnProperty;
//
//describe('WebSocketRails', function () {
//
//  beforeEach(function () {
//    var HttpConnectionStub, WebSocketConnectionStub;
//    this.url = 'df-monkey.herokuapp.com/websocket';
//    //WebSocketRails.WebSocketConnection = WebSocketConnectionStub = (function (superClass) {
//    //  extend(WebSocketConnectionStub, superClass);
//    //
//    //  function WebSocketConnectionStub() {
//    //    WebSocketConnectionStub.__super__.constructor.apply(this, arguments);
//    //  }
//    //
//    //  WebSocketConnectionStub.prototype.connection_type = 'websocket';
//    //
//    //  WebSocketConnectionStub;
//    //
//    //})(AbstractConnection);
//
//    //WebSocketRails.HttpConnection = HttpConnectionStub = (function (superClass) {
//    //  extend(HttpConnectionStub, superClass);
//    //
//    //  function HttpConnectionStub() {
//    //    HttpConnectionStub.__super__.constructor.apply(this, arguments);
//    //  }
//    //
//    //  HttpConnectionStub.prototype.connection_type = 'http';
//    //
//    //  HttpConnectionStub;
//    //
//    //})(AbstractConnection);
//    this.dispatcher = new WebSocketRails(this.url, true);
//  });
//
//  describe('constructor', function () {
//    it('should start connection automatically', function () {
//      assert(this.dispatcher.state === 'connecting');
//    });
//  });
//
//  describe('.connect', function () {
//    it('should set the new_message method on connection to this.new_message', function () {
//      assert(this.dispatcher._conn.new_message === this.dispatcher.new_message);
//    });
//
//    it('should set the initial state to connecting', function () {
//      assert(this.dispatcher.state === 'connecting');
//    });
//
//    describe('when use_websockets is true', function () {
//      it('should use the WebSocket Connection', function () {
//        const dispatcher = new WebSocketRails(this.url, true);
//        assert(dispatcher._conn.connection_type === 'websocket');
//      });
//    });
//
//    describe('when use_websockets is false', function () {
//      it('should use the Http Connection', function () {
//        const dispatcher = new WebSocketRails(this.url, false);
//        assert(dispatcher._conn.connection_type === 'http');
//      });
//    });
//
//    describe('when the browser does not support WebSockets', function () {
//      it('should use the Http Connection', function () {
//        window.WebSocket = 'undefined';
//        const dispatcher = new WebSocketRails(this.url, true);
//        assert(dispatcher._conn.connection_type === 'http');
//      });
//    });
//  });
//
//  describe('.disconnect', function () {
//    beforeEach(function () {
//      this.dispatcher.disconnect();
//    });
//    it('should close the connection', function () {
//      assert(this.dispatcher.state === 'disconnected');
//    });
//    it('existing connection should be destroyed', function () {
//      assert(this.dispatcher._conn).toBeUndefined();
//    });
//  });
//
//  describe('.reconnect', function () {
//    var NEW_CONNECTION_ID, OLD_CONNECTION_ID;
//    OLD_CONNECTION_ID = 1;
//    NEW_CONNECTION_ID = 2;
//
//    it('should connect, when disconnected', function () {
//      const mock_dispatcher = sinon.mock(this.dispatcher);
//      mock_dispatcher.expects('connect').once();
//      this.dispatcher.disconnect();
//      this.dispatcher.reconnect();
//      mock_dispatcher.verify();
//    });
//
//    it('should recreate the connection', function () {
//      //helpers.startConnection(this.dispatcher, OLD_CONNECTION_ID);
//      //this.dispatcher.reconnect();
//      //helpers.startConnection(this.dispatcher, NEW_CONNECTION_ID);
//      //assert(this.dispatcher._conn.connection_id).toEqual(NEW_CONNECTION_ID);
//    });
//
//    it('should resend all uncompleted events', function () {
//      //var event;
//      //event = this.dispatcher.trigger('create_post');
//      //helpers.startConnection(this.dispatcher, OLD_CONNECTION_ID);
//      //this.dispatcher.reconnect();
//      //helpers.startConnection(this.dispatcher, NEW_CONNECTION_ID);
//      //assert(this.dispatcher.queue[event.id].connection_id).toEqual(NEW_CONNECTION_ID);
//    });
//
//    it('should not resend completed events', function () {
//      //var event;
//      //event = this.dispatcher.trigger('create_post');
//      //event.run_callbacks(true, {});
//      //helpers.startConnection(this.dispatcher, OLD_CONNECTION_ID);
//      //this.dispatcher.reconnect();
//      //helpers.startConnection(this.dispatcher, NEW_CONNECTION_ID);
//      //assert(this.dispatcher.queue[event.id].connection_id).toEqual(OLD_CONNECTION_ID);
//    });
//
//    it('should reconnect to all channels', function () {
//      const mock_dispatcher = sinon.mock(this.dispatcher);
//      mock_dispatcher.expects('reconnect_channels').once();
//      this.dispatcher.reconnect();
//      mock_dispatcher.verify();
//    });
//  });
//
//  describe('.reconnect_channels', function () {
//    beforeEach(function () {
//      this.channel_callback = function () {
//        true;
//      };
//      helpers.startConnection(this.dispatcher, 1);
//      this.dispatcher.subscribe('public 4chan');
//      this.dispatcher.subscribe_private('private 4chan');
//      this.dispatcher.channels['public 4chan'].bind('new_post', this.channel_callback);
//    });
//
//    it('should recreate existing channels, keeping their private/public type', function () {
//      this.dispatcher.reconnect_channels();
//      assert(this.dispatcher.channels['public 4chan'].is_private).toEqual(false);
//      assert(this.dispatcher.channels['private 4chan'].is_private).toEqual(true);
//    });
//
//    it('should move all existing callbacks from old channel objects to new ones', function () {
//      var old_public_channel;
//      old_public_channel = this.dispatcher.channels['public 4chan'];
//      this.dispatcher.reconnect_channels();
//      assert(old_public_channel._callbacks).toEqual({});
//      assert(this.dispatcher.channels['public 4chan']._callbacks).toEqual({
//        new_post: [this.channel_callback]
//      });
//    });
//  });
//
//  describe('.new_message', function () {
//    describe('when this.state is "connecting"', function () {
//      beforeEach(function () {
//        this.connection_id = 123;
//      });
//
//      it('should call this.connection_established on the "client_connected" event', function () {
//        var mock_dispatcher;
//        mock_dispatcher = sinon.mock(this.dispatcher);
//        mock_dispatcher.expects('connection_established').once().withArgs({
//          connection_id: this.connection_id
//        });
//        helpers.startConnection(this.dispatcher, this.connection_id);
//        mock_dispatcher.verify();
//      });
//
//      it('should set the state to connected', function () {
//        helpers.startConnection(this.dispatcher, this.connection_id);
//        assert(this.dispatcher.state).toEqual('connected');
//      });
//
//      it('should flush any messages queued before the connection was established', function () {
//        var mock_con;
//        mock_con = sinon.mock(this.dispatcher._conn);
//        mock_con.expects('flush_queue').once();
//        helpers.startConnection(this.dispatcher, this.connection_id);
//        mock_con.verify();
//      });
//
//      it('should set the correct connection_id', function () {
//        helpers.startConnection(this.dispatcher, this.connection_id);
//        assert(this.dispatcher._conn.connection_id).toEqual(123);
//      });
//
//      it('should call the user defined on_open callback', function () {
//        var spy;
//        spy = sinon.spy();
//        this.dispatcher.on_open = spy;
//        helpers.startConnection(this.dispatcher, this.connection_id);
//        assert(spy.calledOnce).toEqual(true);
//      });
//    });
//
//    describe('after the connection has been established', function () {
//      beforeEach(function () {
//        this.dispatcher.state = 'connected';
//        this.attributes = {
//          data:    'message',
//          channel: 'channel',
//        };
//      });
//
//      it('should dispatch channel messages', function () {
//        var data, mock_dispatcher;
//        data = [['event', this.attributes]];
//        mock_dispatcher = sinon.mock(this.dispatcher);
//        mock_dispatcher.expects('dispatch_channel').once();
//        this.dispatcher.new_message(data);
//        mock_dispatcher.verify();
//      });
//
//      it('should dispatch standard events', function () {
//        var data, mock_dispatcher;
//        data = [['event', 'message']];
//        mock_dispatcher = sinon.mock(this.dispatcher);
//        mock_dispatcher.expects('dispatch').once();
//        this.dispatcher.new_message(data);
//        mock_dispatcher.verify();
//      });
//
//      describe('result events', function () {
//        beforeEach(function () {
//          this.attributes['success'] = true;
//          this.attributes['id'] = 1;
//          this.event = {
//            run_callbacks: function (data) {}
//          };
//          this.event_mock = sinon.mock(this.event);
//          this.dispatcher.queue[1] = this.event;
//          this.event_data = [['event', this.attributes]];
//        });
//
//        it('should run callbacks for result events', function () {
//          this.event_mock.expects('run_callbacks').once();
//          this.dispatcher.new_message(this.event_data);
//          this.event_mock.verify();
//        });
//
//        it('should remove the event from the queue', function () {
//          this.dispatcher.new_message(this.event_data);
//          assert(this.dispatcher.queue[1]).toBeUndefined();
//        });
//      });
//    });
//  });
//
//  describe('.bind', function () {
//    it('should store the callback on the correct event', function () {
//      var callback;
//      callback = function () {};
//      this.dispatcher.bind('event', callback);
//      assert(this.dispatcher.callbacks['event'].find(callback));
//    });
//  });
//
//  describe('.unbind', function () {
//    it('should delete the callback on the correct event', function () {
//      var callback;
//      callback = function () {};
//      this.dispatcher.bind('event', callback);
//      this.dispatcher.unbind('event');
//      assert(this.dispatcher.callbacks['event'] === undefined);
//      //assert(this.dispatcher.callbacks['event']).toBeUndefined();
//    });
//  });
//  describe('.dispatch', function () {
//    it('should execute the callback for the correct event', function () {
//      var callback, event;
//      callback = sinon.spy();
//      event = new WebSocketRails.Event([
//        'event', {
//          data: 'message',
//        }
//      ]);
//      this.dispatcher.bind('event', callback);
//      this.dispatcher.dispatch(event);
//      assert(callback.calledWith('message') === true);
//    });
//  });
//
//  describe('triggering events with', function () {
//    beforeEach(function () {
//      this.dispatcher._conn = {
//        connection_id: 123,
//        trigger:       function () {},
//      };
//    });
//
//    describe('.trigger', function () {
//      it('should add the event to the queue', function () {
//        const event = this.dispatcher.trigger('event', 'message');
//        assert(this.dispatcher.queue[event.id] === event);
//      });
//
//      it('should delegate to the connection object', function () {
//        const conn_trigger = sinon.spy(this.dispatcher._conn, 'trigger');
//        this.dispatcher.trigger('event', 'message');
//        assert(conn_trigger.called === true);
//      });
//
//      it("should not delegate to the connection object, if it's not available", function () {
//        this.dispatcher._conn = null;
//        this.dispatcher.trigger('event', 'message');
//      });
//    });
//  });
//
//  describe('.connection_stale', function () {
//    describe('when state is connected', function () {
//      it('should false', function () {
//        this.dispatcher.state = 'connected';
//        assert(this.dispatcher.connection_stale() === false);
//      });
//    });
//
//    describe('when state is disconnected', function () {
//      it('should true', function () {
//        this.dispatcher.state = 'disconnected';
//        assert(this.dispatcher.connection_stale() === true);
//      });
//    });
//  });
//
//  describe('working with channels', function () {
//    beforeEach(function () {
//      WebSocketRails.Channel = function (name, dispatcher1, is_private) {
//        this.name = name;
//        this.dispatcher = dispatcher1;
//        this.is_private = is_private;
//      };
//    });
//
//    describe('.subscribe', function () {
//      describe('for new channels', function () {
//        it('should create and store a new Channel object', function () {
//          const channel = this.dispatcher.subscribe('test_channel');
//          assert(channel.name === 'test_channel');
//        });
//      });
//
//      describe('for existing channels', function () {
//        it('should the same Channel object', function () {
//          const channel = this.dispatcher.subscribe('test_channel');
//          assert(this.dispatcher.subscribe('test_channel') === channel);
//        });
//      });
//    });
//
//    describe('.subscribe_private', function () {
//      it('should create private channels', function () {
//        const private_channel = this.dispatcher.subscribe_private('private_something');
//        assert(private_channel.is_private);
//      });
//    });
//
//    describe('.unsubscribe', function () {
//      describe('for existing channels', function () {
//        it('should remove the Channel object', function () {
//          this.dispatcher.unsubscribe('test_channel');
//          //assert(this.dispatcher.channels['test_channel']).toBeUndefined;
//        });
//      });
//    });
//
//    describe('.dispatch_channel', function () {
//      it('should delegate to the Channel object', function () {
//        var channel, event, spy;
//        channel = this.dispatcher.subscribe('test');
//        channel.dispatch = function () {};
//        spy = sinon.spy(channel, 'dispatch');
//        event = new WebSocketRails.Event([
//          'event', {
//            channel: 'test',
//            data:    'awesome',
//          },
//        ]);
//        this.dispatcher.dispatch_channel(event);
//        assert(spy.calledWith('event', 'awesome') === true);
//      });
//    });
//  });
//
//});
