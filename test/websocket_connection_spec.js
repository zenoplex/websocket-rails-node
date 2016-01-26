import sinon from 'sinon';
import assert from 'power-assert';
import Event from '../src/Event';
import WebSocketConnection from '../src/WebSocketConnection';
import { WebSocketStub } from './stubs';

describe('WebSocketConnection', () => {
  const SAMPLE_EVENT_DATA = ['event', 'message'];
  const SAMPLE_EVENT = {
    data: JSON.stringify(SAMPLE_EVENT_DATA),
  };

  beforeEach(function () {
    this.dispatcher = {
      new_message: () => true,
      dispatch:    () => true,
      state:       'connected',
    };
    WebSocket = WebSocketStub;
    this.connection = new WebSocketConnection('localhost:3000/websocket', this.dispatcher);
    this.dispatcher._conn = this.connection;
  });

  describe('constructor', function () {
    it('should redirect onmessage events\' data from the WebSocket object to this.on_message', function () {
      var mock_connection;
      mock_connection = sinon.mock(this.connection);
      mock_connection.expects('on_message').once().withArgs(SAMPLE_EVENT_DATA);
      this.connection._conn.onmessage(SAMPLE_EVENT);
      mock_connection.verify();
    });
    it('should redirect onclose events from the WebSocket object to this.on_close', function () {
      var mock_connection;
      mock_connection = sinon.mock(this.connection);
      mock_connection.expects('on_close').once().withArgs(SAMPLE_EVENT);
      this.connection._conn.onclose(SAMPLE_EVENT);
      mock_connection.verify();
    });
    describe('with ssl', function () {
      it('should not add the ws:// prefix to the URL', function () {
        var connection;
        connection = new WebSocketConnection('wss://localhost.com');
        assert(connection.url === 'wss://localhost.com');
      });
    });
    describe('without ssl', function () {
      it('should add the ws:// prefix to the URL', function () {
        assert(this.connection.url === 'ws://localhost:3000/websocket');
      });
    });
  });

  describe('.close', function () {
    it('should close the connection', function () {
      this.connection.close();
      assert(this.dispatcher.state === 'disconnected');
    });
  });

  describe('.trigger', function () {
    describe('before the connection has been fully established', function () {
      it('should queue up the events', function () {
        var event, mock_queue;
        this.connection.dispatcher.state = 'connecting';
        event = new Event(['event', 'message']);
        mock_queue = sinon.mock(this.connection.message_queue);
        mock_queue.expects('push').once().withArgs(event);
      });
    });

    describe('after the connection has been fully established', function () {
      it('should encode the data and send it through the WebSocket object', function () {
        this.connection.dispatcher.state = 'connected';
        const event = new Event(['event', 'message']);
        this.connection._conn = {
          send: () => true,
        };
        const mock_connection = sinon.mock(this.connection._conn);
        mock_connection.expects('send').once().withArgs(event.serialize());
        this.connection.trigger(event);
        mock_connection.verify();
      });
    });
  });

  describe('.on_message', function () {
    it('should decode the message and pass it to the dispatcher', function () {
      const mock_dispatcher = sinon.mock(this.connection.dispatcher);
      mock_dispatcher.expects('new_message').once().withArgs(SAMPLE_EVENT_DATA);
      this.connection.on_message(SAMPLE_EVENT_DATA);
      mock_dispatcher.verify();
    });
  });

  describe('.on_close', function () {
    it('should dispatch the connection_closed event and pass the original event', function () {
      const event = new Event(['event', 'message']);
      const close_event = new Event(['connection_closed', event]);
      sinon.spy(this.dispatcher, 'dispatch');
      this.connection.on_close(close_event);
      const dispatcher = this.dispatcher.dispatch;
      const lastCall = dispatcher.lastCall.args[0];
      assert(dispatcher.calledOnce === true);
      assert(lastCall.data === event.data);
      dispatcher.restore();
    });
    it('sets the connection state on the dispatcher to disconnected', function () {
      const close_event = new Event(['connection_closed', {}]);
      this.connection.on_close(close_event);
      assert(this.dispatcher.state === 'disconnected');
    });
  });

  describe('.on_error', function () {
    it('should dispatch the connection_error event and pass the original event', function () {
      const event = new Event(['event', 'message']);
      const error_event = new Event(['connection_error', event]);
      sinon.spy(this.dispatcher, 'dispatch');
      this.connection.on_error(event);
      const dispatcher = this.dispatcher.dispatch;
      const lastCall = dispatcher.lastCall.args[0];
      assert(dispatcher.calledOnce === true);
      assert(lastCall.data === event.data);
      dispatcher.restore();
    });
    it('sets the connection state on the dispatcher to disconnected', function () {
      const close_event = new Event(['connection_closed', {}]);
      this.connection.on_error(close_event);
      assert(this.dispatcher.state === 'disconnected');
    });
  });
  describe('it\'s no longer active connection', function () {
    beforeEach(function () {
      this.new_connection = new WebSocketConnection('localhost:3000/websocket', this.dispatcher);
      this.dispatcher._conn = this.new_connection;
    });
    it('.on_error should not react to the event response', function () {
      const mock_dispatcher = sinon.mock(this.connection.dispatcher);
      mock_dispatcher.expects('dispatch').never();
      this.connection.on_error(SAMPLE_EVENT_DATA);
      mock_dispatcher.verify();
    });
    it('.on_close should not react to the event response', function () {
      const mock_dispatcher = sinon.mock(this.connection.dispatcher);
      mock_dispatcher.expects('dispatch').never();
      this.connection.on_close(SAMPLE_EVENT_DATA);
      mock_dispatcher.verify();
    });
    it('.on_message should not react to the event response', function () {
      const mock_dispatcher = sinon.mock(this.connection.dispatcher);
      mock_dispatcher.expects('new_message').never();
      this.connection.on_message(SAMPLE_EVENT_DATA);
      mock_dispatcher.verify();
    });
  });

  describe('.flush_queue', function () {
    beforeEach(function () {
      this.event = new Event(['event', 'message']);
      this.connection.message_queue.push(this.event);
      this.connection._conn = {
        send: () => true,
      };
    });
    it('should send out all of the messages in the queue', function () {
      const mock_connection = sinon.mock(this.connection._conn);
      mock_connection.expects('send').once().withArgs(this.event.serialize());
      this.connection.flush_queue();
      mock_connection.verify();
    });
    it('should empty the queue after sending', function () {
      assert(this.connection.message_queue.length === 1);
      this.connection.flush_queue();
      assert(this.connection.message_queue.length === 0);
    });
  });
});
