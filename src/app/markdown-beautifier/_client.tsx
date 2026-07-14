'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Copy, Check, Download, History } from 'lucide-react'

// ============================================================
// FAQ
// ============================================================

const markdownBeautifierFaq = [
  {
    question: 'What does a markdown beautifier do?',
    answer: 'A markdown beautifier cleans up messy or poorly formatted markdown by fixing common issues: adding missing blank lines around headings and code blocks, normalizing table formatting, fixing bold/italic spacing, collapsing multiple blank lines, trimming trailing whitespace, and normalizing horizontal rules. It can also auto-generate a table of contents, format callouts as blockquotes, and detect code block languages. The result is clean, consistently formatted markdown that renders correctly.',
  },
  {
    question: 'Will this tool change the content of my markdown?',
    answer: 'No. The beautifier only adjusts whitespace, blank lines, and structural formatting. Your actual text content — words, links, images, code — is preserved exactly. The only exception is the optional "generate table of contents" and "format callouts" features, which add structural elements around your existing content.',
  },
  {
    question: 'Does it fix malformed markdown tables?',
    answer: 'Yes. The tool detects pipe-delimited table rows, normalizes column widths, ensures consistent pipe delimiters, inserts missing separator rows, and preserves alignment markers. Misaligned tables with uneven columns become properly formatted. You can also enable "compact tables" to reduce cell padding.',
  },
  {
    question: 'Does it work with large markdown files?',
    answer: 'Yes. The beautifier processes text entirely in your browser using pure JavaScript string operations. There is no file size limit from the tool itself — performance depends on your device. For files over 100KB, formatting may take a moment.',
  },
  {
    question: 'Can it auto-generate a table of contents?',
    answer: 'Yes — if you enable the optional "Generate table of contents" toggle, it scans all headings (h1 through h3) and inserts a linked table of contents after the first heading. Each entry is a clickable anchor link that works in GitHub, GitLab, and most markdown renderers.',
  },
]

// ============================================================
// SEO Content
// ============================================================

const markdownBeautifierSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Clean Up Messy Markdown Instantly</h2>
    <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
      Markdown is the universal format for documentation, README files, blog posts, and developer notes. But manually formatted markdown quickly becomes messy — inconsistent spacing, misaligned tables, and inconsistent indentation are common in files that have been edited by multiple people or converted from other formats. This beautifier fixes all structural issues in one click while preserving your content exactly.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What Gets Fixed</h3>
    <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
      The tool applies a pipeline of formatting rules: normalizing line endings, trimming trailing whitespace, collapsing multiple blank lines, adding missing blank lines around block elements (headings, code blocks, lists, horizontal rules), fixing bold and italic marker spacing, normalizing horizontal rules to consistent dashes, fixing malformed pipe-delimited tables, and normalizing nested list indentation. Each rule is independent and can be reasoned about separately.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Extra Features</h3>
    <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
      Beyond basic cleanup, the tool offers optional features: auto-generating a table of contents from document headings, formatting inline callouts (Note, Tip, Warning, etc.) as blockquotes for better visual hierarchy, compact table mode for tighter cell spacing, and automatic language hint detection for fenced code blocks. These features are all disabled by default and can be toggled individually.
    </p>
  </div>
)

// ============================================================
// Constants
// ============================================================

const FREE_LIMIT_HISTORY = 3
const STORAGE_KEY_HISTORY = 'toolhub_markdown_beautifier_history'

const DEMO_MARKDOWN = `# My Project Documentation

**Note:** This is a demo showing what the beautifier can fix.

##Getting Started

This section has ** bold ** and * italic * spacing issues.

Here is normal text with **bold** and *italic* mixed in.

### Installation


- item one
    - nested with 4 spaces
- item two

|Name |Role|Location|
|---|---|---|
|Alice|Admin|US|
|Bob |Editor|UK|

**Tip:** Keep your tables aligned for readability.

###Usage

> a blockquote without blank lines
More text here.

\`\`\`
const greeting = "Hello";
console.log(greeting);
\`\`\`

-   Item with extra spaces
    -  Badly nested item
  - Another nesting level

This has   excessive   spaces   and trailing spaces.
This has__double underscore__ text and__no spaces__.

|Left|Center|Right|Extra|
|:---|---:|:---:|---|
|Left-aligned|Right-aligned|Centered|Wide|
|text|more text|even more|short|

- [ ] incomplete task
- [x] completed task

**Warning:** Always validate your input before processing.

---

This has excessive blank lines above.
`

// ============================================================
// Types
// ============================================================

interface HistoryItem {
  id: string
  timestamp: string
  preview: string
  fullInput: string
}

interface Stats {
  inputLines: number
  inputChars: number
  outputLines: number
  outputChars: number
  changePercent: number
}

interface BeautifierOptions {
  addLanguageHints: boolean
  generateTOC: boolean
  formatCallouts: boolean
  compactTables: boolean
}

