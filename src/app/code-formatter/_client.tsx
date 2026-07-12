'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { History } from 'lucide-react'

const codeFormatterFaq = [
  {
    question: 'What languages does this code formatter support?',
    answer: 'This formatter supports JavaScript (JS), TypeScript (TS), HTML, CSS, JSON, Python, XML, SQL, YAML, GraphQL, Rust, Go, Java, C#, PHP, Ruby, and Bash. Each language has its own formatting rules — JS/TS/Java/C#/PHP use brace-based indentation, HTML/XML format tags with proper nesting, CSS formats rules into blocks, Python/Ruby/Bash use keyword-level detection, SQL breaks at major clauses, and JSON validates structure while formatting.'
  },
  {
    question: 'How does the formatter handle syntax errors?',
    answer: 'The formatter does best-effort formatting to make code readable even with minor syntax issues. For JSON, invalid JSON shows a clear error message — only valid JSON is formatted. For code, comment-aware bracket tracking prevents strings and comments from affecting indentation. For production code, always run the formatter on valid syntax.'
  },
  {
    question: 'Can I get minified output instead of beautified?',
    answer: 'Yes. Toggle the "Minify" option to produce compact output instead of beautified code. Minifying removes unnecessary whitespace, newlines, and comments while preserving functionality. Use beautify mode for readability and minify mode for production-ready compact output. The stats bar shows estimated size savings.'
  },
  {
    question: 'Does formatting preserve all my code structure?',
    answer: 'Yes. Formatting only adjusts whitespace and line breaks — it does not change variable names, function definitions, or program logic. The output code runs identically to the original. Use the indent size selector to match your team standards (2 or 4 spaces).'
  }
]

const codeFormatterSeo = (
  <div className="space-y-4">
    <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Beautify or Minify Code in 17 Languages</h2>
    <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
      Code formatters transform messy or minified code into cleanly structured sources that are easier to read and maintain. Whether you are working with JavaScript, Python, SQL, or Rust, consistent formatting reduces cognitive load and prevents bugs caused by unclear structure. Toggle minify mode to compress code for production deployment with one click.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Why Format Your Code?</h3>
    <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
      Consistent formatting catches syntax errors by revealing mismatched brackets and unexpected structure. It saves code review time by removing style debates — reviewers focus on logic instead of spacing. Most importantly, properly formatted code is searchable and navigable, making it easier to find specific functions or debug issues.
    </p>
    <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Language-Specific Formatting Rules</h3>
    <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
      JavaScript/TypeScript/Java/C#/PHP: inserts line breaks, formats object literals, and aligns function bodies with brace-based indentation. HTML/XML: indents nested tags, places closing tags on new lines, and handles self-closing tags. CSS: formats rules into separate blocks with properties on their own lines. JSON: validates before formatting and handles large nested structures. SQL: breaks queries at SELECT, FROM, WHERE, and other major clauses with consistent indentation for sub-clauses.
    </p>
  </div>
)

const PRO_LIMIT = false
const FREE_LIMIT_HISTORY = 3

// ============================================================
// Types
// ============================================================

type Language = 'js' | 'ts' | 'html' | 'css' | 'json' | 'python' | 'xml' | 'sql' | 'yaml' | 'graphql' | 'rust' | 'go' | 'java' | 'csharp' | 'php' | 'ruby' | 'bash'
type IndentSize = '2' | '4'

interface HistoryItem {
  id: string
  language: string
  timestamp: string
  preview: string
  fullCode: string
}

interface Stats {
  inputLines: number
  inputChars: number
  outputLines: number
  outputChars: number
  saveRatio: number
}

// ============================================================
// Constants
// ============================================================

const LANGUAGE_NAMES: Record<Language, string> = {
  js: 'JavaScript', ts: 'TypeScript', html: 'HTML', css: 'CSS',
  json: 'JSON', python: 'Python', xml: 'XML', sql: 'SQL',
  yaml: 'YAML', graphql: 'GraphQL', rust: 'Rust', go: 'Go',
  java: 'Java', csharp: 'C#', php: 'PHP', ruby: 'Ruby', bash: 'Bash'
}

const ALL_LANGUAGES = Object.keys(LANGUAGE_NAMES) as Language[]

const FILE_EXTENSIONS: Record<Language, string> = {
  js: 'js', ts: 'ts', html: 'html', css: 'css', json: 'json',
  python: 'py', xml: 'xml', sql: 'sql', yaml: 'yaml',
  graphql: 'graphql', rust: 'rs', go: 'go', java: 'java',
  csharp: 'cs', php: 'php', ruby: 'rb', bash: 'sh'
}

// ============================================================
// Demo presets (minified/raw input for each language)
// ============================================================

