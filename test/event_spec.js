import assert from 'power-assert';
import Event from '../src/Event';

describe('Event', () => {
  describe('standard events', () => {
    let event;
    beforeEach(() => {
      const data = [
        'event', {
          data: {
            message: 'test',
          },
        }, 12345,
      ];
      event = new Event(data);
    });
    it('should generate an ID', () => {
      assert(event.id !== null);
    });

    it('should have a connection ID', () => {
      assert(event.connection_id === 12345);
    });

    it('should assign the correct properties when passed a data array', () => {
      assert(event.name === 'event');
      assert(event.data.message === 'test');
    });

    describe('.serialize()', () => {
      it('should serialize the event as JSON', () => {
        event.id = 1;
        const serialized = '["event",{"id":1,"data":{"message":"test"}}]';
        assert(event.serialize() === serialized);
      });
    });

    describe('.is_channel()', () => {
      it('should be false', () => {
        assert(event.is_channel() === false);
      });
    });
  });

  describe('channel events', () => {
    let event;
    beforeEach(() => {
      const data = [
        'event', {
          channel: 'channel',
          data:    {
            message: 'test',
          },
        },
      ];
      event = new Event(data);
    });

    it('should assign the channel property', () => {
      assert(event.channel === 'channel');
      assert(event.name === 'event');
      assert(event.data.message === 'test');
    });

    describe('.is_channel()', () => {
      it('should be true', () => {
        assert(event.is_channel() === true);
      });
    });
    return describe('.serialize()', () => {
      it('should serialize the event as JSON', () => {
        event.id = 1;
        const serialized = '["event",{"id":1,"channel":"channel","data":{"message":"test"}}]';
        assert(event.serialize() === serialized);
      });
    });
  });

  describe('.run_callbacks()', () => {
    let event;
    beforeEach(() => {
      function success_func(data) {
        return data;
      }

      function failure_func(data) {
        return data;
      }

      const data = [
        'event', {
          data: {
            message: 'test',
          },
        }, 12345,
      ];

      event = new Event(data, success_func, failure_func);
    });

    describe('when successful', () => {
      it('should run the success callback when passed true', () => {
        assert(event.run_callbacks(true, 'success') === 'success');
      });
      // Not sure about this test
      // it('should not run the failure callback', () => {
      //   assert(event.run_callbacks(true, 'success'));
      // });
    });

    describe('when failure', () => {
      it('should run the failure callback when passed true', () => {
        assert(event.run_callbacks(false, 'failure') === 'failure');
      });
      // Not sure about this test
      // it('should not run the failure callback', () => {
      //   assert(event.run_callbacks(true, 'failure'));
      // });
    });
  });
});
