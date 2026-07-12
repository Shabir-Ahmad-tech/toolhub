'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

// ─── SVG / React Attribute Mapping ───────────────────────────────────────────

const HTML_TO_REACT_ATTRS: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  autofocus: 'autoFocus',
  autocomplete: 'autoComplete',
  'accept-charset': 'acceptCharset',
  accesskey: 'accessKey',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  charset: 'charSet',
  classid: 'classID',
  colspan: 'colSpan',
  contenteditable: 'contentEditable',
  contextmenu: 'contextMenu',
  crossorigin: 'crossOrigin',
  datetime: 'dateTime',
  defaultchecked: 'defaultChecked',
  defaultvalue: 'defaultValue',
  enctype: 'encType',
  formaction: 'formAction',
  formenctype: 'formEncType',
  formmethod: 'formMethod',
  formnovalidate: 'formNoValidate',
  formtarget: 'formTarget',
  frameborder: 'frameBorder',
  hreflang: 'hrefLang',
  'http-equiv': 'httpEquiv',
  inputmode: 'inputMode',
  ismap: 'isMap',
  itemprop: 'itemProp',
  itemref: 'itemRef',
  itemscope: 'itemScope',
  itemtype: 'itemType',
  keytype: 'keyType',
  marginheight: 'marginHeight',
  marginwidth: 'marginWidth',
  maxlength: 'maxLength',
  mediagroup: 'mediaGroup',
  minlength: 'minLength',
  nomodule: 'noModule',
  novalidate: 'noValidate',
  playsinline: 'playsInline',
  readonly: 'readOnly',
  referrerpolicy: 'referrerPolicy',
  rowspan: 'rowSpan',
  srcdoc: 'srcDoc',
  srclang: 'srcLang',
  srcset: 'srcSet',
  typemustmatch: 'typeMustMatch',
  usemap: 'useMap',
  // SVG namespace attrs
  'xmlns:xlink': 'xmlnsXlink',
  'xlink:actuate': 'xlinkActuate',
  'xlink:arcrole': 'xlinkArcrole',
  'xlink:href': 'xlinkHref',
  'xlink:role': 'xlinkRole',
  'xlink:show': 'xlinkShow',
  'xlink:title': 'xlinkTitle',
  'xlink:type': 'xlinkType',
  'xml:base': 'xmlBase',
  'xml:lang': 'xmlLang',
  'xml:space': 'xmlSpace',
}

// Keep these XML / SVG intrinsic attributes as-is (they are already JSX-compatible)
const SKIP_ATTRS = new Set(['xmlns'])

// SVG elements that are self-closing by convention
const SELF_CLOSING = new Set([
  'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline',
  'rect', 'use', 'image', 'stop', 'br', 'hr', 'input',
  'meta', 'link', 'area', 'base', 'col', 'embed',
  'source', 'track', 'wbr', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix',
  'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight',
  'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB',
  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage',
  'feMerge', 'feMergeNode', 'feMorphology', 'feOffset',
  'fePointLight', 'feSpecularLighting', 'feSpotLight',
  'feTile', 'feTurbulence', 'animate', 'animateTransform',
  'animateMotion', 'set', 'mpath',
])

// ─── Helper Functions ────────────────────────────────────────────────────────

function hyphenToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

