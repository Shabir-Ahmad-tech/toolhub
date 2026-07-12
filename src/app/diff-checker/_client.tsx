'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Copy, Check, AlertTriangle, Download } from 'lucide-react'

const IS_PRO = true
const FREE_LINE_LIMIT = 10000

interface CharPart {
  type: 'added' | 'removed' | 'unchanged'
  text: string
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  text: string
  charParts?: CharPart[]
}

// Compute character-level difference between two lines
function computeCharDiff(oldStr: string, newStr: string): { oldParts: CharPart[], newParts: CharPart[] } {
  const n = oldStr.length
  const m = newStr.length

  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(m + 1).fill(0))

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldStr[i - 1] === newStr[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const oldParts: CharPart[] = []
  const newParts: CharPart[] = []

  let i = n
  let j = m

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldStr[i - 1] === newStr[j - 1]) {
      const char = oldStr[i - 1]
      oldParts.unshift({ type: 'unchanged', text: char })
      newParts.unshift({ type: 'unchanged', text: char })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      newParts.unshift({ type: 'added', text: newStr[j - 1] })
      j--
    } else {
      oldParts.unshift({ type: 'removed', text: oldStr[i - 1] })
      i--
    }
  }

  const mergeParts = (parts: CharPart[]): CharPart[] => {
    if (parts.length === 0) return []
    const merged: CharPart[] = []
    let current = { ...parts[0] }

    for (let k = 1; k < parts.length; k++) {
      if (parts[k].type === current.type) {
        current.text += parts[k].text
      } else {
        merged.push(current)
        current = { ...parts[k] }
      }
    }
    merged.push(current)
    return merged
  }

  return {
    oldParts: mergeParts(oldParts),
    newParts: mergeParts(newParts)
  }
}

// Group contiguous removed and added lines, and run character-level diff on paired lines
const postProcessDiff = (lines: DiffLine[]): DiffLine[] => {
  const result: DiffLine[] = [...lines]
  
  let i = 0
  while (i < result.length) {
    if (result[i].type === 'removed') {
      const removedBlock: number[] = []
      while (i < result.length && result[i].type === 'removed') {
        removedBlock.push(i)
        i++
      }
      
      const addedBlock: number[] = []
      while (i < result.length && result[i].type === 'added') {
        addedBlock.push(i)
        i++
      }
      
      const pairsCount = Math.min(removedBlock.length, addedBlock.length)
      for (let p = 0; p < pairsCount; p++) {
        const remIdx = removedBlock[p]
        const addIdx = addedBlock[p]
        
        const remLine = result[remIdx]
        const addLine = result[addIdx]
        
        if (remLine.text.length <= 1000 && addLine.text.length <= 1000) {
          const { oldParts, newParts } = computeCharDiff(remLine.text, addLine.text)
          result[remIdx] = {
            ...remLine,
            charParts: oldParts
          }
          result[addIdx] = {
            ...addLine,
            charParts: newParts
          }
        }
      }
    } else {
      i++
    }
  }
  
  return result
}