const DEMO_PRESETS: Record<Language, string> = {
  js: `const items = [
  { id: 1, name: 'Widget', price: 9.99, qty: 3 },
  { id: 2, name: 'Gadget', price: 24.99, qty: 1 },
  { id: 3, name: 'Doohickey', price: 4.99, qty: 10 }
];

function calcTotal(cart) {
  let total = 0;
  for (let i = 0; i < cart.length; i++) {
    total += cart[i].price * cart[i].qty;
  }
  return total;
}

const grandTotal = calcTotal(items);
console.log('Total:', '$' + grandTotal.toFixed(2));`,

  ts: `interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

function formatName(user: User): string {
  return user.name.charAt(0).toUpperCase() + user.name.slice(1);
}

fetchUsers()
  .then(users => users.map(formatName))
  .then(names => console.log(names));`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Hello World</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header id="top">
    <h1 class="title">Welcome</h1>
    <nav><a href="/">Home</a><a href="/about">About</a><a href="/contact">Contact</a></nav>
  </header>
  <main>
    <section class="hero"><h2>Hero Section</h2><p>This is the main hero area.</p></section>
    <section class="features"><article><h3>Feature 1</h3><p>Description here.</p></article><article><h3>Feature 2</h3><p>Description here.</p></article></section>
  </main>
  <footer><p>&copy; 2026 My Site. All rights reserved.</p></footer>
</body>
</html>`,

  css: `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#f5f5f5;line-height:1.6}
.container{max-width:1200px;margin:0 auto;padding:0 20px}
.header{background:#1a1a1a;border-bottom:1px solid #333;padding:16px 0;position:sticky;top:0;z-index:100}
.header .logo{font-size:1.5rem;font-weight:700;color:#00ff41}
.card{background:#1a1a1a;border:1px solid #333;border-radius:0;padding:24px;margin-bottom:16px;transition:border-color 0.2s}
.card:hover{border-color:#00ff41}
.btn{display:inline-flex;align-items:center;padding:10px 20px;font-size:0.875rem;font-weight:600;border:none;cursor:pointer;text-transform:uppercase;letter-spacing:0.05em}
.btn-primary{background:#00ff41;color:#000}
.btn-primary:hover{background:#00cc34}`,

  json: `{
  "app": "toolhub",
  "version": "2.1.0",
  "author": {
    "name": "Shabir Ahmad",
    "email": "shabir@krumb.dev",
    "url": "https://krumb.dev"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}`,

  python: `class DataPipeline:
    def __init__(self, source):
        self.source = source
        self.processed = []

    def validate(self, record):
        if not isinstance(record, dict):
            return False
        required = {'id', 'name', 'value'}
        return required.issubset(record.keys())

    def transform(self, record):
        return {
            'id': record['id'],
            'name': record['name'].strip().lower(),
            'value': float(record['value']),
            'processed_at': __import__('datetime').datetime.now().isoformat()
        }

    def run(self):
        for record in self.source:
            if self.validate(record):
                self.processed.append(self.transform(record))
        return self.processed

records = [{'id': 1, 'name': ' Alice ', 'value': '42.5'}, {'id': 2, 'name': ' Bob ', 'value': '37.0'}]
pipeline = DataPipeline(records)
result = pipeline.run()
print(f'Processed {len(result)} records')`,

  xml: `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price>5.95</price>
    <publish_date>2000-12-16</publish_date>
    <description>A former architect battles corporate zombies in this farcical tale.</description>
  </book>
</catalog>`,

  sql: `SELECT
  u.id,
  u.name,
  u.email,
  o.total,
  o.created_at
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.total > 100
  AND u.active = 1
  AND u.created_at >= '2025-01-01'
ORDER BY o.created_at DESC
LIMIT 50;

INSERT INTO audit_log (user_id, action, timestamp)
VALUES (1, 'bulk_export', datetime('now'));

UPDATE users
SET last_login = datetime('now'), login_count = login_count + 1
WHERE id = 1;`,

  yaml: `server:
  host: localhost
  port: 8080
  ssl: false
database:
  driver: postgresql
  host: db.internal
  port: 5432
  name: myapp
  user: admin
  pool:
    min: 2
    max: 10
    timeout: 30
logging:
  level: debug
  format: json
  outputs:
    - stdout
    - file: /var/log/app.log`,

  graphql: `type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  posts(authorId: ID): [Post!]!
}
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}
type User {
  id: ID!
  name: String!
  email: String
  posts: [Post!]!
  createdAt: String!
}
type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
  published: Boolean!
}
input CreateUserInput {
  name: String!
  email: String!
}`,

  rust: `use std::collections::HashMap;

#[derive(Debug)]
struct AppConfig {
    host: String,
    port: u16,
    debug: bool,
}

impl AppConfig {
    fn from_env() -> Result<Self, String> {
        let host = std::env::var("HOST").unwrap_or_else(|_| "localhost".into());
        let port: u16 = std::env::var("PORT")
            .unwrap_or_else(|_| "8080".into())
            .parse()
            .map_err(|e| format!("Invalid PORT: {}", e))?;
        let debug = std::env::var("DEBUG").is_ok();
        Ok(AppConfig { host, port, debug })
    }
}

fn handle_request(path: &str, config: &AppConfig) -> String {
    match path {
        "/health" => "OK".to_string(),
        "/config" => format!("{:?}", config),
        _ => format!("404: {} not found", path),
    }
}

fn main() -> Result<(), String> {
    let config = AppConfig::from_env()?;
    println!("Starting server on {}:{}", config.host, config.port);
    let response = handle_request("/health", &config);
    println!("Response: {}", response);
    Ok(())
}`,

  go: `package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type Todo struct {
    ID        int       ` + "`json:\"id\"`" + `
    Title     string    ` + "`json:\"title\"`" + `
    Completed bool      ` + "`json:\"completed\"`" + `
    CreatedAt time.Time ` + "`json:\"created_at\"`" + `
}

var todos []Todo
var nextID int

func listTodos(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(todos)
}

func main() {
    http.HandleFunc("/todos", listTodos)
    fmt.Println("Server listening on :8080")
    http.ListenAndServe(":8080", nil)
}`,

  java: `import java.util.*;
import java.time.*;

public class TaskManager {
    private final Map<String, List<String>> tasks = new HashMap<>();

    public void addTask(String category, String task) {
        tasks.computeIfAbsent(category, k -> new ArrayList<>()).add(task);
    }

    public List<String> getTasks(String category) {
        return tasks.getOrDefault(category, Collections.emptyList());
    }

    public Map<String, Integer> getStats() {
        Map<String, Integer> stats = new HashMap<>();
        for (Map.Entry<String, List<String>> entry : tasks.entrySet()) {
            stats.put(entry.getKey(), entry.getValue().size());
        }
        return stats;
    }

    public static void main(String[] args) {
        TaskManager mgr = new TaskManager();
        mgr.addTask("work", "Review PR #42");
        mgr.addTask("work", "Write unit tests");
        mgr.addTask("personal", "Buy groceries");
        System.out.println("Stats: " + mgr.getStats());
    }
}`,

  csharp: `using System;
using System.Collections.Generic;

namespace ToolHub.Formatters
{
    class JsonPrettyPrinter
    {
        private readonly int _indentSize;

        public JsonPrettyPrinter(int indentSize = 2)
        {
            _indentSize = indentSize;
        }

        public string Format(string raw)
        {
            try
            {
                var parsed = System.Text.Json.JsonDocument.Parse(raw);
                return System.Text.Json.JsonSerializer.Serialize(parsed.RootElement, new System.Text.Json.JsonSerializerOptions
                {
                    WriteIndented = true
                });
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        static void Main(string[] args)
        {
            var printer = new JsonPrettyPrinter(4);
            string input = "{\"name\":\"Test\",\"value\":42}";
            Console.WriteLine(printer.Format(input));
        }
    }
}`,

  php: `<?php

namespace App\Services;

class CacheManager
{
    private array $store = [];
    private int $ttl;

    public function __construct(int $ttl = 3600)
    {
        $this->ttl = $ttl;
    }

    public function get(string $key): mixed
    {
        $entry = $this->store[$key] ?? null;
        if ($entry === null) return null;
        if (time() > $entry['expires']) {
            unset($this->store[$key]);
            return null;
        }
        return $entry['data'];
    }

    public function set(string $key, mixed $data, ?int $ttl = null): void
    {
        $this->store[$key] = [
            'data' => $data,
            'expires' => time() + ($ttl ?? $this->ttl),
        ];
    }

    public function flush(): void
    {
        $this->store = [];
    }
}

$cache = new CacheManager(300);
$cache->set('user_1', ['name' => 'Alice', 'role' => 'admin']);
print_r($cache->get('user_1'));`,

  ruby: `require 'json'

class ConfigLoader
  attr_reader :data

  def initialize(path)
    @path = path
    @data = {}
  end

  def load
    raise "File not found: #{@path}" unless File.exist?(@path)
    raw = File.read(@path)
    @data = JSON.parse(raw)
    self
  rescue JSON::ParserError => e
    puts "Parse error: #{e.message}"
    @data = {}
    self
  end

  def get(key, default = nil)
    keys = key.to_s.split('.')
    result = @data
    keys.each do |k|
      result = result[k] if result.is_a?(Hash)
    end
    result.nil? ? default : result
  end
end

config = ConfigLoader.new('config.json').load
puts config.get('database.host', 'localhost')`,

  bash: `#!/bin/bash

# System health check script

RED='\\033[0;31m'
GREEN='\\033[0;32m'
NC='\\033[0m'

check_service() {
    local name=$1
    if systemctl is-active --quiet "$name" 2>/dev/null; then
        echo -e "[\${GREEN}OK\${NC}] $name is running"
    else
        echo -e "[\${RED}FAIL\${NC}] $name is not running"
    fi
}

check_disk() {
    local threshold=\${1:-80}
    df -h / | awk 'NR==2 {print $5}' | sed 's/%//' | read usage
    if [ "$usage" -gt "$threshold" ]; then
        echo -e "[\${RED}WARN\${NC}] Disk usage at \${usage}% (threshold: \${threshold}%)"
    else
        echo -e "[\${GREEN}OK\${NC}] Disk usage at \${usage}%"
    fi
}

services=("nginx" "postgresql" "redis")
for svc in "\${services[@]}"; do
    check_service "$svc"
done
check_disk 85
echo "Health check complete."`
}

// ============================================================
// Helper: indent string
// ============================================================

const getIndentString = (level: number, size: IndentSize) => {
  const indentLevel = Math.max(0, level)
  return ' '.repeat(indentLevel * parseInt(size, 10))
}

// ============================================================
// Helper: track brackets/strings/comments across lines
// ============================================================

const analyzeBracketsAndStrings = (
  line: string,
  stack: string[],
  inMultilineComment: boolean,
  inTemplateLiteral: boolean
) => {
  let inSingleString = false
  let inDoubleString = false
  let escaped = false

  for (let idx = 0; idx < line.length; idx++) {
    const char = line[idx]
    const nextChar = line[idx + 1] || ''

    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }

    if (inMultilineComment) {
      if (char === '*' && nextChar === '/') {
        inMultilineComment = false
        idx++
      }
      continue
    }

    if (!inSingleString && !inDoubleString && !inTemplateLiteral) {
      if (char === '/' && nextChar === '*') {
        inMultilineComment = true
        idx++
        continue
      }
      if (char === '/' && nextChar === '/') {
        break
      }
    }

    if (!inMultilineComment) {
      if (char === '\'' && !inDoubleString && !inTemplateLiteral) {
        inSingleString = !inSingleString
        continue
      }
      if (char === '"' && !inSingleString && !inTemplateLiteral) {
        inDoubleString = !inDoubleString
        continue
      }
      if (char === '`' && !inSingleString && !inDoubleString) {
        inTemplateLiteral = !inTemplateLiteral
        continue
      }
    }

    if (inSingleString || inDoubleString || inTemplateLiteral) {
      continue
    }

    if (char === '{') stack.push('{')
    else if (char === '[') stack.push('[')
    else if (char === '(') stack.push('(')
    else if (char === '}') { if (stack[stack.length - 1] === '{') stack.pop() }
    else if (char === ']') { if (stack[stack.length - 1] === '[') stack.pop() }
    else if (char === ')') { if (stack[stack.length - 1] === '(') stack.pop() }
  }

  return { inMultilineComment, inTemplateLiteral }
}

// ============================================================
// JS / TS Formatter (existing — full comment-aware)
// ============================================================

const formatJSTS = (code: string, size: IndentSize): string => {
  let formatted = ''
  let indent = 0

  const lines = code.split('\n').map(line => line.trimEnd())
  const cleanLines: string[] = []

  let lastWasBlank = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      if (!lastWasBlank && cleanLines.length > 0) {
        cleanLines.push('')
        lastWasBlank = true
      }
    } else {
      cleanLines.push(lines[i])
      lastWasBlank = false
    }
  }

  const stack: string[] = []
  let inMultilineComment = false
  let inTemplateLiteral = false

  for (let i = 0; i < cleanLines.length; i++) {
    let line = cleanLines[i].trim()
    if (!line) {
      formatted += '\n'
      continue
    }

    const startsWithClosing = /^[\]\}\)]/.test(line)
    if (startsWithClosing) {
      indent = Math.max(0, indent - 1)
    }

    const prevState = { inMultilineComment, inTemplateLiteral }
    const result = analyzeBracketsAndStrings(line, stack, inMultilineComment, inTemplateLiteral)
    inMultilineComment = result.inMultilineComment
    inTemplateLiteral = result.inTemplateLiteral

    const isComment = line.startsWith('//') || line.startsWith('/*') || line.startsWith('*') || prevState.inMultilineComment
    const endsWithSemicolon = line.endsWith(';')
    const endsWithOpenOrContinuation = /[\{\[\(\,;:\?\+\-\*\/=&|><]$/.test(line)
    const inArrayOrParen = stack.includes('[') || stack.includes('(')

    const isBlockDeclaration = /^(if|else|for|while|switch|try|catch|finally|class|interface|enum|namespace|function|async\s+function|export\s+default\s+class|export\s+class|export\s+interface|export\s+enum|export\s+function)\b/.test(line)
    const isIsolatedBracket = /^[\{\}\[\]\(\)]+$/.test(line)

    if (!isComment && !endsWithSemicolon && !endsWithOpenOrContinuation && !inArrayOrParen && !isBlockDeclaration && !isIsolatedBracket && !inTemplateLiteral) {
      line += ';'
    }

    formatted += getIndentString(indent, size) + line + '\n'

    const openBraces = (line.match(/\{/g) || []).length
    const closeBraces = (line.match(/\}/g) || []).length
    const openBrackets = (line.match(/\[/g) || []).length
    const closeBrackets = (line.match(/\]/g) || []).length
    const openParens = (line.match(/\(/g) || []).length
    const closeParens = (line.match(/\)/g) || []).length

    const diff = (openBraces - closeBraces) + (openBrackets - closeBrackets) + (openParens - closeParens)

    let delta = diff
    if (startsWithClosing) {
      delta += 1
    }

    indent += delta
  }

  return formatted.trim()
}

// ============================================================
// HTML Formatter (existing)
// ============================================================

const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']

const formatHTML = (html: string, size: IndentSize): string => {
  let formatted = ''
  let indent = 0
  const reg = /(<\/?[^>]+>)/g
  const parts = html.replace(/\s*([<>])\s*/g, '$1').split(reg)

  for (let i = 0; i < parts.length; i++) {
    const element = parts[i].trim()
    if (!element) continue

    if (element.match(/^<\//)) {
      indent--
    }

    formatted += getIndentString(indent, size) + element + '\n'

    const tagNameMatch = element.match(/^<([a-zA-Z0-9\-]+)/)
    const isVoid = tagNameMatch && voidElements.includes(tagNameMatch[1].toLowerCase())

    if (element.match(/^<[^/!?]+>/) && !element.match(/\/?>$/) && !isVoid) {
      indent++
    }
  }
  return formatted.trim()
}

// ============================================================
// CSS Formatter (existing)
// ============================================================

const formatCSS = (css: string, size: IndentSize): string => {
  let formatted = ''
  let indent = 0
  const parts = css
    .replace(/\s*([\{\};,])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .split(/([\{\}])/g)

  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i].trim()
    if (!chunk) continue

    if (chunk === '}') {
      indent--
    }

    if (chunk === '{' || chunk === '}') {
      formatted += getIndentString(indent, size) + chunk + '\n'
    } else {
      const props = chunk.split(';')
      for (const p of props) {
        const prop = p.trim()
        if (!prop) continue
        const colonIdx = prop.indexOf(':')
        if (colonIdx !== -1) {
          const key = prop.substring(0, colonIdx).trim()
          const val = prop.substring(colonIdx + 1).trim()
          formatted += getIndentString(indent, size) + `${key}: ${val};\n`
        } else {
          formatted += getIndentString(indent, size) + prop + '\n'
        }
      }
    }

    if (chunk === '{') {
      indent++
    }
  }
  return formatted.trim()
}

// ============================================================
// JSON Formatter (existing)
// ============================================================

const formatJSON = (code: string, size: IndentSize): string => {
  const parsed = JSON.parse(code)
  return JSON.stringify(parsed, null, parseInt(size, 10))
}

// ============================================================
// Python Formatter (existing)
// ============================================================

const formatPython = (code: string, size: IndentSize): string => {
  const lines = code.split('\n')

  let usesTabs = false
  const indents: number[] = []
  for (const line of lines) {
    if (!line.trim()) continue
    const leadingTabs = (line.match(/^\t+/) || [''])[0].length
    if (leadingTabs > 0) {
      usesTabs = true
      break
    }
    const leadingSpaces = (line.match(/^ +/) || [''])[0].length
    if (leadingSpaces > 0) {
      indents.push(leadingSpaces)
    }
  }

  let inputStep = 4
  if (usesTabs) {
    inputStep = 1
  } else if (indents.length > 0) {
    const sortedIndents = Array.from(new Set(indents)).sort((a, b) => a - b)
    if (sortedIndents.length > 0) {
      inputStep = sortedIndents[0]
      if (inputStep === 1 && sortedIndents.length > 1) {
        inputStep = sortedIndents[1] - sortedIndents[0]
      }
    }
  }

  const cleanLines: string[] = []
  let lastWasBlank = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      if (!lastWasBlank && cleanLines.length > 0) {
        cleanLines.push('')
        lastWasBlank = true
      }
    } else {
      cleanLines.push(lines[i])
      lastWasBlank = false
    }
  }

  let formatted = ''
  const formattedLevels: number[] = []

  for (let i = 0; i < cleanLines.length; i++) {
    const line = cleanLines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      formatted += '\n'
      formattedLevels.push(0)
      continue
    }

    let rawLevel = 0
    if (usesTabs) {
      rawLevel = (line.match(/^\t+/) || [''])[0].length
    } else {
      const leadingSpaces = (line.match(/^ +/) || [''])[0].length
      rawLevel = Math.round(leadingSpaces / inputStep)
    }

    let level = rawLevel
    if (i > 0) {
      let prevIdx = i - 1
      while (prevIdx >= 0 && !cleanLines[prevIdx].trim()) {
        prevIdx--
      }
      if (prevIdx >= 0) {
        const prevTrimmed = cleanLines[prevIdx].trim()
        if (prevTrimmed.endsWith(':')) {
          level = Math.max(level, formattedLevels[prevIdx] + 1)
        }
      }
    }

    formattedLevels.push(level)
    formatted += getIndentString(level, size) + trimmed + '\n'
  }

  return formatted.trim()
}

