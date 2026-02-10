import * as interpreter from '../interpreter.js'
import * as helpers from '../helpers.js'
import * as debug from './debug_tools.js'

describe('Recognizes tokens', () => {

  test('Ident', () => {
    const lexInput = "str";
    const expectedOutput = ['SOE','str','EOE'];

    const lexOutput = debug.lexToField(lexInput,'value');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
  test('Simple expression', () => {
    const lexInput = "a+4";
    const expectedOutput = ['SOE','a','+','4','EOE'];

    const lexOutput = debug.lexToField(lexInput,'value');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
  test('Decimals', () => {
    const lexInput = "a+4+7.2";
    const expectedOutput = ['SOE','a','+','4','+','7.2','EOE'];

    const lexOutput = debug.lexToField(lexInput,'value');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
  test('Operators and brackets', () => {
    const lexInput = "+-*/^()[]{}";
    const expectedOutput = ['SOE','+','-','*','/','^','(', ')','[',']','{','}','EOE'];

    const lexOutput = debug.lexToField(lexInput,'value');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
  test('Ignores comments', () => {
    const lexInput = "var1/*com */var2 /*com*/ */var3 //com fakevar * a */\\d|a1";
    const expectedOutput = ['SOE','var1','var2','*','/','var3','EOE'];

    const lexOutput = debug.lexToField(lexInput,'value');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
});

describe('Recognizes token name', () => {
  test('Ident', () => {
    const lexInput = "str";
    const expectedOutput = ['SOE','identity','EOE'];

    const lexOutput = debug.lexToField(lexInput,'name');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
  test('Simple expression', () => {
    const lexInput = "a+4";
    const expectedOutput = ['SOE','identity','plus','decimal','EOE'];

    const lexOutput = debug.lexToField(lexInput,'name');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
  test('Decimals', () => {
    const lexInput = "a+4+7.2";
    const expectedOutput = ['SOE','identity', 'plus', 'decimal', 'plus', 'decimal','EOE'];

    const lexOutput = debug.lexToField(lexInput,'name');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
  test('Operators and brackets', () => {
    const lexInput = "+-*/^()[]{}";
    const expectedOutput = ['SOE','plus','dash','star','slash','hat','Lparenthesis',
                            'Rparenthesis','Lsquare','Rsquare','Lcurly','Rcurly','EOE'];

    const lexOutput = debug.lexToField(lexInput,'name');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
});

describe('Correctly locates positions', () => {
  test('Simple whitespaces', () => {
    const lexInput = `${' '.repeat(13)}str`;
    const expectedOutput = 13;

    const lexOutput = interpreter.lexer(lexInput)[1].position;
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
  test('Whitespaces and tokens', () => {
    const lexInput = `${' '.repeat(13)}${'a'.repeat(5)}${' '.repeat(4)}^${' '.repeat(13)}${'3'.repeat(5)}`;
    const expectedOutput = 13+5+4;

    const lexOutput = interpreter.lexer(lexInput)[2].position;
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
  test('Complex input', () => {
    const preString = '123+[pi/sin(12)] A4 ^^ 2[';
    const lexInput = preString+']dsah^da+ kasd /*] com*/';
    const expectedOutput = preString.length;

    const lexOutput = interpreter.lexer(lexInput).filter(token=>token.value==']')[1].position;
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
});

describe('Throws errors correctly', () => {
  test('Illegal character', () => {
    function erroneousCall() {
      interpreter.lexer('&');
    }
    const errorMsg = 
`Lexer encountered unexpected character at index 0

>> &
   ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });
  test('Illegal character in complex input', () => {

    const preString = '123+[pi/sin(12)] A4 ^^ 2[ /*asd@*/ sin(12)';
    
    function erroneousCall() {
      interpreter.lexer(preString+'@ lagrange++');
    }
    const errorMsg = 
`Lexer encountered unexpected character at index ${preString.length}

>> 123+[pi/sin(12)] A4 ^^ 2[ /*asd@*/ sin(12)@ lagrange++
                                             ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });
});
