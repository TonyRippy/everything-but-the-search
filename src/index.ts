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
import { convert } from './conversion'

export function query (q: string | null): void {
  if (q === null) {
    // Nothing to do
    return
  }
  // Set the search box to the query
  const input = document.getElementsByName('q')[0] as HTMLInputElement
  input.setAttribute('value', q)
  input.setSelectionRange(q.length, q.length)

  // Parse the query and invoke the proper handler if a match is found.
  const ast = parse(q)
  if (ast.ast === null) {
    // TODO: Give option to file GitHub issue.
    ast.errs.forEach((e) => { console.debug(e.toString()) })
  } else {
    switch (ast.ast.kind) {
      case ASTKinds.HELLO:
        console.log('Hello')
        break
      case ASTKinds.CONVERSION:
        convert(ast.ast)
        break
      default:
        // TODO: This is an oopsie. Provide link to file GitHub issue.
        console.error('Unknown AST kind.')
        console.error(ast.ast)
    }
  }
}

query(new URLSearchParams(window.location.search).get('q'))