// ============================================================
// XML Formatter (new — tag-based, similar to HTML)
// ============================================================

const formatXML = (code: string, size: IndentSize): string => {
  let formatted = ''
  let indent = 0
  const reg = /(<[^>]+>)/g
  const parts = code.replace(/\s*([<>])\s*/g, '$1').split(reg)

  for (let i = 0; i < parts.length; i++) {
    const element = parts[i].trim()
    if (!element) continue

    const isClosing = element.startsWith('</')
    const isSelfClosing = element.endsWith('/>')
    const isProcessing = element.startsWith('<?')

    if (isClosing) {
      indent = Math.max(0, indent - 1)
    }

    formatted += getIndentString(indent, size) + element + '\n'

    if (!isClosing && !isSelfClosing && !isProcessing && element.startsWith('<')) {
      indent++
    }
  }
  return formatted.trim()
}

// ============================================================
// Generic C-Style Braces Formatter (for Rust, Go, Java, C#, PHP, GraphQL)
// ============================================================

const formatCBraces = (code: string, size: IndentSize): string => {
  const lines = code.split('\n')
  let result = ''
  let indent = 0

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (!trimmed) {
      if (result.length > 0 && !result.endsWith('\n\n')) {
        result += '\n'
      }
      continue
    }

    // Dedent if line starts with closing brace
    if (/^[\}\]\)]/.test(trimmed)) {
      indent = Math.max(0, indent - 1)
    }

    result += getIndentString(indent, size) + trimmed + '\n'

    const openBraces = (trimmed.match(/\{/g) || []).length
    const closeBraces = (trimmed.match(/\}/g) || []).length
    const openBrackets = (trimmed.match(/\[/g) || []).length
    const closeBrackets = (trimmed.match(/\]/g) || []).length
    const openParens = (trimmed.match(/\(/g) || []).length
    const closeParens = (trimmed.match(/\)/g) || []).length

    indent += (openBraces - closeBraces) + (openBrackets - closeBrackets) + (openParens - closeParens)
  }

  return result.trim()
}

