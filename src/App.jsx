import { useWallet } from './hooks/useWallet'
import WalletCard from './components/WalletCard'
import ConnectButton from './components/ConnectButton'
import './App.css'

/**
 * Komponen utama App
 * Ini adalah entry point dari dApp kita
 *
 * Konsep React yang digunakan:
 * 1. Custom Hooks (useWallet) - untuk logic yang reusable
 * 2. Conditional Rendering - menampilkan UI berbeda berdasarkan state
 * 3. Props - passing data ke child components
 * 4. Event Handling - onClick handlers
 */
function App() {
  // Menggunakan custom hook untuk wallet connection
  const {
    account,
    balance,
    chainId,
    isConnecting,
    error,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet
  } = useWallet()

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>Web3 Wallet dApp</h1>
        <p className="subtitle">Belajar React dengan Web3 Integration</p>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Conditional Rendering: tampilkan berdasarkan status koneksi */}
        {!account ? (
          // Belum terkoneksi - tampilkan tombol connect
          <div className="connect-section">
            <div className="connect-info">
              <h2>Connect Your Wallet</h2>
              <p>
                Hubungkan wallet MetaMask kamu untuk mulai menggunakan dApp ini.
              </p>
            </div>

            {!isMetaMaskInstalled ? (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="install-link"
              >
                Install MetaMask
              </a>
            ) : (
              <ConnectButton
                onClick={connectWallet}
                isConnecting={isConnecting}
              />
            )}
          </div>
        ) : (
          // Sudah terkoneksi - tampilkan info wallet
          <WalletCard
            account={account}
            balance={balance}
            chainId={chainId}
            onDisconnect={disconnectWallet}
          />
        )}

        {/* Info Section */}
        <section className="info-section">
          <h3>Apa yang dipelajari:</h3>
          <ul>
            <li><strong>useState</strong> - Mengelola state lokal komponen</li>
            <li><strong>useEffect</strong> - Side effects dan lifecycle</li>
            <li><strong>useCallback</strong> - Memoize fungsi</li>
            <li><strong>Custom Hooks</strong> - Logic reusable (useWallet)</li>
            <li><strong>Props</strong> - Passing data antar komponen</li>
            <li><strong>Conditional Rendering</strong> - Tampilkan UI berdasarkan kondisi</li>
            <li><strong>Event Handling</strong> - Menangani user interactions</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Built with React + Vite + ethers.js</p>
      </footer>
    </div>
  )
}

export default App
