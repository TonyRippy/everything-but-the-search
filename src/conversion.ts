// Handler for conversion queries.
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

import type { CONVERSION } from './parser'
import { ASTKinds } from './parser'
import Fraction from 'fraction.js'

enum BaseUnit {
  Bytes,
}

class Unit {
  public name: string
  public base: BaseUnit
  public quantity: Fraction

  constructor (kind: ASTKinds) {
    switch (kind) {
      case ASTKinds.bit:
        this.name = 'bit'
        this.base = BaseUnit.Bytes
        this.quantity = new Fraction(1, 8)
        break
      case ASTKinds.nibble:
        this.name = 'nibble'
        this.base = BaseUnit.Bytes
        this.quantity = new Fraction(1, 2)
        break
      case ASTKinds.byte:
        this.name = 'byte'
        this.base = BaseUnit.Bytes
        this.quantity = new Fraction(1)
        break
      case ASTKinds.kilobyte:
        this.name = 'kilobyte'
        this.base = BaseUnit.Bytes
        this.quantity = new Fraction(1_000)
        break
      case ASTKinds.megabyte:
        this.name = 'megabyte'
        this.base = BaseUnit.Bytes
        this.quantity = new Fraction(1_000_000)
        break
      case ASTKinds.gigabyte:
        this.name = 'gigabyte'
        this.base = BaseUnit.Bytes
        this.quantity = new Fraction(1_000_000_000)
        break
      default:
        throw new Error(`AST kind ${kind} is not a known unit of measure.`)
    }
  }
}

// fn try_convert(mut pairs: Pairs<Rule>) -> Result<String, String> {
//     let number = match pairs.next() {
//         Some(pair) => match parse_number(pair) {
//             Ok(number) => number,
//             Err(e) => {
//                 return Err(format!("unable to parse number: {}", e));
//             }
//         },
//         None => {
//             // TODO: Make this an internal server error.
//             return Err("This shouldn't happen!".to_string());
//         }
//     };
//     let from_unit = match pairs.next() {
//         Some(pair) => parse_unit(pair)?,
//         None => {
//             // TODO: Make this an internal server error.
//             return Err("This shouldn't happen!".to_string());
//         }
//     };
//     let to_unit = match pairs.next() {
//         Some(pair) => parse_unit(pair)?,
//         None => {
//             // TODO: Make this an internal server error.
//             return Err("This shouldn't happen!".to_string());
//         }
//     };
//     if from_unit.base != to_unit.base {
//         return Err(format!(
//             "Cannot convert between {}, measured in {:?}, and {}, which is measured in {:?}.",
//             from_unit.name, from_unit.base, to_unit.name, to_unit.base
//         ));
//     }
//     let factor = from_unit.quantity / to_unit.quantity;
//     let result = number * factor;
//     Ok(format!(
//         "{} {} = {} {}",
//         number, from_unit.name, result, to_unit.name
//     ))
// }

//     #[test]
//     fn test_conversion() {
//         for (input, expected) in &[
//             ("10 kb in bits", "10 kilobyte = 80000 bit"),
//             ("10 MB in KB", "10 megabyte = 10000 kilobyte"),
//         ] {
//             let actual = try_query(input);
//             assert_eq!(
//                 Some(expected.to_string()),
//                 actual.ok(),
//                 "with input: {:?}",
//                 input
//             );
//         }
//     }
// }

function convertParsed (quantity: Fraction, from: Unit, to: Unit): void {
  console.log(`convert ${quantity.toString()} ${from.name} to ${to.name}`)
}

export function convert (query: CONVERSION): void {
  convertParsed(query.quantity.value, new Unit(query.from_unit.kind), new Unit(query.to_unit.kind))
}
