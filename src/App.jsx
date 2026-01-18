import { useState, useCallback } from 'react'
import { useWallet } from './hooks/useWallet'
import { useTransactionHistory } from './hooks/useTransactionHistory'
import WalletCard from './components/WalletCard'
import ConnectButton from './components/ConnectButton'
import SendTransaction from './components/SendTransaction'
import TokenTransfer from './components/TokenTransfer'
import TransactionHistory from './components/TransactionHistory'
import { ethers } from 'ethers'
import './App.css'

/**
 * Komponen utama App
 * Ini adalah entry point dari dApp kita
 *
 * Konsep React yang digunakan:
 * 1. Custom Hooks (useWallet, useTransactionHistory) - untuk logic yang reusable
 * 2. Conditional Rendering - menampilkan UI berbeda berdasarkan state
 * 3. Props - passing data ke child components
 * 4. Event Handling - onClick handlers
 * 5. Tabs Navigation - useState untuk active tab
 */
function App() {
  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState('send') // 'send', 'token', 'history'

  // Menggunakan custom hook untuk wallet connection
  const {
    account,
    balance,
    chainId,
    isConnecting,
    error,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    refreshBalance
  } = useWallet()

  // Menggunakan custom hook untuk transaction history
  const {
    transactions,
    addTransaction,
    updateTransaction,
    clearHistory
  } = useTransactionHistory(account)

  // Handler untuk menambah transaksi ETH ke history
  const handleSendTransaction = useCallback(async (txData) => {
    // Tambah ke history dengan status pending
    addTransaction({
      hash: txData.hash,
      from: account,
      to: txData.to,
      value: txData.value,
      type: 'send',
      chainId
    })

    // Update status setelah transaksi selesai
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const receipt = await provider.waitForTransaction(txData.hash)
      updateTransaction(txData.hash, {
        status: receipt.status === 1 ? 'success' : 'failed'
      })
    } catch {
      updateTransaction(txData.hash, { status: 'failed' })
    }
  }, [account, chainId, addTransaction, updateTransaction])

  // Handler untuk menambah transaksi token ke history
  const handleAddTokenTransaction = useCallback((txData) => {
    addTransaction(txData)
  }, [addTransaction])

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
          // Sudah terkoneksi - tampilkan wallet dan fitur
          <div className="wallet-section">
            <WalletCard
              account={account}
              balance={balance}
              chainId={chainId}
              onDisconnect={disconnectWallet}
            />

            {/* Tabs Navigation */}
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'send' ? 'active' : ''}`}
                onClick={() => setActiveTab('send')}
              >
                Kirim ETH
              </button>
              <button
                className={`tab-btn ${activeTab === 'token' ? 'active' : ''}`}
                onClick={() => setActiveTab('token')}
              >
                Token ERC-20
              </button>
              <button
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Riwayat
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'send' && (
              <SendTransaction
                account={account}
                chainId={chainId}
                onTransactionComplete={refreshBalance}
                onTransactionSent={handleSendTransaction}
              />
            )}

            {activeTab === 'token' && (
              <TokenTransfer
                account={account}
                chainId={chainId}
                onTransactionComplete={refreshBalance}
                onAddTransaction={handleAddTokenTransaction}
              />
            )}

            {activeTab === 'history' && (
              <TransactionHistory
                transactions={transactions}
                account={account}
                onClearHistory={clearHistory}
              />
            )}
          </div>
        )}

        {/* Info Section */}
        <section className="info-section">
          <h3>Apa yang dipelajari:</h3>
          <ul>
            <li><strong>useState</strong> - Mengelola state lokal (tabs, form)</li>
            <li><strong>useEffect</strong> - Side effects dan lifecycle</li>
            <li><strong>useCallback</strong> - Memoize fungsi</li>
            <li><strong>Custom Hooks</strong> - useWallet, useTransactionHistory</li>
            <li><strong>localStorage</strong> - Persistent storage untuk history</li>
            <li><strong>ERC-20</strong> - Interaksi dengan smart contract token</li>
            <li><strong>ethers.js</strong> - Library Web3 untuk Ethereum</li>
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
