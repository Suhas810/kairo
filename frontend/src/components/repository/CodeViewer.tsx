const tokenPattern = /(\/\/.*|#.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|from|export|function|return|const|let|var|if|else|new|class|type|interface|async|await|true|false|null|undefined)\b|\b\d+\b)/g

function highlight(line: string) {
  return line.split(tokenPattern).filter(Boolean).map((token, index) => {
    let className = ''
    if (/^(\/\/|#)/.test(token)) className = 'text-zinc-500'
    else if (/^["'`]/.test(token)) className = 'text-emerald-300'
    else if (/^\d+$/.test(token)) className = 'text-amber-300'
    else if (/^(import|from|export|function|return|const|let|var|if|else|new|class|type|interface|async|await|true|false|null|undefined)$/.test(token)) className = 'text-indigo-300'
    return className ? <span key={index} className={className}>{token}</span> : token
  })
}

type CodeViewerProps = { content: string; language?: string }

export function CodeViewer({ content, language = 'text' }: CodeViewerProps) {
  const lines = content.split('\n')
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#0b0d10]" aria-label={`${language} source code`}>
      <pre className="min-w-max py-4 font-mono text-[13px] leading-6 text-zinc-200">
        {lines.map((line, index) => (
          <div key={index} className="flex min-h-6">
            <span className="sticky left-0 w-12 shrink-0 select-none border-r border-zinc-800 bg-[#0b0d10] pr-3 text-right text-zinc-600">{index + 1}</span>
            <code className="whitespace-pre px-4">{highlight(line) || ' '}</code>
          </div>
        ))}
      </pre>
    </div>
  )
}