// ============================================================
// SQL Formatter (new — keyword-based)
// ============================================================

const formatSQL = (code: string, size: IndentSize): string => {
  const majorKeywords = /\b(SELECT|FROM|WHERE|AND|OR|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|ON|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|UNION|INTERSECT|EXCEPT|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE|CREATE INDEX|CREATE VIEW|INTO|SET|RETURNING|WINDOW|PARTITION BY)\b/i

  let result = ''
  let indent = 0
  let inSubquery = false

  const lines = code
    .replace(/\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?=\bSELECT\b|\bFROM\b|\bWHERE\b|\bORDER BY\b|\bGROUP BY\b|\bHAVING\b|\bLIMIT\b|\bJOIN\b|\bINNER JOIN\b|\bLEFT JOIN\b|\bRIGHT JOIN\b|\bFULL JOIN\b|\bCROSS JOIN\b|\bON\b|\bUNION\b|\bINSERT INTO\b|\bVALUES\b|\bUPDATE\b|\bSET\b|\bDELETE FROM\b)/i)

  for (const part of lines) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const isSubclause = /^(AND|OR)\b/i.test(trimmed)
    const isMajorClause = !isSubclause

    if (isMajorClause && indent > 0) {
      indent = 0
    }

    result += getIndentString(indent, size) + trimmed + '\n'

    if (isMajorClause && !isSubclause) {
      indent = 1
    }
  }

  return result.trim()
}

