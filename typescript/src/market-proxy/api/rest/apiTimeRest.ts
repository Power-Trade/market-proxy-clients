import MarketProxyWs from '../../base/MarketProxyWs';

type ApiTimeResponseRaw = {
  server_utc_timestamp: string;
};

export type ApiTimeResponse = {
  serverUtcTimestamp: string;
};

export const apiTimeRest = async (ws: MarketProxyWs): Promise<ApiTimeResponse> => {
  const response = (await ws.restCall({
    url: `${ws.httpUrl}/v1/api/time`,
    method: 'GET',
  })) as ApiTimeResponseRaw;

  return { serverUtcTimestamp: response.server_utc_timestamp };
};
