import {
  parse,
  ASTKinds,
  HelloQuery,
  ConversionQuery,
  GreetingWithoutName,
  GreetingWithName,
} from '../src/parser'

import Fraction from 'fraction.js'

describe('Hello World parsing', () => {

  test('should work without a name', () => {
    let ret = parse('hello')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as GreetingWithoutName
    expect(ast.kind).toBe(ASTKinds.GreetingWithoutName)
  })

  test('should work with a trailing comma', () => {
    let ret = parse('hello,')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as HelloQuery
    expect(ast.kind).toBe(ASTKinds.GreetingWithoutName)
  })

  test('should work with punctuation', () => {
    let ret = parse('hello!!!')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as HelloQuery
    expect(ast.kind).toBe(ASTKinds.GreetingWithoutName)
  })

  test('should work with leading whitespace', () => {
    let ret = parse('  hello')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as HelloQuery
    expect(ast.kind).toBe(ASTKinds.GreetingWithoutName)
  })

  test('should work with trailing whitespace', () => {
    let ret = parse('hello  ')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as HelloQuery
    expect(ast.kind).toBe(ASTKinds.GreetingWithoutName)
  })

  test('should not work without space before name', () => {
    let ret = parse('Helloworld!')
    expect(ret.ast).toBeNull()
  })

  test('forgive a space if a comma', () => {
    let ret = parse('Hello,world')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as GreetingWithName
    expect(ast.kind).toBe(ASTKinds.GreetingWithName)
    expect(ast.name).toBe('world')
  })

  test('should capture the name', () => {
    let ret = parse('Hello, World!')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as GreetingWithName
    expect(ast.kind).toBe(ASTKinds.GreetingWithName)
    expect(ast.name).toBe('World')
  })

})

function parseFraction(input: string): Fraction {
  let ret = parse(`${input} bytes in bytes`)
  expect(ret.ast).not.toBeNull()
  let ast = ret.ast as ConversionQuery
  return ast.quantity!.value
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

  test('What is # X in Y?', () => {
    let ret = parse('What is 1 GB in bytes?')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as ConversionQuery
    expect(ast.kind).toBe(ASTKinds.ConvertXtoY)
    expect(ast.quantity).not.toBeNull();
    expect(ast.quantity?.value).toStrictEqual(new Fraction(1))
    expect(ast.fromUnit.kind).toBe(ASTKinds.Gigabyte)
    expect(ast.toUnit.kind).toBe(ASTKinds.Byte)
  })

  test('X per Y', () => {
    let ret = parse('milliseconds per second')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as ConversionQuery
    expect(ast.kind).toBe(ASTKinds.ConvertYtoX)
    expect(ast.quantity).toBeNull()
    expect(ast.fromUnit.kind).toBe(ASTKinds.Second)
    expect(ast.toUnit.kind).toBe(ASTKinds.Millisecond)
  })

})
