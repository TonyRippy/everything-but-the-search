import { parse, ASTKinds, HELLO } from '../src/parser'

describe('Hello World parsing', () => {

  test('should work without a name', () => {
    let ret = parse('hello')
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
