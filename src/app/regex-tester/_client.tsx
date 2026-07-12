'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Copy, Check, ChevronRight, ChevronDown, AlertCircle, HelpCircle, Code, Sparkles } from 'lucide-react'

const regexFaq = [
  {
    question: 'What can I test with this regex tool?',
    answer: 'You can test any JavaScript-compatible regular expression pattern against your input text. The tool shows matches, highlight them in the text, and provides a structural tree view explaining each token in plain English.'
  },
  {
    question: 'How do I use regex flags like global or case-insensitive?',
    answer: 'Enter flags in the Flags input field (e.g., "gi" for global + case-insensitive, "gm" for global + multiline). The tool supports all JavaScript regex flags: g, i, m, s, u, y. Click "Try it" on cheat sheet patterns to see working examples.'
  },
  {
    question: 'What is the Regex Tree Explainer for?',
    answer: 'The tree view breaks down your regex into individual nodes (anchors, quantifiers, character sets, groups). This helps you understand complex patterns, debug why matches are not working, and learn regex syntax by seeing the parsed structure.'
  },
  {
    question: 'Why does my regex match differently in JavaScript vs other languages?',
    answer: 'JavaScript regex lacks some features like lookbehind (added in ES2018, now supported), possessive quantifiers, and the \\x flag (extended mode). If your pattern uses these, it may fail silently or behave unexpectedly. This tool uses the JavaScript RegExp engine, so test patterns you intend to use in Node.js or browser code.'
  },
  {
    question: 'How do I handle matching across multiple lines?',
    answer: 'Use the multiline flag "m" to make ^ and $ match at line boundaries instead of string boundaries. Use the dotAll flag "s" to make the dot (.) match newline characters. Combine them as "gms" for cross-line matching with global search.'
  }
]

const regexSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Test Regular Expressions Interactively</h2>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What It Is</h3>
    <p>
      A regular expression (regex) is a sequence of characters that defines a search pattern. It is used for pattern matching, search-and-replace, and input validation in text. Common uses include email validation, log parsing, URL rewriting, and code refactoring. This interactive tester lets you type a pattern, provide sample text, and immediately see which parts match in real time.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How It Works</h3>
    <p>
      The regex engine compiles your pattern into a finite-state machine that walks through the input text character by character. Anchors (^, $) assert positions, quantifiers (*, +, ?, {'{n,m}'}) control repetition, character sets ([abc] or \d, \w, \s) match specific groups of characters, and grouping constructs ((...), lookaheads, lookbehinds) create sub-expressions. The built-in tree explainer parses your regex into a visual hierarchy so you can inspect each token and understand its role in the full pattern.
    </p>
    <h3 className="text-sm font-semibold text-[#F9F9F9]">Worked Example</h3>
    <p>
      To validate an email address, enter the pattern <code className="px-1.5 py-0.5 font-mono text-xs text-[#00FF41]">{'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'}</code> with the "gm" flags.
    </p>
    <h3 className="text-sm font-semibold text-[#F9F9F9]">Common Mistakes</h3>
    <p>
      Forgetting to escape the dot (\.) when you need a literal period instead of any-character wildcard is the most common regex bug. Not anchoring patterns with ^ and $ when validating entire strings causes partial matches to pass. Overusing greedy quantifiers (*, +) without considering backtracking can cause catastrophic backtracking and freeze your application. Always test your pattern against edge cases empty strings, very long inputs, and strings with special characters before deploying.
    </p>
  </div>
)

// Types for the Regex AST
export interface RegexNode {
  type: string
  label: string
  description: string
  raw: string
  children?: RegexNode[]
}