export default function DiffCheckerClient() {
  const [originalText, setOriginalText] = useState('')
  const [modifiedText, setModifiedText] = useState('')
  const [diffResult, setDiffResult] = useState<DiffLine[]>([])
  const [stats, setStats] = useState({ added: 0, removed: 0, unchanged: 0 })
  const [copied, setCopied] = useState(false)
  const [limitWarning, setLimitWarning] = useState(false)
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [isDragOverOrig, setIsDragOverOrig] = useState(false)
  const [isDragOverMod, setIsDragOverMod] = useState(false)

  // Longest Common Subsequence (LCS) for diff algorithm
  const computeDiff = (origLines: string[], modLines: string[]): DiffLine[] => {
    const n = origLines.length
    const m = modLines.length
    
    const eq = (a: string, b: string) => {
      if (ignoreWhitespace) {
        return a.trimEnd() === b.trimEnd()
      }
      return a === b
    }

    // DP Table
    const dp: number[][] = Array(n + 1)
      .fill(null)
      .map(() => Array(m + 1).fill(0))

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (eq(origLines[i - 1], modLines[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    // Backtrack to find diff
    const result: DiffLine[] = []
    let i = n
    let j = m

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && eq(origLines[i - 1], modLines[j - 1])) {
        result.unshift({ type: 'unchanged', text: origLines[i - 1] })
        i--
        j--
      } else if (ignoreWhitespace && i > 0 && origLines[i - 1].trim() === '') {
        result.unshift({ type: 'unchanged', text: origLines[i - 1] })
        i--
      } else if (ignoreWhitespace && j > 0 && modLines[j - 1].trim() === '') {
        result.unshift({ type: 'unchanged', text: modLines[j - 1] })
        j--
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: 'added', text: modLines[j - 1] })
        j--
      } else {
        result.unshift({ type: 'removed', text: origLines[i - 1] })
        i--
      }
    }

    return result
  }

  const handleCompare = () => {
    const origLines = originalText.split('\n')
    const modLines = modifiedText.split('\n')
    const totalLines = origLines.length + modLines.length

    if (!IS_PRO && totalLines > FREE_LINE_LIMIT) {
      setLimitWarning(true)
      return
    }

    setLimitWarning(false)
    let result = computeDiff(origLines, modLines)
    result = postProcessDiff(result)
    setDiffResult(result)

    let added = 0
    let removed = 0
    let unchanged = 0

    result.forEach((line) => {
      if (line.type === 'added') added++
      else if (line.type === 'removed') removed++
      else unchanged++
    })

    setStats({ added, removed, unchanged })
  }

  const handleCopyDiff = () => {
    if (diffResult.length === 0) return
    const textToCopy = diffResult
      .map((line) => {
        if (line.type === 'added') return `+ ${line.text}`
        if (line.type === 'removed') return `- ${line.text}`
        return `  ${line.text}`
      })
      .join('\n')

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadDiff = () => {
    if (diffResult.length === 0) return
    const textToDownload = diffResult
      .map((line) => {
        if (line.type === 'added') return `+ ${line.text}`
        if (line.type === 'removed') return `- ${line.text}`
        return `  ${line.text}`
      })
      .join('\n')

    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'diff-report.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleFileRead = (file: File, setText: (val: string) => void) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setText(e.target.result)
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setText: (val: string) => void,
    setDragOver: (val: boolean) => void
  ) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileRead(e.dataTransfer.files[0], setText)
    }
  }

  // SEO Content and FAQ
  const diffFaq = [
    {
      question: 'What is a diff tool used for?',
      answer: 'A diff tool compares two text blocks or code files to highlight additions, deletions, and unchanged sections. It is essential for code reviews, tracking file changes, comparing configuration files, and seeing exactly what was modified between versions.'
    },
    {
      question: 'Do my files get uploaded when comparing?',
      answer: 'No. All comparison happens client-side in your browser. Files and text are processed locally without being uploaded to any server. This makes it safe for comparing sensitive code, API keys, or confidential documents.'
    },
    {
      question: 'What is the difference between line and character-level comparison?',
      answer: 'Line-level diff shows which complete lines changed, while character-level highlights the exact characters added or removed within each changed line. Character-level diff is more precise for spotting minor changes in long lines of code.'
    }
  ]

  const diffSeo = (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Compare Code and Text Differences Instantly</h2>
      <p>
        Diff Checker identifies insertions, deletions, and modifications between two text inputs. It supports file drag-and-drop, character-level precision, and works entirely in your browser. Compare source code, configuration files, or any text to spot changes instantly.
      </p>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">When to Use Text Comparison</h3>
      <p>
        Use diff tools during code reviews, git workflows, configuration audits, and API response debugging. Diff Checker handles large files, shows line numbers, and highlights character-level changes that would be impossible to spot visually in long lines.
      </p>
    </div>
  )

  return (
    <ToolLayout
      title="Diff Checker"
      description="Compare two text blocks or source codes to find similarities and differences highlighted instantly."
      toolSlug="diff-checker"
      categorySlug="developer-tools"
      faq={diffFaq}
      seoContent={diffSeo}
    >
      <div className="space-y-6">
        {/* Input Textareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original Text Pane */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOverOrig(true)
            }}
            onDragLeave={() => setIsDragOverOrig(false)}
            onDrop={(e) => handleDrop(e, setOriginalText, setIsDragOverOrig)}
            className={`relative space-y-2 border-2 border-dashed p-3 transition-colors ${
              isDragOverOrig
                ? 'border-[#00FF41] bg-[#0a0a0a]'
                : 'border-[#333333] bg-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-[#888888] uppercase">
                Original Text
              </label>
              <label className="terminal-btn px-2 py-1">
                [<span className="green-chevron">&gt;</span> UPLOAD FILE]
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.js,.ts,.tsx,.json,.html,.css,.md,.py,.cpp,.c,.java"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileRead(e.target.files[0], setOriginalText)
                    }
                  }}
                />
              </label>
            </div>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste original text or drag & drop a file here..."
              className="w-full h-64 p-4 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs md:text-sm leading-relaxed resize-y focus:border-2 focus:border-[#00FF41] focus:outline-none"
            />
          </div>

          {/* Modified Text Pane */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOverMod(true)
            }}
            onDragLeave={() => setIsDragOverMod(false)}
            onDrop={(e) => handleDrop(e, setModifiedText, setIsDragOverMod)}
            className={`relative space-y-2 border-2 border-dashed p-3 transition-colors ${
              isDragOverMod
                ? 'border-[#00FF41] bg-[#0a0a0a]'
                : 'border-[#333333] bg-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-[#888888] uppercase">
                Modified Text
              </label>
              <label className="terminal-btn px-2 py-1">
                [<span className="green-chevron">&gt;</span> UPLOAD FILE]
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.js,.ts,.tsx,.json,.html,.css,.md,.py,.cpp,.c,.java"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileRead(e.target.files[0], setModifiedText)
                    }
                  }}
                />
              </label>
            </div>
            <textarea
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              placeholder="Paste modified text or drag & drop a file here..."
              className="w-full h-64 p-4 border border-[#F9F9F9] bg-[#000000] text-[#F9F9F9] font-mono text-xs md:text-sm leading-relaxed resize-y focus:border-2 focus:border-[#00FF41] focus:outline-none"
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center space-x-2 p-3 bg-[#0a0a0a] border border-[#333333]">
          <input
            id="ignore-whitespace"
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(e) => setIgnoreWhitespace(e.target.checked)}
            className="appearance-none w-4 h-4 bg-[#000000] border border-[#F9F9F9] checked:bg-[#F9F9F9] cursor-pointer"
          />
          <label
            htmlFor="ignore-whitespace"
            className="text-sm font-bold text-[#F9F9F9] cursor-pointer select-none"
          >
            Ignore Whitespace (strips trailing spaces and ignores blank lines when comparing)
          </label>
        </div>

        {limitWarning && (
          <div className="p-4 bg-[#0a0a0a] border border-[#333333] text-sm text-[#FF4444] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-[#00FF41]" />
            <span>
              <strong>Limit Reached:</strong> Comparing over {FREE_LINE_LIMIT} lines requires a Pro subscription.
            </span>
          </div>
        )}

        {/* Action button — Terminal ghost style */}
        <button
          onClick={handleCompare}
          className="terminal-btn w-full justify-center"
        >
          [<span className="green-chevron">&gt;</span> Compare Texts]
        </button>

        {/* Diff Result View */}
        {diffResult.length > 0 && !limitWarning && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-[#0a0a0a] border border-[#333333] gap-3">
              <div className="flex flex-wrap gap-4 text-xs font-bold">
                <span className="text-[#00FF41]">
                  +++ {stats.added} line(s) added
                </span>
                <span className="text-[#FF4444]">
                  --- {stats.removed} line(s) removed
                </span>
                <span className="text-[#888888]">
                  {stats.unchanged} line(s) unchanged
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyDiff}
                  className="inline-flex items-center gap-1.5 text-xs bg-[#0a0a0a] border border-[#333333] px-3 py-1.5 text-[#F9F9F9] hover:bg-[#111111] transition font-bold cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#888888]" />
                      <span>Copy Unified Diff</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadDiff}
                  className="inline-flex items-center gap-1.5 text-xs bg-[#0a0a0a] border border-[#333333] px-3 py-1.5 text-[#F9F9F9] hover:bg-[#111111] transition font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#888888]" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            {/* Code Block Container */}
            <div className="border border-[#333333] overflow-x-auto bg-[#0a0a0a] font-mono text-sm leading-relaxed p-4 h-[400px] max-h-[500px]">
              {diffResult.map((line, idx) => {
                let cls = 'text-[#F9F9F9]'
                let prefix = ' '
                if (line.type === 'added') {
                  cls = 'bg-emerald-50 text-[#00FF41] font-normal'
                  prefix = '+'
                } else if (line.type === 'removed') {
                  cls = 'bg-red-50 text-[#FF4444] font-normal'
                  prefix = '-'
                }

                return (
                  <div key={idx} className={`px-2 py-0.5 ${cls} whitespace-pre`}>
                    <span className="select-none opacity-40 mr-3 inline-block w-4 text-center">{prefix}</span>
                    {line.charParts ? (
                      line.charParts.map((part, pIdx) => {
                        if (line.type === 'removed' && part.type === 'removed') {
                          return (
                            <span
                              key={pIdx}
                              className="bg-red-200 text-[#FF4444] px-0.5 font-bold font-mono"
                            >
                              {part.text}
                            </span>
                          )
                        }
                        if (line.type === 'added' && part.type === 'added') {
                          return (
                            <span
                              key={pIdx}
                              className="bg-emerald-200 text-[#00FF41] px-0.5 font-bold font-mono"
                            >
                              {part.text}
                            </span>
                          )
                        }
                        return <span key={pIdx}>{part.text}</span>
                      })
                    ) : (
                      line.text || ' '
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      </ToolLayout>
  )
}
