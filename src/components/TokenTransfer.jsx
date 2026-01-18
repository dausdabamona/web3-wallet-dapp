import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { ERC20_ABI, getPopularTokens, formatTokenAmount } from '../utils/tokens'
import { getNetworkInfo } from '../utils/networks'

/**
 * Komponen TokenTransfer
 * Transfer token ERC-20 ke alamat lain
 *
 * Konsep React yang digunakan:
 * 1. useState - form inputs dan token info
 * 2. useEffect - load token info saat address berubah
 * 3. useCallback - memoize async functions
 * 4. Error Handling - handle berbagai error case
 */

const TX_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed'
}

function TokenTransfer({ account, chainId, onTransactionComplete, onAddTransaction }) {
  // Token state
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenInfo, setTokenInfo] = useState(null)
  const [tokenBalance, setTokenBalance] = useState(null)

  // Form state
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')

  // Transaction state
  const [txStatus, setTxStatus] = useState(TX_STATUS.IDLE)
  const [txHash, setTxHash] = useState(null)
  const [txError, setTxError] = useState(null)

  // UI state
  const [showTokenList, setShowTokenList] = useState(false)

  const networkInfo = getNetworkInfo(chainId)
  const popularTokens = getPopularTokens(chainId)

  // Validasi alamat
  const isValidAddress = useCallback((address) => {
    try {
      return ethers.isAddress(address)
    } catch {
      return false
    }
  }, [])

  // Load token info saat token address berubah
  const loadTokenInfo = useCallback(async (address) => {
    if (!isValidAddress(address)) {
      setTokenInfo(null)
      setTokenBalance(null)
      return
    }

    setTxStatus(TX_STATUS.LOADING)
    setTxError(null)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(address, ERC20_ABI, provider)

      // Fetch token info
      const [name, symbol, decimals, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.balanceOf(account)
      ])

      setTokenInfo({ name, symbol, decimals: Number(decimals), address })
      setTokenBalance(formatTokenAmount(balance.toString(), Number(decimals)))
      setTxStatus(TX_STATUS.IDLE)
    } catch (err) {
      console.error('Error loading token:', err)
      setTxError('Token tidak valid atau tidak ditemukan')
      setTokenInfo(null)
      setTokenBalance(null)
      setTxStatus(TX_STATUS.IDLE)
    }
  }, [account, isValidAddress])

  // Effect: load token info saat address berubah
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tokenAddress) {
        loadTokenInfo(tokenAddress)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [tokenAddress, loadTokenInfo])

  // Pilih token dari list
  const selectToken = (token) => {
    setTokenAddress(token.address)
    setTokenInfo({
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      address: token.address
    })
    setShowTokenList(false)
    // Load balance
    loadTokenInfo(token.address)
  }

  // Transfer token
  const transferToken = async () => {
    if (!tokenInfo || !isValidAddress(recipient) || !amount || parseFloat(amount) <= 0) {
      setTxError('Mohon lengkapi semua field')
      return
    }

    setTxStatus(TX_STATUS.PENDING)
    setTxError(null)
    setTxHash(null)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(tokenInfo.address, ERC20_ABI, signer)

      // Parse amount dengan decimals yang benar
      const amountInWei = ethers.parseUnits(amount, tokenInfo.decimals)

      // Kirim transaksi
      const tx = await contract.transfer(recipient, amountInWei)
      setTxHash(tx.hash)

      // Tambah ke history
      if (onAddTransaction) {
        onAddTransaction({
          hash: tx.hash,
          from: account,
          to: recipient,
          value: '0',
          type: 'token_transfer',
          tokenSymbol: tokenInfo.symbol,
          tokenAmount: amount,
          chainId
        })
      }

      // Tunggu konfirmasi
      const receipt = await tx.wait()

      if (receipt.status === 1) {
        setTxStatus(TX_STATUS.SUCCESS)
        // Refresh balance
        loadTokenInfo(tokenInfo.address)
        if (onTransactionComplete) {
          onTransactionComplete()
        }
      } else {
        setTxStatus(TX_STATUS.FAILED)
        setTxError('Transaksi gagal')
      }
    } catch (err) {
      setTxStatus(TX_STATUS.FAILED)
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        setTxError('Transaksi dibatalkan')
      } else if (err.message?.includes('insufficient')) {
        setTxError('Saldo token tidak cukup')
      } else {
        setTxError(err.message || 'Transaksi gagal')
      }
    }
  }

  // Reset form
  const resetForm = () => {
    setRecipient('')
    setAmount('')
    setTxStatus(TX_STATUS.IDLE)
    setTxHash(null)
    setTxError(null)
  }

  // Set max amount
  const setMaxAmount = () => {
    if (tokenBalance) {
      setAmount(tokenBalance)
    }
  }

  const isFormValid = tokenInfo && isValidAddress(recipient) && amount && parseFloat(amount) > 0
  const isLoading = txStatus === TX_STATUS.LOADING || txStatus === TX_STATUS.PENDING

  return (
    <div className="token-transfer">
      <h3 className="token-title">
        <svg viewBox="0 0 24 24" fill="none" className="token-icon">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Transfer Token
      </h3>

      {/* Success State */}
      {txStatus === TX_STATUS.SUCCESS ? (
        <div className="tx-success">
          <div className="success-icon">✓</div>
          <h4>Transfer Berhasil!</h4>
          <p className="tx-hash-label">Transaction Hash:</p>
          <a
            href={`${networkInfo.explorer}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-hash-link"
          >
            {txHash?.slice(0, 10)}...{txHash?.slice(-8)}
          </a>
          <button className="new-tx-btn" onClick={resetForm}>
            Transfer Lagi
          </button>
        </div>
      ) : (
        <>
          {/* Token Selection */}
          <div className="form-group">
            <label>Token Address</label>
            <div className="token-input-wrapper">
              <input
                type="text"
                placeholder="0x... atau pilih token"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                disabled={isLoading}
              />
              {popularTokens.length > 0 && (
                <button
                  className="token-list-btn"
                  onClick={() => setShowTokenList(!showTokenList)}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Token List Dropdown */}
            {showTokenList && popularTokens.length > 0 && (
              <div className="token-list">
                <div className="token-list-header">Token Populer</div>
                {popularTokens.map((token) => (
                  <button
                    key={token.address}
                    className="token-list-item"
                    onClick={() => selectToken(token)}
                  >
                    <span className="token-symbol">{token.symbol}</span>
                    <span className="token-name">{token.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Token Info */}
          {tokenInfo && (
            <div className="token-info-box">
              <div className="token-info-row">
                <span>Token:</span>
                <span>{tokenInfo.symbol} ({tokenInfo.name})</span>
              </div>
              <div className="token-info-row">
                <span>Saldo:</span>
                <span className="token-balance">{tokenBalance} {tokenInfo.symbol}</span>
              </div>
            </div>
          )}

          {/* Recipient */}
          <div className="form-group">
            <label>Alamat Tujuan</label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isLoading || !tokenInfo}
              className={recipient && !isValidAddress(recipient) ? 'invalid' : ''}
            />
            {recipient && !isValidAddress(recipient) && (
              <span className="input-error">Alamat tidak valid</span>
            )}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label>Jumlah</label>
            <div className="amount-input-wrapper">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading || !tokenInfo}
                step="0.0001"
                min="0"
              />
              {tokenBalance && (
                <button className="max-btn" onClick={setMaxAmount} type="button">
                  MAX
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {txError && (
            <div className="tx-error">{txError}</div>
          )}

          {/* Pending */}
          {txStatus === TX_STATUS.PENDING && txHash && (
            <div className="tx-pending">
              <div className="pending-spinner"></div>
              <p>Menunggu konfirmasi...</p>
              <a
                href={`${networkInfo.explorer}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-hash-link small"
              >
                Lihat di Explorer
              </a>
            </div>
          )}

          {/* Transfer Button */}
          <button
            className="send-btn token-btn"
            onClick={transferToken}
            disabled={!isFormValid || isLoading}
          >
            {txStatus === TX_STATUS.LOADING ? (
              'Memuat Token...'
            ) : txStatus === TX_STATUS.PENDING ? (
              <>
                <span className="btn-spinner"></span>
                Mengirim...
              </>
            ) : (
              `Transfer ${tokenInfo?.symbol || 'Token'}`
            )}
          </button>
        </>
      )}
    </div>
  )
}

export default TokenTransfer
