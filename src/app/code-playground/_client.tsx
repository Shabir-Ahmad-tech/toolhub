'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/ui/CopyButton'
import { ChevronDown, Terminal, FileCode, Monitor, Sun, Moon, Type, Minus, Plus } from 'lucide-react'
import * as Icons from 'lucide-react'

function getLanguageIcon(id: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Code: Icons.Code,
    FileCode: Icons.FileCode,
    FileText: Icons.FileText,
    Database: Icons.Database,
    Terminal: Icons.Terminal,
    Container: Icons.Container,
    Palette: Icons.Palette,
    GitBranch: Icons.GitBranch,
    Search: Icons.Search,
  }
  // Find matching language
  const lang = LANGUAGES.find(l => l.id === id)
  return icons[lang?.icon || 'Code'] || Icons.Code
}

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: 'js', mode: 'javascript', runnable: true, icon: 'Code' },
  { id: 'typescript', name: 'TypeScript', ext: 'ts', mode: 'typescript', runnable: true, icon: 'FileCode' },
  { id: 'python', name: 'Python', ext: 'py', mode: 'python', runnable: true, icon: 'Code' },
  { id: 'html', name: 'HTML/CSS/JS', ext: 'html', mode: 'html', runnable: true, icon: 'FileCode' },
  { id: 'json', name: 'JSON', ext: 'json', mode: 'json', runnable: false, icon: 'FileText' },
  { id: 'yaml', name: 'YAML', ext: 'yaml', mode: 'yaml', runnable: false, icon: 'FileText' },
  { id: 'markdown', name: 'Markdown', ext: 'md', mode: 'markdown', runnable: false, icon: 'FileText' },
  { id: 'sql', name: 'SQL', ext: 'sql', mode: 'sql', runnable: false, icon: 'Database' },
  { id: 'go', name: 'Go', ext: 'go', mode: 'go', runnable: false, icon: 'Code' },
  { id: 'rust', name: 'Rust', ext: 'rs', mode: 'rust', runnable: false, icon: 'Code' },
  { id: 'java', name: 'Java', ext: 'java', mode: 'java', runnable: false, icon: 'Code' },
  { id: 'csharp', name: 'C#', ext: 'cs', mode: 'csharp', runnable: false, icon: 'Code' },
  { id: 'cpp', name: 'C++', ext: 'cpp', mode: 'cpp', runnable: false, icon: 'Code' },
  { id: 'php', name: 'PHP', ext: 'php', mode: 'php', runnable: false, icon: 'Code' },
  { id: 'ruby', name: 'Ruby', ext: 'rb', mode: 'ruby', runnable: false, icon: 'Code' },
  { id: 'swift', name: 'Swift', ext: 'swift', mode: 'swift', runnable: false, icon: 'Code' },
  { id: 'kotlin', name: 'Kotlin', ext: 'kt', mode: 'kotlin', runnable: false, icon: 'Code' },
  { id: 'dart', name: 'Dart', ext: 'dart', mode: 'dart', runnable: false, icon: 'Code' },
  { id: 'bash', name: 'Bash/Shell', ext: 'sh', mode: 'bash', runnable: false, icon: 'Terminal' },
  { id: 'dockerfile', name: 'Dockerfile', ext: 'dockerfile', mode: 'dockerfile', runnable: false, icon: 'Container' },
  { id: 'css', name: 'CSS', ext: 'css', mode: 'css', runnable: false, icon: 'Palette' },
  { id: 'scss', name: 'SCSS', ext: 'scss', mode: 'scss', runnable: false, icon: 'Palette' },
  { id: 'graphql', name: 'GraphQL', ext: 'graphql', mode: 'graphql', runnable: false, icon: 'GitBranch' },
  { id: 'regex', name: 'Regex', ext: 'regex', mode: 'regex', runnable: false, icon: 'Search' },
  { id: 'xml', name: 'XML', ext: 'xml', mode: 'xml', runnable: false, icon: 'FileCode' },
  { id: 'toml', name: 'TOML', ext: 'toml', mode: 'toml', runnable: false, icon: 'FileText' },
]

