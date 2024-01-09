// Generates fallback queries for the user to select from.
// Copyright (C) 2023, Tony Rippy
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import newGithubIssueUrl from 'new-github-issue-url'
import type { ParseResult } from './parser'
import { version as BUILD_VERSION } from '../package.json'

function feedbackTemplate (query: string, result: ParseResult): string {
  const diagnostics = JSON.stringify({
    version: BUILD_VERSION,
    query,
    parse_result: result
  }, null, 2)
  return '## Expected Behavior\n\n' +
    '> Please describe what you expected to happen, and why you expected it to happen.\n\n' +
    '## Diagnostics\n\n' +
    '```json\n' + diagnostics + '\n```\n'
}

function buildLink (base: string, param: string, query: string): URL {
  const url = new URL(base)
  url.searchParams.set(param, query)
  return url
}

function addLinkTo (ul: HTMLUListElement, name: string, url: URL): void {
  const li = document.createElement('li')
  const a = document.createElement('a')
  a.href = url.toString()
  a.innerText = name
  a.focus()
  li.appendChild(a)
  ul.appendChild(li)
}

export function showFallback (query: string, result: ParseResult): void {
  const fallback = document.getElementById('fallback') as HTMLInputElement
  fallback.style.display = 'block'

  const feedback = document.getElementById('feedback-link') as HTMLAnchorElement
  feedback.href = newGithubIssueUrl({
    user: 'TonyRippy',
    repo: 'everything-but-the-search',
    body: feedbackTemplate(query, result),
    labels: ['needs triage']
  })

  const list = document.getElementById('fallback-list') as HTMLUListElement
  addLinkTo(list, 'Google', buildLink('https://www.google.com/search', 'q', query))
  addLinkTo(list, 'DuckDuckGo', buildLink('https://duckduckgo.com/', 'q', query))
  addLinkTo(list, 'Bing', buildLink('https://www.bing.com/search', 'q', query))
}
