import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

/**
 * Custom Hook untuk mengelola koneksi wallet
 * Hook ini menangani:
 * - Koneksi ke MetaMask
 * - Mendapatkan alamat wallet
 * - Mendapatkan saldo ETH
 * - Mendeteksi perubahan akun/network
 */
export function useWallet() {
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  // Cek apakah MetaMask terinstall
  const isMetaMaskInstalled = typeof window !== 'undefined' && window.ethereum

  // Fungsi untuk mendapatkan saldo
  const getBalance = useCallback(async (address) => {
    if (!window.ethereum) return
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(address)
      // Format dari Wei ke ETH dengan 4 desimal
      setBalance(ethers.formatEther(balance))
    } catch (err) {
      console.error('Error getting balance:', err)
    }
  }, [])

  // Fungsi untuk connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask tidak terinstall. Silakan install MetaMask!')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Request akses ke akun
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        await getBalance(accounts[0])

        // Dapatkan chain ID
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        })
        setChainId(parseInt(chainId, 16))
      }
    } catch (err) {
      if (err.code === 4001) {
        setError('Koneksi ditolak oleh user')
      } else {
        setError('Gagal connect: ' + err.message)
      }
    } finally {
      setIsConnecting(false)
    }
  }, [isMetaMaskInstalled, getBalance])

  // Fungsi untuk disconnect
  const disconnectWallet = useCallback(() => {
    setAccount(null)
    setBalance(null)
    setChainId(null)
    setError(null)
  }, [])

  // Fungsi untuk refresh balance (dipanggil setelah transaksi)
  const refreshBalance = useCallback(() => {
    if (account) {
      getBalance(account)
    }
  }, [account, getBalance])

  // Listen untuk perubahan akun dan network
  useEffect(() => {
    if (!isMetaMaskInstalled) return

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        setAccount(accounts[0])
        getBalance(accounts[0])
      }
    }

    const handleChainChanged = (chainId) => {
      setChainId(parseInt(chainId, 16))
      // Refresh balance saat ganti network
      if (account) {
        getBalance(account)
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    // Cleanup listeners
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [isMetaMaskInstalled, account, getBalance, disconnectWallet])

  // Cek apakah sudah terkoneksi sebelumnya
  useEffect(() => {
    if (!isMetaMaskInstalled) return

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          await getBalance(accounts[0])

          const chainId = await window.ethereum.request({
            method: 'eth_chainId'
          })
          setChainId(parseInt(chainId, 16))
        }
      } catch (err) {
        console.error('Error checking connection:', err)
      }
    }

    checkConnection()
  }, [isMetaMaskInstalled, getBalance])

  return {
    account,
    balance,
    chainId,
    isConnecting,
    error,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    refreshBalance
  }
}
