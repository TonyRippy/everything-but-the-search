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

import type { ConversionQuery, Unit as UnitAST } from './parser'
import { ASTKinds } from './parser'
import Fraction from 'fraction.js'
import { ServerError, QueryError } from './errors'

enum MeasurementTypes {
  DataStorage = 'data-storage',
  Time = 'time',
}

function defaultFrom (type: MeasurementTypes): ASTKinds {
  switch (type) {
    case MeasurementTypes.DataStorage:
      return ASTKinds.Megabyte
    case MeasurementTypes.Time:
      return ASTKinds.Minute
    default:
      throw new ServerError('Unhandled measurement type')
  }
}

function defaultTo (type: MeasurementTypes): ASTKinds {
  switch (type) {
    case MeasurementTypes.DataStorage:
      return ASTKinds.Byte
    case MeasurementTypes.Time:
      return ASTKinds.Second
    default:
      throw new ServerError('Unhandled measurement type')
  }
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
  // The base unit used here is the gigabyte.
  [ASTKinds.Bit, new Unit(
    'Bit',
    ASTKinds.Bit,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(8e9),
    (quantity: Fraction) => quantity.mul(8e9)
  )],
  [ASTKinds.Nibble, new Unit(
    'Nibble',
    ASTKinds.Nibble,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(2e9),
    (quantity: Fraction) => quantity.mul(2e9)
  )],
  [ASTKinds.Byte, new Unit(
    'Byte (B)',
    ASTKinds.Byte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(1e9),
    (quantity: Fraction) => quantity.mul(1e9)
  )],
  [ASTKinds.Kilobyte, new Unit(
    'Kilobyte (KB)',
    ASTKinds.Kilobyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(1e6),
    (quantity: Fraction) => quantity.mul(1e6)
  )],
  [ASTKinds.Megabyte, new Unit(
    'Megabyte (MB)',
    ASTKinds.Megabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.div(1e3),
    (quantity: Fraction) => quantity.mul(1e3)
  )],
  [ASTKinds.Gigabyte, new Unit(
    'Gigabyte (GB)',
    ASTKinds.Gigabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity,
    (quantity: Fraction) => quantity
  )],
  [ASTKinds.Terabyte, new Unit(
    'Terabyte (TB)',
    ASTKinds.Terabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(1e3),
    (quantity: Fraction) => quantity.div(1e3)
  )],
  [ASTKinds.Petabyte, new Unit(
    'Petabyte (PB)',
    ASTKinds.Petabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(1e6),
    (quantity: Fraction) => quantity.div(1e6)
  )],
  [ASTKinds.Exabyte, new Unit(
    'Exabyte (EB)',
    ASTKinds.Exabyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(1e9),
    (quantity: Fraction) => quantity.div(1e9)
  )],
  [ASTKinds.Kibibyte, new Unit(
    'Kibibyte (KiB)',
    ASTKinds.Kibibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(1 << 10, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(1 << 10, 1e9))
  )],
  [ASTKinds.Mebibyte, new Unit(
    'Mebibyte (MiB)',
    ASTKinds.Mebibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(1 << 20, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(1 << 20, 1e9))
  )],
  [ASTKinds.Gibibyte, new Unit(
    'Gibibyte (GiB)',
    ASTKinds.Gibibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(1 << 30, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(1 << 30, 1e9))
  )],
  [ASTKinds.Tebibyte, new Unit(
    'Tebibyte (TiB)',
    ASTKinds.Tebibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(2 ** 40, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(2 ** 40, 1e9))
  )],
  [ASTKinds.Pebibyte, new Unit(
    'Pebibyte (PiB)',
    ASTKinds.Pebibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(2 ** 50, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(2 ** 50, 1e9))
  )],
  [ASTKinds.Exbibyte, new Unit(
    'Exbibyte (EiB)',
    ASTKinds.Exbibyte,
    MeasurementTypes.DataStorage,
    (quantity: Fraction) => quantity.mul(new Fraction(2 ** 60, 1e9)),
    (quantity: Fraction) => quantity.div(new Fraction(2 ** 60, 1e9))
  )],

  // Time units
  // https://en.wikipedia.org/wiki/Unit_of_time
  // The base unit used here is the second.
  [ASTKinds.Nanosecond, new Unit(
    'Nanosecond (ns)',
    ASTKinds.Nanosecond,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.div(1e9),
    (quantity: Fraction) => quantity.mul(1e9)
  )],
  [ASTKinds.Microsecond, new Unit(
    'Microsecond (μs)',
    ASTKinds.Microsecond,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.div(1e6),
    (quantity: Fraction) => quantity.mul(1e6)
  )],
  [ASTKinds.Millisecond, new Unit(
    'Millisecond (ms)',
    ASTKinds.Millisecond,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.div(1e3),
    (quantity: Fraction) => quantity.mul(1e3)
  )],
  [ASTKinds.Second, new Unit(
    'Second (s)',
    ASTKinds.Second,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity,
    (quantity: Fraction) => quantity
  )],
  [ASTKinds.Minute, new Unit(
    'Minute (min)',
    ASTKinds.Minute,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(60),
    (quantity: Fraction) => quantity.div(60)
  )],
  [ASTKinds.Hour, new Unit(
    'Hour (h)',
    ASTKinds.Hour,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(3600),
    (quantity: Fraction) => quantity.div(3600)
  )],
  [ASTKinds.Helek, new Unit(
    'Helek',
    ASTKinds.Helek,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(10, 3),
    (quantity: Fraction) => quantity.div(10, 3)
  )],
  [ASTKinds.Day, new Unit(
    'Day (d)',
    ASTKinds.Day,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(86400),
    (quantity: Fraction) => quantity.div(86400)
  )],
  [ASTKinds.Week, new Unit(
    'Week (w)',
    ASTKinds.Week,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(604800),
    (quantity: Fraction) => quantity.div(604800)
  )],
  [ASTKinds.Fortnight, new Unit(
    'Fortnight',
    ASTKinds.Fortnight,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(1209600),
    (quantity: Fraction) => quantity.div(1209600)
  )],
  [ASTKinds.Month, new Unit(
    'Month',
    ASTKinds.Month,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(2628000),
    (quantity: Fraction) => quantity.div(2628000)
  )],
  [ASTKinds.Year, new Unit(
    'Year (y)',
    ASTKinds.Year,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(31536000),
    (quantity: Fraction) => quantity.div(31536000)
  )],
  [ASTKinds.LeapYear, new Unit(
    'Leap Year',
    ASTKinds.LeapYear,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(31622400),
    (quantity: Fraction) => quantity.div(31622400)
  )],
  [ASTKinds.Decade, new Unit(
    'Decade',
    ASTKinds.Decade,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(315576000),
    (quantity: Fraction) => quantity.div(315576000)
  )],
  [ASTKinds.Century, new Unit(
    'Century',
    ASTKinds.Century,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(3155760000),
    (quantity: Fraction) => quantity.div(3155760000)
  )],
  [ASTKinds.Millennium, new Unit(
    'Millennium',
    ASTKinds.Millennium,
    MeasurementTypes.Time,
    (quantity: Fraction) => quantity.mul(31557600000),
    (quantity: Fraction) => quantity.div(31557600000)
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

  public setToDefault (type: MeasurementTypes): void {
    const fromKind = defaultFrom(type)
    const fromUnit = UNITS.get(fromKind)
    if (fromUnit === undefined) {
      throw new ServerError(`Unknown unit: ${fromKind}`)
    }
    this.fromUnit = fromUnit
    this.fromQuantity = new Fraction(1)

    const toKind = defaultTo(type)
    const toUnit = UNITS.get(toKind)
    if (toUnit === undefined) {
      throw new ServerError(`Unknown unit: ${toKind}`)
    }
    this.toUnit = toUnit
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

function updateUnits (type: MeasurementTypes, fromKind: ASTKinds, toKind: ASTKinds): void {
  // Find the converter tool elements
  const selectFrom = document.getElementById('converter-from-unit') as HTMLSelectElement
  if (selectFrom === null) {
    throw new ServerError('Unable to find element: converter-from-unit')
  }
  while (selectFrom.firstChild !== null) {
    selectFrom.removeChild(selectFrom.firstChild)
  }
  const selectTo = document.getElementById('converter-to-unit') as HTMLSelectElement
  if (selectTo === null) {
    throw new ServerError('Unable to find element: converter-to-unit')
  }
  while (selectTo.firstChild !== null) {
    selectTo.removeChild(selectTo.firstChild)
  }

  // Add the supported measurements to the converter tool
  for (const [key, unit] of UNITS) {
    if (unit.measurementType !== type) {
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
  updateUnits(converter.getMeasurementType(), converter.getFromUnit().kind, converter.getToUnit().kind)

  // Set the input/output values
  inputFrom.value = converter.getFromQuantity().toString()
  inputTo.value = converter.getToQuantity().toString()

  // Set the event handlers
  selectType.onchange = (e) => {
    const type = selectType.value as MeasurementTypes
    converter.setToDefault(type)
    updateUnits(type, converter.getFromUnit().kind, converter.getToUnit().kind)
    inputFrom.value = converter.getFromQuantity().toString()
    inputTo.value = converter.getToQuantity().toString()
  }
  selectFrom.onchange = (e) => {
    const unit = UNITS.get(parseInt(selectFrom.value))
    if (unit === undefined) {
      throw new ServerError(`Unknown unit: ${selectFrom.value}`)
    }
    converter.setFromUnit(unit)
    inputTo.value = converter.getToQuantity().toString()
  }
  inputFrom.oninput = (e) => {
    try {
      const quantity = new Fraction(inputFrom.value)
      converter.setFromQuantity(quantity)
      inputTo.value = converter.getToQuantity().toString()
    } catch {
      inputTo.value = ''
    }
  }
  selectTo.onchange = (e) => {
    const unit = UNITS.get(parseInt(selectTo.value))
    if (unit === undefined) {
      throw new ServerError(`Unknown unit: ${selectTo.value}`)
    }
    converter.setToUnit(unit)
    inputFrom.value = converter.getFromQuantity().toString()
  }
  inputTo.oninput = (e) => {
    try {
      const quantity = new Fraction(inputTo.value)
      converter.setToQuantity(quantity)
      inputFrom.value = converter.getFromQuantity().toString()
    } catch {
      inputFrom.value = ''
    }
  }
}

function toUnit (ast: UnitAST): Unit {
  const unit = UNITS.get(ast.kind)
  if (unit === undefined) {
    throw new ServerError(`Unhandled measurement unit: "${ast.literal}" (${ast.kind})`)
  }
  return unit
}

export function handleConversion (query: ConversionQuery): void {
  const converter = new UnitConverter(
    query.quantity.value,
    toUnit(query.fromUnit),
    toUnit(query.toUnit))
  attach(converter)
}

export function showUnitConverter (): void {
  const converter = new UnitConverter(
    new Fraction(1),
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    UNITS.get(ASTKinds.Kilobyte)!,
    UNITS.get(ASTKinds.Byte)!
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  )
  attach(converter)
}
