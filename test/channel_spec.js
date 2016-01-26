import sinon from 'sinon';
import assert from 'power-assert';
import Channel from '../src/Channel';
import { WebSocketRailsStub } from './stubs';

describe('WebSocketRails.Channel:', () => {
  let dispatcher;
  let channel;
  let spy;

  beforeEach(() => {
    dispatcher = new WebSocketRailsStub();
    channel = new Channel('public', dispatcher);
    spy = sinon.spy(dispatcher, 'trigger_event');
  });

  afterEach(() => {
    dispatcher.trigger_event.restore();
  });

  describe('.bind', () => {
    it('should add a function to the callbacks collection', () => {
      const test_func = () => ({});
      channel.bind('event_name', test_func);
      assert(channel._callbacks.event_name.length === 1);
      assert(channel._callbacks.event_name.some(item => item === test_func));
    });
  });

  describe('.unbind', () => {
    it('should remove the callbacks of an event', () => {
      const callback = () => true;
      channel.bind('event', callback);
      channel.unbind('event');
      assert(channel._callbacks.event === undefined);
    });
  });

  describe('.trigger', () => {
    describe('before the channel token is set', () => {
      it('queues the events', () => {
        channel.trigger('someEvent', 'someData');
        const queue = channel._queue;
        assert(queue[0].name === 'someEvent');
        assert(queue[0].data === 'someData');
      });
    });
    describe('when channel token is set', () => {
      it('adds token to event metadata and dispatches event', () => {
        channel._token = 'valid token';
        channel.trigger('someEvent', 'someData');
        dispatcher.trigger_event([
          'someEvent', {
            token: 'valid token',
            data:  'someData',
          },
        ]);

        assert(spy.calledWith([
          'someEvent', {
            token: 'valid token',
            data:  'someData',
          },
        ]));
      });
    });
  });

  describe('.destroy', () => {
    it('should destroy all callbacks', () => {
      const event_callback = () => true;

      channel.bind('new_message', event_callback);
      channel.destroy();
      assert.deepEqual(channel._callbacks, {});
    });

    describe('when this channel\'s connection is still active', () => {
      it('should send unsubscribe event', () => {
        channel.destroy();
        assert(dispatcher.trigger_event.args[0][0].name === 'websocket_rails.unsubscribe');
      });
    });

    describe('when this channel\'s connection is no more active', () => {
      beforeEach(() => (dispatcher._conn.connection_id++));

      it('should not send unsubscribe event', () => {
        channel.destroy();
        return assert(dispatcher.trigger_event.notCalled === true);
      });
    });
  });

  describe('public channels', () => {
    let event;

    beforeEach(() => {
      channel = new Channel('forchan', dispatcher, false);
      event = dispatcher.trigger_event.lastCall.args[0];
    });

    it('should trigger an event containing the channel name', () => {
      assert(event.data.channel === 'forchan');
    });

    it('should trigger an event containing the correct connection_id', () => {
      assert(event.connection_id === 12345);
    });

    it('should initialize an empty callbacks property', () => {
      assert(channel._callbacks);
      assert.deepEqual(channel._callbacks, {});
    });
    it('should be public', () => {
      assert(!channel.is_private);
    });
  });

  describe('channel tokens', () => {
    it('should set token when event_name is websocket_rails.channel_token', () => {
      channel.dispatch('websocket_rails.channel_token', {
        token: 'abc123',
      });
      assert(channel._token === 'abc123');
    });

    it("should refresh channel's connection_id after channel_token has been received", () => {
      channel.connection_id = null;
      channel.dispatch('websocket_rails.channel_token', {
        token: 'abc123',
      });
      assert(channel.connection_id === dispatcher._conn.connection_id);
    });

    it('should flush the event queue after setting token', () => {
      channel.trigger('someEvent', 'someData');
      channel.dispatch('websocket_rails.channel_token', {
        token: 'abc123',
      });
      assert(channel._queue.length === 0);
    });
  });

  describe('private channels', () => {
    let event;

    beforeEach(() => {
      channel = new Channel('forchan', dispatcher, true);
      event = dispatcher.trigger_event.lastCall.args[0];
    });

    it('should trigger a subscribe_private event when created', () => {
      assert(event.name === 'websocket_rails.subscribe_private');
    });

    it('should be private', () => {
      assert(channel.is_private);
    });
  });
});