function cssToCamelCase(key: string): string {
  // Handle vendor prefixes like -webkit- → Webkit
  const prefixed = key.replace(/^-ms-/, 'ms-').replace(/^-webkit-/, 'webkit-')
  return prefixed.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

function formatStyleValue(key: string, value: string): string {
  const trimmed = value.trim()
  // Pure numeric values → number in JSX (opacity: 0.5, flex: 1, etc.)
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return trimmed
  }
  // Quoted CSS values (like 'url(...)') → strip outer quotes
  const clean = trimmed.replace(/^["']|["']$/g, '')
  return `'${clean.replace(/'/g, "\\'")}'`
}

function parseStyleString(style: string): string {
  const decls = style.split(';').filter(s => s.trim().length > 0)
  if (decls.length === 0) return '{}'

  const entries: string[] = []
  for (const decl of decls) {
    const colonIdx = decl.indexOf(':')
    if (colonIdx === -1) continue
    const cssKey = decl.slice(0, colonIdx).trim()
    const value = decl.slice(colonIdx + 1).trim()
    if (!cssKey || !value) continue
    const jsKey = cssToCamelCase(cssKey)
    entries.push(`    ${jsKey}: ${formatStyleValue(jsKey, value)}`)
  }

  if (entries.length === 0) return '{}'
  return `{\n${entries.join(',\n')}\n  }`
}

function transformAttr(name: string, value: string): string | null {
  if (SKIP_ATTRS.has(name)) return null

  // Handle style attribute specially
  if (name === 'style') {
    const obj = parseStyleString(value)
    return `style={${obj}}`
  }

  // Direct mapping (class → className, etc.)
  const mapped = HTML_TO_REACT_ATTRS[name]
  if (mapped) {
    return `${mapped}="${value}"`
  }

  // Hyphenated → camelCase (stroke-width → strokeWidth)
  if (name.includes('-') && !name.startsWith('data-') && !name.startsWith('aria-')) {
    const camel = hyphenToCamelCase(name)
    return `${camel}="${value}"`
  }

  // Namespace attrs with colon (xlink:href → xlinkHref)
  if (name.includes(':')) {
    const parts = name.split(':')
    const camel = parts[0] + parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
    return `${camel}="${value}"`
  }

  return `${name}="${value}"`
}

function escapeJsxText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
}

function elementToJSX(el: Element, depth: number): string {
  const pad = '  '.repeat(depth)
  const tagName = el.tagName

  // Collect attributes
  const attrParts: string[] = []
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i]
    const transformed = transformAttr(attr.name, attr.value)
    if (transformed !== null) {
      attrParts.push(transformed)
    }
  }

  // Collect children
  const childParts: string[] = []
  let hasMeaningfulChildren = false

  for (let i = 0; i < el.childNodes.length; i++) {
    const node = el.childNodes[i]
    if (node.nodeType === 1) {
      // Element node
      childParts.push('\n' + elementToJSX(node as Element, depth + 1))
      hasMeaningfulChildren = true
    } else if (node.nodeType === 3) {
      // Text node
      const text = node.textContent ?? ''
      if (text.trim().length > 0) {
        childParts.push(escapeJsxText(text))
        hasMeaningfulChildren = true
      } else if (text.length > 0) {
        // Preserve whitespace between elements for formatting
        childParts.push(text)
      }
    } else if (node.nodeType === 4) {
      // CDATA section
      childParts.push(node.textContent ?? '')
      hasMeaningfulChildren = true
    }
    // Skip comment nodes (nodeType === 8)
  }

  // If no meaningful children, self-close
  if (!hasMeaningfulChildren && SELF_CLOSING.has(tagName)) {
    if (attrParts.length === 0) return `${pad}<${tagName} />`
    return `${pad}<${tagName} ${attrParts.join(' ')} />`
  }

  // Build opening tag
  const openTag =
    attrParts.length === 0
      ? `${pad}<${tagName}>`
      : `${pad}<${tagName} ${attrParts.join(' ')}>`

  // Build children
  const children = childParts.join('')

  // Closing tag
  // If there were only whitespace text nodes, we still need a closing tag
  if (!hasMeaningfulChildren) {
    return `${openTag}${children}</${tagName}>`
  }

  const closeTag = `\n${pad}</${tagName}>`
  return `${openTag}${children}${closeTag}`
}

function svgToJsx(
  svgString: string,
  componentName: string,
  outputFormat: 'function' | 'arrow' | 'jsx'
): string {
  const trimmed = svgString.trim()
  const parser = new DOMParser()
  const doc = parser.parseFromString(trimmed, 'image/svg+xml')

  // Check for parse errors — look for parsererror tag in the document
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    const msg = parseError.textContent ?? 'Invalid SVG XML'
    throw new Error(msg.replace(/^[^:]*:/, '').trim())
  }

  const root = doc.documentElement
  if (!root || root.tagName !== 'svg') {
    throw new Error('The root element must be an <svg> tag. Make sure your input contains valid SVG markup.')
  }

  const jsx = elementToJSX(root, 0)

  if (outputFormat === 'jsx') {
    return jsx
  }

  const importLine = `import React from 'react';\n\n`

  if (outputFormat === 'function') {
    return (
      `${importLine}function ${componentName}(props) {\n  return (\n    ${jsx.replace(/\n/g, '\n    ')}\n  );\n}\n\nexport default ${componentName};`
    )
  }

  // arrow
  return (
    `${importLine}const ${componentName} = (props) => {\n  return (\n    ${jsx.replace(/\n/g, '\n    ')}\n  );\n};\n\nexport default ${componentName};`
  )
}

// ─── FAQ & SEO ───────────────────────────────────────────────────────────────

