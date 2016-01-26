import AbstractConnection from './AbstractConnection';

export default class HttpConnection extends AbstractConnection {
  constructor(url, dispatcher) {
    super(url, dispatcher);
    this.connection_type = 'http';

    let e;
    this.dispatcher = dispatcher;
    this._url = 'http://' + url;
    this._conn = this._createXMLHttpObject();
    this.last_pos = 0;
    try {
      this._conn.onreadystatechange = this._parse_stream()
      this._conn.addEventListener('load', this.on_close, false);
    } catch (_error) {
      e = _error;
      this._conn.onprogress = this._parse_stream();
      this._conn.onload = this.on_close;
      this._conn.readyState = 3;
    }
    this._conn.open('GET', this._url, true);
    this._conn.send();
  }

  _httpFactories() {
    const { XDomainRequest, XMLHttpRequest, ActiveXObject } = window;

    return [
      () => new XDomainRequest(),
      () => new XMLHttpRequest(),
      () => new ActiveXObject('Msxml2.XMLHTTP'),
      () => new ActiveXObject('Msxml3.XMLHTTP'),
      () => new ActiveXObject('Microsoft.XMLHTTP'),
    ];
  }

  close() {
    return this._conn.abort();
  };

  send_event(event) {
    super.send_event(event);
    return this._post_data(event.serialize());
  };

  _post_data(payload) {
    const { jQuery } = window;
    if (jQuery) {
      return jQuery.ajax(this._url, {
        type:    'POST',
        data:    {
          client_id: this.connection_id,
          data:      payload,
        },
        success: () => false,
      });
    }
  };

  _createXMLHttpObject() {
    var e, factories, factory, i, len, xmlhttp;
    xmlhttp = false;
    factories = this._httpFactories();
    for (i = 0, len = factories.length; i < len; i++) {
      factory = factories[i];
      try {
        xmlhttp = factory();
      } catch (_error) {
        e = _error;
        continue;
      }
      break;
    }
    return xmlhttp;
  };

  _parse_stream() {
    var data, e, event_data;
    if (this._conn.readyState === 3) {
      data = this._conn.responseText.substring(this.last_pos);
      this.last_pos = this._conn.responseText.length;
      data = data.replace(/\]\]\[\[/g, "],[");
      try {
        event_data = JSON.parse(data);
        return this.on_message(event_data);
      } catch (_error) {
        e = _error;
      }
    }
  };
}
