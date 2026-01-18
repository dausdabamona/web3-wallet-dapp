/**
 * Daftar network yang didukung
 * Berguna untuk menampilkan nama network berdasarkan chainId
 */
export const NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    explorer: 'https://etherscan.io'
  },
  5: {
    name: 'Goerli Testnet',
    symbol: 'ETH',
    explorer: 'https://goerli.etherscan.io'
  },
  11155111: {
    name: 'Sepolia Testnet',
    symbol: 'ETH',
    explorer: 'https://sepolia.etherscan.io'
  },
  137: {
    name: 'Polygon Mainnet',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com'
  },
  80001: {
    name: 'Mumbai Testnet',
    symbol: 'MATIC',
    explorer: 'https://mumbai.polygonscan.com'
  },
  56: {
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    explorer: 'https://bscscan.com'
  },
  42161: {
    name: 'Arbitrum One',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io'
  },
  10: {
    name: 'Optimism',
    symbol: 'ETH',
    explorer: 'https://optimistic.etherscan.io'
  }
}

/**
 * Mendapatkan info network berdasarkan chainId
 */
export function getNetworkInfo(chainId) {
  return NETWORKS[chainId] || {
    name: `Unknown Network (${chainId})`,
    symbol: 'ETH',
    explorer: null
  }
}

/**
 * Format alamat wallet (0x1234...5678)
 */
export function formatAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
