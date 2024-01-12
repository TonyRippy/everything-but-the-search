import { ASTKinds } from '../src/parser'
import { Unit, UnitConverter, UNITS } from '../src/conversion'

import Fraction from 'fraction.js'

describe('Numeric limits', () => {
  // TODO: Remove after https://github.com/rawify/Fraction.js/pull/74 is merged.
  // Also switch dependency in package,json back to upstream.
  test('1e12 doesn\'t overflow', () => {
    let n = new Fraction(1e12)
    expect(n.toString()).toBe('1000000000000')
  })
})

function conversionTest(fromQuantity: Fraction, fromUnit: Unit, toQuantity: Fraction, toUnit: Unit) {
  test(`${fromQuantity.toString()} ${fromUnit.name} <--> ${toQuantity.toString()} ${toUnit.name}`, () => {
    expect(fromUnit).not.toBeUndefined()
    expect(toUnit).not.toBeUndefined()
    // Test the conversion from --> to.
    let converter = new UnitConverter(fromUnit, toUnit)
    converter.setFromQuantity(fromQuantity)
    expect(converter.getToQuantity()).toStrictEqual(toQuantity)
    // Test the same conversion in reverse. (to --> from)
    converter = new UnitConverter(toUnit, fromUnit)
    converter.setFromQuantity(toQuantity)
    expect(converter.getToQuantity()).toStrictEqual(fromQuantity)
  })
}

describe('Data storage conversions', () => {
  [
    [new Fraction(0), UNITS.get(ASTKinds.Bit), new Fraction(0), UNITS.get(ASTKinds.Byte)],
    [new Fraction(5), UNITS.get(ASTKinds.Byte), new Fraction(5), UNITS.get(ASTKinds.Byte)],
    [new Fraction(1), UNITS.get(ASTKinds.Kilobyte), new Fraction(1_000), UNITS.get(ASTKinds.Byte)],
    [new Fraction(1), UNITS.get(ASTKinds.Kibibyte), new Fraction(1_024), UNITS.get(ASTKinds.Byte)],
    [new Fraction(1), UNITS.get(ASTKinds.Gibibyte), new Fraction(1_048_576), UNITS.get(ASTKinds.Kibibyte)],
    [new Fraction(1), UNITS.get(ASTKinds.Gibibyte), new Fraction(1_024), UNITS.get(ASTKinds.Mebibyte)],
    [new Fraction(1), UNITS.get(ASTKinds.Gibibyte), new Fraction(2**30), UNITS.get(ASTKinds.Byte)],
    [new Fraction(1), UNITS.get(ASTKinds.Gibibyte), new Fraction(2**30, 1e9), UNITS.get(ASTKinds.Gigabyte)],
    [new Fraction(1e-3), UNITS.get(ASTKinds.Exabyte), new Fraction(1e12), UNITS.get(ASTKinds.Kilobyte)],
  ].forEach(([fromQuantity, fromUnit, toQuantity, toUnit]) => {
    conversionTest(fromQuantity as Fraction, fromUnit as Unit, toQuantity as Fraction, toUnit as Unit)
  })
})

describe('Time conversions', () => {
  [
    [new Fraction(0), UNITS.get(ASTKinds.Minute), new Fraction(0), UNITS.get(ASTKinds.Millennium)],
    [new Fraction(1000), UNITS.get(ASTKinds.Nanosecond), new Fraction(1), UNITS.get(ASTKinds.Microsecond)],
    [new Fraction(1000), UNITS.get(ASTKinds.Microsecond), new Fraction(1), UNITS.get(ASTKinds.Millisecond)],
    [new Fraction(1000), UNITS.get(ASTKinds.Millisecond), new Fraction(1), UNITS.get(ASTKinds.Second)],
    [new Fraction(2_000_000), UNITS.get(ASTKinds.Nanosecond), new Fraction(2), UNITS.get(ASTKinds.Millisecond)],
    [new Fraction(60), UNITS.get(ASTKinds.Second), new Fraction(1), UNITS.get(ASTKinds.Minute)],
    [new Fraction(60), UNITS.get(ASTKinds.Minute), new Fraction(1), UNITS.get(ASTKinds.Hour)],
    [new Fraction(1080), UNITS.get(ASTKinds.Helek), new Fraction(1), UNITS.get(ASTKinds.Hour)],
    [new Fraction(24), UNITS.get(ASTKinds.Hour), new Fraction(1), UNITS.get(ASTKinds.Day)],
    [new Fraction(7), UNITS.get(ASTKinds.Day), new Fraction(1), UNITS.get(ASTKinds.Week)],
    [new Fraction(12), UNITS.get(ASTKinds.Month), new Fraction(1), UNITS.get(ASTKinds.Year)],
    [new Fraction(365), UNITS.get(ASTKinds.Day), new Fraction(1), UNITS.get(ASTKinds.Year)],
    [new Fraction(366), UNITS.get(ASTKinds.Day), new Fraction(1), UNITS.get(ASTKinds.LeapYear)],
    [new Fraction(10), UNITS.get(ASTKinds.Decade), new Fraction(1), UNITS.get(ASTKinds.Century)],
  ].forEach(([fromQuantity, fromUnit, toQuantity, toUnit]) => {
    conversionTest(fromQuantity as Fraction, fromUnit as Unit, toQuantity as Fraction, toUnit as Unit)
  })
})
