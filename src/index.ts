// Javascript code for Everything But The Search
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

import { parse, ASTKinds } from './parser'
import type { QUERY } from './parser'
import { handleConversion } from './conversion'
import { hello, helloWithName } from './hello'
import { ServerError, QueryError } from './errors'

function handleQuery (ast: QUERY): void {
  switch (ast.kind) {
    case ASTKinds.greeting: {
      hello()
      return
    }
    case ASTKinds.greeting_with_name: {
      helloWithName(ast)
      return
    }
    case ASTKinds.CONVERSION: {
      handleConversion(ast)
      return
    }
    default: {
      // TODO: This is an oopsie. Provide link to file GitHub issue.
      throw new ServerError('Unknown AST kind')
    }
  }
}

export function query (q: string | null): void {
  if (q === null || q.length === 0) {
    // Nothing to do
    return
  }
  // Set the search box to the query
  const input = document.getElementsByName('q')[0] as HTMLInputElement
  input.setAttribute('value', q)
  input.setSelectionRange(q.length, q.length)

  // Show the results section
  const results = document.getElementById('results') as HTMLInputElement
  results.style.display = 'block'

  // Parse the query and invoke the proper handler if a match is found.
  try {
    const result = parse(q)
    if (result.ast === null) {
      result.errs.forEach((e) => { console.debug(e.toString()) })
    } else {
      handleQuery(result.ast)
    }
  } catch (e) {
    if (e instanceof ServerError) {
      // TODO: Give option to file GitHub issue.
      console.error(e)
    } else if (e instanceof QueryError) {
      // TODO: Provide guidance to user about how to improve/fix the query.
      console.error(e)
    } else {
      throw e
    }
  }
}

query(new URLSearchParams(window.location.search).get('q'))
