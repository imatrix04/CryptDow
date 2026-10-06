import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MarketOrderInput } from '../../../shared/types'

export const PORTFOLIO_ID = 1

export function useBalances() {
  return useQuery({
    queryKey: ['balances', PORTFOLIO_ID],
    queryFn: () => window.api.getBalances(PORTFOLIO_ID)
  })
}

export function useTrades() {
  return useQuery({
    queryKey: ['trades', PORTFOLIO_ID],
    queryFn: () => window.api.getTrades(PORTFOLIO_ID)
  })
}

export function usePlaceOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<MarketOrderInput, 'portfolioId'>) =>
      window.api.placeMarketOrder({ ...input, portfolioId: PORTFOLIO_ID }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['balances'] })
      qc.invalidateQueries({ queryKey: ['trades'] })
    }
  })
}

export function usePortfolioInfo() {
  return useQuery({
    queryKey: ['portfolio', PORTFOLIO_ID],
    queryFn: () => window.api.getPortfolio(PORTFOLIO_ID)
  })
}

export function useResetPortfolio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (amount: string) => window.api.resetPortfolio(PORTFOLIO_ID, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] })
      qc.invalidateQueries({ queryKey: ['balances'] })
      qc.invalidateQueries({ queryKey: ['trades'] })
    }
  })
}