// Custom Regex parser that parses a pattern string into an AST
export function parseRegex(pattern: string): RegexNode[] {
  if (!pattern) return []
  let index = 0

  function peek(offset = 0): string {
    if (index + offset >= pattern.length) return ''
    return pattern[index + offset]
  }

  function consume(): string {
    const char = peek()
    index++
    return char
  }

  function parseGroup(): RegexNode {
    const startIdx = index - 1 // '(' is already consumed
    let type = 'capturing'
    let label = 'Capturing Group'
    let description = 'Groups multiple tokens together and creates a capture group for extracting substrings.'

    if (peek() === '?') {
      consume() // consume '?'
      const next = peek()
      if (next === ':') {
        consume() // consume ':'
        type = 'non-capturing'
        label = 'Non-Capturing Group'
        description = 'Groups multiple tokens together without creating a capture group.'
      } else if (next === '=') {
        consume() // consume '='
        type = 'positive-lookahead'
        label = 'Positive Lookahead'
        description = 'Asserts that the pattern is immediately followed by the group content, without including it in the match.'
      } else if (next === '!') {
        consume() // consume '!'
        type = 'negative-lookahead'
        label = 'Negative Lookahead'
        description = 'Asserts that the pattern is NOT immediately followed by the group content.'
      } else if (next === '<') {
        consume() // consume '<'
        const lookbehindType = peek()
        if (lookbehindType === '=') {
          consume() // consume '='
          type = 'positive-lookbehind'
          label = 'Positive Lookbehind'
          description = 'Asserts that the pattern is immediately preceded by the group content, without including it in the match.'
        } else if (lookbehindType === '!') {
          consume() // consume '!'
          type = 'negative-lookbehind'
          label = 'Negative Lookbehind'
          description = 'Asserts that the pattern is NOT immediately preceded by the group content.'
        } else {
          // Named capture group: (?<name>...)
          let name = ''
          while (index < pattern.length && peek() !== '>') {
            name += consume()
          }
          if (peek() === '>') {
            consume() // consume '>'
          }
          type = 'named-capturing'
          label = `Named Capturing Group (?<${name}>)`
          description = `Groups tokens together and captures them under the name "${name}".`
        }
      }
    }

    const children: RegexNode[] = []
    while (index < pattern.length && peek() !== ')') {
      const parsedNodes = parseNext()
      children.push(...parsedNodes)
    }

    if (peek() === ')') {
      consume() // consume ')'
    }

    const raw = pattern.substring(startIdx, index)
    return {
      type: 'group',
      label,
      description,
      raw,
      children: handleAlternations(children),
    }
  }

  function parseCharacterSet(): RegexNode {
    const startIdx = index - 1 // '[' is already consumed
    let isNegated = false
    if (peek() === '^') {
      consume() // consume '^'
      isNegated = true
    }

    let innerText = ''
    while (index < pattern.length && peek() !== ']') {
      if (peek() === '\\') {
        innerText += consume() // consume '\'
      }
      if (index < pattern.length) {
        innerText += consume()
      }
    }

    if (peek() === ']') {
      consume() // consume ']'
    }

    const raw = pattern.substring(startIdx, index)
    const label = isNegated ? 'Negated Character Set' : 'Character Set'

    // Parse the inner ranges/characters
    const children: RegexNode[] = []
    let j = 0
    while (j < innerText.length) {
      if (innerText[j] === '\\') {
        const esc = innerText.substring(j, j + 2)
        j += 2
        children.push({
          type: 'escaped',
          label: `Escaped: "${esc}"`,
          description: `Matches the literal character or shorthand class defined by ${esc}`,
          raw: esc,
        })
      } else if (innerText[j + 1] === '-' && j + 2 < innerText.length) {
        const range = innerText.substring(j, j + 3)
        children.push({
          type: 'range',
          label: `Range: ${range[0]} to ${range[2]}`,
          description: `Matches any character in the ASCII range from '${range[0]}' to '${range[2]}'`,
          raw: range,
        })
        j += 3
      } else {
        const char = innerText[j]
        children.push({
          type: 'literal',
          label: `Literal: "${char}"`,
          description: `Matches the character "${char}" literally`,
          raw: char,
        })
        j++
      }
    }

    return {
      type: 'charset',
      label,
      description: isNegated
        ? 'Matches any character NOT in the specified set.'
        : 'Matches any single character in the specified set.',
      raw,
      children,
    }
  }

  function parseNext(): RegexNode[] {
    const char = consume()
    if (!char) return []

    // Anchors
    if (char === '^') {
      return [{
        type: 'anchor',
        label: 'Start of String Anchor',
        description: 'Asserts the start of the string or line (requires multiline flag "m" for lines).',
        raw: char,
      }]
    }
    if (char === '$') {
      return [{
        type: 'anchor',
        label: 'End of String Anchor',
        description: 'Asserts the end of the string or line (requires multiline flag "m" for lines).',
        raw: char,
      }]
    }
    if (char === '.') {
      return [{
        type: 'character_class',
        label: 'Any Character Wildcard',
        description: 'Matches any single character except a newline (unless dotAll flag "s" is active).',
        raw: char,
      }]
    }

    if (char === '|') {
      return [{
        type: 'alternation-separator',
        label: 'Alternation (OR)',
        description: 'Acts like a logical OR, matching either the pattern on the left or the pattern on the right.',
        raw: char,
      }]
    }

    if (char === '(') {
      return [parseGroup()]
    }

    if (char === '[') {
      return [parseCharacterSet()]
    }

    if (char === '\\') {
      const nextChar = peek()
      if (!nextChar) {
        return [{
          type: 'literal',
          label: 'Backslash',
          description: 'Matches a literal backslash character.',
          raw: '\\',
        }]
      }
      consume() // consume next character
      const raw = '\\' + nextChar

      // Shorthand character classes
      switch (nextChar) {
        case 'd':
          return [{
            type: 'character_class',
            label: 'Digit Shorthand',
            description: 'Matches any decimal digit. Equivalent to [0-9].',
            raw,
          }]
        case 'D':
          return [{
            type: 'character_class',
            label: 'Non-Digit Shorthand',
            description: 'Matches any character that is not a decimal digit. Equivalent to [^0-9].',
            raw,
          }]
        case 'w':
          return [{
            type: 'character_class',
            label: 'Word Character Shorthand',
            description: 'Matches any alphanumeric character or underscore. Equivalent to [A-Za-z0-9_].',
            raw,
          }]
        case 'W':
          return [{
            type: 'character_class',
            label: 'Non-Word Character Shorthand',
            description: 'Matches any character that is not a word character. Equivalent to [^A-Za-z0-9_].',
            raw,
          }]
        case 's':
          return [{
            type: 'character_class',
            label: 'Whitespace Shorthand',
            description: 'Matches any whitespace character (space, tab, newline, carriage return, vertical tab, form feed).',
            raw,
          }]
        case 'S':
          return [{
            type: 'character_class',
            label: 'Non-Whitespace Shorthand',
            description: 'Matches any character that is not a whitespace character.',
            raw,
          }]
        case 'b':
          return [{
            type: 'anchor',
            label: 'Word Boundary',
            description: 'Asserts a position where a word boundary occurs (between a word character and a non-word character or boundary).',
            raw,
          }]
        case 'B':
          return [{
            type: 'anchor',
            label: 'Non-Word Boundary',
            description: 'Asserts a position where a word boundary does NOT occur.',
            raw,
          }]
        case 't':
          return [{ type: 'literal', label: 'Tab Character', description: 'Matches a horizontal tab character.', raw }]
        case 'n':
          return [{ type: 'literal', label: 'Newline Character', description: 'Matches a line feed (newline) character.', raw }]
        case 'r':
          return [{ type: 'literal', label: 'Carriage Return', description: 'Matches a carriage return character.', raw }]
        default:
          return [{
            type: 'escaped_literal',
            label: `Escaped Literal: "${nextChar}"`,
            description: `Matches the character "${nextChar}" literally (escaped regex control character).`,
            raw,
          }]
      }
    }

    // Default literal
    return [{
      type: 'literal',
      label: `Literal: "${char}"`,
      description: `Matches the character "${char}" literally and case-sensitively (unless case-insensitive flag "i" is active).`,
      raw: char,
    }]
  }

  function handleAlternations(nodes: RegexNode[]): RegexNode[] {
    const results: RegexNode[] = []
    let currentBranch: RegexNode[] = []

    for (let k = 0; k < nodes.length; k++) {
      const node = nodes[k]
      if (node.type === 'alternation-separator') {
        if (currentBranch.length > 0) {
          results.push(wrapBranch(currentBranch))
          currentBranch = []
        } else {
          results.push({
            type: 'empty',
            label: 'Empty Branch',
            description: 'Matches an empty string (always matches).',
            raw: '',
          })
        }
      } else {
        currentBranch.push(node)
      }
    }

    if (results.length > 0) {
      if (currentBranch.length > 0) {
        results.push(wrapBranch(currentBranch))
      } else {
        results.push({
          type: 'empty',
          label: 'Empty Branch',
          description: 'Matches an empty string (always matches).',
          raw: '',
        })
      }
      return [{
        type: 'alternation',
        label: 'Alternation (OR Selection)',
        description: 'Matches any of the listed alternatives, checked from left to right.',
        raw: results.map(r => r.raw).join('|'),
        children: results,
      }]
    }

    return nodes
  }

  function wrapBranch(nodes: RegexNode[]): RegexNode {
    if (nodes.length === 1) return nodes[0]
    return {
      type: 'branch',
      label: 'Alternative path',
      description: 'One of the possible paths of the alternation.',
      raw: nodes.map(n => n.raw).join(''),
      children: nodes,
    }
  }

  let rootNodes: RegexNode[] = []
  while (index < pattern.length) {
    rootNodes.push(...parseNext())
  }

  function processQuantifiers(nodes: RegexNode[]): RegexNode[] {
    const processed: RegexNode[] = []

    for (let k = 0; k < nodes.length; k++) {
      const node = nodes[k]

      if (node.children) {
        node.children = processQuantifiers(node.children)
      }

      const isQuantifierChar = node.type === 'literal' && (node.raw === '*' || node.raw === '+' || node.raw === '?')
      const isBraceQuantifier = node.type === 'literal' && node.raw === '{'

      if ((isQuantifierChar || isBraceQuantifier) && processed.length > 0) {
        const targetNode = processed.pop()!
        let rawQuantifier = node.raw
        let isLazy = false

        if (isQuantifierChar) {
          if (k + 1 < nodes.length && nodes[k + 1].type === 'literal' && nodes[k + 1].raw === '?') {
            rawQuantifier += '?'
            isLazy = true
            k++
          }
        } else {
          let braceContent = ''
          let tempK = k + 1
          while (tempK < nodes.length && !(nodes[tempK].type === 'literal' && nodes[tempK].raw === '}')) {
            braceContent += nodes[tempK].raw
            tempK++
          }
          if (tempK < nodes.length) {
            rawQuantifier += braceContent + '}'
            k = tempK
            if (k + 1 < nodes.length && nodes[k + 1].type === 'literal' && nodes[k + 1].raw === '?') {
              rawQuantifier += '?'
              isLazy = true
              k++
            }
          }
        }

        let label = 'Quantifier'
        let description = ''
        const lazyText = isLazy ? ' (lazy, matches as few times as possible)' : ' (greedy, matches as many times as possible)'

        if (rawQuantifier.startsWith('*')) {
          label = 'Zero or more times'
          description = `Matches the preceding token 0 or more times${lazyText}.`
        } else if (rawQuantifier.startsWith('+')) {
          label = 'One or more times'
          description = `Matches the preceding token 1 or more times${lazyText}.`
        } else if (rawQuantifier.startsWith('?')) {
          label = 'Zero or one time'
          description = `Matches the preceding token 0 or 1 time (making it optional)${lazyText}.`
        } else if (rawQuantifier.startsWith('{')) {
          const match = rawQuantifier.match(/\{(\d+)(,)?(\d+)?\}/)
          if (match) {
            const min = match[1]
            const hasComma = !!match[2]
            const max = match[3]

            if (hasComma) {
              if (max) {
                label = `Between ${min} and ${max} times`
                description = `Matches the preceding token between ${min} and ${max} times${lazyText}.`
              } else {
                label = `${min} or more times`
                description = `Matches the preceding token ${min} or more times${lazyText}.`
              }
            } else {
              label = `Exactly ${min} times`
              description = `Matches the preceding token exactly ${min} times.`
            }
          } else {
            label = `Range quantifier ${rawQuantifier}`
            description = `Matches the preceding token specified by ${rawQuantifier}${lazyText}.`
          }
        }

        processed.push({
          type: 'quantifier',
          label: `${label} (${rawQuantifier})`,
          description,
          raw: targetNode.raw + (rawQuantifier.startsWith(node.raw) ? rawQuantifier.substring(targetNode.raw.length) : rawQuantifier),
          children: [targetNode],
        })
      } else {
        processed.push(node)
      }
    }

    return processed
  }

  rootNodes = processQuantifiers(rootNodes)
  rootNodes = handleAlternations(rootNodes)

  function groupConsecutiveLiterals(nodes: RegexNode[]): RegexNode[] {
    const result: RegexNode[] = []
    let literalAccumulator: RegexNode[] = []

    function flush() {
      if (literalAccumulator.length > 0) {
        if (literalAccumulator.length === 1) {
          result.push(literalAccumulator[0])
        } else {
          const combinedRaw = literalAccumulator.map(l => l.raw).join('')
          result.push({
            type: 'literal_sequence',
            label: `Text sequence: "${combinedRaw}"`,
            description: `Matches the literal characters "${combinedRaw}" in exact sequence.`,
            raw: combinedRaw,
          })
        }
        literalAccumulator = []
      }
    }

    for (const node of nodes) {
      if (node.type === 'literal') {
        literalAccumulator.push(node)
      } else {
        flush()
        if (node.children) {
          node.children = groupConsecutiveLiterals(node.children)
        }
        result.push(node)
      }
    }
    flush()
    return result
  }

  rootNodes = groupConsecutiveLiterals(rootNodes)

  return rootNodes
}

