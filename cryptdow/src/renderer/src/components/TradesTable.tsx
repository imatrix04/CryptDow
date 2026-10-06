import { useTrades } from '../hooks/usePortfolio'

export function TradesTable() {
  const { data: trades = [] } = useTrades()

  if (trades.length === 0) {
    return <p className="p-3 text-sm text-gray-500">Aucun trade pour l'instant.</p>
  }

  return (
    <table className="w-full text-left text-xs">
      <thead className="sticky top-0 bg-[#0f1117] text-gray-400">
        <tr>
          <th className="px-3 py-1.5">Date</th>
          <th>Paire</th>
          <th>Côté</th>
          <th>Prix</th>
          <th>Quantité</th>
          <th>Frais</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((t) => (
          <tr key={t.id} className="border-t border-gray-800">
            <td className="px-3 py-1.5 text-gray-400">
              {new Date(t.executedAt).toLocaleString('fr-FR')}
            </td>
            <td>{t.pair}</td>
            <td className={t.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>
              {t.side === 'BUY' ? 'Achat' : 'Vente'}
            </td>
            <td>{t.price}</td>
            <td>{t.quantity}</td>
            <td className="text-gray-400">
              {t.fee} {t.feeAsset}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}