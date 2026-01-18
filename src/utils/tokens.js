/**
 * ERC-20 Token Utilities
 * ABI minimal untuk interaksi dengan token ERC-20
 */

// ABI minimal ERC-20 (hanya fungsi yang diperlukan)
export const ERC20_ABI = [
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',

  // Write functions
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
]

// Daftar token populer per network
export const POPULAR_TOKENS = {
  // Ethereum Mainnet
  1: [
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0x6B175474E89094C44Da98b954EesafcdAD3F1e5fDb', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 }
  ],
  // Sepolia Testnet
  11155111: [
    { address: '0x779877A7B0D9E8603169DdbD7836e478b4624789', symbol: 'LINK', name: 'Chainlink Token', decimals: 18 }
  ],
  // Polygon Mainnet
  137: [
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin', decimals: 6 }
  ],
  // BSC Mainnet
  56: [
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether USD', decimals: 18 },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin', decimals: 18 }
  ]
}

/**
 * Mendapatkan daftar token populer berdasarkan chainId
 */
export function getPopularTokens(chainId) {
  return POPULAR_TOKENS[chainId] || []
}

/**
 * Format token amount dengan decimals yang benar
 */
export function formatTokenAmount(amount, decimals, displayDecimals = 4) {
  const value = Number(amount) / Math.pow(10, decimals)
  return value.toFixed(displayDecimals)
}

/**
 * Parse token amount ke wei-like value
 */
export function parseTokenAmount(amount, decimals) {
  return BigInt(Math.floor(Number(amount) * Math.pow(10, decimals)))
}
