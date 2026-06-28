import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="detail-page">
      <h1 className="detail-title">Page not found</h1>
      <p className="detail-desc">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '12px 24px',
          marginTop: '30px',
          border: '1px solid var(--color-text)',
          borderRadius: '8px',
          fontSize: '16rem',
          cursor: 'pointer',
          transition: 'all 0.25s ease'
        }}
      >
        Back to home
      </button>
    </div>
  )
}