const faq = [
  {
    question: 'How does the SVG attribute conversion work?',
    answer: 'The converter automatically maps SVG attributes to their React JSX equivalents: hyphenated attributes like stroke-width become camelCase (strokeWidth), class becomes className, and style strings are parsed into React style objects. Namespace attributes like xlink:href map to xlinkHref. Standard SVG attributes that are already JSX-compatible pass through unchanged.',
  },
  {
    question: 'What output formats are available?',
    answer: 'You can choose from three output formats: a React function component declaration (function keyword), a React arrow function component (const + arrow), or bare JSX markup with no component wrapper. All formats properly handle self-closing tags, camelCase attributes, and style objects. The component name defaults to "SvgIcon" and is fully customizable.',
  },
  {
    question: 'Can I convert SVGs with inline styles?',
    answer: 'Yes. The converter parses inline style strings (style="fill: #000; stroke-width: 2px") into React-compatible style objects (style={{ fill: "#000", strokeWidth: "2px" }}). CSS property names are converted from kebab-case to camelCase automatically. Numeric values like opacity: "0.5" become plain numbers (0.5) in the output, while values with units remain strings.',
  },
  {
    question: 'Does this work with complex SVGs that have gradients, masks, or filters?',
    answer: 'Yes. The converter handles all SVG elements including defs, linearGradient, radialGradient, mask, clipPath, and filter primitives (feGaussianBlur, feOffset, feColorMatrix, etc.). Element names preserve their correct case sensitivity, and all standard SVG attributes are converted to their JSX equivalents. The preview panel renders the original SVG so you can verify the result visually.',
  },
  {
    question: 'Is this SVG to JSX conversion done on the server or in my browser?',
    answer: 'Everything runs locally in your browser. The SVG markup you paste is parsed using the native DOMParser API — no data is sent to any server. This makes the tool instant, private, and available offline after the initial page load. Your SVG content never leaves your device.',
  },
]

const seoContent = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">SVG to React/JSX Converter</h2>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What It Is</h3>
    <p>
      This tool converts raw SVG markup into clean, production-ready React JSX component syntax. It handles all the tedious parts of manual SVG-to-React conversion: transforming hyphenated SVG attributes to camelCase, converting <code className="px-1.5 py-0.5 bg-[#1a1a1a] text-xs font-mono">class</code> to <code className="px-1.5 py-0.5 bg-[#1a1a1a] text-xs font-mono">className</code>, parsing inline style strings into React style objects, and generating properly self-closing tags. Developers use it constantly when porting icons from design tools like Figma or Sketch, converting SVG sprite sheets, migrating from vanilla SVG to React component libraries, or building custom icon systems.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How It Works</h3>
    <p>
      Paste your SVG markup into the input area and the conversion happens instantly. The tool parses the SVG using the browser native DOMParser, walks the element tree, and applies a comprehensive attribute mapping for every SVG-to-React edge case. Hyphenated attributes (<code className="px-1.5 py-0.5 bg-[#1a1a1a] text-xs font-mono">stroke-width</code> → <code className="px-1.5 py-0.5 bg-[#1a1a1a] text-xs font-mono">strokeWidth</code>), namespace attributes (<code className="px-1.5 py-0.5 bg-[#1a1a1a] text-xs font-mono">xlink:href</code> → <code className="px-1.5 py-0.5 bg-[#1a1a1a] text-xs font-mono">xlinkHref</code>), and SVG-presentational attributes are all handled automatically. The output can be formatted as a function component, arrow function, or bare JSX markup — whichever matches your project conventions.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Worked Example</h3>
    <p>
      <strong>Input SVG:</strong>
      <code className="block px-3 py-2 bg-[#1a1a1a] text-xs font-mono mt-1 mb-2">
        {`<svg class="icon" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round">
  <circle cx="12" cy="12" r="10"
    style="fill: none; stroke: #333;"/>
</svg>`}
      </code>
      <strong>Output JSX:</strong>
      <code className="block px-3 py-2 bg-[#1a1a1a] text-xs font-mono mt-1 mb-2">
        {`<svg className="icon" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round">
  <circle cx="12" cy="12" r="10"
    style={{ fill: "none", stroke: "#333" }} />
</svg>`}
      </code>
      The converter handles <code className="px-1.5 py-0.5 bg-[#1a1a1a] text-xs font-mono">class</code> → <code className="px-1.5 py-0.5 bg-[#1a1a1a] text-xs font-mono">className</code>, hyphenated attrs become camelCase, and the style string is parsed into a proper React style object. All within your browser — no server round-trip.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Common Use Cases</h3>
    <ul className="list-disc pl-5 space-y-1 text-sm text-[#888888]">
      <li><strong>Icon library migration.</strong> Converting SVG icon sets from design handoffs into reusable React components with consistent prop interfaces.</li>
      <li><strong>Design-to-code.</strong> SVGs exported from Figma, Sketch, or Illustrator need attribute conversion before they work in React. This tool automates that step.</li>
      <li><strong>Component refactoring.</strong> Replace inline dangerouslySetInnerHTML SVG usage with proper JSX components for better performance and type safety.</li>
      <li><strong>Learning & teaching.</strong> Compare SVG and JSX syntax side-by-side to understand how React abstracts SVG attributes.</li>
    </ul>
  </div>
)

// ─── Terminal Copy Button ────────────────────────────────────────────────────

function CopyOutputButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy} className="terminal-btn">
      [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
    </button>
  )
}

