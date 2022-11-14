import { test, describe, beforeAll, afterAll, expect } from '@jest/globals';

import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { SnapshotRaw } from '../../market-proxy/types';
import { sleep } from '../../market-proxy/utils/time';
import { getUserTag } from '../../market-proxy/utils/userTag';

describe('[WS] Listen to RFQs', () => {
  let api: MarketProxyApi;

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();
  }, 10000);

  afterAll(async () => {
    await api.cancelAllOpenOrdersRest();
    await api.close();
  });

  test('[WS] listen to Rfqs', async () => {
    let rfqsAdded: any[] = [];
    let rfqsRemoved: any[] = [];
    const unsubscribeFromRfqAdded = api.onRfqAdded((msg) => rfqsAdded.push(msg));
    const unsubscribeFromRfqRemoved = api.onRfqRemoved((msg) => rfqsRemoved.push(msg));

    await api.startListeningForRfqsWs();

    expect(rfqsAdded.length).toEqual(0);

    await api.placeOrderWs({
      activeCycles: 4,
      clientOrderId: getUserTag(),
      marketType: 'rfq',
      orderType: 'Limit',
      price: 1,
      quantity: 10000,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      symbol: 'PTF-USD',
    });

    while (rfqsAdded.length === 0) {
      await sleep(200);
    }

    expect(rfqsAdded.length).toEqual(1);
    expect(rfqsAdded[0]).toEqual({
      server_utc_timestamp: expect.any(String),
      utc_timestamp: expect.any(String),
      market_id: 'none',
      tradeable_entity_id: '6',
      symbol: 'PTF-USD',
      side: 'buy',
      order_id: expect.any(String),
      price: expect.any(String),
      quantity: '10000.0',
    });

    expect(rfqsRemoved.length).toEqual(0);

    await api.cancelAllOpenOrdersRest();

    while (rfqsRemoved.length === 0) {
      await sleep(200);
    }

    expect(rfqsRemoved.length).toEqual(1);
    expect(rfqsRemoved[0]).toEqual({
      server_utc_timestamp: expect.any(String),
      utc_timestamp: expect.any(String),
      market_id: 'none',
      tradeable_entity_id: '6',
      symbol: 'PTF-USD',
      side: 'buy',
      order_id: expect.any(String),
    });

    await api.stopListeningForRfqsWs();

    unsubscribeFromRfqAdded();
    unsubscribeFromRfqRemoved();
  }, 100000);

  test('[WS] place RFQs without listening', async () => {
    let rfqsAdded: any[] = [];
    let rfqsRemoved: any[] = [];
    const unsubscribeFromRfqAdded = api.onRfqAdded((msg) => rfqsAdded.push(msg));
    const unsubscribeFromRfqRemoved = api.onRfqRemoved((msg) => rfqsRemoved.push(msg));

    expect(rfqsAdded.length).toEqual(0);

    await api.placeOrderWs({
      activeCycles: 4,
      clientOrderId: getUserTag(),
      marketType: 'rfq',
      orderType: 'Limit',
      price: 1,
      quantity: 10000,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      symbol: 'PTF-USD',
    });

    await sleep(3000);

    expect(rfqsAdded.length).toEqual(0);

    expect(rfqsRemoved.length).toEqual(0);

    await api.cancelAllOpenOrdersRest();

    await sleep(3000);

    expect(rfqsRemoved.length).toEqual(0);

    unsubscribeFromRfqAdded();
    unsubscribeFromRfqRemoved();
  }, 100000);

  test('[WS] Received snapshot when first connecting', async () => {
    let snapshots: SnapshotRaw[] = [];
    const unsubscribeFromSnapshots = api.onSnapshot((msg) => snapshots.push(msg));

    await api.placeOrderWs({
      activeCycles: 4,
      clientOrderId: getUserTag(),
      marketType: 'rfq',
      orderType: 'Limit',
      price: 1,
      quantity: 10000,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      symbol: 'PTF-USD',
    });

    await api.placeOrderWs({
      activeCycles: 4,
      clientOrderId: getUserTag(),
      marketType: 'rfq',
      orderType: 'Limit',
      price: 1,
      quantity: 100,
      side: 'sell',
      state: 'new',
      timeInForce: 'GTC',
      symbol: 'SOL-USD',
    });

    await sleep(3000);

    await api.startListeningForRfqsWs();

    await sleep(3000);

    const ptfSnapshot = snapshots.find((s) => s.symbol === 'PTF-USD');

    expect(ptfSnapshot?.market_id).toEqual('none');
    expect(ptfSnapshot?.buy).toContainEqual({
      order_id: expect.any(String),
      price: expect.any(String),
      quantity: '10000.0',
      utc_timestamp: expect.any(String),
    });

    const solSnapshot = snapshots.find((s) => s.symbol === 'SOL-USD');

    expect(solSnapshot?.market_id).toEqual('none');
    expect(solSnapshot?.sell).toContainEqual({
      order_id: expect.any(String),
      price: expect.any(String),
      quantity: '100.0',
      utc_timestamp: expect.any(String),
    });

    await api.stopListeningForRfqsWs();

    unsubscribeFromSnapshots();
  }, 100000);
});
