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

import type { CONVERSION, UNIT } from './parser'
import { ASTKinds } from './parser'
import type Fraction from 'fraction.js'
import { ServerError, QueryError } from './errors'

enum MeasurementTypes {
  DataStorage = 'data-storage',
}

class Unit {
  constructor (
    public name: string,
    public kind: ASTKinds,
    public measurementType: MeasurementTypes,
    public toBaseUnit: (quantity: Fraction) => Fraction,
    public fromBaseUnit: (quantity: Fraction) => Fraction) {
  }
}

const UNITS = new Map<ASTKinds, Unit>([
  [ASTKinds.bit, new Unit(
    'Bit',
    ASTKinds.bit,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(8_000_000_000),
    (quantity: Fraction) => quantity.mul(8_000_000_000)
  )],
  [ASTKinds.nibble, new Unit(
    'Nibble',
    ASTKinds.nibble,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(2_000_000_000),
    (quantity: Fraction) => quantity.mul(2_000_000_000)
  )],
  [ASTKinds.byte, new Unit(
    'Byte',
    ASTKinds.byte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(1_000_000_000),
    (quantity: Fraction) => quantity.mul(1_000_000_000)
  )],
  [ASTKinds.kilobyte, new Unit(
    'Kilobyte',
    ASTKinds.kilobyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(1_000_000),
    (quantity: Fraction) => quantity.mul(1_000_000)
  )],
  [ASTKinds.megabyte, new Unit(
    'Megabyte',
    ASTKinds.megabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(1_000),
    (quantity: Fraction) => quantity.mul(1_000)
  )],
  [ASTKinds.gigabyte, new Unit(
    'Gigabyte',
    ASTKinds.gigabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity,
    (quantity: Fraction) => quantity
  )]
])

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
  if (from.measurementType !== to.measurementType) {
    throw new QueryError(`Cannot convert between ${from.name}, measured in ${from.measurementType as string}, and ${to.name}, which is measured in ${to.measurementType as string}.`)
  }

  // Make the converter tool visible
  const onebox = document.getElementById('converter')
  if (onebox === null) {
    throw new ServerError('Unable to find element: converter')
  }
  onebox.style.display = 'block'

  const selectType = document.getElementById('converter-type') as HTMLSelectElement
  if (selectType === null) {
    throw new ServerError('Unable to find element: converter-type')
  }
  selectType.value = from.measurementType

  // Add the supported measurements to the converter tool
  const selectFrom = document.getElementById('converter-from-unit') as HTMLSelectElement
  if (selectFrom === null) {
    throw new ServerError('Unable to find element: converter-from-unit')
  }
  const selectTo = document.getElementById('converter-to-unit') as HTMLSelectElement
  if (selectTo === null) {
    throw new ServerError('Unable to find element: converter-to-unit')
  }
  for (const [key, unit] of UNITS) {
    if (unit.measurementType !== from.measurementType) {
      continue
    }
    // Add to the "from" dropdown
    let option = document.createElement('option')
    option.value = key.toString()
    option.text = unit.name
    selectFrom.appendChild(option)
    if (unit.kind === from.kind) {
      option.selected = true
    }

    // Add to the "to" dropdown
    option = document.createElement('option')
    option.value = key.toString()
    option.text = unit.name
    if (unit.kind === to.kind) {
      option.selected = true
    }
    selectTo.appendChild(option)
  }

  // Set the input value
  const input = document.getElementById('converter-from-value') as HTMLInputElement
  if (input === null) {
    throw new ServerError('Unable to find element: converter-from-value')
  }
  input.value = quantity.toString()

  // Set the output value
  const output = document.getElementById('converter-to-value') as HTMLInputElement
  if (output === null) {
    throw new ServerError('Unable to find element: converter-to-value')
  }
  output.value = to.fromBaseUnit(from.toBaseUnit(quantity)).toString()

  // TODO: Add event handlers
}

function toUnit (ast: UNIT): Unit {
  const unit = UNITS.get(ast.kind)
  if (unit === undefined) {
    throw new ServerError(`Unhandled measurement unit: "${ast.literal}" (${ast.kind})`)
  }
  return unit
}

export function convert (query: CONVERSION): void {
  convertParsed(query.quantity.value, toUnit(query.from_unit), toUnit(query.to_unit))
}