// ============================================================
// Transform: Normalize Line Endings
// ============================================================

function normalizeLineEndings(md: string): string {
  return md.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

// ============================================================
// Transform: Trim Trailing Whitespace
// ============================================================

function trimTrailingWhitespace(md: string): string {
  return md.split('\n').map(line => line.trimEnd()).join('\n')
}

// ============================================================
// Transform: Collapse Multiple Blank Lines
// ============================================================

function collapseBlankLines(md: string): string {
  return md.replace(/\n{3,}/g, '\n\n')
}

// ============================================================
// Transform: Fix Bold/Italic Spacing
// ============================================================

function fixInlineSpacing(md: string): string {
  const lines = md.split('\n')
  return lines.map(line => {
    // Split on backtick code spans — process only non-code segments
    const parts = line.split(/(`[^`]*`)/g)
    return parts.map(part => {
      if (part.startsWith('`') && part.endsWith('`')) return part

      let result = part

      // Fix ** bold ** → **bold** (only remove whitespace INSIDE marker pairs)
      // Pattern A: space on both sides — ** text ** → **text**
      result = result.replace(/\*\*\s+([^*]+?)\s+\*\*/g, '**$1**')
      // Pattern B: trailing space only — **text ** → **text**
      result = result.replace(/\*\*([^*]+?)\s+\*\*/g, '**$1**')
      // Pattern C: leading space only — ** text** → **text**
      result = result.replace(/\*\*\s+([^*]+?)\*\*/g, '**$1**')

      // Same for __...__
      result = result.replace(/__\s+([^_]+?)\s+__/g, '__$1__')
      result = result.replace(/__([^_]+?)\s+__/g, '__$1__')
      result = result.replace(/__\s+([^_]+?)__/g, '__$1__')

      // Fix * italic * → *italic* (single markers, not confused with **)
      result = result.replace(/(?<!\*)\*\s+([^*]+?)\s+\*(?!\*)/g, '*$1*')
      result = result.replace(/(?<!\*)\*([^*]+?)\s+\*(?!\*)/g, '*$1*')
      result = result.replace(/(?<!\*)\*\s+([^*]+?)\*(?!\*)/g, '*$1*')

      // Same for single _ (only when NOT adjacent to word chars on both sides)
      result = result.replace(/(?<![_\w])_\s+([^_]+?)\s+_(?![_\w])/g, '_$1_')
      result = result.replace(/(?<![_\w])_([^_]+?)\s+_(?![_\w])/g, '_$1_')
      result = result.replace(/(?<![_\w])_\s+([^_]+?)_(?![_\w])/g, '_$1_')

      return result
    }).join('')
  }).join('\n')
}

// ============================================================
// Transform: Normalize Headings
// ============================================================

function normalizeHeadings(md: string): string {
  const lines = md.split('\n')
  let inCodeBlock = false
  return lines.map(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) inCodeBlock = !inCodeBlock
    if (inCodeBlock) return line

    // Fix ##text → ## text (missing space after # markers)
    return line.replace(/^(#{1,6})([^#\s])/g, '$1 $2')
  }).join('\n')
}

// ============================================================
// Transform: Format Callouts as Blockquotes
// ============================================================

const CALLOUT_TYPES = [
  'Note', 'Notes', 'Tip', 'Tips', 'Warning',
  'Important', 'Info', 'Caution', 'Goal', 'Source',
  'Why', 'FAQ', 'Hint', 'Remember',
]

function formatCallouts(md: string): string {
  const lines = md.split('\n')
  let inCodeBlock = false
  const result: string[] = []

  // Build regexes once
  const types = CALLOUT_TYPES.join('|')

  // Matches: optional prefix + **Label:** text  (e.g., "👤**Profile:** Student" or "**Note:** text")
  const boldCallout = new RegExp(
    `^(>\\s*)?(.+?)?\\*\\*(${types})\\*\\*:\\s*(.+)$`, 'i'
  )
  // Matches: Label: text at start of content
  const plainCallout = new RegExp(
    `^(>\\s*)?(.+?)?(${types}):\\s+(.+)$`, 'i'
  )

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) inCodeBlock = !inCodeBlock
    if (inCodeBlock) { result.push(line); continue }

    // If already a blockquote with **Label:** pattern, just normalize spacing
    const existingBq = trimmed.match(/^>\s*(.+)$/)
    if (existingBq) {
      const inner = existingBq[1]
      const innerMatch = inner.match(new RegExp(`^(.*?)\\*\\*(${types})\\*\\*:\\s*(.*)$`, 'i'))
      if (innerMatch) {
        const prefix = innerMatch[1].trim()
        const label = innerMatch[2].charAt(0).toUpperCase() + innerMatch[2].slice(1).toLowerCase().replace(/s$/, '')
        const text = innerMatch[3].trim()
        if (prefix) {
          result.push(`> ${prefix} **${label}:** ${text}`)
        } else {
          result.push(`> **${label}:** ${text}`)
        }
        continue
      }
      result.push(line)
      continue
    }

    // Try bold pattern with optional prefix: **Note:** text or 👤**Profile:** text
    const boldMatch = trimmed.match(boldCallout)
    if (boldMatch) {
      const prefix = (boldMatch[2] || '').trim()
      const label = boldMatch[3].charAt(0).toUpperCase() + boldMatch[3].slice(1).toLowerCase().replace(/s$/, '')
      const text = boldMatch[4].trim()
      if (prefix) {
        result.push(`> ${prefix} **${label}:** ${text}`)
      } else {
        result.push(`> **${label}:** ${text}`)
      }
      continue
    }

    // Try plain pattern: Note: text
    const plainMatch = trimmed.match(plainCallout)
    if (plainMatch) {
      const prefix = (plainMatch[2] || '').trim()
      const label = plainMatch[3].charAt(0).toUpperCase() + plainMatch[3].slice(1).toLowerCase()
      const text = plainMatch[4].trim()
      if (prefix) {
        result.push(`> ${prefix} **${label}:** ${text}`)
      } else {
        result.push(`> **${label}:** ${text}`)
      }
      continue
    }

    result.push(line)
  }

  return result.join('\n')
}

// ============================================================
// Transform: Normalize Horizontal Rules
// ============================================================

function normalizeHorizontalRules(md: string): string {
  const lines = md.split('\n')
  let inCodeBlock = false
  return lines.map(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) inCodeBlock = !inCodeBlock
    if (inCodeBlock) return line
    // Don't match separator lines that are inside tables (start with |)
    if (trimmed.startsWith('|')) return line
    return line.replace(/^(\s*)([-*_])\s*\2\s*\2[\s\2]*$/, '$1---')
  }).join('\n')
}

// ============================================================
// Transform: Fix Tables
// ============================================================

type Align = 'left' | 'center' | 'right'

function fixTables(md: string, compact: boolean = false): string {
  const lines = md.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const tableLines: string[] = []

    // Collect consecutive lines that look like table rows
    while (i < lines.length && isTableRow(lines[i])) {
      tableLines.push(lines[i])
      i++
    }

    if (tableLines.length >= 2) {
      result.push(...formatTable(tableLines, compact))
    } else if (tableLines.length === 1) {
      result.push(tableLines[0])
    } else {
      result.push(lines[i])
      i++
    }
  }

  return result.join('\n')
}

function isTableRow(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed.includes('|')) return false
  if (trimmed.startsWith('```')) return false
  // Lines starting with list markers are not table rows
  if (/^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) return false
  const pipes = (trimmed.match(/\|/g) || []).length
  return pipes >= 2
}

function formatTable(tableLines: string[], compact: boolean): string[] {
  const parsed = tableLines.map(line => parseTableRow(line))

  // Determine column count (max across all rows)
  const maxCols = Math.max(...parsed.map(r => r.cells.length))

  // Find separator row and extract alignment
  let separatorIdx = -1
  let alignments: (Align | null)[] = []
  for (let i = 0; i < parsed.length; i++) {
    if (parsed[i].isSeparator) {
      separatorIdx = i
      alignments = getAlignments(parsed[i].rawSeparator || '', maxCols)
      break
    }
  }

  // Pad all rows to max column count
  const padded = parsed.map(row => {
    const cells = [...row.cells]
    while (cells.length < maxCols) cells.push('')
    return { ...row, cells }
  })

  // Calculate column widths (content rows only, not separator)
  const colWidths: number[] = []
  for (let c = 0; c < maxCols; c++) {
    let maxW = compact ? 1 : 3
    for (let r = 0; r < padded.length; r++) {
      if (r !== separatorIdx) {
        maxW = Math.max(maxW, padded[r].cells[c].length)
      }
    }
    colWidths[c] = maxW
  }

  // Build output rows
  const result: string[] = []
  for (let r = 0; r < padded.length; r++) {
    const row = padded[r]
    if (row.isSeparator) {
      const cells = colWidths.map((w, c) => {
        const align = alignments[c] || 'left'
        return buildSeparatorCell(w, align)
      })
      result.push('| ' + cells.join(' | ') + ' |')
    } else {
      const cells = row.cells.map((cell, c) => {
        const align = alignments[c] || 'left'
        return alignCell(cell, colWidths[c], align)
      })
      result.push('| ' + cells.join(' | ') + ' |')
    }
  }

  return result
}

function parseTableRow(line: string): { cells: string[]; isSeparator: boolean; rawSeparator?: string } {
  const trimmed = line.trim()

  // Detect separator row
  const isSeparator = /^\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?$/.test(trimmed)

  // Strip leading/trailing pipes
  let content = trimmed
  if (content.startsWith('|')) content = content.substring(1)
  if (content.endsWith('|')) content = content.substring(0, content.length - 1)

  const cells = content.split('|').map(cell => cell.trim())

  return { cells, isSeparator, rawSeparator: isSeparator ? trimmed : undefined }
}

/** Extract alignment from a separator row string */
function getAlignments(sepRow: string, colCount: number): (Align | null)[] {
  let content = sepRow.trim()
  if (content.startsWith('|')) content = content.substring(1)
  if (content.endsWith('|')) content = content.substring(0, content.length - 1)

  const parts = content.split('|').map(s => s.trim())
  const result: (Align | null)[] = []

  for (let i = 0; i < Math.min(parts.length, colCount); i++) {
    const p = parts[i]
    if (p.startsWith(':') && p.endsWith(':')) {
      result.push('center')
    } else if (p.endsWith(':')) {
      result.push('right')
    } else if (p.startsWith(':')) {
      result.push('left')
    } else {
      result.push(null)
    }
  }

  while (result.length < colCount) result.push(null)
  return result
}

/** Build a separator cell with proper alignment markers */
function buildSeparatorCell(width: number, align: Align | null): string {
  if (width < 3) width = 3
  if (align === 'center') return ':' + '-'.repeat(width - 2) + ':'
  if (align === 'right') return '-'.repeat(width - 1) + ':'
  if (align === 'left') return ':' + '-'.repeat(width - 1)
  return '-'.repeat(width)
}

/** Pad/align a cell's content within its column */
function alignCell(content: string, width: number, align: Align | null): string {
  if (align === 'right') return content.padStart(width)
  if (align === 'center') {
    const leftPad = Math.floor((width - content.length) / 2)
    return ' '.repeat(leftPad) + content + ' '.repeat(width - content.length - leftPad)
  }
  return content.padEnd(width)
}

// ============================================================
// Transform: Fix Blank Line Spacing
// ============================================================

function fixBlankLineSpacing(md: string): string {
  const lines = md.split('\n')
  const result: string[] = []
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Track code block state
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      result.push(line)
      continue
    }

    if (inCodeBlock) {
      result.push(line)
      continue
    }

    const isPrevLineBlank = result.length === 0 || result[result.length - 1].trim() === ''

    // Block elements that need blank line before them
    if (!isPrevLineBlank && result.length > 0) {
      const isBlockStart = isHeading(trimmed) ||
        isHorizontalRule(trimmed) ||
        trimmed.startsWith('```') ||
        trimmed.startsWith('>') ||
        trimmed.startsWith('|') ||
        /^[-*+]\s/.test(trimmed) ||
        /^\d+\.\s/.test(trimmed)

      if (isBlockStart) {
        result.push('')
      }
    }

    result.push(line)

    // Add blank line AFTER block elements if next line isn't blank
    const isBlockElement = isHeading(trimmed) ||
      isHorizontalRule(trimmed) ||
      trimmed.startsWith('```')

    if (isBlockElement && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim()
      if (nextLine !== '') {
        result.push('')
      }
    }
  }

  return result.join('\n')
}

function isHeading(line: string): boolean {
  return /^#{1,6}\s/.test(line)
}

function isHorizontalRule(line: string): boolean {
  return /^(\s*)([-*_])\s*\2\s*\2[\s\2]*$/.test(line)
}

// ============================================================
// Transform: Fix Blockquote Spacing
// ============================================================

function fixBlockquoteSpacing(md: string): string {
  const lines = md.split('\n')
  let inCodeBlock = false
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) inCodeBlock = !inCodeBlock
    if (inCodeBlock) { result.push(line); continue }

    // Ensure blank line before blockquote that follows non-blank, non-blockquote content
    if (trimmed.startsWith('>') && result.length > 0) {
      const prev = result[result.length - 1].trim()
      if (prev !== '' && !prev.startsWith('>')) {
        result.push('')
      }
    }

    // Ensure blank line after blockquote if next line is non-blank
    if (trimmed.startsWith('>') && i + 1 < lines.length) {
      const next = lines[i + 1].trim()
      if (next !== '' && !next.startsWith('>')) {
        result.push(line)
        result.push('')
        continue
      }
    }

    result.push(line)
  }

  return result.join('\n')
}

