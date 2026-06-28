import { useState } from 'react'
import '../../styles/tools.css'

export default function EasyMCQPage() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [pending, setPending] = useState(false)

  const canSubmit = question.trim().length > 0 && answer.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || pending) return

    setPending(true)

    try {
      await fetch('/api/distractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), answer: answer.trim() })
      })
    } catch (e: any) {
      console.error(e)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="detail-page">
      <h1 className="detail-title">EasyMCQ</h1>
      <p className="detail-desc">Generate multiple choice distractors</p>
      <div className="tool-form">
        <form onSubmit={handleSubmit}>
          <label>Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question"
            disabled={pending}
          />
          <label>Correct Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter the correct answer"
            disabled={pending}
          />
          <button type="submit" disabled={!canSubmit || pending}>
            {pending ? 'Generating...' : 'Generate'}
          </button>
        </form>
      </div>
    </div>
  )
}
