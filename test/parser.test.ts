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

function parseUnit(input: string): ASTKinds {
  let ast = expectParse(`${input} per inch`) as ConversionQuery
  return ast.toUnit.kind
}

describe('Data storage unit parsing', () => {
  [
    ['bit', ASTKinds.Bit],
    ['bits', ASTKinds.Bit],
    ['nibble', ASTKinds.Nibble],
    ['nibbles', ASTKinds.Nibble],
    ['b', ASTKinds.Byte],
    ['byte', ASTKinds.Byte],
    ['bytes', ASTKinds.Byte],
    ['kB', ASTKinds.Kilobyte],
    ['kilobyte', ASTKinds.Kilobyte],
    ['kilobytes', ASTKinds.Kilobyte],
    ['mb', ASTKinds.Megabyte],
    ['MB', ASTKinds.Megabyte],
    ['megabyte', ASTKinds.Megabyte],
    ['megabytes', ASTKinds.Megabyte],
    ['gb', ASTKinds.Gigabyte],
    ['gigabyte', ASTKinds.Gigabyte],
    ['gigabytes', ASTKinds.Gigabyte],
    ['tb', ASTKinds.Terabyte],
    ['TB', ASTKinds.Terabyte],
    ['terabyte', ASTKinds.Terabyte],
    ['terabytes', ASTKinds.Terabyte],
    ['pb', ASTKinds.Petabyte],
    ['petabyte', ASTKinds.Petabyte],
    ['petabytes', ASTKinds.Petabyte],
    ['eb', ASTKinds.Exabyte],
    ['exabyte', ASTKinds.Exabyte],
    ['exabytes', ASTKinds.Exabyte],
    ['kib', ASTKinds.Kibibyte],
    ['kibibyte', ASTKinds.Kibibyte],
    ['kibibytes', ASTKinds.Kibibyte],
    ['mib', ASTKinds.Mebibyte],
    ['MiB', ASTKinds.Mebibyte],
    ['mebibyte', ASTKinds.Mebibyte],
    ['mebibytes', ASTKinds.Mebibyte],
    ['gib', ASTKinds.Gibibyte],
    ['GiB', ASTKinds.Gibibyte],
    ['gibibyte', ASTKinds.Gibibyte],
    ['gibibytes', ASTKinds.Gibibyte],
    ['tib', ASTKinds.Tebibyte],
    ['TiB', ASTKinds.Tebibyte],
    ['tebibyte', ASTKinds.Tebibyte],
    ['tebibytes', ASTKinds.Tebibyte],
    ['pib', ASTKinds.Pebibyte],
    ['pebibyte', ASTKinds.Pebibyte],
    ['pebibytes', ASTKinds.Pebibyte],
    ['eib', ASTKinds.Exbibyte],
    ['exbibyte', ASTKinds.Exbibyte],
    ['exbibytes', ASTKinds.Exbibyte],
  ].forEach(([input, expected]) => {
    test(input as string, () => {
      expect(parseUnit(input as string)).toBe(expected)
    })
  })
})

