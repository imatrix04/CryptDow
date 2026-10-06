import { useState } from 'react'
import { usePortfolioInfo, useResetPortfolio } from '../hooks/usePortfolio'

const PRESETS = ['1000', '10000', '100000', '1000000']

function cleanError(msg: string) {
  return msg.replace(/^Error invoking remote method '[^']+': (Error: )?/, '')
}

export function ResetPortfolio() {
  const { data: info } = usePortfolioInfo()
  const reset = useResetPortfolio()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('10000')
  const [error, setError] = useState<string | null>(null)

  const openDialog = () => {
    setAmount(info?.initialBalance ?? '10000')
    setError(null)
    setOpen(true)
  }

  const confirm = () => {
    setError(null)
    reset.mutate(amount, {
      onSuccess: () => setOpen(false),
      onError: (err) => setError(cleanError((err as Error).message))
    })
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="rounded border border-gray-700 py-1.5 text-xs text-gray-400 hover:border-red-500 hover:text-red-400"
      >
        Réinitialiser le portefeuille
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-96 rounded bg-[#151822] p-4 shadow-xl">
            <h3 className="mb-1 font-semibold">Réinitialiser le portefeuille</h3>
            <p className="mb-3 text-xs text-gray-400">
              Tous les trades, ordres et soldes seront supprimés. Tu repars avec le montant
              ci-dessous en USDT. Cette action est irréversible.
            </p>

            <label className="text-xs text-gray-400">Capital de départ (USDT)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(',', '.'))}
              inputMode="decimal"
              autoFocus
              className="mb-2 w-full rounded bg-[#1a1d27] px-2 py-1.5 text-sm outline-none"
            />

            <div className="mb-3 grid grid-cols-4 gap-1">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`rounded py-1 text-xs ${
                    amount === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#1a1d27] text-gray-400 hover:text-white'
                  }`}
                >
                  {Number(p).toLocaleString('fr-FR')}
                </button>
              ))}
            </div>

            {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded bg-[#1a1d27] px-3 py-1.5 text-sm text-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={confirm}
                disabled={reset.isPending || !amount}
                className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                {reset.isPending ? 'Réinitialisation…' : 'Réinitialiser'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}