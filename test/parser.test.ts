import { parse, ASTKinds, HELLO } from '../src/parser'

// import * as chai from 'chai'

// const expect = chai.expect

describe('Parser', () => {

  test('should capture the name', () => {
  // it('should capture the name in a Hello, World query', async () => {
    let ret = parse('Hello, World!')
    expect(ret.ast).not.toBeNull()
    let ast = ret.ast as HELLO
    expect(ast.kind).toBe(ASTKinds.HELLO)
    expect(ast.name).toBe('World')
  })

})
