import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { getNetworkInfo } from '../utils/networks'

/**
 * Komponen SendTransaction
 * Fitur utama wallet untuk mengirim crypto
 *
 * Konsep React yang digunakan:
 * 1. useState - untuk form inputs dan transaction state
 * 2. useEffect - untuk estimasi gas otomatis
 * 3. useCallback - memoize fungsi
 * 4. Controlled Components - input dikontrol oleh state
 */

// Status transaksi
const TX_STATUS = {
  IDLE: 'idle',
  ESTIMATING: 'estimating',
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed'
}

function SendTransaction({ account, chainId, onTransactionComplete }) {
  // Form state
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')

  // Gas state
  const [gasEstimate, setGasEstimate] = useState(null)
  const [gasPrice, setGasPrice] = useState(null)
  const [totalCost, setTotalCost] = useState(null)

  // Transaction state
  const [txStatus, setTxStatus] = useState(TX_STATUS.IDLE)
  const [txHash, setTxHash] = useState(null)
  const [txError, setTxError] = useState(null)

  // Get network symbol
  const networkInfo = getNetworkInfo(chainId)
  const symbol = networkInfo.symbol

  // Validasi alamat
  const isValidAddress = useCallback((address) => {
    try {
      return ethers.isAddress(address)
    } catch {
      return false
    }
  }, [])

  // Validasi amount
  const isValidAmount = useCallback((value) => {
    if (!value || value === '') return false
    try {
      const num = parseFloat(value)
      return num > 0 && !isNaN(num)
    } catch {
      return false
    }
  }, [])

  // Estimasi gas
  const estimateGas = useCallback(async () => {
    if (!isValidAddress(recipient) || !isValidAmount(amount)) {
      setGasEstimate(null)
      setGasPrice(null)
      setTotalCost(null)
      return
    }

    setTxStatus(TX_STATUS.ESTIMATING)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)

      // Estimasi gas untuk transaksi
      const gasLimit = await provider.estimateGas({
        from: account,
        to: recipient,
        value: ethers.parseEther(amount)
      })

      // Dapatkan gas price
      const feeData = await provider.getFeeData()
      const currentGasPrice = feeData.gasPrice

      // Hitung total cost
      const gasCost = gasLimit * currentGasPrice
      const total = ethers.parseEther(amount) + gasCost

      setGasEstimate(gasLimit.toString())
      setGasPrice(ethers.formatUnits(currentGasPrice, 'gwei'))
      setTotalCost(ethers.formatEther(total))
      setTxStatus(TX_STATUS.IDLE)
    } catch (err) {
      console.error('Gas estimation error:', err)
      setTxStatus(TX_STATUS.IDLE)
      // Jangan tampilkan error, biarkan user coba send
    }
  }, [account, recipient, amount, isValidAddress, isValidAmount])

  // Auto-estimate gas saat input berubah
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      estimateGas()
    }, 500) // Debounce 500ms

    return () => clearTimeout(debounceTimer)
  }, [estimateGas])

  // Kirim transaksi
  const sendTransaction = async () => {
    if (!isValidAddress(recipient)) {
      setTxError('Alamat tidak valid')
      return
    }

    if (!isValidAmount(amount)) {
      setTxError('Jumlah tidak valid')
      return
    }

    setTxStatus(TX_STATUS.PENDING)
    setTxError(null)
    setTxHash(null)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Buat dan kirim transaksi
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount)
      })

      setTxHash(tx.hash)

      // Tunggu konfirmasi
      const receipt = await tx.wait()

      if (receipt.status === 1) {
        setTxStatus(TX_STATUS.SUCCESS)
        // Callback untuk refresh balance
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
        setTxError('Transaksi dibatalkan oleh user')
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        setTxError('Saldo tidak cukup')
      } else {
        setTxError(err.message || 'Transaksi gagal')
      }
    }
  }

  // Reset form
  const resetForm = () => {
    setRecipient('')
    setAmount('')
    setGasEstimate(null)
    setGasPrice(null)
    setTotalCost(null)
    setTxStatus(TX_STATUS.IDLE)
    setTxHash(null)
    setTxError(null)
  }

  // Cek apakah form valid
  const isFormValid = isValidAddress(recipient) && isValidAmount(amount)
  const isLoading = txStatus === TX_STATUS.PENDING || txStatus === TX_STATUS.ESTIMATING

  return (
    <div className="send-transaction">
      <h3 className="send-title">
        <svg viewBox="0 0 24 24" fill="none" className="send-icon">
          <path
            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Kirim {symbol}
      </h3>

      {/* Success State */}
      {txStatus === TX_STATUS.SUCCESS ? (
        <div className="tx-success">
          <div className="success-icon">✓</div>
          <h4>Transaksi Berhasil!</h4>
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
            Kirim Lagi
          </button>
        </div>
      ) : (
        <>
          {/* Form Inputs */}
          <div className="form-group">
            <label htmlFor="recipient">Alamat Tujuan</label>
            <input
              type="text"
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isLoading}
              className={!recipient || isValidAddress(recipient) ? '' : 'invalid'}
            />
            {recipient && !isValidAddress(recipient) && (
              <span className="input-error">Alamat tidak valid</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Jumlah ({symbol})</label>
            <input
              type="number"
              id="amount"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              step="0.0001"
              min="0"
              className={!amount || isValidAmount(amount) ? '' : 'invalid'}
            />
          </div>

          {/* Gas Estimation */}
          {gasEstimate && (
            <div className="gas-info">
              <div className="gas-row">
                <span>Gas Limit:</span>
                <span>{parseInt(gasEstimate).toLocaleString()}</span>
              </div>
              <div className="gas-row">
                <span>Gas Price:</span>
                <span>{parseFloat(gasPrice).toFixed(2)} Gwei</span>
              </div>
              <div className="gas-row total">
                <span>Total (incl. gas):</span>
                <span>{parseFloat(totalCost).toFixed(6)} {symbol}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {txError && (
            <div className="tx-error">
              {txError}
            </div>
          )}

          {/* Pending State */}
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

          {/* Send Button */}
          <button
            className="send-btn"
            onClick={sendTransaction}
            disabled={!isFormValid || isLoading}
          >
            {txStatus === TX_STATUS.ESTIMATING ? (
              'Menghitung Gas...'
            ) : txStatus === TX_STATUS.PENDING ? (
              <>
                <span className="btn-spinner"></span>
                Mengirim...
              </>
            ) : (
              `Kirim ${symbol}`
            )}
          </button>
        </>
      )}
    </div>
  )
}

export default SendTransaction