describe('Time unit parsing', () => {
  [
    ['s', ASTKinds.Second],
    ['sec', ASTKinds.Second],
    ['secs', ASTKinds.Second],
    ['second', ASTKinds.Second],
    ['seconds', ASTKinds.Second],
    ['ms', ASTKinds.Millisecond],
    ['millisecond', ASTKinds.Millisecond],
    ['milliseconds', ASTKinds.Millisecond],
    ['μs', ASTKinds.Microsecond],
    ['us', ASTKinds.Microsecond],
    ['microsecond', ASTKinds.Microsecond],
    ['microseconds', ASTKinds.Microsecond],
    ['ns', ASTKinds.Nanosecond],
    ['nanosecond', ASTKinds.Nanosecond],
    ['nanoseconds', ASTKinds.Nanosecond],
    ['min', ASTKinds.Minute],
    ['mins', ASTKinds.Minute],
    ['minute', ASTKinds.Minute],
    ['minutes', ASTKinds.Minute],
    ['hour', ASTKinds.Hour],
    ['hours', ASTKinds.Hour],
    ['day', ASTKinds.Day],
    ['days', ASTKinds.Day],
    ['week', ASTKinds.Week],
    ['weeks', ASTKinds.Week],
    ['month', ASTKinds.Month],
    ['months', ASTKinds.Month],
    ['year', ASTKinds.Year],
    ['years', ASTKinds.Year],
    ['leapyear', ASTKinds.LeapYear],
    ['leap year', ASTKinds.LeapYear],
    ['leap years', ASTKinds.LeapYear],
    ['decade', ASTKinds.Decade],
    ['decades', ASTKinds.Decade],
    ['century', ASTKinds.Century],
    ['centuries', ASTKinds.Century],
    ['millennium', ASTKinds.Millennium],
    ['millennia', ASTKinds.Millennium],
    ['helek', ASTKinds.Helek],
    ['chelek', ASTKinds.Helek],
    ['חלק', ASTKinds.Helek],
  ].forEach(([input, expected]) => {
    test(input as string, () => {
      expect(parseUnit(input as string)).toBe(expected)
    })
  })
})

describe('Length unit parsing', () => {
  [
    ['inch', ASTKinds.Inch],
    ['inches', ASTKinds.Inch],
    ['in', ASTKinds.Inch],
    ['foot', ASTKinds.Foot],
    ['feet', ASTKinds.Foot],
    ['ft', ASTKinds.Foot],
    ['yard', ASTKinds.Yard],
    ['yards', ASTKinds.Yard],
    ['yd', ASTKinds.Yard],
    ['mi', ASTKinds.Mile],
    ['mile', ASTKinds.Mile],
    ['miles', ASTKinds.Mile],
    ['meter', ASTKinds.Meter],
    ['meters', ASTKinds.Meter],
    ['metre', ASTKinds.Meter],
    ['metres', ASTKinds.Meter],
    ['m', ASTKinds.Meter],
    ['cm', ASTKinds.Centimeter],
    ['centimeter', ASTKinds.Centimeter],
    ['centimeters', ASTKinds.Centimeter],
    ['centimetre', ASTKinds.Centimeter],
    ['centimetres', ASTKinds.Centimeter],
    ['mm', ASTKinds.Millimeter],
    ['millimeter', ASTKinds.Millimeter],
    ['millimeters', ASTKinds.Millimeter],
    ['millimetre', ASTKinds.Millimeter],
    ['millimetres', ASTKinds.Millimeter],
    ['nm', ASTKinds.Nanometer],
    ['nanometer', ASTKinds.Nanometer],
    ['nanometers', ASTKinds.Nanometer],
    ['nanometre', ASTKinds.Nanometer],
    ['nanometres', ASTKinds.Nanometer],
    ['um', ASTKinds.Micrometer],
    ['μm', ASTKinds.Micrometer],
    ['micrometer', ASTKinds.Micrometer],
    ['micrometers', ASTKinds.Micrometer],
    ['micrometre', ASTKinds.Micrometer],
    ['micrometres', ASTKinds.Micrometer],
    ['dam', ASTKinds.Decameter],
    ['decameter', ASTKinds.Decameter],
    ['decameters', ASTKinds.Decameter],
    ['decametre', ASTKinds.Decameter],
    ['decametres', ASTKinds.Decameter],
    ['hm', ASTKinds.Hectometer],
    ['hectometer', ASTKinds.Hectometer],
    ['hectometers', ASTKinds.Hectometer],
    ['hectometre', ASTKinds.Hectometer],
    ['hectometres', ASTKinds.Hectometer],
    ['km', ASTKinds.Kilometer],
    ['kilometer', ASTKinds.Kilometer],
    ['kilometers', ASTKinds.Kilometer],
    ['kilometre', ASTKinds.Kilometer],
    ['kilometres', ASTKinds.Kilometer],
  ].forEach(([input, expected]) => {
    test(input as string, () => {
      expect(parseUnit(input as string)).toBe(expected)
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
