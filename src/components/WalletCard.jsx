import { formatAddress, getNetworkInfo } from '../utils/networks'

/**
 * Komponen WalletCard
 * Menampilkan informasi wallet yang terkoneksi
 *
 * Props:
 * - account: alamat wallet
 * - balance: saldo dalam ETH
 * - chainId: ID network
 * - onDisconnect: fungsi untuk disconnect
 */
function WalletCard({ account, balance, chainId, onDisconnect }) {
  const network = getNetworkInfo(chainId)

  return (
    <div className="wallet-card">
      <div className="wallet-header">
        <span className="connected-badge">Connected</span>
        <button className="disconnect-btn" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>

      <div className="wallet-info">
        <div className="info-row">
          <span className="label">Address</span>
          <span className="value address">{formatAddress(account)}</span>
        </div>

        <div className="info-row">
          <span className="label">Balance</span>
          <span className="value balance">
            {balance ? `${parseFloat(balance).toFixed(4)} ${network.symbol}` : 'Loading...'}
          </span>
        </div>

        <div className="info-row">
          <span className="label">Network</span>
          <span className="value network">{network.name}</span>
        </div>
      </div>

      {network.explorer && (
        <a
          href={`${network.explorer}/address/${account}`}
          target="_blank"
          rel="noopener noreferrer"
          className="explorer-link"
        >
          View on Explorer
        </a>
      )}
    </div>
  )
}

export default WalletCard
