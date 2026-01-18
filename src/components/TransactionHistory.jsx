import { getNetworkInfo, formatAddress } from '../utils/networks'

/**
 * Komponen TransactionHistory
 * Menampilkan daftar transaksi yang sudah dilakukan
 *
 * Konsep React yang digunakan:
 * 1. Array.map() - untuk render list
 * 2. Conditional Rendering - tampilan berbeda berdasarkan status
 * 3. Props - menerima data dari parent
 */

// Format timestamp ke waktu yang readable
function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // Kurang dari 1 menit
  if (diff < 60000) {
    return 'Baru saja'
  }

  // Kurang dari 1 jam
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000)
    return `${mins} menit lalu`
  }

  // Kurang dari 24 jam
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} jam lalu`
  }

  // Lebih dari 24 jam
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    pending: { label: 'Pending', className: 'status-pending' },
    success: { label: 'Success', className: 'status-success' },
    failed: { label: 'Failed', className: 'status-failed' }
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`status-badge ${config.className}`}>
      {status === 'pending' && <span className="status-spinner"></span>}
      {config.label}
    </span>
  )
}

// Single transaction item
function TransactionItem({ tx, account }) {
  const networkInfo = getNetworkInfo(tx.chainId)
  const isSent = tx.from?.toLowerCase() === account?.toLowerCase()

  return (
    <div className="tx-item">
      <div className="tx-item-left">
        <div className={`tx-direction ${isSent ? 'sent' : 'received'}`}>
          {isSent ? (
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M17 7L7 17M7 17H17M7 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className="tx-details">
          <div className="tx-type">
            {tx.type === 'token_transfer' ? (
              <span>Transfer {tx.tokenSymbol}</span>
            ) : (
              <span>{isSent ? 'Kirim' : 'Terima'} {networkInfo.symbol}</span>
            )}
          </div>
          <div className="tx-address">
            {isSent ? 'Ke: ' : 'Dari: '}
            {formatAddress(isSent ? tx.to : tx.from)}
          </div>
          <div className="tx-time">{formatTime(tx.timestamp)}</div>
        </div>
      </div>

      <div className="tx-item-right">
        <div className={`tx-amount ${isSent ? 'sent' : 'received'}`}>
          {isSent ? '-' : '+'}
          {tx.type === 'token_transfer'
            ? `${parseFloat(tx.tokenAmount).toFixed(4)} ${tx.tokenSymbol}`
            : `${parseFloat(tx.value).toFixed(4)} ${networkInfo.symbol}`
          }
        </div>
        <StatusBadge status={tx.status} />
        {networkInfo.explorer && (
          <a
            href={`${networkInfo.explorer}/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-explorer-link"
            title="Lihat di Explorer"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 13V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V8C3 6.89543 3.89543 6 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

function TransactionHistory({ transactions, account, onClearHistory }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="tx-history">
        <div className="tx-history-header">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" className="history-icon">
              <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Riwayat Transaksi
          </h3>
        </div>
        <div className="tx-empty">
          <svg viewBox="0 0 24 24" fill="none" className="empty-icon">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <p>Belum ada transaksi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tx-history">
      <div className="tx-history-header">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" className="history-icon">
            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Riwayat Transaksi
        </h3>
        <button className="clear-history-btn" onClick={onClearHistory}>
          Hapus Semua
        </button>
      </div>

      <div className="tx-list">
        {transactions.map((tx) => (
          <TransactionItem key={tx.hash} tx={tx} account={account} />
        ))}
      </div>
    </div>
  )
}

export default TransactionHistory
