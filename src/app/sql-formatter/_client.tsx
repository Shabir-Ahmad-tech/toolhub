'use client'

import { useState, useCallback, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useToast } from '@/components/ui/Toast'
import {
  formatDialect,
  mysql,
  postgresql,
  sqlite,
  bigquery,
  hive,
  plsql,
  db2,
  transactsql,
  spark,
  snowflake,
  clickhouse,
  redshift,
  duckdb,
  singlestoredb,
  n1ql,
  trino,
  mariadb,
} from 'sql-formatter'

type DialectKey =
  | 'mysql' | 'postgresql' | 'sqlite' | 'bigquery' | 'hive'
  | 'plsql' | 'db2' | 'tsql' | 'spark' | 'snowflake'
  | 'clickhouse' | 'redshift' | 'duckdb' | 'singlestoredb'
  | 'n1ql' | 'trino' | 'mariadb'

type KeywordCase = 'preserve' | 'upper' | 'lower'

const DIALECTS: { key: DialectKey; label: string }[] = [
  { key: 'mysql', label: 'MySQL' },
  { key: 'postgresql', label: 'PostgreSQL' },
  { key: 'sqlite', label: 'SQLite' },
  { key: 'mariadb', label: 'MariaDB' },
  { key: 'bigquery', label: 'BigQuery' },
  { key: 'hive', label: 'Hive' },
  { key: 'plsql', label: 'Oracle PL/SQL' },
  { key: 'db2', label: 'IBM DB2' },
  { key: 'tsql', label: 'SQL Server (T-SQL)' },
  { key: 'spark', label: 'Spark' },
  { key: 'snowflake', label: 'Snowflake' },
  { key: 'clickhouse', label: 'ClickHouse' },
  { key: 'redshift', label: 'Redshift' },
  { key: 'duckdb', label: 'DuckDB' },
  { key: 'singlestoredb', label: 'SingleStoreDB' },
  { key: 'n1ql', label: 'Couchbase N1QL' },
  { key: 'trino', label: 'Trino' },
]

const DIALECT_MAP: Record<DialectKey, unknown> = {
  mysql,
  postgresql,
  sqlite,
  bigquery,
  hive,
  plsql,
  db2,
  tsql: transactsql,
  spark,
  snowflake,
  clickhouse,
  redshift,
  duckdb,
  singlestoredb,
  n1ql,
  trino,
  mariadb,
}