// ============================================================
// YAML Formatter (new — simplify blank lines, keep structure)
// ============================================================

const formatYAML = (code: string, size: IndentSize): string => {
  const lines = code.split('\n')
  const result: string[] = []
  let lastWasBlank = false

  for (const line of lines) {
    const trimmed = line.trimEnd()
    if (!trimmed) {
      if (!lastWasBlank && result.length > 0) {
        result.push('')
        lastWasBlank = true
      }
      continue
    }
    lastWasBlank = false

    // Detect current indent level from original, preserve it
    const leadingSpaces = (line.match(/^ +/) || [''])[0].length
    const indentLevel = Math.round(leadingSpaces / 2) // YAML typically uses 2-space indent

    result.push(getIndentString(indentLevel, size) + trimmed)
  }

  return result.join('\n')
}

// ============================================================
// Ruby Formatter (new — keyword-based indent)
// ============================================================

const RUBY_INDENT_KW = /\b(def|class|module|if|unless|case|while|until|for|begin|do)\s*$/

const formatRuby = (code: string, size: IndentSize): string => {
  const lines = code.split('\n')
  let result = ''
  let indent = 0

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()
    if (!trimmed) {
      result += '\n'
      continue
    }

    // Dedent mid-block keywords and end
    if (/^(end|elsif|when|rescue|ensure|else)\b/.test(trimmed)) {
      indent = Math.max(0, indent - 1)
    }

    result += getIndentString(indent, size) + trimmed + '\n'

    if (RUBY_INDENT_KW.test(trimmed) || trimmed.endsWith('|') || trimmed.endsWith('do')) {
      indent++
    }
  }

  return result.trim()
}

