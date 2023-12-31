import {
  parse,
  ASTKinds,
  HELLO,
  CONVERSION,
} from '../src/parser'

import Fraction from 'fraction.js'

describe('Hello World parsing', () => {

  test('should work without a name', () => {
    let ret = parse('hello')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as HELLO
    expect(ast.kind).toBe(ASTKinds.HELLO)
    expect(ast.name).toBe('')
  })

  test('should work with punctuation', () => {
    let ret = parse('HELLO!')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as HELLO
    expect(ast.kind).toBe(ASTKinds.HELLO)
    expect(ast.name).toBe('')
  })

  test('should capture the name', () => {
    let ret = parse('Hello, World!')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as HELLO
    expect(ast.kind).toBe(ASTKinds.HELLO)
    expect(ast.name).toBe('World')
  })

})

function parseFraction(input: string): Fraction {
  let ret = parse(`${input} bytes in bytes`)
  expect(ret.ast).not.toBeNull()
  let ast = ret.ast as CONVERSION
  return ast.quantity.value
}

describe('Integer parsing', () => {
  [
    ['0', new Fraction(0)],
    ['+0', new Fraction(0)],
    ['-0', new Fraction(-0)],
    ['123', new Fraction(123)],
    ['+123', new Fraction(123)],
    ['-123', new Fraction(-123)],
  ].forEach(([input, expected]) => {
    test(input as string, () => {
      expect(parseFraction(input as string)).toStrictEqual(expected)
    })
  })
})

describe('Decimal parsing', () => {
  [
    ['3.14159', new Fraction(314159, 100000)],
    ['+3.14159', new Fraction(314159, 100000)],
    ['-3.14159', new Fraction(-314159, 100000)],
    ['.14159', new Fraction(14159, 100000)],
    ['+.14159', new Fraction(14159, 100000)],
    ['-.14159', new Fraction(-14159, 100000)],
    ['0.14159', new Fraction(14159, 100000)],
    ['+0.14159', new Fraction(14159, 100000)],
    ['-0.14159', new Fraction(-14159, 100000)],
  ].forEach(([input, expected]) => {
    test(input as string, () => {
      expect(parseFraction(input as string)).toStrictEqual(expected)
    })
  })
})

describe('Scientific number parsing', () => {
  [
    ['1e6', new Fraction(1000000)],
    ['+1e6', new Fraction(1000000)],
    ['-1e6', new Fraction(-1000000)],
    ['1e-6', new Fraction(1, 1000000)],
    ['+1e-6', new Fraction(1, 1000000)],
    ['-1e-6', new Fraction(-1, 1000000)],
    ['1.2e-6', new Fraction(12, 10000000)],
    ['1.1e6', new Fraction(1100000)],
    ['+1.1e6', new Fraction(1100000)],
    ['-1.1e6', new Fraction(-1100000)],
    ['.1e6', new Fraction(100000)],
    ['+.1e6', new Fraction(100000)],
    ['-.1e6', new Fraction(-100000)],
    ['1.234e2', new Fraction(1234, 10)],
  ].forEach(([input, expected]) => {
    test(input as string, () => {
      expect(parseFraction(input as string)).toStrictEqual(expected)
    })
  })
})

describe('Conversion parsing', () => {

  test('full sentence', () => {
    let ret = parse('What is 1 GB in bytes?')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as CONVERSION
    expect(ast.kind).toBe(ASTKinds.CONVERSION)
    expect(ast.quantity.value).toStrictEqual(new Fraction(1))
    expect(ast.from_unit.kind).toBe(ASTKinds.gigabyte)
    expect(ast.to_unit.kind).toBe(ASTKinds.byte)
  })

})