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
    [new Fraction(0), UNITS.get(ASTKinds.bit), new Fraction(0), UNITS.get(ASTKinds.byte)],
    [new Fraction(5), UNITS.get(ASTKinds.byte), new Fraction(5), UNITS.get(ASTKinds.byte)],
    [new Fraction(1), UNITS.get(ASTKinds.kilobyte), new Fraction(1_000), UNITS.get(ASTKinds.byte)],
    [new Fraction(1), UNITS.get(ASTKinds.kibibyte), new Fraction(1_024), UNITS.get(ASTKinds.byte)],
    [new Fraction(1), UNITS.get(ASTKinds.gibibyte), new Fraction(1_048_576), UNITS.get(ASTKinds.kibibyte)],
    [new Fraction(1), UNITS.get(ASTKinds.gibibyte), new Fraction(1_024), UNITS.get(ASTKinds.mebibyte)],
    [new Fraction(1), UNITS.get(ASTKinds.gibibyte), new Fraction(2**30), UNITS.get(ASTKinds.byte)],
    [new Fraction(1), UNITS.get(ASTKinds.gibibyte), new Fraction(2**30, 1e9), UNITS.get(ASTKinds.gigabyte)],
    [new Fraction(1e-3), UNITS.get(ASTKinds.exabyte), new Fraction(1e12), UNITS.get(ASTKinds.kilobyte)],
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