const SAMPLE_QUERIES: { label: string; query: string }[] = [
  {
    label: 'SELECT with JOINs',
    query: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND u.created_at >= '2024-01-01' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC LIMIT 10;`,
  },
  {
    label: 'Subquery + Window',
    query: `SELECT department, employee_name, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) as salary_rank FROM (SELECT e.department, e.name as employee_name, e.salary FROM employees e WHERE e.active = true) ranked WHERE salary > 50000;`,
  },
  {
    label: 'CREATE TABLE',
    query: `CREATE TABLE users (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, status ENUM('active','inactive','suspended') DEFAULT 'active', metadata JSON, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
]

export default function SqlFormatter() {
  const { toast } = useToast()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [dialect, setDialect] = useState<DialectKey>('mysql')
  const [tabWidth, setTabWidth] = useState(2)
  const [useTabs, setUseTabs] = useState(false)
  const [keywordCase, setKeywordCase] = useState<KeywordCase>('upper')

  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter a SQL query to format.')
      setOutput('')
      return
    }
    setError(null)
    try {
      const result = formatDialect(input, {
        dialect: DIALECT_MAP[dialect] as never,
        tabWidth,
        useTabs,
        keywordCase: keywordCase === 'preserve' ? undefined : keywordCase,
      })
      setOutput(result)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to format SQL'
      setError(msg)
      setOutput('')
    }
  }, [input, dialect, tabWidth, useTabs, keywordCase])

  const copyOutput = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      toast('Copied formatted SQL!', 'success')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = output
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast('Copied formatted SQL!', 'success')
    }
  }

  const loadSample = (query: string) => {
    setInput(query)
    setOutput('')
    setError(null)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const seoContent = (
    <div className="space-y-4">
      <p>
        <strong className="text-[#F9F9F9]">What is an SQL Formatter?</strong> An SQL formatter is a tool that
        automatically reformats SQL queries to make them more readable and maintainable. It adds consistent
        indentation, line breaks, and keyword casing so that complex queries become easier to understand at a
        glance. This is especially valuable for teams that collaborate on database code or for developers who
        debug long, unformatted queries.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">Why use this SQL Formatter?</strong> This tool supports 17 SQL
        dialects including MySQL, PostgreSQL, SQLite, BigQuery, and T-SQL. You can customize indentation style
        (spaces or tabs), keyword casing (upper or lower), and tab width. All processing happens entirely in
        your browser — your SQL queries never leave your machine, making it safe to use with sensitive schema
        or proprietary queries.
      </p>
      <p>
        <strong className="text-[#F9F9F9]">How does SQL formatting help development?</strong> Consistent SQL
        formatting makes code reviews faster, reduces the chance of syntax errors caused by misreading
        unformatted code, and helps new team members understand complex queries. Many teams adopt SQL formatting
        as part of their CI/CD pipeline, using the same rules enforced locally by tools like this one.
      </p>
      <p>
        Try pasting your SQL query above, select the correct dialect, and click &quot;Format SQL&quot;. Use the
        sample queries to see how different formatting options affect the output. Copy the result with one click
        for use in your codebase.
      </p>
    </div>
  )

  const faq = [
    {
      question: 'Does this SQL formatter work with stored procedures and functions?',
      answer: 'The sql-formatter library does not support stored procedures, functions, or delimiter changes. For standard DML (SELECT, INSERT, UPDATE, DELETE) and DDL (CREATE TABLE, ALTER, etc.) queries, formatting works well. Complex procedural blocks may not format correctly.',
    },
    {
      question: 'Which SQL dialect should I choose?',
      answer: 'Select the dialect that matches your database. MySQL is the most common choice and works well for most queries. PostgreSQL users should select PostgreSQL for proper handling of jsonb operators, array syntax, and specific functions. Use BigQuery for Google Cloud, T-SQL for SQL Server / Azure, and Oracle PL/SQL for Oracle databases. When in doubt, start with the generic SQL dialect.',
    },
    {
      question: 'Is my SQL data safe when using this formatter?',
      answer: 'Yes. This SQL formatter runs entirely in your browser using client-side JavaScript. Your SQL queries are never sent to any server, stored, or logged. This makes it safe to format queries containing proprietary schema, sensitive column names, or confidential business logic.',
    },
    {
      question: 'What formatting options are available?',
      answer: 'You can configure: tab width (2-8 spaces), tabs vs spaces for indentation, and keyword casing (upper case like SELECT/WHERE or lower case like select/where). Additional options like expression width, lines between queries, and logical operator newline placement are available through the underlying library.',
    },
    {
      question: 'Can I use this formatter in my CI/CD pipeline?',
      answer: 'The underlying sql-formatter library is available as an npm package and can be integrated into any Node.js CI/CD pipeline, ESLint workflow (via eslint-plugin-sql), or used as a pre-commit hook. This online tool provides the same formatting rules so you can preview the output before configuring automated formatting.',
    },
  ]

  return (
    <ToolLayout
      title="SQL Formatter & Beautifier"
      description="Format and beautify SQL queries with support for 17 SQL dialects. Customize indentation, keyword casing, and more. All processing happens client-side — your data never leaves your machine."
      toolSlug="sql-formatter"
      categorySlug="developer-tools"
      faq={faq}
      seoContent={seoContent}
    >
      <div className="space-y-4">
        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dialect selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; dialect</span>
            <select
              value={dialect}
              onChange={e => setDialect(e.target.value as DialectKey)}
              className="bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] md:text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#00FF41]/50"
            >
              {DIALECTS.map(d => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
            <span className="text-[#555555] text-[10px] select-none">]</span>
          </div>

          {/* Tab width */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; tab</span>
            <select
              value={tabWidth}
              onChange={e => setTabWidth(Number(e.target.value))}
              className="bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] md:text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#00FF41]/50"
            >
              {[2, 4, 6, 8].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-[#555555] text-[10px] select-none">]</span>
          </div>

          {/* Use tabs */}
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-[10px] font-mono text-[#555555] select-none">[</span>
            <input
              type="checkbox"
              checked={useTabs}
              onChange={e => setUseTabs(e.target.checked)}
              className="accent-[#00FF41]"
            />
            <span className="text-[10px] font-mono text-[#555555] select-none">tabs]</span>
          </label>

          {/* Keyword case */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; case</span>
            <select
              value={keywordCase}
              onChange={e => setKeywordCase(e.target.value as KeywordCase)}
              className="bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-[10px] md:text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#00FF41]/50"
            >
              <option value="upper">UPPER</option>
              <option value="lower">lower</option>
              <option value="preserve">Preserve</option>
            </select>
            <span className="text-[#555555] text-[10px] select-none">]</span>
          </div>
        </div>

        {/* Input area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; input.sql</span>
            <div className="flex gap-2">
              {SAMPLE_QUERIES.map(sq => (
                <button
                  key={sq.label}
                  onClick={() => loadSample(sq.query)}
                  className="text-[9px] md:text-[10px] font-mono text-[#555555] hover:text-[#00FF41]/60 transition-colors"
                >
                  [&gt; {sq.label}]
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your SQL query here..."
            rows={8}
            className="w-full bg-[#0A0A0A] border border-[#333333] text-[#F9F9F9] font-mono text-xs md:text-sm p-3 rounded focus:outline-none focus:border-[#00FF41]/50 placeholder:text-[#555555] resize-y"
            spellCheck={false}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFormat}
            className="terminal-btn text-[11px]"
          >
            <span className="green-chevron">&gt;</span> Format SQL
          </button>
          <button
            onClick={copyOutput}
            disabled={!output}
            className="terminal-btn text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="green-chevron">&gt;</span> Copy Output
          </button>
          <button
            onClick={clearAll}
            className="terminal-btn text-[11px]"
          >
            <span className="green-chevron">&gt;</span> Clear
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-red-500/30 bg-red-500/5 p-3 rounded">
            <p className="text-red-400 font-mono text-xs">
              <span className="text-red-400">&gt;</span> {error}
            </p>
          </div>
        )}

        {/* Output area */}
        {output && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#555555] select-none">[&gt; output.sql</span>
            <pre className="w-full bg-[#0A0A0A] border border-[#00FF41]/20 text-[#F9F9F9] font-mono text-xs md:text-sm p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
