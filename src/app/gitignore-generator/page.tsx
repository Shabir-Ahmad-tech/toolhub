'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'

interface GitignoreTemplate {
  id: string
  label: string
  content: string
}

const TEMPLATES: GitignoreTemplate[] = [
  {
    id: 'node',
    label: 'Node.js',
    content: `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db`
  },
  {
    id: 'python',
    label: 'Python',
    content: `# Bytecode
__pycache__/
*.py[cod]
*$py.class

# Virtual environment
venv/
.venv/
env/
.env/
*.egg-info/

# Build artifacts
dist/
build/
*.egg

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
  },
  {
    id: 'go',
    label: 'Go',
    content: `# Binaries
*.exe
*.dll
*.so
*.dylib
*.test
*.out
/bin/

# Dependencies
/vendor/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
  },
  {
    id: 'rust',
    label: 'Rust',
    content: `# Build
/target/
**/*.rs.bk

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
  },
  {
    id: 'java',
    label: 'Java',
    content: `# Compiled
*.class

# Build
target/
build/
*.jar
*.war
*.ear

# Maven
!/.mvn/wrapper/maven-wrapper.jar

# Gradle
.gradle/
build/

# IDE
.idea/
*.iml
.vscode/

# OS
.DS_Store
Thumbs.db`
  },
  {
    id: 'dotnet',
    label: '.NET',
    content: `# Build
bin/
obj/
*.user
*.suo
*.userosscache
*.sln.docstates

# NuGet
packages/
*.nupkg

# IDE
.vs/
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
  },
  {
    id: 'react',
    label: 'React / Next.js',
    content: `# Dependencies
node_modules/

# Build
.next/
out/
build/
dist/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
  },
  {
    id: 'macos',
    label: 'macOS',
    content: `# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns`
  },
  {
    id: 'windows',
    label: 'Windows',
    content: `# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump

# Recycle Bin
$Recycle.Bin

# Windows shortcuts
*.lnk`
  },
  {
    id: 'linux',
    label: 'Linux',
    content: `# Linux
*~

# KDE
.kde/

# Desktop entry
*.directory`
  },
  {
    id: 'docker',
    label: 'Docker',
    content: `# Docker
.docker/
*.docker.tar
docker-compose.override.yml

# Logs
*.log`
  },
  {
    id: 'terraform',
    label: 'Terraform',
    content: `# Terraform
*.tfstate
*.tfstate.*
.terraform/
crash.log
override.tf
override.tf.json
*_override.tf
*_override.tf.json
.terraform.lock.hcl`
  },
  {
    id: 'rails',
    label: 'Ruby on Rails',
    content: `# Rails
*.rbc
*.sassc
.sass-cache
capybara-*.html
log/*
tmp/*
!log/.keep
!tmp/.keep
public/assets
public/packs
public/packs-test
vendor/bundle
.bundle`
  },
  {
    id: 'elixir',
    label: 'Elixir / Phoenix',
    content: `# Elixir
_build/
deps/
*.ez
mix.lock

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
  },
  {
    id: 'flutter',
    label: 'Flutter / Dart',
    content: `# Flutter
.dart_tool/
.packages
.pub/
build/
*.iml
.flutter-plugins
.flutter-plugins-dependencies

# IDE
.idea/
.vscode/

# OS
.DS_Store
Thumbs.db`
  },
  {
    id: 'php',
    label: 'PHP / Laravel',
    content: `# PHP
vendor/
*.composer.lock

# Laravel
.env
.env.*.php
storage/framework/cache/data/*
storage/framework/sessions/*
storage/framework/views/*
storage/logs/*
bootstrap/cache/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
  },
  {
    id: 'custom',
    label: 'Custom rules',
    content: `# Custom
`
  },
]

const faq = [
  {
    question: 'Which .gitignore templates do you support?',
    answer: 'The generator includes templates for Node.js, Python, Go, Rust, Java, .NET, React/Next.js, Ruby on Rails, Elixir/Phoenix, Flutter/Dart, PHP/Laravel, Terraform, and Docker -- plus OS-specific entries for macOS, Windows, and Linux. You can combine any number of templates and add custom rules.'
  },
  {
    question: 'How do I combine multiple templates?',
    answer: 'Simply check every template that applies to your project. The generator merges all selected templates, removes duplicate entries, and outputs a single .gitignore file.'
  },
  {
    question: 'What is the difference between a template and a custom rule?',
    answer: 'Templates are pre-built .gitignore entries for specific languages, frameworks, or operating systems. Custom rules let you add project-specific entries like local config files, generated output directories, or secret files that aren\'t covered by any template.'
  },
  {
    question: 'Can I edit the generated .gitignore after creating it?',
    answer: 'Yes -- the generator outputs plain text that you can edit in any text editor. After downloading or copying the generated file, you can add, remove, or modify entries just like any .gitignore file.'
  },
  {
    question: 'Why should I use a .gitignore for every project?',
    answer: 'A .gitignore prevents build artifacts, dependencies, environment files with secrets, and OS metadata from being committed to your repository. Starting every project with a proper .gitignore is a best practice for all developers.'
  }
]

const seoContent = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">.gitignore Generator</h2>
    <p className="text-[#888888] font-mono"><strong>What It Is.</strong> A .gitignore file tells Git which files and directories to ignore -- preventing build artifacts, dependencies, environment variables, and OS junk from being committed to your repository. This generator lets you select from 17 templates covering the most popular languages and frameworks, combine them, and download or copy the result.</p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How It Works</h3>
    <p className="text-[#888888] font-mono">Each template is a curated set of .gitignore entries for a specific language, framework, or operating system. When you select multiple templates, the generator concatenates their contents and removes exact duplicate lines. Custom rules you type are appended last.</p>
  </div>
)

function deduplicateLines(text: string): string {
  const seen = new Set<string>()
  return text
    .split('\n')
    .map(l => l.trimEnd())
    .filter(l => {
      const key = l.trim()
      if (!key || key.startsWith('#')) return true
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .join('\n')
}

function GitCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text) } catch { return }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="terminal-btn"
    >
      [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
    </button>
  )
}

export default function GitignoreGeneratorPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['node', 'macos']))
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const content = useMemo(() => {
    const parts: string[] = []
    for (const id of selected) {
      if (id === 'custom') continue
      const tpl = TEMPLATES.find(t => t.id === id)
      if (tpl) parts.push(tpl.content)
    }
    if (selected.has('custom') && customText.trim()) {
      parts.push(customText.trim())
    }
    return deduplicateLines(parts.join('\n'))
  }, [selected, customText])

  return (
    <ToolLayout
      title=".gitignore Generator"
      description="Generate .gitignore files from combinable language and framework templates. Free online .gitignore generator for developers."
      toolSlug="gitignore-generator"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-5 font-mono">
        {/* Template grid */}
        <div>
          <label className="block text-xs font-mono text-[#F9F9F9] mb-2 uppercase tracking-wider">Select templates</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEMPLATES.filter(t => t.id !== 'custom').map(t => (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={`flex items-center gap-2 px-3 py-2.5 border text-xs font-mono transition-none cursor-pointer overflow-hidden min-h-[44px] ${
                  selected.has(t.id)
                    ? 'bg-[#F9F9F9] text-[#000000] border-[#F9F9F9]'
                    : 'bg-[#000000] text-[#F9F9F9] border-[#F9F9F9] hover:bg-[#F9F9F9] hover:text-[#000000]'
                }`}
              >
                <div className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
                  selected.has(t.id) ? 'bg-[#000000] border-[#000000]' : 'border-[#F9F9F9]'
                }`}>
                  {selected.has(t.id) && (
                    <svg className="w-3 h-3 text-[#F9F9F9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom rules toggle */}
        <div>
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="terminal-btn"
          >
            [<span className="green-chevron">&gt;</span> {showCustom ? '- Hide custom rules' : '+ Add custom rules'}]
          </button>
          {showCustom && (
            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              rows={3}
              className="mt-2 w-full px-3 py-2.5 text-xs font-mono bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] outline-none focus:border-2 focus:border-[#00FF41] transition-none resize-y"
              placeholder="# Enter custom .gitignore rules here, one per line"
              spellCheck={false}
            />
          )}
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono text-[#F9F9F9] uppercase tracking-wider">
              .gitignore <span className="text-[#888888] font-normal">({content.split('\n').filter(Boolean).length} active rules)</span>
            </label>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  const blob = new Blob([content], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = '.gitignore'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="terminal-btn"
              >
                [<span className="green-chevron">&gt;</span> Download]
              </button>
              <GitCopyButton text={content} />
            </div>
          </div>
          <pre className="w-full overflow-x-auto border border-[#F9F9F9] bg-[#000000] text-[#00FF41] p-4 text-xs font-mono leading-relaxed max-h-80 overflow-y-auto">
            <code>{content || '# Select at least one template above'}</code>
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}
