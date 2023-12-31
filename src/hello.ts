// Handler for "Hello World" queries.
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

import type { greeting_with_name } from './parser'

export function hello (): void {
  const hello = document.getElementById('hello')
  if (hello === null) {
    return
  }
  hello.style.display = 'block'  // makes the hello section visible
}

export function hello_with_name (ast: greeting_with_name): void {
  hello()
  const note = document.getElementById('hello-note')
  const name = ast.name
  if (note && name && !name.match(/^\s*(?:ebts|everything\s+but\s+the\s+search)\s*$/i)) {
    note.innerHTML = `(but my name isn't &ldquo;${name.trim()}&rdquo;)`
  }
}