// Tree view node component — terminal theme colors
export function RegexTreeNode({ node, depth = 0 }: { node: RegexNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  const getLabelStyles = (type: string) => {
    switch (type) {
      case 'group':
        return 'text-[#a78bfa] border-[#7c3aed] bg-[#0d0d0d]'
      case 'charset':
      case 'range':
        return 'text-[#60a5fa] border-[#2563eb] bg-[#0d0d0d]'
      case 'quantifier':
        return 'text-[#fbbf24] border-[#d97706] bg-[#0d0d0d]'
      case 'anchor':
        return 'text-[#f87171] border-[#dc2626] bg-[#0d0d0d]'
      case 'character_class':
        return 'text-[#34d399] border-[#059669] bg-[#0d0d0d]'
      case 'alternation':
      case 'branch':
        return 'text-[#f472b6] border-[#db2777] bg-[#0d0d0d]'
      case 'literal_sequence':
        return 'text-[#94a3b8] border-[#475569] bg-[#0d0d0d]'
      default:
        return 'text-[#888888] border-[#333333] bg-[#0d0d0d]'
    }
  }

  const labelColors = getLabelStyles(node.type)

  return (
    <div className={`flex flex-col ml-1 sm:ml-2 my-1.5 ${depth > 0 ? 'border-l border-[#1a1a1a] pl-3' : ''}`}>
      <div className="flex items-start gap-1.5 sm:gap-2">
        {hasChildren ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mt-1 p-0.5 text-[#555555] hover:text-[#F9F9F9] cursor-pointer"
          >
            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <div className="w-4.5" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs sm:text-sm px-1.5 py-0.5 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-semibold break-all">
              {node.raw || 'empty'}
            </span>

            <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 border font-medium ${labelColors}`}>
              {node.label}
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-[#666666] mt-1 leading-relaxed">
            {node.description}
          </p>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="mt-1 ml-1 sm:ml-2 space-y-1">
          {node.children!.map((child, idx) => (
            <RegexTreeNode key={idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// Custom live highlight renderer — terminal theme
export function HighlightedText({ text, pattern, flags }: { text: string; pattern: string; flags: string }) {
  if (!pattern) return <span className="whitespace-pre-wrap break-all text-[#888888]">{text}</span>

  try {
    const cleanFlags = flags.includes('g') ? flags : flags + 'g'
    const regex = new RegExp(pattern, cleanFlags)

    const matches = [...text.matchAll(regex)]
    if (matches.length === 0) {
      return <span className="whitespace-pre-wrap break-all text-[#888888]">{text}</span>
    }

    const elements: React.ReactNode[] = []
    let lastIndex = 0
    let matchCount = 0

    for (const match of matches) {
      matchCount++
      if (matchCount > 500) break

      const index = match.index!
      const matchText = match[0]
      if (matchText.length === 0 && index === lastIndex) {
        continue
      }

      if (index > lastIndex) {
        elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, index)}</span>)
      }

      elements.push(
        <mark
          key={`match-${index}`}
          className="bg-[#00FF41]/20 text-[#00FF41] rounded px-0.5 border border-[#00FF41]/40 font-mono text-sm font-semibold select-none inline-block leading-tight"
          title={`Match: "${matchText}"`}
        >
          {matchText}
        </mark>
      )

      lastIndex = index + matchText.length
    }

    if (lastIndex < text.length) {
      elements.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>)
    }

    return <div className="whitespace-pre-wrap break-all font-mono text-sm text-[#888888]">{elements}</div>
  } catch (e) {
    return <span className="whitespace-pre-wrap break-all text-[#FF4444] font-mono">{(e as Error).message}</span>
  }
}

// Cheat Sheet Data
const CHEAT_SHEET_PATTERNS = [
  {
    name: 'Email Address',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'Matches standard email formats.',
    testString: 'support@example.com\nhello.world_123@sub.domain.co\ninvalid-email@missing-tld\n@no-username.com',
    flags: 'gm'
  },
  {
    name: 'Phone Number (US)',
    pattern: '^\\+?1?\\s*\\(?\\d{3}\\)?[-\\s.]?\\d{3}[-\\s.]?\\d{4}$',
    description: 'Matches 10-digit US phone numbers with separators.',
    testString: '123-456-7890\n(555) 555-5555\n+1 987 654 3210\n9876543210\n12345',
    flags: 'gm'
  },
  {
    name: 'URL (HTTP/HTTPS)',
    pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)$',
    description: 'Matches typical website URLs with path.',
    testString: 'https://google.com\nhttp://github.com/features/actions?ref=main\nftp://invalid-protocol.com\nhttps://sub.domain.io/path',
    flags: 'gm'
  },
  {
    name: 'Date (YYYY-MM-DD)',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    description: 'Matches YYYY-MM-DD date format with ranges.',
    testString: '2026-07-10\n1999-12-31\n2025-13-45\n2024-00-15',
    flags: 'gm'
  },
  {
    name: 'Strong Password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    description: 'Min 8 chars, 1 upper, 1 lower, 1 digit, 1 special.',
    testString: 'StrongP@ss123\nweakpass\nNoSpecial123\nShort1@',
    flags: 'gm'
  }
]

// Common regex syntax tokens
const SYNTAX_REFERENCE = [
  { token: '.', desc: 'Any character except newline' },
  { token: '\\d', desc: 'Any digit (0-9)' },
  { token: '\\w', desc: 'Alphanumeric character + _' },
  { token: '\\s', desc: 'Whitespace (space, tab, newline)' },
  { token: '^ / $', desc: 'Start / End of string' },
  { token: '\\b', desc: 'Word boundary position' },
  { token: '*', desc: '0 or more times (greedy)' },
  { token: '+', desc: '1 or more times (greedy)' },
  { token: '?', desc: '0 or 1 time (optional)' },
  { token: '{n,m}', desc: 'Between n and m times' },
  { token: '(...)', desc: 'Capturing group' },
  { token: '[abc]', desc: 'Any character in set' },
  { token: '[^abc]', desc: 'Any character not in set' },
  { token: 'a|b', desc: 'Alternation (a OR b)' }
]

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState<string>('\\d{3}-\\d{2}-\\d{4}')
  const [flags, setFlags] = useState<string>('g')
  const [testString, setTestString] = useState<string>('123-45-6789\n987-65-4321\n555-55-5555')
  const [replacement, setReplacement] = useState<string>('***-**-****')
  const [result, setResult] = useState<{ matches: string[]; count: number; replaced: string; error: string } | null>(null)

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedRefIndex, setCopiedRefIndex] = useState<number | null>(null)
  const [treeNodes, setTreeNodes] = useState<RegexNode[]>([])

  const handleTest = () => {
    try {
      const regex = new RegExp(pattern, flags)
      const matches = [...testString.matchAll(regex)].map(m => m[0])
      const replaced = testString.replace(regex, replacement)
      setResult({ matches, count: matches.length, replaced, error: '' })
    } catch (e) {
      setResult({ matches: [], count: 0, replaced: '', error: (e as Error).message })
    }
  }

  // Parse tree and update matches whenever regex properties change
  useEffect(() => {
    handleTest()
    try {
      const nodes = parseRegex(pattern)
      setTreeNodes(nodes)
    } catch (e) {
      // ignore parsing crashes
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, flags, testString, replacement])

  const copyToClipboard = (text: string, index: number, isRef = false) => {
    navigator.clipboard.writeText(text)
    if (isRef) {
      setCopiedRefIndex(index)
      setTimeout(() => setCopiedRefIndex(null), 1500)
    } else {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1500)
    }
  }

  const loadPattern = (item: typeof CHEAT_SHEET_PATTERNS[0]) => {
    setPattern(item.pattern)
    setFlags(item.flags)
    setTestString(item.testString)
  }

  return (
    <ToolLayout
      title="Regex Tester & Parser"
      description="Test regular expressions online, visualize pattern breakdowns in a tree, copy common patterns, and see matches highlighted in real time."
      toolSlug="regex-tester"
      faq={regexFaq}
      seoContent={regexSeo}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Main interactive panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0a0a0a] border border-[#333333] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
              <h2 className="text-base font-bold text-[#F9F9F9] flex items-center gap-2 font-heading">
                <Code className="h-5 w-5 text-[#00FF41]" />
                Regex Tester Panel
              </h2>
              <span className="text-xs text-[#555555] border border-[#333333] px-2 py-0.5 font-mono">
                JavaScript regex
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-mono text-[#888888] mb-1 uppercase tracking-wider">
                  [ Pattern ]
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#555555] font-mono text-sm select-none">/</span>
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className="w-full pl-6 pr-6 py-3 border border-[#333333] font-mono text-sm text-[#F9F9F9] bg-[#000000] outline-none caret-[#00FF41] focus:border-[#00FF41]"
                    placeholder="[a-zA-Z0-9]+"
                  />
                  <span className="absolute right-3 top-3 text-[#555555] font-mono text-sm select-none">/</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#888888] mb-1 uppercase tracking-wider">
                  [ Flags ]
                </label>
                <input
                  type="text"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  className="w-full px-4 py-3 border border-[#333333] font-mono text-sm text-[#F9F9F9] bg-[#000000] outline-none caret-[#00FF41] focus:border-[#00FF41]"
                  placeholder="g, i, m, s, u"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#888888] mb-1 uppercase tracking-wider">
                [ Test String ]
              </label>
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-[#333333] font-mono text-sm text-[#F9F9F9] bg-[#000000] outline-none caret-[#00FF41] focus:border-[#00FF41]"
                placeholder="Insert test text here..."
              />
            </div>

            {/* Visual match highlight area */}
            <div className="border border-[#333333] bg-[#000000] p-4">
              <label className="block text-[10px] font-mono text-[#555555] uppercase tracking-wider mb-2">
                Highlighted Matches
              </label>
              <div className="min-h-[60px] p-3 border border-[#1a1a1a] bg-[#000000] overflow-y-auto max-h-[250px]">
                {testString ? (
                  <HighlightedText text={testString} pattern={pattern} flags={flags} />
                ) : (
                  <span className="text-[#555555] text-xs font-mono">Matches will be highlighted here in real time...</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#888888] mb-1 uppercase tracking-wider">
                [ Replacement String (optional) ]
              </label>
              <input
                type="text"
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                className="w-full px-4 py-3 border border-[#333333] font-mono text-sm text-[#F9F9F9] bg-[#000000] outline-none caret-[#00FF41] focus:border-[#00FF41]"
                placeholder="Insert replacement expression..."
              />
            </div>

            <button
              onClick={handleTest}
              className="terminal-btn w-full justify-center"
            >
              [<span className="green-chevron">&gt;</span> TEST REGEX]
            </button>

            {result && (
              <div className="space-y-4 pt-2">
                {result.error ? (
                  <div className="p-3.5 border border-[#FF4444]/30 bg-[#0a0a0a] text-[#FF4444] text-sm flex items-start gap-2 font-mono">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span className="font-mono text-xs">{result.error}</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 border border-[#00FF41]/20 bg-[#0a0a0a] text-center">
                        <p className="text-[10px] font-mono text-[#00FF41] uppercase tracking-wide">Matches Found</p>
                        <p className="text-3xl font-bold text-[#00FF41] mt-1 font-mono">{result.count}</p>
                      </div>
                      <div className="p-4 border border-[#333333] bg-[#0a0a0a] text-center">
                        <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wide">Replaced Text</p>
                        <div className="mt-2 text-xs font-mono text-[#F9F9F9] bg-[#000000] p-2 border border-[#333333] break-all text-left max-h-[80px] overflow-y-auto">
                          {result.replaced}
                        </div>
                      </div>
                    </div>
                    {result.matches.length > 0 && (
                      <div>
                        <p className="text-xs font-mono text-[#888888] mb-2 uppercase tracking-wider">[ Match List ]</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[150px] overflow-y-auto p-1 border border-[#1a1a1a] bg-[#0a0a0a]">
                          {result.matches.map((m, i) => (
                            <div key={i} className="p-2 bg-[#000000] border border-[#1a1a1a] font-mono text-xs text-[#888888] truncate" title={m}>
                              <span className="text-[10px] text-[#555555] mr-1.5">#{i+1}</span>
                              {m || <span className="italic text-[#555555]">(empty)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Regex Tree Explainer */}
          <div className="bg-[#0a0a0a] border border-[#333333] p-5 space-y-4">
            <div className="border-b border-[#1a1a1a] pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#F9F9F9] flex items-center gap-2 font-heading">
                  <Code className="h-5 w-5 text-[#a78bfa]" />
                  Regex Tree Explainer
                </h2>
                <p className="text-xs font-mono text-[#666666] mt-0.5">
                  Visual structural breakdown of your regex pattern into readable nodes.
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-1.5 text-[9px] uppercase font-bold tracking-wider font-mono">
                <span className="px-1.5 py-0.5 border border-[#7c3aed] text-[#a78bfa] bg-[#0d0d0d]">Group</span>
                <span className="px-1.5 py-0.5 border border-[#2563eb] text-[#60a5fa] bg-[#0d0d0d]">Set</span>
                <span className="px-1.5 py-0.5 border border-[#d97706] text-[#fbbf24] bg-[#0d0d0d]">Quantifier</span>
                <span className="px-1.5 py-0.5 border border-[#dc2626] text-[#f87171] bg-[#0d0d0d]">Anchor</span>
                <span className="px-1.5 py-0.5 border border-[#059669] text-[#34d399] bg-[#0d0d0d]">Shorthand</span>
              </div>
            </div>

            <div className="border border-[#333333] p-3 bg-[#000000]">
              {treeNodes.length > 0 ? (
                <div className="space-y-1">
                  {treeNodes.map((node, idx) => (
                    <RegexTreeNode key={idx} node={node} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[#555555] text-xs font-mono">
                  Enter a valid regular expression pattern above to generate the structural tree explainer.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Cheat Sheet */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0a0a0a] border border-[#333333] p-5 space-y-4">
            <h2 className="text-base font-bold text-[#F9F9F9] flex items-center gap-2 font-heading border-b border-[#1a1a1a] pb-3">
              <Sparkles className="h-5 w-5 text-[#fbbf24]" />
              Common Cheat Sheet
            </h2>

            <div className="space-y-3">
              {CHEAT_SHEET_PATTERNS.map((item, idx) => (
                <div key={idx} className="p-3 border border-[#333333] bg-[#000000] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F9F9F9] font-mono">{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(item.pattern, idx, false)}
                        className="p-1 text-[#555555] hover:text-[#F9F9F9] cursor-pointer"
                        title="Copy pattern"
                      >
                        {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-[#00FF41]" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => loadPattern(item)}
                        className="text-[10px] font-bold text-[#00FF41] border border-[#333333] px-2 py-0.5 hover:border-[#00FF41] font-mono cursor-pointer"
                      >
                        Try it
                      </button>
                    </div>
                  </div>
                  <div className="font-mono text-[10px] bg-[#000000] p-1.5 border border-[#333333] break-all text-[#888888]">
                    {item.pattern}
                  </div>
                  <p className="text-[10px] font-mono text-[#666666] leading-normal">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Syntax reference */}
          <div className="bg-[#0a0a0a] border border-[#333333] p-5 space-y-4">
            <h2 className="text-base font-bold text-[#F9F9F9] flex items-center gap-2 font-heading border-b border-[#1a1a1a] pb-3">
              <Code className="h-5 w-5 text-[#818cf8]" />
              Syntax Reference
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#333333] text-[#555555]">
                    <th className="pb-2 font-mono">Token</th>
                    <th className="pb-2 pl-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {SYNTAX_REFERENCE.map((ref, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-2 pr-1 font-mono text-[#F9F9F9] font-semibold whitespace-nowrap">
                        <button
                          onClick={() => copyToClipboard(ref.token, idx, true)}
                          className="hover:underline flex items-center gap-1 text-[#00FF41] cursor-pointer"
                          title="Copy token"
                        >
                          {ref.token}
                          {copiedRefIndex === idx && <Check className="h-2.5 w-2.5 text-[#00FF41] inline" />}
                        </button>
                      </td>
                      <td className="py-2 pl-2 text-[#888888]" title={ref.desc}>
                        {ref.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </ToolLayout>
  )
}