// ============================================================
// Bash Formatter (new — keyword-based indent)
// ============================================================

const formatBash = (code: string, size: IndentSize): string => {
  const lines = code.split('\n')
  let result = ''
  let indent = 0
  let hereDoc = false

  const indentKw = /\b(then|do|else|elif|case)\s*$/
  const dedentKw = /^(fi|done|esac|else|elif)\b/

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()
    if (!trimmed) {
      result += '\n'
      continue
    }

    // Handle heredoc
    if (/<<\s*-?\w+/.test(trimmed)) {
      hereDoc = true
    }
    if (hereDoc && /^\w+$/.test(trimmed)) {
      hereDoc = false
      result += trimmed + '\n'
      continue
    }
    if (hereDoc) {
      result += getIndentString(indent, size) + trimmed + '\n'
      continue
    }

    if (dedentKw.test(trimmed)) {
      indent = Math.max(0, indent - 1)
    }

    result += getIndentString(indent, size) + trimmed + '\n'

    if (indentKw.test(trimmed) || trimmed.endsWith('then') || trimmed.endsWith('do')) {
      indent++
    }
  }

  return result.trim()
}

// ============================================================
// Format dispatch table
// ============================================================

type FormatterFn = (code: string, size: IndentSize) => string

const FORMATTERS: Record<Language, FormatterFn> = {
  js: formatJSTS,
  ts: formatJSTS,
  html: formatHTML,
  css: formatCSS,
  json: formatJSON,
  python: formatPython,
  xml: formatXML,
  sql: formatSQL,
  yaml: formatYAML,
  graphql: formatCBraces,
  rust: formatCBraces,
  go: formatCBraces,
  java: formatCBraces,
  csharp: formatCBraces,
  php: formatCBraces,
  ruby: formatRuby,
  bash: formatBash,
}

// ============================================================
// Minify functions
// ============================================================

