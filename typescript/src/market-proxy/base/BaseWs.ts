import WebSocket from 'ws';

import { log } from '../utils/log';

class BaseWs {
  private ws: WebSocket;
  private onOpen: () => void;
  private onClose: () => void;
  private onMessage: (payload: any) => void;

  constructor({
    url,
    onOpen,
    onClose,
    onMessage,
  }: {
    url: string;
    onOpen: () => void;
    onClose: () => void;
    onMessage: (payload: any) => void;
  }) {
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onMessage = onMessage;
    log(`opening: ${url}`);
    this.ws = new WebSocket(url);

    this.ws.onopen = this.onWsOpen;
    this.ws.onclose = this.onWsClose;
    this.ws.onmessage = this.onWsMessage;
  }

  private onWsOpen = () => {
    log('opened');
    this.onOpen();
  };

  private onWsClose = () => {
    log('closed');
    this.onClose();
  };

  private onWsMessage = (payload: any) => {
    try {
      this.onMessage(JSON.parse(payload.data));
      log(JSON.parse(payload.data));
    } catch (err) {
      console.error(`market proxy: failed to decode ws message on endpoint ${payload.data}`);
      this.onMessage({});
    }
  };

  public send = (payload: any) => {
    log(payload);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  };

  public close = () => this.ws.close();
}

export default BaseWs;