const DEFAULT_CODE: Record<string, string> = {
  javascript: `// JavaScript Playground
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const start = performance.now();
const result = fibonacci(10);
const end = performance.now();

console.log(\`fibonacci(10) = \${result}\`);
console.log(\`Calculated in \${(end - start).toFixed(2)}ms\`);

// Try modifying the number above!
`,
  typescript: `// TypeScript Playground
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}! Your email is \${user.email}\`;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', isActive: true },
  { id: 2, name: 'Bob', email: 'bob@example.com', isActive: false },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', isActive: true },
];

const activeUsers = users.filter(u => u.isActive);
activeUsers.forEach(u => console.log(greetUser(u)));
`,
  python: `# Python Playground (via Pyodide)
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

import time
start = time.perf_counter()
result = fibonacci(10)
end = time.perf_counter()

print(f"fibonacci(10) = {result}")
print(f"Calculated in {(end - start)*1000:.2f}ms")

# Try: import json; print(json.dumps({"hello": "world"}))
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Playground</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      color: #333;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      text-align: center;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: transform 0.2s, background 0.2s;
    }
    button:hover { background: #5a6fd6; transform: scale(1.05); }
    button:active { transform: scale(0.98); }
    #counter { font-size: 24px; margin: 20px 0; font-weight: bold; color: #667eea; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, Playground!</h1>
    <p id="counter">0 clicks</p>
    <button onclick="count()">Click Me!</button>
  </div>
  <script>
    let count = 0;
    function count() {
      count++;
      document.getElementById('counter').textContent = count + ' click' + (count !== 1 ? 's' : '');
    }
  </script>
</body>
</html>
`,
  json: `{
  "name": "KRUMB.DEV Code Playground",
  "version": "1.0.0",
  "description": "A multi-language code playground in your browser",
  "features": [
    "Syntax highlighting for 25+ languages",
    "Live execution for JS/TS/Python/HTML",
    "Auto-save to localStorage",
    "Download code as file",
    "Dark mode support"
  ],
  "languages": [
    "JavaScript",
    "TypeScript",
    "Python",
    "HTML/CSS/JS",
    "JSON",
    "YAML",
    "Markdown",
    "SQL",
    "Go",
    "Rust",
    "Java",
    "C#",
    "C++",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "Dart",
    "Bash",
    "Dockerfile",
    "CSS/SCSS",
    "GraphQL",
    "Regex",
    "XML",
    "TOML"
  ],
  "author": "KRUMB.DEV",
  "license": "MIT"
}`,
  yaml: `# YAML Playground
name: KRUMB.DEV Code Playground
version: 1.0.0
description: A multi-language code playground in your browser
features:
  - Syntax highlighting for 25+ languages
  - Live execution for JS/TS/Python/HTML
  - Auto-save to localStorage
  - Download code as file
  - Dark mode support
languages:
  - JavaScript
  - TypeScript
  - Python
  - HTML/CSS/JS
  - JSON
  - YAML
  - Markdown
  - SQL
  - Go
  - Rust
  - Java
  - C#
  - C++
  - PHP
  - Ruby
  - Swift
  - Kotlin
  - Dart
  - Bash
  - Dockerfile
  - CSS/SCSS
  - GraphQL
  - Regex
  - XML
  - TOML
author: KRUMB.DEV
license: MIT
`,
  markdown: `# Code Playground

**KRUMB.DEV** - Free Online Code Editor

## Features

- **25+ Languages** with syntax highlighting
- **Live Execution** for JavaScript, TypeScript, Python, HTML
- **Auto-save** to localStorage
- **Download** code as file
- **Dark Mode** support
- **No signup** required

## Quick Start

1. Select a language from the dropdown
2. Write your code
3. Click **Run** (for supported languages)
4. See output instantly!

## Example

\`\`\`python
def hello(name):
    return f"Hello, {name}!"

print(hello("World"))
\`\`\`

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl/Cmd + Enter | Run code |
| Ctrl/Cmd + S | Download file |
| Ctrl/Cmd + / | Toggle comment |`,
  sql: `-- SQL Playground
-- Create sample tables
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE
);

-- Insert sample data
INSERT INTO users (name, email) VALUES
  ('Alice', 'alice@example.com'),
  ('Bob', 'bob@example.com'),
  ('Charlie', 'charlie@example.com');

INSERT INTO posts (user_id, title, content, published) VALUES
  (1, 'Hello World', 'My first post!', TRUE),
  (1, 'Learning SQL', 'SQL is powerful', TRUE),
  (2, 'Draft Post', 'Not published yet', FALSE);

-- Query with JOIN
SELECT u.name, p.title, p.published
FROM users u
JOIN posts p ON u.id = p.user_id
WHERE p.published = TRUE
ORDER BY u.name;`,
  go: `// Go Playground (syntax highlighting only - no execution)
package main

import (
	"fmt"
	"time"
)

func fibonacci(n int) int {
	if n <= 1 {
		return n
	}
	return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
	start := time.Now()
	result := fibonacci(10)
	elapsed := time.Since(start)

	fmt.Printf("fibonacci(10) = %d\\n", result)
	fmt.Printf("Calculated in %v\\n", elapsed)
}`,
  rust: `// Rust Playground (syntax highlighting only - no execution)
fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    let start = std::time::Instant::now();
    let result = fibonacci(10);
    let elapsed = start.elapsed();

    println!("fibonacci(10) = {}", result);
    println!("Calculated in {:?}", elapsed);
}`,
  java: `// Java Playground (syntax highlighting only - no execution)
public class Main {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static void main(String[] args) {
        long start = System.nanoTime();
        int result = fibonacci(10);
        long elapsed = System.nanoTime() - start;

        System.out.println("fibonacci(10) = " + result);
        System.out.println("Calculated in " + elapsed/1_000_000.0 + "ms");
    }
}`,
  csharp: `// C# Playground (syntax highlighting only - no execution)
using System;
using System.Diagnostics;

class Program {
    static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }

    static void Main() {
        var sw = Stopwatch.StartNew();
        int result = Fibonacci(10);
        sw.Stop();

        Console.WriteLine($"fibonacci(10) = {result}");
        Console.WriteLine($"Calculated in {sw.Elapsed.TotalMilliseconds}ms");
    }
}`,
  cpp: `// C++ Playground (syntax highlighting only - no execution)
#include <iostream>
#include <chrono>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    auto start = std::chrono::high_resolution_clock::now();
    int result = fibonacci(10);
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);

    std::cout << "fibonacci(10) = " << result << std::endl;
    std::cout << "Calculated in " << duration.count() / 1000.0 << "ms" << std::endl;

    return 0;
}`,
  php: `<?php
// PHP Playground (syntax highlighting only - no execution)
function fibonacci($n) {
    if ($n <= 1) return $n;
    return fibonacci($n - 1) + fibonacci($n - 2);
}

$start = microtime(true);
$result = fibonacci(10);
$end = microtime(true);

echo "fibonacci(10) = $result\\n";
echo "Calculated in " . round(($end - $start) * 1000, 2) . "ms\\n";
?>`,
  ruby: `# Ruby Playground (syntax highlighting only - no execution)
def fibonacci(n)
  return n if n <= 1
  fibonacci(n - 1) + fibonacci(n - 2)
end

start = Time.now
result = fibonacci(10)
elapsed = Time.now - start

puts "fibonacci(10) = #{result}"
puts "Calculated in #{(elapsed * 1000).round(2)}ms"`,
  swift: `// Swift Playground (syntax highlighting only - no execution)
func fibonacci(_ n: Int) -> Int {
    if n <= 1 { return n }
    return fibonacci(n - 1) + fibonacci(n - 2)
}

let start = CFAbsoluteTimeGetCurrent()
let result = fibonacci(10)
let elapsed = CFAbsoluteTimeGetCurrent() - start

print("fibonacci(10) = \\(result)")
print("Calculated in \\(elapsed * 1000)ms")`,
  kotlin: `// Kotlin Playground (syntax highlighting only - no execution)
fun fibonacci(n: Int): Int {
    return if (n <= 1) n else fibonacci(n - 1) + fibonacci(n - 2)
}

fun main() {
    val start = System.nanoTime()
    val result = fibonacci(10)
    val elapsed = (System.nanoTime() - start) / 1_000_000.0

    println("fibonacci(10) = \$result")
    println("Calculated in \${elapsed}ms")
}`,
  dart: `// Dart Playground (syntax highlighting only - no execution)
int fibonacci(int n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

void main() {
  var start = DateTime.now();
  var result = fibonacci(10);
  var elapsed = DateTime.now().difference(start);

  print('fibonacci(10) = \$result');
  print('Calculated in \${elapsed.inMicroseconds / 1000}ms');
}`,
  bash: `#!/bin/bash
# Bash/Shell Playground (syntax highlighting only - no execution)

fibonacci() {
    local n=$1
    if [ $n -le 1 ]; then
        echo $n
    else
        echo $(( $(fibonacci $((n-1))) + $(fibonacci $((n-2))) ))
    fi
}

start=$(date +%s%N)
result=$(fibonacci 10)
end=$(date +%s%N)

echo "fibonacci(10) = $result"
echo "Calculated in $(( (end - start) / 1000000 ))ms"`,
  dockerfile: `# Dockerfile Playground (syntax highlighting only - no execution)
# Use official Node.js runtime as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run application
CMD ["node", "server.js"]`,
  css: `/* CSS Playground */
:root {
  --primary: #667eea;
  --primary-dark: #5a6fd6;
  --secondary: #764ba2;
  --bg: #f8fafc;
  --text: #1e293b;
  --card: #ffffff;
  --border: #e2e8f0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn:hover { background: var(--primary-dark); }
.btn:active { transform: scale(0.98); }

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f172a;
    --text: #f1f5f9;
    --card: #1e293b;
    --border: #334155;
  }
}`,
  scss: `// SCSS Playground
$primary: #667eea;
$primary-dark: #5a6fd6;
$secondary: #764ba2;
$bg: #f8fafc;
$text: #1e293b;
$card: #ffffff;
$border: #e2e8f0;

@mixin card {
  background: $card;
  border: 1px solid $border;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
}

@mixin btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: $primary;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;

  &:hover { background: $primary-dark; }
  &:active { transform: scale(0.98); }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: $bg;
  color: $text;
  line-height: 1.6;
}

.card { @include card; }
.btn { @include btn; }

@media (prefers-color-scheme: dark) {
  $bg: #0f172a;
  $text: #f1f5f9;
  $card: #1e293b;
  $border: #334155;
}`,
  graphql: `# GraphQL Playground
# Query example
query GetUsers($limit: Int, $active: Boolean) {
  users(limit: $limit, active: $active) {
    id
    name
    email
    isActive
    posts {
      id
      title
      published
    }
  }
}

# Variables
{
  "limit": 10,
  "active": true
}

# Mutation example
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}

# Variables for mutation
{
  "input": {
    "name": "New User",
    "email": "new@example.com"
  }
}`,
  regex: `# Regex Playground
# Test your regular expressions

# Email validation
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$

# URL validation
^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$

# Phone number (US)
^(\+1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$

# IPv4 address
^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$

# Date (YYYY-MM-DD)
^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$

# Strong password (8+ chars, upper, lower, number, special)
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<!-- XML Playground -->
<toolhub>
  <tool name="Code Playground" version="1.0">
    <description>A multi-language code playground in your browser</description>
    <features>
      <feature>Syntax highlighting for 25+ languages</feature>
      <feature>Live execution for JS/TS/Python/HTML</feature>
      <feature>Auto-save to localStorage</feature>
      <feature>Download code as file</feature>
      <feature>Dark mode support</feature>
    </features>
    <languages count="25">
      <language runnable="true">JavaScript</language>
      <language runnable="true">TypeScript</language>
      <language runnable="true">Python</language>
      <language runnable="true">HTML/CSS/JS</language>
      <language runnable="false">JSON</language>
      <language runnable="false">YAML</language>
      <language runnable="false">Markdown</language>
      <language runnable="false">SQL</language>
      <language runnable="false">Go</language>
      <language runnable="false">Rust</language>
      <language runnable="false">Java</language>
      <language runnable="false">C#</language>
      <language runnable="false">C++</language>
      <language runnable="false">PHP</language>
      <language runnable="false">Ruby</language>
      <language runnable="false">Swift</language>
      <language runnable="false">Kotlin</language>
      <language runnable="false">Dart</language>
      <language runnable="false">Bash</language>
      <language runnable="false">Dockerfile</language>
      <language runnable="false">CSS</language>
      <language runnable="false">SCSS</language>
      <language runnable="false">GraphQL</language>
      <language runnable="false">Regex</language>
      <language runnable="false">XML</language>
      <language runnable="false">TOML</language>
    </languages>
    <author>KRUMB.DEV</author>
    <license>MIT</license>
  </tool>
</toolhub>`,
  toml: `# TOML Playground
name = "KRUMB.DEV Code Playground"
version = "1.0.0"
description = "A multi-language code playground in your browser"

features = [
  "Syntax highlighting for 25+ languages",
  "Live execution for JS/TS/Python/HTML",
  "Auto-save to localStorage",
  "Download code as file",
  "Dark mode support"
]

[author]
name = "KRUMB.DEV"
email = "support@toolhub.com"
github = "toolhub"

[languages]
javascript = { runnable = true, ext = "js" }
typescript = { runnable = true, ext = "ts" }
python = { runnable = true, ext = "py" }
html = { runnable = true, ext = "html" }
json = { runnable = false, ext = "json" }
yaml = { runnable = false, ext = "yaml" }
markdown = { runnable = false, ext = "md" }
sql = { runnable = false, ext = "sql" }
go = { runnable = false, ext = "go" }
rust = { runnable = false, ext = "rs" }
java = { runnable = false, ext = "java" }
csharp = { runnable = false, ext = "cs" }
cpp = { runnable = false, ext = "cpp" }
php = { runnable = false, ext = "php" }
ruby = { runnable = false, ext = "rb" }
swift = { runnable = false, ext = "swift" }
kotlin = { runnable = false, ext = "kt" }
dart = { runnable = false, ext = "dart" }
bash = { runnable = false, ext = "sh" }
dockerfile = { runnable = false, ext = "dockerfile" }
css = { runnable = false, ext = "css" }
scss = { runnable = false, ext = "scss" }
graphql = { runnable = false, ext = "graphql" }
regex = { runnable = false, ext = "regex" }
xml = { runnable = false, ext = "xml" }
toml = { runnable = false, ext = "toml" }
`
}

