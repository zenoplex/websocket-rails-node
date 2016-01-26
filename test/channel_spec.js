//import sinon from 'sinon';
//import assert from 'power-assert';
//import Channel from '../src/Channel';
//import { WebSocketRailsStub } from './stubs';
//
//
//describe('Channel:', function () {
//  beforeEach(function () {
//    this.dispatcher = new WebSocketRailsStub();
//    this.channel = new Channel('public', this.dispatcher);
//    sinon.spy(this.dispatcher, 'trigger_event');
//  });
//
//  afterEach(function () {
//    this.dispatcher.trigger_event.restore();
//  });
//
//  describe('.bind', function () {
//    it('should add a function to the callbacks collection', function () {
//      const test_func = function () {};
//      this.channel.bind('event_name', test_func);
//      assert(this.channel._callbacks['event_name'].length === 1);
//
//      console.log(this.channel._callbacks['event_name'], 'afe');
//
//      assert(this.channel._callbacks['event_name'].find(test_func));
//    });
//  });
//
//  describe('.unbind', function () {
//    it('should remove the callbacks of an event', function () {
//
//      const callback = function () {};
//      this.channel.bind('event', callback);
//      this.channel.unbind('event');
//      assert(this.channel._callbacks['event']).toBeUndefined();
//    });
//  });
//
//  describe('.trigger', function () {
//    describe('before the channel token is set', function () {
//      it('queues the events', function () {
//        var queue;
//        this.channel.trigger('someEvent', 'someData');
//        queue = this.channel._queue;
//        assert(queue[0].name).toEqual('someEvent');
//        assert(queue[0].data).toEqual('someData');
//      });
//    });
//
//    describe('when channel token is set', function () {
//      it('adds token to event metadata and dispatches event', function () {
//        this.channel._token = 'valid token';
//        this.channel.trigger('someEvent', 'someData');
//        assert(this.dispatcher.trigger_event.calledWith([
//          'someEvent', {
//            token: 'valid token',
//            data:  'someData'
//          }
//        ]));
//      });
//    });
//  });
//
//  describe('.destroy', function () {
//    it('should destroy all callbacks', function () {
//      var event_callback;
//      event_callback = function () {
//        true;
//      };
//      this.channel.bind('new_message', this.event_callback);
//      this.channel.destroy();
//      assert(this.channel._callbacks).toEqual({});
//    });
//
//    describe('when this channel\'s connection is still active', function () {
//      it('should send unsubscribe event', function () {
//        this.channel.destroy();
//        assert(this.dispatcher.trigger_event.args[0][0].name).toEqual('websocket_rails.unsubscribe');
//      });
//    });
//
//    describe('when this channel\'s connection is no more active', function () {
//      beforeEach(function () {
//        this.dispatcher._conn.connection_id++;
//      });
//      it('should not send unsubscribe event', function () {
//        this.channel.destroy();
//        assert(this.dispatcher.trigger_event.notCalled).toEqual(true);
//      });
//    });
//  });
//
//  describe('public channels', function () {
//    beforeEach(function () {
//      this.channel = new WebSocketRails.Channel('forchan', this.dispatcher, false);
//      this.event = this.dispatcher.trigger_event.lastCall.args[0];
//    });
//    it('should trigger an event containing the channel name', function () {
//      assert(this.event.data.channel).toEqual('forchan');
//    });
//    it('should trigger an event containing the correct connection_id', function () {
//      assert(this.event.connection_id).toEqual(12345);
//    });
//    it('should initialize an empty callbacks property', function () {
//      assert(this.channel._callbacks).toBeDefined();
//      assert(this.channel._callbacks).toEqual({});
//    });
//    it('should be public', function () {
//      assert(this.channel.is_private).toBeFalsy;
//    });
//  });
//  describe('channel tokens', function () {
//    it('should set token when event_name is websocket_rails.channel_token', function () {
//      this.channel.dispatch('websocket_rails.channel_token', {
//        token: 'abc123'
//      });
//      assert(this.channel._token).toEqual('abc123');
//    });
//    it("should refresh channel's connection_id after channel_token has been received", function () {
//      this.channel.connection_id = null;
//      this.channel.dispatch('websocket_rails.channel_token', {
//        token: 'abc123'
//      });
//      assert(this.channel.connection_id).toEqual(this.dispatcher._conn.connection_id);
//    });
//    it('should flush the event queue after setting token', function () {
//      this.channel.trigger('someEvent', 'someData');
//      this.channel.dispatch('websocket_rails.channel_token', {
//        token: 'abc123'
//      });
//      assert(this.channel._queue.length).toEqual(0);
//    });
//  });
//  describe('private channels', function () {
//    beforeEach(function () {
//      this.channel = new WebSocketRails.Channel('forchan', this.dispatcher, true);
//      this.event = this.dispatcher.trigger_event.lastCall.args[0];
//    });
//    it('should trigger a subscribe_private event when created', function () {
//      assert(this.event.name).toEqual('websocket_rails.subscribe_private');
//    });
//    it('should be private', function () {
//      assert(this.channel.is_private).toBeTruthy;
//    });
//  });
//});
//
//// ---
//// generated by coffee-script 1.9.2
