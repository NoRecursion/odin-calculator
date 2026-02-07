import * as interpreter from '../interpreter.js'
import * as helpers from '../helpers.js'
import * as debug from './debug_tools.js'



describe('Recognizes tokens', () => {

  test('recognises ident', () => {
    const lexInput = "str";
    const expectedOutput = ['SOE','str','EOE'];

    const lexOutput = debug.lexToFields(lexInput,'value');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
    test('recognizes simple expression', () => {
    const lexInput = "a+4";
    const expectedOutput = ['SOE','a','+','4','EOE'];

    const lexOutput = debug.lexToFields(lexInput,'value');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
    test('recognizes decimals', () => {
    const lexInput = "a+4+7.2";
    const expectedOutput = ['SOE','a','+','4','+','7.2','EOE'];

    const lexOutput = debug.lexToFields(lexInput,'value');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
    test('recognizes operators and brackets', () => {
    const lexInput = "+-*/^()[]{}";
    const expectedOutput = ['SOE','+','-','*','/','^','(', ')','[',']','{','}','EOE'];

    const lexOutput = debug.lexToFields(lexInput,'value');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
    test('ignores comments', () => {
    const lexInput = "var1/*com */var2 /*com*/ */var3 //com fakevar * a */\\d|a1";
    const expectedOutput = ['SOE','var1','var2','*','/','var3','EOE'];

    const lexOutput = debug.lexToFields(lexInput,'value');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
});

describe('Recognizes token name', () => {
  test('recognises ident', () => {
    const lexInput = "str";
    const expectedOutput = ['SOE','identity','EOE'];

    const lexOutput = debug.lexToFields(lexInput,'name');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
    test('recognizes simple expression', () => {
    const lexInput = "a+4";
    const expectedOutput = ['SOE','identity','plus','decimal','EOE'];

    const lexOutput = debug.lexToFields(lexInput,'name');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
    test('recognizes decimals', () => {
    const lexInput = "a+4+7.2";
    const expectedOutput = ['SOE','identity', 'plus', 'decimal', 'plus', 'decimal','EOE'];

    const lexOutput = debug.lexToFields(lexInput,'name');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
    test('recognizes operators and brackets', () => {
    const lexInput = "+-*/^()[]{}";
    const expectedOutput = ['SOE','plus','dash','star','slash','hat','Lparenthesis',
                            'Rparenthesis','Lsquare','Rsquare','Lcurly','Rcurly','EOE'];

    const lexOutput = debug.lexToFields(lexInput,'name');
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
});

describe('Correctly locates positions', () => {
  test('simple whitespaces', () => {
    const lexInput = `${' '.repeat(13)}str`;
    const expectedOutput = 13;

    const lexOutput = interpreter.lexer(lexInput)[1].position;
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
  test('whitespaces and tokens', () => {
    const lexInput = `${' '.repeat(13)}${'a'.repeat(5)}${' '.repeat(4)}^${' '.repeat(13)}${'3'.repeat(5)}`;
    const expectedOutput = 13+5+4;

    const lexOutput = interpreter.lexer(lexInput)[2].position;
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
  test('complex input', () => {
    const preString = '123+[pi/sin(12)] A4 ^^ 2[';
    const lexInput = preString+']dsah^da+ kasd /*] com*/';
    const expectedOutput = preString.length;

    const lexOutput = interpreter.lexer(lexInput).filter(token=>token.value==']')[1].position;
    expect(lexOutput).toStrictEqual(expectedOutput);
  });
});

describe('Throws errors correctly', () => {
  test('simple whitespaces', () => {
    function erroneousCall() {
      interpreter.lexer('&');
    }
    const errorMsg = 
`Unexpected token found at index 0

>> &
   ^`;

    expect(erroneousCall).toThrow(new helpers.LexerError(errorMsg));
  });
  test('simple whitespaces', () => {

    const preString = '123+[pi/sin(12)] A4 ^^ 2[ /*asd@*/ sin(12)';
    
    function erroneousCall() {
      interpreter.lexer(preString+'@ lagrange++');
    }
    const errorMsg = 
`Unexpected token found at index ${preString.length}

>> 123+[pi/sin(12)] A4 ^^ 2[ /*asd@*/ sin(12)@ lagrange++
                                             ^`;

    expect(erroneousCall).toThrow(new helpers.LexerError(errorMsg));
  });
});