// ============================================================
// Transform: Normalize List Indentation
// ============================================================

function normalizeListIndentation(md: string): string {
  const lines = md.split('\n')
  let inCodeBlock = false
  const result: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      result.push(line)
      continue
    }

    if (inCodeBlock) {
      result.push(line)
      continue
    }

    // Task list item (preserve checkbox markers)
    const taskMatch = line.match(/^(\s*)([-*+])\s+(\[[ xX]\])\s+(.*)/)
    // Unordered list: - item, * item, + item
    const listMatch = line.match(/^(\s*)([-*+])(\s+)(.*)/)
    // Ordered list: 1. item, 10. item
    const orderedMatch = line.match(/^(\s*)(\d+\.)(\s+)(.*)/)

    if (taskMatch) {
      const [, leading, marker, checkbox, content] = taskMatch
      const depth = Math.floor(leading.length / 2)
      result.push('  '.repeat(depth) + marker + ' ' + checkbox + ' ' + content)
    } else if (listMatch) {
      const [, leading, marker, , content] = listMatch
      const depth = Math.floor(leading.length / 2)
      result.push('  '.repeat(depth) + marker + ' ' + content.trim())
    } else if (orderedMatch) {
      const [, leading, marker, , content] = orderedMatch
      const depth = Math.floor(leading.length / 2)
      result.push('  '.repeat(depth) + marker + ' ' + content.trim())
    } else {
      result.push(line)
    }
  }

  return result.join('\n')
}

