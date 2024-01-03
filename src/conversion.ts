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
import Fraction from 'fraction.js'
import { ServerError, QueryError } from './errors'

enum MeasurementTypes {
  DataStorage = 'data-storage',
}

export class Unit {
  constructor (
    public name: string,
    public kind: ASTKinds,
    public measurementType: MeasurementTypes,
    public toBaseUnit: (quantity: Fraction) => Fraction,
    public fromBaseUnit: (quantity: Fraction) => Fraction) {
  }
}

export const UNITS = new Map<ASTKinds, Unit>([

  // Data storage units
  // https://en.wikipedia.org/wiki/Byte#Multiple-byte_units
  [ASTKinds.bit, new Unit(
    'Bit',
    ASTKinds.bit,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(8e9),
    (quantity: Fraction) => quantity.mul(8e9)
  )],
  [ASTKinds.nibble, new Unit(
    'Nibble',
    ASTKinds.nibble,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(2e9),
    (quantity: Fraction) => quantity.mul(2e9)
  )],
  [ASTKinds.byte, new Unit(
    'Byte (B)',
    ASTKinds.byte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(1e9),
    (quantity: Fraction) => quantity.mul(1e9)
  )],
  [ASTKinds.kilobyte, new Unit(
    'Kilobyte (KB)',
    ASTKinds.kilobyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(1e6),
    (quantity: Fraction) => quantity.mul(1e6)
  )],
  [ASTKinds.megabyte, new Unit(
    'Megabyte (MB)',
    ASTKinds.megabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(1e3),
    (quantity: Fraction) => quantity.mul(1e3)
  )],
  [ASTKinds.gigabyte, new Unit(
    'Gigabyte (GB)',
    ASTKinds.gigabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity,
    (quantity: Fraction) => quantity
  )],
  [ASTKinds.terabyte, new Unit(
    'Terabyte (TB)',
    ASTKinds.terabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(1e3),
    (quantity: Fraction) => quantity.div(1e3)
  )],
  [ASTKinds.petabyte, new Unit(
    'Petabyte (PB)',
    ASTKinds.petabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(1e6),
    (quantity: Fraction) => quantity.div(1e6)
  )],
  [ASTKinds.exabyte, new Unit(
    'Exabyte (EB)',
    ASTKinds.exabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(1e9),
    (quantity: Fraction) => quantity.div(1e9)
  )],
  [ASTKinds.kibibyte, new Unit(
    'Kibibyte (KiB)',
    ASTKinds.kibibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(1 << 10, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(1 << 10, 1e9))
  )],
  [ASTKinds.mebibyte, new Unit(
    'Mebibyte (MiB)',
    ASTKinds.mebibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(1 << 20, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(1 << 20, 1e9))
  )],
  [ASTKinds.gibibyte, new Unit(
    'Gibibyte (GiB)',
    ASTKinds.gibibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(1 << 30, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(1 << 30, 1e9))
  )],
  [ASTKinds.tebibyte, new Unit(
    'Tebibyte (TiB)',
    ASTKinds.tebibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(2 ** 40, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(2 ** 40, 1e9))
  )],
  [ASTKinds.pebibyte, new Unit(
    'Pebibyte (PiB)',
    ASTKinds.pebibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(2 ** 50, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(2 ** 50, 1e9))
  )],
  [ASTKinds.exbibyte, new Unit(
    'Exbibyte (EiB)',
    ASTKinds.exbibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(2 ** 60, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(2 ** 60, 1e9))
  )]
])

export class UnitConverter {
  private fromQuantity: Fraction
  private fromUnit: Unit
  private toQuantity: Fraction
  private toUnit: Unit

  constructor (quantity: Fraction, from: Unit, to: Unit) {
    if (from.measurementType !== to.measurementType) {
      throw new QueryError(`Cannot convert between ${from.name}, measured in ${from.measurementType as string}, and ${to.name}, which is measured in ${to.measurementType as string}.`)
    }
    this.fromQuantity = quantity
    this.fromUnit = from
    this.toUnit = to
    this.calcTo()
  }

  private calcTo (): void {
    this.toQuantity = this.toUnit.fromBaseUnit(this.fromUnit.toBaseUnit(this.fromQuantity))
  }

  private calcFrom (): void {
    this.fromQuantity = this.fromUnit.fromBaseUnit(this.toUnit.toBaseUnit(this.toQuantity))
  }

  public getMeasurementType (): MeasurementTypes {
    return this.fromUnit.measurementType
  }

  public getFromQuantity (): Fraction {
    return this.fromQuantity
  }