// ─── Default Example SVG ─────────────────────────────────────────────────────

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
  <circle cx="11" cy="11" r="8"/>
  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
</svg>`

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SvgToJsxClient() {
  const [input, setInput] = useState(DEFAULT_SVG)
  const [output, setOutput] = useState('')
  const [componentName, setComponentName] = useState('SvgIcon')
  const [outputFormat, setOutputFormat] = useState<'function' | 'arrow' | 'jsx'>('function')
  const [error, setError] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      setError('')
      setPreviewHtml('')
      return
    }

    try {
      const result = svgToJsx(input.trim(), componentName, outputFormat)
      setOutput(result)
      setError('')
      setPreviewHtml(input.trim())
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Conversion failed. Check that your SVG markup is valid XML.'
      setError(msg)
      setOutput('')
      setPreviewHtml('')
    }
  }, [input, componentName, outputFormat])

  useEffect(() => {
    convert()
  }, [convert])

  const formatOptions: { value: 'function' | 'arrow' | 'jsx'; label: string }[] = [
    { value: 'function', label: 'Function' },
    { value: 'arrow', label: 'Arrow' },
    { value: 'jsx', label: 'Bare JSX' },
  ]

  const handleFormatChange = (format: 'function' | 'arrow' | 'jsx') => {
    setOutputFormat(format)
  }

  return (
    <ToolLayout
      title="SVG to React/JSX Converter"
      description="Convert SVG markup to React JSX component syntax. Handles camelCase attributes, style objects, and self-closing tags automatically."
      toolSlug="svg-to-jsx"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-6 font-mono">
        {/* SVG Input */}
        <div>
          <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">
            SVG Markup
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            spellCheck={false}
            className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-xs leading-relaxed outline-none focus:border-[#00FF41] resize-y min-h-[160px] transition-none"
            placeholder="Paste your SVG markup here..."
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Component Name */}
          <div>
            <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">
              Component Name
            </label>
            <input
              type="text"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value || 'SvgIcon')}
              className="w-full px-4 py-3 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm outline-none focus:border-[#00FF41] transition-none"
              placeholder="SvgIcon"
              disabled={outputFormat === 'jsx'}
            />
            {outputFormat === 'jsx' && (
              <p className="text-[10px] text-[#888888] mt-1">N/A in Bare JSX mode</p>
            )}
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">
              Output Format
            </label>
            <div className="flex gap-1">
              {formatOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFormatChange(opt.value)}
                  className={`flex-1 px-3 py-3 text-xs uppercase tracking-wider cursor-pointer min-h-[44px] transition-none font-mono border ${
                    outputFormat === opt.value
                      ? 'bg-[#F9F9F9] text-[#000000] border-[#F9F9F9]'
                      : 'bg-[#000000] text-[#F9F9F9] border-[#F9F9F9] hover:bg-[#F9F9F9] hover:text-[#000000]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-[#ff4444] p-3">
            <p className="text-xs font-mono text-[#ff4444] leading-relaxed">{error}</p>
          </div>
        )}

        {/* Output */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">
                JSX Output
              </label>
              <CopyOutputButton text={output} />
            </div>
            <pre className="w-full bg-[#0a0a0a] border border-[#333333] p-4 text-[#F9F9F9] font-mono text-xs leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto">
              <code>{output}</code>
            </pre>
          </div>
        )}

        {/* SVG Preview */}
        {previewHtml && !error && (
          <div>
            <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">
              SVG Preview
            </label>
            <div
              className="border border-[#333333] p-4 bg-[#ffffff] flex items-center justify-center min-h-[120px] max-h-[300px] overflow-hidden"
              style={{ backgroundImage: 'repeating-conic-gradient(#e8e8e8 0% 25%, transparent 0% 50%)', backgroundSize: '20px 20px' }}
            >
              <div
                className="max-w-full max-h-[260px]"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        )}

        {/* Stats row when converted */}
        {output && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border border-[#333333] p-3">
              <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1">Input Lines</p>
              <p className="text-base font-mono font-bold text-[#F9F9F9]">{input.split('\n').length}</p>
            </div>
            <div className="border border-[#333333] p-3">
              <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1">Output Lines</p>
              <p className="text-base font-mono font-bold text-[#F9F9F9]">{output.split('\n').length}</p>
            </div>
            <div className="border border-[#333333] p-3">
              <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1">Output Chars</p>
              <p className="text-base font-mono font-bold text-[#F9F9F9]">{output.length}</p>
            </div>
            <div className="border border-[#333333] p-3">
              <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider mb-1">Format</p>
              <p className="text-base font-mono font-bold text-[#F9F9F9]">{outputFormat === 'function' ? 'Function' : outputFormat === 'arrow' ? 'Arrow' : 'Bare JSX'}</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
