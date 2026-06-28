import { useParams } from 'react-router-dom'

export default function DetailPage() {
  const { slug } = useParams()
  return (
    <div className="detail-page">
      <h1 className="detail-title">Detail: {slug}</h1>
      <p className="detail-desc">Placeholder content</p>
    </div>
  )
}