  public setFromQuantity (quantity: Fraction): void {
    this.fromQuantity = quantity
    this.calcTo()
  }

  public getFromUnit (): Unit {
    return this.fromUnit
  }

  public setFromUnit (unit: Unit): void {
    this.fromUnit = unit
    this.calcTo()
  }

  public getToQuantity (): Fraction {
    return this.toQuantity
  }

  public setToQuantity (quantity: Fraction): void {
    this.toQuantity = quantity
    this.calcFrom()
  }

  public getToUnit (): Unit {
    return this.toUnit
  }

  public setToUnit (unit: Unit): void {
    this.toUnit = unit
    this.calcFrom()
  }
}

function attach (converter: UnitConverter): void {
  // Make the converter tool visible
  const onebox = document.getElementById('converter')
  if (onebox === null) {
    throw new ServerError('Unable to find element: converter')
  }
  onebox.style.display = 'block'

  // Set the measurement type
  const selectType = document.getElementById('converter-type') as HTMLSelectElement
  if (selectType === null) {
    throw new ServerError('Unable to find element: converter-type')
  }
  selectType.value = converter.getMeasurementType()

  // Find the converter tool elements
  const selectFrom = document.getElementById('converter-from-unit') as HTMLSelectElement
  if (selectFrom === null) {
    throw new ServerError('Unable to find element: converter-from-unit')
  }
  const selectTo = document.getElementById('converter-to-unit') as HTMLSelectElement
  if (selectTo === null) {
    throw new ServerError('Unable to find element: converter-to-unit')
  }
  const inputFrom = document.getElementById('converter-from-value') as HTMLInputElement
  if (inputFrom === null) {
    throw new ServerError('Unable to find element: converter-from-value')
  }
  const inputTo = document.getElementById('converter-to-value') as HTMLInputElement
  if (inputTo === null) {
    throw new ServerError('Unable to find element: converter-to-value')
  }

  // Add the supported measurements to the converter tool
  const fromKind = converter.getFromUnit().kind
  const toKind = converter.getToUnit().kind
  for (const [key, unit] of UNITS) {
    if (unit.measurementType !== converter.getMeasurementType()) {
      continue
    }
    // Add to the "from" dropdown
    let option = document.createElement('option')
    option.value = key.toString()
    option.text = unit.name
    selectFrom.appendChild(option)
    if (unit.kind === fromKind) {
      option.selected = true
    }

    // Add to the "to" dropdown
    option = document.createElement('option')
    option.value = key.toString()
    option.text = unit.name
    if (unit.kind === toKind) {
      option.selected = true
    }
    selectTo.appendChild(option)
  }

  // Set the input value
  inputFrom.value = converter.getFromQuantity().toString()
  inputFrom.oninput = (e) => {
    try {
      const quantity = new Fraction(inputFrom.value)
      converter.setFromQuantity(quantity)
      inputTo.value = converter.getToQuantity().toString()
    } catch {
      inputTo.value = ''
    }
  };

  // Set the output value
  inputTo.value = converter.getToQuantity().toString()
  inputTo.oninput = (e) => {
    try {
      const quantity = new Fraction(inputTo.value)
      converter.setToQuantity(quantity)
      inputFrom.value = converter.getFromQuantity().toString()
    } catch {
      inputFrom.value = ''
    }
  };

  selectFrom.onchange = (e) => {
    const unit = UNITS.get(parseInt(selectFrom.value))
    if (unit === undefined) {
      throw new ServerError(`Unknown unit: ${selectFrom.value}`)
    }
    converter.setFromUnit(unit)
    inputFrom.value = converter.getFromQuantity().toString()
    inputTo.value = converter.getToQuantity().toString()
  }

  selectTo.onchange = (e) => {
    const unit = UNITS.get(parseInt(selectTo.value))
    if (unit === undefined) {
      throw new ServerError(`Unknown unit: ${selectTo.value}`)
    }
    converter.setToUnit(unit)
    inputFrom.value = converter.getFromQuantity().toString()
    inputTo.value = converter.getToQuantity().toString()
  }
}

function toUnit (ast: UNIT): Unit {
  const unit = UNITS.get(ast.kind)
  if (unit === undefined) {
    throw new ServerError(`Unhandled measurement unit: "${ast.literal}" (${ast.kind})`)
  }
  return unit
}

export function handleConversion (query: CONVERSION): void {
  const converter = new UnitConverter(query.quantity.value, toUnit(query.from_unit), toUnit(query.to_unit))
  attach(converter)
}
