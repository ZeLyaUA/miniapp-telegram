'use client'

import { Component, ReactNode } from 'react'

interface Props { children: ReactNode; name: string }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary] caught:', error)
    return { error }
  }

  render() {
    const { error } = this.state
    if (error) {
      return (
        <div className="p-4 m-4 rounded-2xl" style={{ background: 'rgba(220,60,60,0.1)', border: '1px solid rgba(220,60,60,0.3)' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: 'rgba(255,100,80,0.9)' }}>
            ❌ {this.props.name} crashed
          </p>
          <pre className="text-xs leading-relaxed" style={{ color: 'rgba(255,100,80,0.7)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error.message}
          </pre>
          <pre className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(255,100,80,0.4)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error.stack?.split('\n').slice(0, 6).join('\n')}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-3 text-xs px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(220,60,60,0.15)', color: 'rgba(255,100,80,0.7)', border: '1px solid rgba(220,60,60,0.2)' }}
          >
            Попробовать снова
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
