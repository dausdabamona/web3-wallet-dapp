import { useState, useEffect, useCallback } from 'react'

/**
 * Custom Hook untuk mengelola history transaksi
 * Menyimpan transaksi di localStorage agar persist
 *
 * Konsep yang digunakan:
 * - localStorage untuk persistent storage
 * - useEffect untuk sync dengan storage
 * - useCallback untuk memoize fungsi
 */

const STORAGE_KEY = 'web3_tx_history'

export function useTransactionHistory(account) {
  const [transactions, setTransactions] = useState([])

  // Load transactions dari localStorage saat account berubah
  useEffect(() => {
    if (!account) {
      setTransactions([])
      return
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${account.toLowerCase()}`)
      if (stored) {
        setTransactions(JSON.parse(stored))
      } else {
        setTransactions([])
      }
    } catch (err) {
      console.error('Error loading transactions:', err)
      setTransactions([])
    }
  }, [account])

  // Simpan ke localStorage setiap kali transactions berubah
  useEffect(() => {
    if (!account || transactions.length === 0) return

    try {
      localStorage.setItem(
        `${STORAGE_KEY}_${account.toLowerCase()}`,
        JSON.stringify(transactions)
      )
    } catch (err) {
      console.error('Error saving transactions:', err)
    }
  }, [account, transactions])

  // Tambah transaksi baru
  const addTransaction = useCallback((tx) => {
    const newTx = {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      type: tx.type || 'send', // 'send', 'token_transfer'
      tokenSymbol: tx.tokenSymbol || null,
      tokenAmount: tx.tokenAmount || null,
      status: 'pending',
      timestamp: Date.now(),
      chainId: tx.chainId
    }

    setTransactions(prev => [newTx, ...prev].slice(0, 50)) // Max 50 transaksi
    return newTx
  }, [])

  // Update status transaksi
  const updateTransaction = useCallback((hash, updates) => {
    setTransactions(prev =>
      prev.map(tx =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      )
    )
  }, [])

  // Hapus transaksi
  const removeTransaction = useCallback((hash) => {
    setTransactions(prev => prev.filter(tx => tx.hash !== hash))
  }, [])

  // Clear semua transaksi
  const clearHistory = useCallback(() => {
    setTransactions([])
    if (account) {
      localStorage.removeItem(`${STORAGE_KEY}_${account.toLowerCase()}`)
    }
  }, [account])

  return {
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    clearHistory
  }
}
