import {
  parse,
  ASTKinds,
  HelloQuery,
  ConversionQuery,
  GreetingWithoutName,
  GreetingWithName,
  Query,
} from '../src/parser'

import Fraction from 'fraction.js'

function expectParse(input: string): Query {
  let ret = parse(input)
  expect(ret.errs).toStrictEqual([])
  expect(ret.ast).not.toBeNull()
  return ret.ast!
}

function expectParseFailure(input: string) {
  let ret = parse(input)
  expect(ret.errs).not.toStrictEqual([])
  expect(ret.ast).toBeNull()
}

describe('Hello World parsing', () => {

  test('should work without a name', () => {
    let ast = expectParse('hello') as GreetingWithoutName
    expect(ast.kind).toBe(ASTKinds.GreetingWithoutName)
  })

  test('should work with a trailing comma', () => {
    let ast = expectParse('hello,') as HelloQuery
    expect(ast.kind).toBe(ASTKinds.GreetingWithoutName)
  })

  test('should work with punctuation', () => {
    let ast = expectParse('hello!!!') as HelloQuery
    expect(ast.kind).toBe(ASTKinds.GreetingWithoutName)
  })

  test('should work with leading whitespace', () => {
    let ast = expectParse('  hello') as HelloQuery
    expect(ast.kind).toBe(ASTKinds.GreetingWithoutName)
  })

  test('should work with trailing whitespace', () => {
    let ast = expectParse('hello  ') as HelloQuery
    expect(ast.kind).toBe(ASTKinds.GreetingWithoutName)
  })

  test('should not work without space before name', () => {
    expectParseFailure('Helloworld!')
  })

  test('forgive a space if a comma', () => {
    let ast = expectParse('Hello,world') as GreetingWithName
    expect(ast.kind).toBe(ASTKinds.GreetingWithName)
    expect(ast.name).toBe('world')
  })

  test('should capture the name', () => {
    let ast = expectParse('Hello, World!') as GreetingWithName
    expect(ast.kind).toBe(ASTKinds.GreetingWithName)
    expect(ast.name).toBe('World')
  })

})

function parseFraction(input: string): Fraction {
  let ast = expectParse(`${input} bytes in bytes`) as ConversionQuery
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
    let ast = expectParse('What is 1 GB in bytes?') as ConversionQuery
    expect(ast.kind).toBe(ASTKinds.ConvertXtoY)
    expect(ast.quantity).not.toBeNull()
    expect(ast.quantity?.value).toStrictEqual(new Fraction(1))
    expect(ast.fromUnit.kind).toBe(ASTKinds.Gigabyte)
    expect(ast.toUnit.kind).toBe(ASTKinds.Byte)
  })

  test('X per Y', () => {
    let ast = expectParse('milliseconds per second') as ConversionQuery
    expect(ast.kind).toBe(ASTKinds.ConvertYtoX)
    expect(ast.quantity).toBeNull()
    expect(ast.fromUnit.kind).toBe(ASTKinds.Second)
    expect(ast.toUnit.kind).toBe(ASTKinds.Millisecond)
  })

  test('Y per X', () => {
    // If the order of precedence is wrong, the parser will
    // choose "y" from "yd" and assume it is years.
    let ast = expectParse('ft per yd') as ConversionQuery
    expect(ast.kind).toBe(ASTKinds.ConvertYtoX)
    expect(ast.quantity).toBeNull()
    expect(ast.fromUnit.kind).toBe(ASTKinds.Yard)
    expect(ast.toUnit.kind).toBe(ASTKinds.Foot)

    ast = expectParse('d per y') as ConversionQuery
    expect(ast.kind).toBe(ASTKinds.ConvertYtoX)
    expect(ast.quantity).toBeNull()
    expect(ast.fromUnit.kind).toBe(ASTKinds.Year)
    expect(ast.toUnit.kind).toBe(ASTKinds.Day)

    ast = expectParse('How many seconds are in a minute?') as ConversionQuery
    expect(ast.kind).toBe(ASTKinds.ConvertYtoX)
    expect(ast.quantity).not.toBeNull()
    expect(ast.fromUnit.kind).toBe(ASTKinds.Minute)
    expect(ast.toUnit.kind).toBe(ASTKinds.Second)
  })

})
