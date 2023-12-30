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

import { ASTKinds, CONVERSION } from "./parser"
import Fraction from "fraction.js"

// #[derive(Debug, PartialEq)]
// enum BaseUnit {
//     Bytes,
// }

// struct Unit {
//     name: String,
//     base: BaseUnit,
//     quantity: Rational64,
// }

// fn format_ratio(n: i64, d: i64) -> String {
//   let (whole, remainder) = n.div_rem(&d);
//   if remainder == 0 {
//       return whole.to_string();
//   }
//   if whole == 0 {
//       return format!("{}/{}", n, d);  
//   }

//     //         format!("{} {}/{}", whole, remainder, d)
//     //     }
//     // } else {
//     // if d % 2 == 0 {
//     // }

//     //     format!("{}/{}", ratio.numer(), ratio.denom())
//     // }
// }

// fn parse_integer(pair: Pair<Rule>) -> Result<i64, ParseIntError> {
//     debug_assert_eq!(pair.as_rule(), Rule::integer);
//     pair.as_str().parse::<i64>()
// }

// fn calc_decimal(whole: i64, fraction: &str) -> Result<Rational64, std::num::ParseIntError> {
//     let fraction_digits = fraction.len() as u32;
//     let fraction = fraction.parse::<i64>()?;
//     let denominator = 10i64.pow(fraction_digits);
//     Ok(num_rational::Rational64::new(
//         whole * denominator + fraction,
//         denominator,
//     ))
// }

// fn parse_decimal(pair: Pair<Rule>) -> Result<Rational64, ParseIntError> {
//     debug_assert_eq!(pair.as_rule(), Rule::decimal);
//     let mut inner = pair.into_inner();
//     match (inner.next(), inner.next()) {
//         (Some(first), Some(second)) => {
//             debug_assert_eq!(first.as_rule(), Rule::digits);
//             debug_assert_eq!(second.as_rule(), Rule::digits);
//             calc_decimal(first.as_str().parse::<i64>()?, second.as_str())
//         }
//         (Some(second), None) => {
//             debug_assert_eq!(second.as_rule(), Rule::digits);
//             calc_decimal(0, second.as_str())
//         }
//         _ => unreachable!(),
//     }
// }

// fn parse_scientific(pair: Pair<Rule>) -> Result<Rational64, ParseIntError> {
//     debug_assert_eq!(pair.as_rule(), Rule::scientific);
//     let mut inner = pair.into_inner();
//     let first = inner.next().unwrap();
//     let first = match first.as_rule() {
//         Rule::integer => num_rational::Rational64::from_integer(parse_integer(first)?),
//         Rule::decimal => parse_decimal(first)?,
//         _ => unreachable!(),
//     };

//     let second = inner.next().unwrap();
//     debug_assert_eq!(second.as_rule(), Rule::exponent);
//     let second = second.as_str().parse::<i64>()?;
//     debug_assert!(inner.next().is_none());
//     Ok(first
//         * if second < 0 {
//             num_rational::Rational64::new(1, 10i64.pow(-second as u32))
//         } else {
//             num_rational::Rational64::new(10i64.pow(second as u32), 1)
//         })
// }

// fn parse_number_without_sign(pair: Pair<Rule>) -> Result<Rational64, ParseIntError> {
//     match pair.as_rule() {
//         Rule::integer => Ok(num_rational::Rational64::from_integer(parse_integer(pair)?)),
//         Rule::decimal => parse_decimal(pair),
//         Rule::scientific => parse_scientific(pair),
//         _ => unreachable!(),
//     }
// }

// fn parse_number(pair: Pair<Rule>) -> Result<Rational64, ParseIntError> {
//     debug_assert_eq!(pair.as_rule(), Rule::number);
//     let mut inner = pair.into_inner();
//     let pair = inner.next().unwrap();
//     if pair.as_rule() == Rule::sign {
//         let negative = pair.as_str() == "-";
//         let number = parse_number_without_sign(inner.next().unwrap())?;
//         Ok(if negative { -number } else { number })
//     } else {
//         parse_number_without_sign(pair)
//     }
// }

