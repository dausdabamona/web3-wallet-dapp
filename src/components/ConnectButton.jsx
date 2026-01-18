/**
 * Komponen ConnectButton
 * Tombol untuk menghubungkan wallet
 *
 * Props:
 * - onClick: fungsi yang dipanggil saat tombol diklik
 * - isConnecting: boolean apakah sedang connecting
 * - disabled: boolean apakah tombol disabled
 */
function ConnectButton({ onClick, isConnecting, disabled }) {
  return (
    <button
      className="connect-button"
      onClick={onClick}
      disabled={disabled || isConnecting}
    >
      {isConnecting ? (
        <>
          <span className="spinner"></span>
          Connecting...
        </>
      ) : (
        <>
          <svg
            className="metamask-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.3 2L13.2 8.1L14.7 4.5L21.3 2Z"
              fill="#E2761B"
            />
            <path
              d="M2.7 2L10.7 8.2L9.3 4.5L2.7 2Z"
              fill="#E4761B"
            />
            <path
              d="M18.4 16.1L16.2 19.5L20.8 20.8L22.2 16.2L18.4 16.1Z"
              fill="#E4761B"
            />
            <path
              d="M1.8 16.2L3.2 20.8L7.8 19.5L5.6 16.1L1.8 16.2Z"
              fill="#E4761B"
            />
            <path
              d="M7.5 10.6L6.2 12.6L10.7 12.8L10.5 8L7.5 10.6Z"
              fill="#E4761B"
            />
            <path
              d="M16.5 10.6L13.4 7.9L13.3 12.8L17.8 12.6L16.5 10.6Z"
              fill="#E4761B"
            />
            <path
              d="M7.8 19.5L10.4 18.2L8.1 16.2L7.8 19.5Z"
              fill="#E4761B"
            />
            <path
              d="M13.6 18.2L16.2 19.5L15.9 16.2L13.6 18.2Z"
              fill="#E4761B"
            />
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  )
}

export default ConnectButton