// ============================================================
// Transform: Add Language Hints to Code Blocks
// ============================================================

function addLanguageHints(md: string): string {
  const lines = md.split('\n')
  const result: string[] = []
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('```') && !inCodeBlock) {
      inCodeBlock = true

      // Check if this code block already has a language hint
      if (trimmed === '```' || trimmed === '``` ') {
        // No language hint — try to detect from upcoming content
        const codeContent = []
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim().startsWith('```')) break
          codeContent.push(lines[j])
        }
        const detected = detectCodeLanguage(codeContent.join('\n'))
        if (detected) {
          result.push('```' + detected)
          continue
        }
      }
    }

    if (trimmed.startsWith('```') && inCodeBlock) {
      inCodeBlock = false
    }

    result.push(line)
  }

  return result.join('\n')
}

/** Check if code block content is mostly natural language (English) */
function isNaturalLanguage(text: string): boolean {
  const commonWords = (text.match(
    /\b(the|is|are|was|were|has|have|had|this|that|these|those|with|from|for|will|would|could|should|very|really|also|even|still|already|yet|then|there|here|what|when|where|how|why|which|who|just|about|than|now|each|every|some|any|all|both|most|more|many|few|much|such|your|their|they|them|our|its|can|been|being|done|going|having|making|taking|using|working)\b/gi
  ) || []).length
  const lines = text.split('\n').length
  return commonWords > Math.max(lines * 0.4, 2)
}