const MINIFIERS: Partial<Record<Language, (code: string) => string>> = {
  js: (code) => {
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\}\[\]\(\);,:])\s*/g, '$1')
      .replace(/;\s*}/g, '}')
      .trim()
  },
  ts: (code) => {
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\}\[\]\(\);,:])\s*/g, '$1')
      .replace(/;\s*}/g, '}')
      .trim()
  },
  html: (code) => {
    return code
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n/g, '')
      .trim()
  },
  css: (code) => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\};,:])\s*/g, '$1')
      .replace(/;\s*}/g, '}')
      .trim()
  },
  json: (code) => {
    const parsed = JSON.parse(code)
    return JSON.stringify(parsed)
  },
  python: (code) => {
    // Remove blank lines, keep minimal indentation
    return code
      .split('\n')
      .map(l => l.trimEnd())
      .filter((l, i, arr) => {
        if (l.trim() === '') {
          const isLast = i === arr.length - 1
          const isFirst = i === 0
          const nextNonEmpty = arr.slice(i + 1).find(s => s.trim())
          return !isLast && !isFirst && nextNonEmpty !== undefined
        }
        return true
      })
      .join('\n')
      .trim()
  },
  xml: (code) => {
    return code
      .replace(/\s*<!--[\s\S]*?-->\s*/g, '')
      .replace(/>\s+</g, '><')
      .replace(/\n/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
  },
  sql: (code) => {
    return code
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  },
  yaml: (code) => {
    return code
      .replace(/#.*$/gm, '')
      .split('\n')
      .map(l => l.trimEnd())
      .filter((l, i, arr) => {
        if (l.trim() === '') {
          return i > 0 && i < arr.length - 1 && arr.slice(i + 1).some(s => s.trim())
        }
        return true
      })
      .join('\n')
      .trim()
  },
  graphql: (code) => {
    return code
      .replace(/#.*$/gm, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\}\(\):])\s*/g, '$1')
      .trim()
  },
  rust: (code) => {
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\}\[\]\(\);,:])\s*/g, '$1')
      .trim()
  },
  go: (code) => {
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\}\[\]\(\);,:])\s*/g, '$1')
      .trim()
  },
  java: (code) => {
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\}\[\]\(\);,:])\s*/g, '$1')
      .trim()
  },
  csharp: (code) => {
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\}\[\]\(\);,:])\s*/g, '$1')
      .trim()
  },
  php: (code) => {
    return code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\}\[\]\(\);,:])\s*/g, '$1')
      .trim()
  },
  ruby: (code) => {
    return code
      .replace(/#.*$/gm, '')
      .replace(/\n\s*\n/g, '\n')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .join('\n')
      .trim()
  },
  bash: (code) => {
    return code
      .replace(/#.*$/gm, '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .join('\n')
      .trim()
  },
}

// ============================================================
// Language Detection
// ============================================================

function detectLanguage(code: string): Language | null {
  const trimmed = code.trim()
  if (!trimmed || trimmed.length < 15) return null

  const first300 = trimmed.slice(0, 300)

  // Shebang lines
  if (/^#!\s*\/bin\/(bash|sh)\b/.test(trimmed)) return 'bash'
  if (/^#!\s*\/usr\/bin\/(python|python3)\b/.test(trimmed)) return 'python'
  if (/^#!\s*\/usr\/bin\/(ruby)\b/.test(trimmed)) return 'ruby'
  if (/^#!\s*\/usr\/bin\/(node)\b/.test(trimmed)) return 'js'

  // PHP
  if (/^<\?php/.test(trimmed)) return 'php'

  // XML
  if (/^<\?xml\s/.test(first300)) return 'xml'

  // HTML
  if (/^<!DOCTYPE html/i.test(first300) || /^<html[\s>]/i.test(first300)) return 'html'

  // YAML
  if (/^---\s*\n/.test(trimmed)) return 'yaml'
  if (/^[a-zA-Z_][\w.-]*:\s+\S/.test(trimmed) && !trimmed.includes('{') && !trimmed.includes('=>')) {
    const yamlLines = trimmed.split('\n').filter(l => l.trim())
    if (yamlLines.length > 1 && yamlLines.slice(1).every(l => /^\s+/.test(l) || /^[a-zA-Z_#]/.test(l))) return 'yaml'
  }

  // SQL
  if (/^\s*(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|WITH)\b/i.test(trimmed)) return 'sql'

  // JSON
  if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && /^\s*[\[{]/.test(trimmed)) {
    try { JSON.parse(trimmed); return 'json' } catch {}
  }

  // GraphQL
  if (/^\s*(type|query|mutation|subscription|interface|input|enum)\s+\w/i.test(first300)) return 'graphql'

  // TypeScript (before JS check since TS has more specific indicators)
  if (/\binterface\s+\w+|type\s+\w+\s*=\s*\{/.test(first300)) return 'ts'
  if (/:\s*(string|number|boolean|void|any)\b/.test(first300) && /\bconst\b/.test(first300)) return 'ts'

  // Ruby
  if (/\bdef\s+\w+|\bclass\s+\w+\s*\n.*\bend\b|require\s+['"]/.test(first300)) return 'ruby'

  // Python
  if (/\bdef\s+\w+\s*\(|class\s+\w+\s*:|import\s+\w+|from\s+\w+\s+import\b|print\s*\(/.test(first300)) return 'python'

  // Rust
  if (/\bfn\s+\w+|let\s+mut\b|use\s+(std|crate|self)/.test(first300)) return 'rust'

  // Go
  if (/^\s*package\s+main\b|func\s+\w+|import\s+\(/.test(first300)) return 'go'

  // Java
  if (/\bpublic\s+(class|interface|enum)\b|import\s+java\./.test(first300)) return 'java'

  // C#
  if (/\busing\s+(System|Microsoft|Newtonsoft)/.test(first300) || /\bnamespace\s+\w+/.test(first300)) return 'csharp'

  // JavaScript (check after more specific languages)
  if (/\b(const|let|var)\s+\w+\s*[:=]|=>|require\(|module\.exports|import\s+.*\s+from/.test(first300)) return 'js'

  // Bash
  if (/\becho\s+["']|\$\{?\w+}?|if\s+\[\[?\s/.test(first300)) return 'bash'

  // CSS
  if (/[\w-]+\s*:\s*[\w#]+\s*;/.test(first300) && !/\bfunction\b/.test(first300) && !trimmed.includes('=>')) return 'css'

  return null
}

// ============================================================
// Stats computation
// ============================================================

function computeStats(input: string, output: string): Stats {
  const inputLines = input ? input.split('\n').length : 0
  const inputChars = input.length
  const outputLines = output ? output.split('\n').length : 0
  const outputChars = output.length
  const saveRatio = inputChars > 0 ? Math.round((1 - outputChars / inputChars) * 100) : 0

  return { inputLines, inputChars, outputLines, outputChars, saveRatio }
}

// ============================================================
// Component
// ============================================================

export default function CodeFormatterClient() {
  const [inputCode, setInputCode] = useState('')
  const [outputCode, setOutputCode] = useState('')
  const [language, setLanguage] = useState<Language>('js')
  const [indentSize, setIndentSize] = useState<IndentSize>('2')
  const [minify, setMinify] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [stats, setStats] = useState<Stats>({ inputLines: 0, inputChars: 0, outputLines: 0, outputChars: 0, saveRatio: 0 })
  const [justPasted, setJustPasted] = useState(false)
  const pasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load History
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolhub_code_formatter_history')
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Update stats when output changes
  useEffect(() => {
    setStats(computeStats(inputCode, outputCode))
  }, [inputCode, outputCode])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    setError(null)
    setOutputCode('')
  }

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text')
    if (!pastedText || pastedText.length < 15) return

    const detected = detectLanguage(pastedText)
    if (detected && detected !== language) {
      setLanguage(detected)
    }

    // Mark as just pasted so we can auto-format after state settles
    setJustPasted(true)
    if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current)
    pasteTimerRef.current = setTimeout(() => {
      setJustPasted(false)
    }, 500)
  }, [language])

  const handleFormatInternal = useCallback(() => {
    setError(null)
    if (!inputCode.trim()) {
      setOutputCode('')
      return
    }

    try {
      let result = ''
      const formatter = FORMATTERS[language]
      if (minify) {
        const minifier = MINIFIERS[language]
        if (minifier) {
          result = minifier(inputCode)
        } else {
          // Fallback: basic whitespace removal
          result = inputCode.split('\n').map(l => l.trim()).filter(Boolean).join('\n')
        }
      } else {
        result = formatter(inputCode, indentSize)
      }

      setOutputCode(result)

      const preview = result.length > 80 ? result.substring(0, 80) + '...' : result
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 11),
        language,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        preview,
        fullCode: result,
      }

      setHistory((prev) => {
        const updated = [newItem, ...prev]
        const limit = PRO_LIMIT ? 50 : FREE_LIMIT_HISTORY
        const trimmed = updated.slice(0, limit)
        try {
          localStorage.setItem('toolhub_code_formatter_history', JSON.stringify(trimmed))
        } catch (e) {
          console.error(e)
        }
        return trimmed
      })
    } catch (err: any) {
      setError(err.message || 'Formatting failed. Please check your syntax.')
    }
  }, [inputCode, language, indentSize, minify])

  // Auto-format on paste after language is detected and state settles
  useEffect(() => {
    if (justPasted && inputCode.trim()) {
      const timer = setTimeout(() => {
        handleFormatInternal()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [justPasted, inputCode, handleFormatInternal])

  const handleFormat = () => {
    handleFormatInternal()
  }

  const handleCopy = () => {
    if (!outputCode) return
    navigator.clipboard.writeText(outputCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!outputCode) return
    const ext = FILE_EXTENSIONS[language] || 'txt'
    const blob = new Blob([outputCode], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `formatted-code.${ext}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleLoadDemo = () => {
    const demo = DEMO_PRESETS[language]
    if (demo) {
      setInputCode(demo)
      setError(null)
      setOutputCode('')
      // If minify is on, turn it off for demo (show beautified output)
      if (minify) {
        setMinify(false)
      }
    }
  }

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setLanguage(item.language as Language)
    setOutputCode(item.fullCode)
    setInputCode(item.fullCode)
  }

  const handleClearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem('toolhub_code_formatter_history')
    } catch (e) {
      console.error(e)
    }
  }

  const saveRatioColor = stats.saveRatio > 0 ? 'text-[#00FF41]' : stats.saveRatio < 0 ? 'text-[#ff4444]' : 'text-[#888888]'

  return (
    <ToolLayout
      title="Code Formatter"
      description="Format and beautify JavaScript, TypeScript, HTML, CSS, JSON, Python, XML, SQL, YAML, GraphQL, Rust, Go, Java, C#, PHP, Ruby, and Bash code instantly. Minify option, custom indents, demo presets."
      toolSlug="code-formatter"
      categorySlug="developer-tools"
      faq={codeFormatterFaq}
      seoContent={codeFormatterSeo}
    >
      <div className="space-y-6">
        {/* Settings Bar — Terminal style */}
        <div className="bg-[#000000] border border-[#333333] p-4 space-y-4">
          {/* Language selector — scrollable if overflow */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#F9F9F9] mb-2 uppercase tracking-wider">
              Select Language
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_LANGUAGES.map((lang) => {
                const active = language === lang
                return (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`
                      px-2.5 py-1 text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider transition-none cursor-pointer border
                      ${active
                        ? 'bg-[#F9F9F9] text-[#000000] border-[#F9F9F9]'
                        : 'bg-[#000000] text-[#888888] border-[#444444] hover:border-[#F9F9F9] hover:text-[#F9F9F9]'
                      }
                    `}
                  >
                    {lang}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Controls row: Indent | Minify toggle | Load Demo */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Indentation */}
            <div className="min-w-[140px]">
              <label className="block text-[10px] font-mono font-bold text-[#F9F9F9] mb-1 uppercase tracking-wider">
                Indentation
              </label>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(e.target.value as IndentSize)}
                className="w-full px-2.5 py-1 text-xs font-mono bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] outline-none focus:border-2 focus:border-[#00FF41] cursor-pointer transition-none"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
              </select>
            </div>

            {/* Minify toggle */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#F9F9F9] mb-1 uppercase tracking-wider">
                Mode
              </label>
              <button
                onClick={() => setMinify(!minify)}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer border transition-none ${
                  minify
                    ? 'bg-[#00FF41] text-[#000000] border-[#00FF41]'
                    : 'bg-[#000000] text-[#888888] border-[#444444] hover:border-[#F9F9F9] hover:text-[#F9F9F9]'
                }`}
              >
                [<span className={minify ? 'text-[#000000]' : 'text-[#00FF41]'}>&gt;</span> {minify ? 'Minify' : 'Beautify'}]
              </button>
            </div>

            {/* Load Demo */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#F9F9F9] mb-1 uppercase tracking-wider">
                &nbsp;
              </label>
              <button
                onClick={handleLoadDemo}
                className="px-3 py-1 text-xs font-mono bg-[#000000] text-[#F9F9F9] border border-[#F9F9F9] hover:bg-[#F9F9F9] hover:text-[#000000] cursor-pointer transition-none uppercase tracking-wider"
              >
                [<span className="text-[#00FF41]">&gt;</span> Load Demo]
              </button>
            </div>
          </div>
        </div>

        {/* Input / Output Editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Editor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-mono font-bold text-[#F9F9F9] uppercase tracking-wider">
                Input Code
              </label>
              <button
                onClick={() => setInputCode('')}
                className="text-xs font-mono text-[#666666] hover:text-[#ff4444] transition-none cursor-pointer"
              >
                Clear
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onPaste={handlePaste}
              placeholder={`Paste your ${LANGUAGE_NAMES[language]} code here...`}
              spellCheck={false}
              className="w-full h-96 p-4 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm leading-relaxed resize-y outline-none focus:border-2 focus:border-[#00FF41] transition-none placeholder-[#555555]"
            />
          </div>

          {/* Output Editor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-mono font-bold text-[#F9F9F9] uppercase tracking-wider">
                {minify ? 'Minified Code' : 'Beautified Code'}
              </label>
              {outputCode && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="terminal-btn"
                  >
                    [<span className="green-chevron">&gt;</span> {copied ? 'COPIED' : 'COPY'}]
                  </button>
                  <button
                    onClick={handleDownload}
                    className="terminal-btn"
                  >
                    [<span className="green-chevron">&gt;</span> DL]
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={outputCode}
              readOnly
              placeholder="Your formatted code will appear here..."
              spellCheck={false}
              className="w-full h-96 p-4 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm leading-relaxed resize-y outline-none placeholder-[#555555]"
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
        {outputCode && (
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
            <span className={`font-bold ${saveRatioColor}`}>
              {stats.saveRatio > 0 ? `- ${stats.saveRatio}%` : stats.saveRatio < 0 ? `+ ${Math.abs(stats.saveRatio)}%` : '±0%'}
            </span>
          </div>
        )}

        {/* Format Action */}
        <button
          onClick={handleFormat}
          className="terminal-btn w-full justify-center"
        >
          [<span className="green-chevron">&gt;</span> {minify ? 'Minify Code' : 'Format Code'}]
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
                      {item.language}
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
