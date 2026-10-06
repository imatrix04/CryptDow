import Decimal from 'decimal.js'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

export { Decimal }
export const D = (v: Decimal.Value): Decimal => new Decimal(v)