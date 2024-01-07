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

describe('Data storage', () => {
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
    test(`${(fromQuantity as Fraction).toString()} ${(fromUnit as Unit).name} <--> ${(toQuantity as Fraction).toString()} ${(toUnit as Unit).name}`, () => {
      expect(fromUnit).not.toBeUndefined()
      expect(toUnit).not.toBeUndefined()
      let converter = new UnitConverter(fromQuantity as Fraction, fromUnit as Unit, toUnit as Unit)
      expect(converter.getToQuantity()).toStrictEqual(toQuantity)
      converter = new UnitConverter(toQuantity as Fraction, toUnit as Unit, fromUnit as Unit)
      expect(converter.getToQuantity()).toStrictEqual(fromQuantity)
    })
  })
})