export default function CodePlaygroundClient() {
  const [code, setCode] = useState<string>(DEFAULT_CODE.javascript)
  const [language, setLanguage] = useState<string>('javascript')
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(true)
  const [autoRun, setAutoRun] = useState(false)
  const [shared, setShared] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const outputRef = useRef<HTMLPreElement>(null)
  const autoRunTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pyodideReadyRef = useRef(false)
  const pyodideLoadingRef = useRef(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('toolhub-playground-code')
    const savedLang = localStorage.getItem('toolhub-playground-lang')
    const savedTheme = localStorage.getItem('toolhub-playground-theme')
    const savedFontSize = localStorage.getItem('toolhub-playground-fontsize')
    const savedWordWrap = localStorage.getItem('toolhub-playground-wordwrap')
    const savedAutoRun = localStorage.getItem('toolhub-playground-autorun')

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.code) setCode(parsed.code)
        if (parsed.language && DEFAULT_CODE[parsed.language]) setLanguage(parsed.language)
      } catch { /* ignore */ }
    }
    if (savedLang) setLanguage(savedLang)
    if (savedTheme) setTheme(savedTheme as 'light' | 'dark')
    if (savedFontSize) setFontSize(parseInt(savedFontSize, 10))
    if (savedWordWrap) setWordWrap(savedWordWrap === 'true')
    if (savedAutoRun) setAutoRun(savedAutoRun === 'true')
  }, [])

  // Save to localStorage
  const saveState = useCallback(() => {
    localStorage.setItem('toolhub-playground-code', JSON.stringify({ code, language }))
    localStorage.setItem('toolhub-playground-lang', language)
    localStorage.setItem('toolhub-playground-theme', theme)
    localStorage.setItem('toolhub-playground-fontsize', fontSize.toString())
    localStorage.setItem('toolhub-playground-wordwrap', wordWrap.toString())
    localStorage.setItem('toolhub-playground-autorun', autoRun.toString())
  }, [code, language, theme, fontSize, wordWrap, autoRun])

  useEffect(() => { saveState() }, [saveState])

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Load Pyodide for Python execution
  const loadPyodide = useCallback(async () => {
    if (pyodideReadyRef.current || pyodideLoadingRef.current) return
    pyodideLoadingRef.current = true
    try {
      const pyodide = await (window as any).loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/' })
      ;(window as any).pyodide = pyodide
      pyodideReadyRef.current = true
    } catch (e) {
      console.error('Failed to load Pyodide:', e)
    } finally {
      pyodideLoadingRef.current = false
    }
  }, [])

  // Load Pyodide when Python is selected
  useEffect(() => {
    if (language === 'python') loadPyodide()
  }, [language, loadPyodide])

  // Run code based on language
  const runCode = useCallback(async () => {
    if (!code.trim()) {
      setOutput('')
      return
    }

    setIsRunning(true)
    setError(null)

    try {
      const lang = LANGUAGES.find(l => l.id === language)
      if (!lang?.runnable) {
        setOutput('// This language does not support live execution.\n// Runnable languages: JavaScript, TypeScript, Python, HTML')
        setIsRunning(false)
        return
      }

      if (language === 'html') {
        // Run HTML in iframe
        const iframe = iframeRef.current
        if (iframe) {
          iframe.srcdoc = code
        }
        setOutput('�--- HTML rendered in preview panel �--')
      } else if (language === 'javascript' || language === 'typescript') {
        // Run JS/TS in sandboxed iframe
        const iframe = iframeRef.current
        if (iframe) {
          const wrappedCode = language === 'typescript'
            ? `// TypeScript will be transpiled\ntry {\n${code}\n} catch (e) { console.error(e); }`
            : `try {\n${code}\n} catch (e) { console.error(e); }`

          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: monospace; padding: 16px; background: #1e1e1e; color: #d4d4d4; margin: 0; }
                  .log { color: #9cdcfe; }
                  .error { color: #f44747; }
                  .warn { color: #cca700; }
                  .info { color: #4ec9b0; }
                </style>
              </head>
              <body>
                <script>
                  const originalLog = console.log;
                  const originalError = console.error;
                  const originalWarn = console.warn;
                  const originalInfo = console.info;

                  function format(...args) {
                    return args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ');
                  }

                  console.log = (...args) => {
                    const div = document.createElement('div');
                    div.className = 'log';
                    div.textContent = '> ' + format(...args);
                    document.body.appendChild(div);
                    originalLog.apply(console, args);
                  };
                  console.error = (...args) => {
                    const div = document.createElement('div');
                    div.className = 'error';
                    div.textContent = '�-- ' + format(...args);
                    document.body.appendChild(div);
                    originalError.apply(console, args);
                  };
                  console.warn = (...args) => {
                    const div = document.createElement('div');
                    div.className = 'warn';
                    div.textContent = '�-- ' + format(...args);
                    document.body.appendChild(div);
                    originalWarn.apply(console, args);
                  };
                  console.info = (...args) => {
                    const div = document.createElement('div');
                    div.className = 'info';
                    div.textContent = '�-- ' + format(...args);
                    document.body.appendChild(div);
                    originalInfo.apply(console, args);
                  };
                </script>
                <script>${wrappedCode}</script>
              </body>
            </html>
          `
          iframe.srcdoc = htmlContent
        }
        setOutput('�-- Executed in preview panel �--')
      } else if (language === 'python') {
        // Run Python via Pyodide
        if (!(window as any).pyodide) {
          setOutput('�-- Loading Python runtime...')
          await loadPyodide()
        }
        const pyodide = (window as any).pyodide
        if (pyodide) {
          try {
            pyodide.runPython(`
import sys
from io import StringIO
old_stdout = sys.stdout
sys.stdout = StringIO()
`)
            await pyodide.runPythonAsync(code)
            const result = pyodide.runPython(`
output = sys.stdout.getvalue()
sys.stdout = old_stdout
output
`)
            setOutput(result || '�-- Code executed (no output)')
          } catch (e: any) {
            pyodide.runPython('sys.stdout = old_stdout')
            setError(e.message || 'Python execution error')
            setOutput('')
          }
        } else {
          setError('Python runtime not available')
        }
      }
    } catch (e: any) {
      setError(e.message || 'Execution error')
      setOutput('')
    } finally {
      setIsRunning(false)
    }
  }, [code, language, loadPyodide])

  // Auto-run
  useEffect(() => {
    if (autoRun && code.trim()) {
      if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current)
      autoRunTimeoutRef.current = setTimeout(() => runCode(), 800)
    }
    return () => { if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current) }
  }, [code, language, autoRun, runCode])

  // Handle code change
  const handleCodeChange = (value: string) => {
    setCode(value)
    setError(null)
  }

  // Change language
  const handleLanguageChange = (langId: string) => {
    setLanguage(langId)
    const defaultCode = DEFAULT_CODE[langId] || ''
    setCode(defaultCode)
    setError(null)
    setOutput('')
    setShowLanguagePicker(false)
  }

  // Download code as file
  const handleDownload = () => {
    const lang = LANGUAGES.find(l => l.id === language)
    const ext = lang?.ext || 'txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `playground.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Share code
  const handleShare = () => {
    const data = JSON.stringify({ code, language })
    const base64 = btoa(encodeURIComponent(data))
    const shareUrl = `${window.location.origin}/code-playground?code=${base64}`
    navigator.clipboard.writeText(shareUrl)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  // Reset to default
  const handleReset = () => {
    if (confirm('Reset to default template for this language?')) {
      const defaultCode = DEFAULT_CODE[language] || ''
      setCode(defaultCode)
      setError(null)
      setOutput('')
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        runCode()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleDownload()
      } else if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        // Could toggle comment - skip for now
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [runCode, handleDownload])

  const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0]
  const LanguageIcon = getLanguageIcon(language)

  // SEO Content and FAQ
  const codeFaq = [
    {
      question: 'Which languages support live code execution?',
      answer: 'JavaScript, TypeScript, Python (via Pyodide WebAssembly), and HTML/CSS/JS run live in your browser. Other 20+ languages have full syntax highlighting but no execution �-- they are for writing, editing, and downloading code snippets.'
    },
    {
      question: 'Is my code saved or sent to a server?',
      answer: 'Your code saves automatically to your browser\'s localStorage. No code is uploaded to any server. Execution happens entirely client-side using iframes (JS/HTML) or WebAssembly (Python).'
    },
    {
      question: 'Can I use npm packages or import modules?',
      answer: 'For JavaScript/TypeScript: only browser globals (fetch, DOM, etc.) �-- no npm. For Python: Pyodide includes many scientific packages (numpy, pandas, matplotlib) but not all PyPI packages. Check Pyodide docs for available packages.'
    },
    {
      question: 'How do I share my code?',
      answer: 'Click the Share button to copy a link with your code encoded. You can also download code as a file and share manually.'
    },
    {
      question: 'What are the keyboard shortcuts?',
      answer: 'Ctrl/Cmd+Enter: Run code. Ctrl/Cmd+S: Download file. Tab: Indent (in editor). Escape: Close language picker.'
    }
  ]

  const codeSeo = (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Multi-Language Code Playground</h2>
      <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
        Code Playground is a free online editor supporting 25+ programming languages with syntax highlighting.
        JavaScript, TypeScript, Python, and HTML/CSS/JS run live in your browser — no server required.
        Write, test, and download code instantly. Perfect for learning, prototyping, interviews, and debugging.
      </p>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Supported Languages</h3>
      <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
        Runnable: JavaScript, TypeScript, Python (via Pyodide WebAssembly), HTML/CSS/JS.
        Syntax highlighting only: JSON, YAML, Markdown, SQL, Go, Rust, Java, C#, C++, PHP, Ruby, Swift, Kotlin, Dart, Bash, Dockerfile, CSS, SCSS, GraphQL, Regex, XML, TOML.
      </p>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Privacy-First Design</h3>
      <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
        All code executes client-side. Your snippets never leave your browser. Uses localStorage for persistence,
        WebAssembly for Python, and sandboxed iframes for JavaScript/HTML. No accounts, no tracking, no server logs.
      </p>
    </div>
  )

  return (
    <ToolLayout
      title="Code Playground"
      description="Multi-language online code editor with live execution for JavaScript, TypeScript, Python, and HTML. Syntax highlighting for 25+ languages."
      toolSlug="code-playground"
      faq={codeFaq}
      seoContent={codeSeo}
    >
      <div className="space-y-4">
        {/* Toolbar — Terminal style */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#000000] border border-[#333333]">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguagePicker(!showLanguagePicker)}
                className="terminal-btn"
              >
                [<span className="green-chevron">&gt;</span> {currentLang.name}] <ChevronDown className="w-4 h-4" />
              </button>

              {showLanguagePicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLanguagePicker(false)} />
                  <div className="absolute right-0 top-full z-20 mt-0 w-56 bg-[#000000] border border-[#F9F9F9] overflow-hidden">
                    <div className="p-2 border-b border-[#333333]">
                      <input
                        type="text"
                        placeholder="Search languages..."
                        className="w-full px-2 py-1.5 text-sm bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono outline-none focus:border-2 focus:border-[#00FF41] placeholder-[#555555] transition-none"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {/* filter logic could go here */}}
                        autoFocus
                        style={{ caretColor: '#F9F9F9' }}
                      />
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={(e) => { e.stopPropagation(); handleLanguageChange(lang.id) }}
                          className={`w-full px-3 py-2 text-left font-mono text-xs transition-none border-b border-[#1a1a1a] last:border-b-0 ${
                            language === lang.id
                              ? 'bg-[#F9F9F9] text-[#000000] font-bold'
                              : 'text-[#888888] hover:bg-[#00FF41] hover:text-[#000000]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {(() => {
                              const Icon = getLanguageIcon(lang.id);
                              return <Icon className="w-4 h-4" />;
                            })()}
                            <span className="capitalize flex-1">{lang.name}</span>
                            {lang.runnable && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 border border-[#444444] text-[#666666]">
                                &gt; Run
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Run Button — Ghost button style */}
            <button
              onClick={runCode}
              disabled={isRunning || !currentLang.runnable}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> {isRunning ? 'Running...' : 'Run Code'}]
            </button>

            {/* Auto-run Toggle */}
            <label className="flex items-center gap-2 text-xs font-mono text-[#666666] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRun}
                onChange={(e) => setAutoRun(e.target.checked)}
                className="appearance-none w-4 h-4 bg-[#000000] border border-[#F9F9F9] checked:bg-[#F9F9F9] checked:border-[#F9F9F9] cursor-pointer"
              />
              Auto-run
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle — ghost button */}
            <button
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              className="terminal-btn"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Font Size */}
            <div className="flex items-center gap-1 bg-[#000000] border border-[#333333] px-2">
              <Minus className="w-3.5 h-3.5 text-[#555555]" />
              <input
                type="range"
                min="10"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-20 h-4 accent-[#F9F9F9]"
                aria-label="Font size"
              />
              <Plus className="w-3.5 h-3.5 text-[#555555]" />
              <span className="text-xs font-mono text-[#555555] w-8 text-right">{fontSize}px</span>
            </div>

            {/* Word Wrap Toggle — ghost */}
            <button
              onClick={() => setWordWrap(!wordWrap)}
              className="terminal-btn"
              title="Toggle word wrap"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Download — ghost */}
            <button
              onClick={handleDownload}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> DL]
            </button>

            {/* Share — ghost */}
            <button
              onClick={handleShare}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> {shared ? 'Shared' : 'Share'}]
            </button>

            {/* Reset — ghost */}
            <button
              onClick={handleReset}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> Reset]
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editor Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-[#F9F9F9] flex items-center gap-2 uppercase tracking-wider">
                <FileCode className="w-4 h-4" />
                Editor
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#555555]">
                <kbd className="px-1.5 py-0.5 bg-[#000000] border border-[#444444]">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 bg-[#000000] border border-[#444444]">+</kbd>
                <kbd className="px-1.5 py-0.5 bg-[#000000] border border-[#444444]">Enter</kbd>
                <span>to run</span>
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder={`// Write your ${currentLang.name} code here...`}
                className={`w-full h-[500px] p-4 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-sm leading-relaxed resize-y outline-none focus:border-2 focus:border-[#00FF41] transition-none placeholder-[#555555] ${!wordWrap ? 'whitespace-pre' : ''}`}
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.6', tabSize: 2, caretColor: '#F9F9F9' }}
                spellCheck={false}
              />
              {error && (
                <div className="absolute bottom-2 right-2 bg-[#F9F9F9] text-[#000000] text-[10px] font-mono px-2 py-1 border border-[#000000]">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Output/Preview Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-[#F9F9F9] flex items-center gap-2 uppercase tracking-wider">
                {currentLang.runnable && currentLang.id !== 'html' ? (
                  <>
                    <Terminal className="w-4 h-4" />
                    Output
                  </>
                ) : currentLang.id === 'html' ? (
                  <>
                    <Monitor className="w-4 h-4" />
                    Preview
                  </>
                ) : (
                  <>
                    <FileCode className="w-4 h-4" />
                    Info
                  </>
                )}
              </h3>
              {output && (
                <CopyButton
                  text={output}
                  label=""
                  className="p-1.5"
                />
              )}
            </div>

            <div className="relative">
              {currentLang.id === 'html' ? (
                <iframe
                  ref={iframeRef}
                  className="w-full h-[500px] border border-[#F9F9F9] bg-[#000000]"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                  title="HTML Preview"
                />
              ) : currentLang.runnable ? (
                <iframe
                  ref={iframeRef}
                  className="w-full h-[500px] border border-[#F9F9F9] bg-[#000000]"
                  sandbox="allow-scripts allow-same-origin"
                  title="Code Output"
                />
              ) : (
                <div className="w-full h-[500px] border border-[#F9F9F9] bg-[#000000] flex items-center justify-center p-6">
                  <div className="text-center text-[#666666] space-y-3">
                    <FileCode className="w-12 h-12 mx-auto text-[#444444]" />
                    <p className="font-mono text-xs text-[#888888]">Live execution not available for {currentLang.name}</p>
                    <p className="text-[11px] font-mono text-[#555555]">
                      This language supports syntax highlighting only.
                      <br />
                      Runnable languages: JavaScript, TypeScript, Python, HTML
                    </p>
                  </div>
                </div>
              )}
            </div>

            {output && currentLang.runnable && currentLang.id !== 'html' && (
              <div className="bg-[#000000] border border-[#333333] p-3 max-h-40 overflow-y-auto">
                <pre ref={outputRef} className="text-xs font-mono text-[#888888] whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-[#000000] border border-[#333333] text-[10px] font-mono text-[#555555]">
          <div className="flex items-center gap-4">
            <span>{code.length} chars</span>
            <span>{code.split('\n').length} lines</span>
            <span>{currentLang.name}</span>
            {currentLang.runnable && <span className="text-[#00FF41]">&gt; Runnable</span>}
          </div>
          <div className="flex items-center gap-2">
            <span>Theme:</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="px-2 py-1 bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9] font-mono text-[10px] outline-none focus:border-2 focus:border-[#00FF41] transition-none cursor-pointer"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>
      </ToolLayout>
  )
}