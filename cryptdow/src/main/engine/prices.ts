export async function getPrice(symbol: string): Promise<string> {
  const res = await fetch(`https://data-api.binance.vision/api/v3/ticker/price?symbol=${symbol}`)
  if (!res.ok) throw new Error(`Prix indisponible pour ${symbol} (${res.status})`)
  const data = (await res.json()) as { price: string }
  return data.price
}