function detectCodeLanguage(code: string): string | null {
  const trimmed = code.trim()
  if (!trimmed) return null

  const lines = trimmed.split('\n')
  if (lines.length < 2) return null

  // If the block looks like natural English text, require strong code signals
  const naturalText = isNaturalLanguage(trimmed)
  const minScore = naturalText ? 6 : 3

  // Score each language by counting weighted pattern matches
  const scores: Record<string, number> = {}

  function inc(lang: string, pattern: RegExp, weight: number = 1): void {
    const matches = (trimmed.match(pattern) || []).length
    if (matches > 0) scores[lang] = (scores[lang] || 0) + matches * weight
  }

  // JavaScript/TypeScript
  inc('typescript', /\b(interface|type\s+\w+\s*=|enum\s|namespace\s|declare\s|as\s+\w+|readonly)\b/g, 2)
  inc('javascript', /\b(const|let|var|=>|async|await|import\s+.+from|export\s+(default|const|function)|console\.)\b/g, 2)
  inc('javascript', /\b(function\s+\w+\s*\(|\.map\(|\.filter\(|\.reduce\(|Promise|===|!==)\b/g, 1)
  inc('javascript', /[{}\[\]\(\)]|=>|===|!==|&&|\|\|/g, 1)

  // Python
  inc('python', /\b(def\s+\w+\s*\(|class\s+\w+\s*[:\(]|import\s+\w+|from\s+\w+\s+import|if\s+__name__|print\(|self\.|elif|except|finally|lambda\s+\w+|yield\s+|raise\s+|return\s+)\b/g, 2)
  inc('python', /^\s*(if|elif|else|for|while|try|except|with|def|class|return|import|from|raise|yield|pass|break|continue)\s*[:\( ]/gm, 2)

  // HTML
  inc('html', /<(!DOCTYPE|html|head|body|div|span|p|a|h[1-6]|ul|ol|li|table|tr|td|th|img|link|script|style|nav|header|footer|section|article|form|input|button|select|option|meta|br|hr|pre|code|blockquote)/gi, 2)
  inc('html', /<\/\w+>/g, 1)

  // CSS
  inc('css', /@media|@import|@keyframes|@font-face/gi, 3)
  inc('css', /[a-zA-Z-]+\s*:\s*[^;]+;/g, 1)
  inc('css', /#[a-fA-F0-9]{3,6}\b|\.\w+-\w+|\d+px|\d+rem|\d+em/gi, 1)

  // SQL
  inc('sql', /\b(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|WHERE|JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|UNION|DISTINCT|COUNT\(|SUM\(|AVG\(|MIN\(|MAX\()\b/g, 3)

  // Bash/Shell
  inc('bash', /^#!\//m, 5)
  inc('bash', /\b(echo\s+["']|if\s+\[|fi|for\s+\w+\s+in|while\s+|do\s+|done|export\s+\w+=|source\s+|exit\s+\d|chmod|chown|grep|sed|awk|curl|wget|rm\s+-rf|mkdir\s+-p|cd\s+\/)\b/g, 2)

  // JSON
  inc('json', /^\s*[\[{]/m, 2)
  inc('json', /"\w+":\s*["\d\[{tfn]/, 2)

  // YAML
  inc('yaml', /^[\w-]+:\s/gm, 2)
  inc('yaml', /^\s*-\s+\w+/gm, 1)

  // Go
  inc('go', /\b(func\s+\w+|package\s+\w+|import\s+"|fmt\.|:=|go\s+func|defer\s+|chan\s+|map\[|\[\]byte|error\s*\))\b/g, 2)

  // Rust
  inc('rust', /\b(fn\s+\w+|let\s+mut|use\s+\w+|impl\s+|pub\s+fn|match\s+|println!|\w+::new\(\)|Some\(|None|Ok\(|Err\()/g, 2)

  // Java
  inc('java', /\b(public\s+(class|static|void)|private\s+static|System\.out|import\s+java\.|public\s+static\s+void\s+main|String\[\]|@Override|extends\s+|implements\s+)\b/g, 2)

  // C#
  inc('csharp', /\b(using\s+System|namespace\s+\w+|class\s+\w+|void\s+Main|Console\.|var\s+\w+\s*=\s*new|async\s+Task|string\s+\w+|int\s+\w+|get;\s*set;)\b/g, 2)

  // Find highest scoring language
  let bestLang: string | null = null
  let bestScore = 0
  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestLang = lang
    }
  }

  return bestScore >= minScore ? bestLang : null
}

// ============================================================
// Transform: Generate Table of Contents
// ============================================================

function generateTableOfContents(md: string): string {
  const lines = md.split('\n')
  let inCodeBlock = false
  const headings: Array<{ level: number; text: string }> = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) inCodeBlock = !inCodeBlock
    if (inCodeBlock) continue

    const match = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      // Strip bold/italic/code from heading text for TOC display
      const rawText = match[2]
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .trim()
      headings.push({ level, text: rawText })
    }
  }

  // Don't add TOC for fewer than 3 headings
  if (headings.length < 3) return md

  const tocLines: string[] = ['', '---', '', '## Table of Contents', '']

  for (const h of headings) {
    if (h.level > 3) continue
    const indent = '  '.repeat(h.level - 1)
    const anchor = h.text
      .toLowerCase()
      // Remove non-alphanumeric characters except spaces and hyphens
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    tocLines.push(`${indent}- [${h.text}](#${anchor})`)
  }

  tocLines.push('', '---', '')

  // Insert after the first h1
  const firstH1Idx = lines.findIndex(l => /^#\s/.test(l.trim()))
  if (firstH1Idx >= 0) {
    const before = lines.slice(0, firstH1Idx + 1)
    const after = lines.slice(firstH1Idx + 1)
    return [...before, ...tocLines, ...after].join('\n')
  }

  return [...tocLines, ...lines].join('\n')
}

// ============================================================
// Transform: Strip Trailing Blank Lines
// ============================================================

function stripTrailingBlankLines(md: string): string {
  return md.replace(/\n+$/, '\n')
}

// ============================================================
// Transform: Collapse consecutive blank lines inside blockquotes
// ============================================================

function collapseBlockquoteBlankLines(md: string): string {
  // Collapse > followed by empty line then > again to keep one > empty line
  const lines = md.split('\n')
  const result: string[] = []
  for (let i = 0; i < lines.length; i++) {
    if (i > 0 && i < lines.length - 1) {
      const prev = lines[i - 1].trim()
      const curr = lines[i].trim()
      const next = lines[i + 1].trim()
      // If current is a blank line between two blockquotes, keep it single
      if (curr === '' && prev.startsWith('>') && next.startsWith('>')) {
        result.push('')
        continue
      }
    }
    result.push(lines[i])
  }
  return result.join('\n')
}

// ============================================================
// Main Pipeline
// ============================================================

function beautifyMarkdown(input: string, options: BeautifierOptions): string {
  if (!input.trim()) return ''

  let result = input

  // Pipeline — order matters
  result = normalizeLineEndings(result)
  result = trimTrailingWhitespace(result)
  result = collapseBlankLines(result)

  // Structural fixes
  result = normalizeHeadings(result)
  result = fixBlankLineSpacing(result)
  result = fixInlineSpacing(result)

  // Optional: format callouts as blockquotes (before blockquote spacing)
  if (options.formatCallouts) {
    result = formatCallouts(result)
  }

  // Blockquote spacing (handles both existing and new callouts)
  result = fixBlockquoteSpacing(result)

  result = normalizeHorizontalRules(result)
  result = fixTables(result, options.compactTables)
  result = normalizeListIndentation(result)

  if (options.addLanguageHints) {
    result = addLanguageHints(result)
  }

  // Optional: generate table of contents (last structural addition)
  if (options.generateTOC) {
    result = generateTableOfContents(result)
  }

  // Final cleanup
  result = collapseBlockquoteBlankLines(result)
  result = collapseBlankLines(result)
  result = stripTrailingBlankLines(result)

  return result
}

// ============================================================
// Stats
// ============================================================

function computeStats(input: string, output: string): Stats {
  const inputLines = input ? input.split('\n').length : 0
  const inputChars = input.length
  const outputLines = output ? output.split('\n').length : 0
  const outputChars = output.length
  const changePercent = inputChars > 0 ? Math.round((1 - outputChars / inputChars) * 100) : 0
  return { inputLines, inputChars, outputLines, outputChars, changePercent }
}

// ============================================================
// Component
// ============================================================

export default function MarkdownBeautifierPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [addLanguageHints, setAddLanguageHints] = useState(false)
  const [generateTOC, setGenerateTOC] = useState(false)
  const [formatCallouts, setFormatCallouts] = useState(false)
  const [compactTables, setCompactTables] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [stats, setStats] = useState<Stats>({ inputLines: 0, inputChars: 0, outputLines: 0, outputChars: 0, changePercent: 0 })
  const [loaded, setLoaded] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY)
      if (stored) setHistory(JSON.parse(stored))
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  // Beautify handler
  const handleBeautify = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      setStats(computeStats('', ''))
      return
    }

    try {
      const options: BeautifierOptions = {
        addLanguageHints,
        generateTOC,
        formatCallouts,
        compactTables,
      }
      const result = beautifyMarkdown(input, options)
      setOutput(result)
      setError(null)
      setStats(computeStats(input, result))

      // Save to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        preview: input.substring(0, 80),
        fullInput: input,
      }
      setHistory(prev => {
        const next = [newItem, ...prev].slice(0, FREE_LIMIT_HISTORY)
        try {
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(next))
        } catch { /* ignore */ }
        return next
      })
    } catch (e) {
      setError(`Beautification error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }, [input, addLanguageHints, generateTOC, formatCallouts, compactTables])

  // Copy output
  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = output
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch { /* ignore */ }
    }
  }, [output])

  // Download .md
  const handleDownload = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'beautified.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [output])

  // Load demo
  const handleLoadDemo = useCallback(() => {
    setInput(DEMO_MARKDOWN)
    setOutput('')
    setError(null)
  }, [])

  // Load from history
  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    setInput(item.fullInput)
    setOutput('')
    setError(null)
  }, [])

  // Clear history
  const handleClearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY)
    } catch { /* ignore */ }
  }, [])

  const changeColor = stats.changePercent > 0 ? 'text-[#00FF41]' : stats.changePercent < 0 ? 'text-[#ff4444]' : 'text-[#888888]'

  if (!loaded) {
    return (
      <ToolLayout
        title="Markdown Beautifier"
        description="Clean and format messy markdown instantly"
        toolSlug="markdown-beautifier"
        categorySlug="developer-tools"
        faq={markdownBeautifierFaq}
        seoContent={markdownBeautifierSeo}
      >
        <div className="space-y-4 font-mono animate-pulse">
          <div className="h-10 bg-[#1a1a1a] border border-[#333333]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-96 bg-[#1a1a1a] border border-[#333333]" />
            <div className="h-96 bg-[#1a1a1a] border border-[#333333]" />
          </div>
        </div>
      </ToolLayout>
    )
  }

  return (
    <ToolLayout
      title="Markdown Beautifier"
      description="Clean and format messy markdown instantly"
      toolSlug="markdown-beautifier"
      categorySlug="developer-tools"
      faq={markdownBeautifierFaq}
      seoContent={markdownBeautifierSeo}
    >
      <div className="space-y-4 font-mono">
        {/* Settings Bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 bg-[#000000] border border-[#333333]">
          <button
            onClick={handleLoadDemo}
            className="terminal-btn text-[10px] shrink-0"
          >
            [<span className="green-chevron">&gt;</span> Load Demo]
          </button>

          <label className="flex items-center gap-1.5 text-[10px] font-mono text-[#888888] cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={generateTOC}
              onChange={(e) => setGenerateTOC(e.target.checked)}
              className="w-3 h-3 accent-[#00FF41] cursor-pointer"
            />
            Table of Contents
          </label>

          <label className="flex items-center gap-1.5 text-[10px] font-mono text-[#888888] cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={formatCallouts}
              onChange={(e) => setFormatCallouts(e.target.checked)}
              className="w-3 h-3 accent-[#00FF41] cursor-pointer"
            />
            Callout blocks
          </label>

          <label className="flex items-center gap-1.5 text-[10px] font-mono text-[#888888] cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={addLanguageHints}
              onChange={(e) => setAddLanguageHints(e.target.checked)}
              className="w-3 h-3 accent-[#00FF41] cursor-pointer"
            />
            Code lang hints
          </label>

          <label className="flex items-center gap-1.5 text-[10px] font-mono text-[#888888] cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={compactTables}
              onChange={(e) => setCompactTables(e.target.checked)}
              className="w-3 h-3 accent-[#00FF41] cursor-pointer"
            />
            Compact tables
          </label>
        </div>

        {/* Two-Pane Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-[#888888] uppercase tracking-wider">Input Markdown</span>
              <span className="text-[10px] font-mono text-[#555555]">{input.split('\n').length} lines</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your messy markdown here..."
              spellCheck={false}
              className="w-full h-96 p-4 bg-[#000000] border border-[#333333] text-[#F9F9F9] font-mono text-sm leading-relaxed resize-y outline-none placeholder-[#555555] focus:border-[#00FF41] transition-none"
            />
          </div>

          {/* Output */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-[#888888] uppercase tracking-wider">Beautified Output</span>
              <div className="flex items-center gap-2">
                {output && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="text-[10px] font-mono text-[#888888] hover:text-[#00FF41] transition-none flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="text-[10px] font-mono text-[#888888] hover:text-[#00FF41] transition-none flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      .md
                    </button>
                  </>
                )}
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Beautified markdown will appear here..."
              spellCheck={false}
              className="w-full h-96 p-4 bg-[#000000] border border-[#333333] text-[#F9F9F9] font-mono text-sm leading-relaxed resize-y outline-none placeholder-[#555555]"
            />
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-[#F9F9F9] text-[#000000] border border-[#000000] relative overflow-hidden animate-glitch-flash">
            <div
              className="absolute left-0 top-0 bottom-0 w-3"
              style={{
                background: `repeating-linear-gradient(
                  45deg,
                  #000000,
                  #000000 4px,
                  #F9F9F9 4px,
                  #F9F9F9 8px
                )`,
              }}
            />
            <div className="pl-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">[ERROR]</span>
              <p className="text-xs font-mono mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        {output && (
          <div className="flex flex-wrap items-center gap-4 md:gap-6 px-4 py-3 bg-[#000000] border border-[#333333] font-mono text-xs">
            <span className="text-[#888888]">
              Input: <span className="text-[#F9F9F9] font-bold">{stats.inputLines.toLocaleString()} lines</span>
              {' | '}
              <span className="text-[#F9F9F9] font-bold">{stats.inputChars.toLocaleString()} chars</span>
            </span>
            <span className="text-[#555555] hidden md:inline">&rarr;</span>
            <span className="text-[#888888]">
              Output: <span className="text-[#F9F9F9] font-bold">{stats.outputLines.toLocaleString()} lines</span>
              {' | '}
              <span className="text-[#F9F9F9] font-bold">{stats.outputChars.toLocaleString()} chars</span>
            </span>
            <span className={`font-bold ${changeColor}`}>
              {stats.changePercent > 0 ? `- ${stats.changePercent}%` : stats.changePercent < 0 ? `+ ${Math.abs(stats.changePercent)}%` : '±0%'}
            </span>
          </div>
        )}

        {/* Beautify Action */}
        <button
          onClick={handleBeautify}
          className="terminal-btn w-full justify-center"
        >
          [<span className="green-chevron">&gt;</span> {output ? 'Re-Beautify' : 'Beautify Markdown'}]
        </button>

        {/* History Section */}
        {history.length > 0 && (
          <div className="pt-6 border-t border-[#333333]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-mono font-bold text-[#F9F9F9] flex items-center gap-1.5 uppercase tracking-wider">
                <History className="w-4 h-4" />
                Recent Formatting History
              </h3>
              <button
                onClick={handleClearHistory}
                className="text-[10px] font-mono text-[#666666] hover:text-[#ff4444] transition-none cursor-pointer uppercase tracking-wider"
              >
                Clear History
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectHistoryItem(item)}
                  className="p-3 bg-[#000000] border border-[#333333] hover:border-[#F9F9F9] cursor-pointer transition-none text-left group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 border border-[#444444] text-[#888888]">
                      Markdown
                    </span>
                    <span className="text-[10px] font-mono text-[#555555]">
                      {item.timestamp}
                    </span>
                  </div>
                  <code className="block text-xs font-mono text-[#888888] line-clamp-2 mt-1 break-all bg-[#000000] p-1.5 border border-[#1a1a1a]">
                    {item.preview}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
