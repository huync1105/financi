export const environment = {
  production: false,
  /** Get a free key at https://www.alphavantage.co/support/#api-key (25 requests/day on free tier) */
  alphaVantageApiKey: '',
  baseUrl: 'http://localhost:3000/',
  /** WebSocket URL for chat (derive from baseUrl if not set) */
  wsUrl: 'ws://localhost:3000/ws',
};
