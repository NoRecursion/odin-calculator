import * as interpreter from '../interpreter.js'
import * as helpers from '../helpers.js'

function logTestLexer(inp, func){
  console.log(`testing: ${inp}`);
  console.log(func(inp));
  return;
}

describe('Recognizes tokens', () => {

  test('recognises ident', () => {
    expect(1).toStrictEqual(1);
  });
});