// fn parse_unit(pair: Pair<Rule>) -> Result<Unit, String> {
//     debug_assert_eq!(pair.as_rule(), Rule::unit);
//     let pair = pair.into_inner().next().unwrap();
//     match pair.as_rule() {
//         Rule::bit => Ok(Unit {
//             name: "bit".to_string(),
//             base: BaseUnit::Bytes,
//             quantity: Ratio::new(1, 8),
//         }),
//         Rule::byte => Ok(Unit {
//             name: "byte".to_string(),
//             base: BaseUnit::Bytes,
//             quantity: Ratio::new(1, 1),
//         }),
//         Rule::kilobyte => Ok(Unit {
//             name: "kilobyte".to_string(),
//             base: BaseUnit::Bytes,
//             quantity: Ratio::new(1_000, 1),
//         }),
//         Rule::megabyte => Ok(Unit {
//             name: "megabyte".to_string(),
//             base: BaseUnit::Bytes,
//             quantity: Ratio::new(1_000_000, 1),
//         }),
//         Rule::gigabyte => Ok(Unit {
//             name: "gigabyte".to_string(),
//             base: BaseUnit::Bytes,
//             quantity: Ratio::new(1_000_000_000, 1),
//         }),
//         x => Err(format!("unknown unit: {:?}", x)),
//     }
// }

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

// pub fn try_query(query: &str) -> Result<String, String> {
//     match QueryParser::parse(Rule::query, query) {
//         Ok(mut pairs) => {
//             dbg!(&pairs);
//             let pair = pairs.next().unwrap();
//             match pair.as_rule() {
//                 Rule::conversion => try_convert(pair.into_inner()),
//                 _ => unreachable!(),
//             }
//         }
//         Err(e) => Err(format!("error while parsing query {:?}: {}", query, e)),
//     }
// }

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn test_parse_decimal() {
//         for (input, expected) in &[
//             ("3.14159", Ratio::new(3_14159, 1_00000)),
//             (".14159", Ratio::new(14159, 1_00000)),
//             ("0.14159", Ratio::new(14159, 1_00000)),
//         ] {
//             let actual = parse_decimal(
//                 QueryParser::parse(Rule::decimal, input)
//                     .expect("unable to parse input")
//                     .next()
//                     .expect("no pairs produced by parser"),
//             );
//             assert_eq!(Ok(*expected), actual, "with input: {:?}", input);
//         }
//     }

//     #[test]
//     fn test_parse_scientific() {
//         for (input, expected) in &[
//             ("1e6", Ratio::new(1_000_000, 1)),
//             (".1e6", Ratio::new(100_000, 1)),
//             ("1.1e6", Ratio::new(1_100_000, 1)),
//             ("1.234e2", Ratio::new(1_234, 10)),
//             ("1e-6", Ratio::new(1, 1_000_000)),
//             ("1.2e-6", Ratio::new(12, 10_000_000)),
//         ] {
//             let actual = parse_scientific(
//                 QueryParser::parse(Rule::scientific, input)
//                     .expect("unable to parse input")
//                     .next()
//                     .expect("no pairs produced by parser"),
//             );
//             assert_eq!(Ok(*expected), actual, "with input: {:?}", input);
//         }
//     }

//     #[test]
//     fn test_parse_number() {
//         for (input, expected) in &[
//             ("3", Ratio::new(3, 1)),
//             ("-3", Ratio::new(-3, 1)),
//             ("+3", Ratio::new(3, 1)),
//             ("3.14159", Ratio::new(3_14159, 1_00000)),
//             (".14159", Ratio::new(14159, 1_00000)),
//             ("0.14159", Ratio::new(14159, 1_00000)),
//             ("-3.14159", Ratio::new(-3_14159, 1_00000)),
//             ("-.14159", Ratio::new(-14159, 1_00000)),
//             ("-0.14159", Ratio::new(-14159, 1_00000)),
//             ("+3.14159", Ratio::new(3_14159, 1_00000)),
//             ("+.14159", Ratio::new(14159, 1_00000)),
//             ("+0.14159", Ratio::new(14159, 1_00000)),
//             ("1e6", Ratio::new(1_000_000, 1)),
//             ("+1e6", Ratio::new(1_000_000, 1)),
//             ("-1e6", Ratio::new(-1_000_000, 1)),
//             ("1e-6", Ratio::new(1, 1_000_000)),
//             ("+1e-6", Ratio::new(1, 1_000_000)),
//             ("-1e-6", Ratio::new(-1, 1_000_000)),
//         ] {
//             let actual = parse_number(
//                 QueryParser::parse(Rule::number, input)
//                     .expect("unable to parse input")
//                     .next()
//                     .expect("no pairs produced by parser"),
//             );
//             assert_eq!(Ok(*expected), actual, "with input: {:?}", input);
//         }
//     }

//     #[test]
//     fn test_bad_query() {
//         for input in &["", "foo", "bar", "baz"] {
//             let actual = try_query(input);
//             assert!(actual.is_err(), "with input: {:?}", input);
//         }
//     }

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

function convertParsed(quantity: Fraction, from: string, to: string) {
  console.log('Conversion')
}

export function convert(query: CONVERSION) {
  return convertParsed(query.quantity.value, query.from_unit, query.to_unit)
}
