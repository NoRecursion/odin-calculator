import * as interpreter from '../interpreter.js'
import * as helpers from '../helpers.js'
import * as debug from './debug_tools.js'
import { opFuncs } from '../rulesets.js';


describe('Parses correct expressions', () => {

  test('Parses simple expression', () => {
    const text = "b+5";
    const expectedOutput = [ [ 'root' ], [ null, opFuncs.add ], [ 'b', 5 ]];

    const parseOutput = debug.parseToFields(text, node=>node.obj);
    expect(parseOutput).toStrictEqual(expectedOutput);
  });

  test('Orders operations correctly', () => {
    const text = "a-2^3+d/5*f";
    const expectedOutput = [ 
      [ 'root' ], 
      [ null, opFuncs.add ],                      //  a-2^3       [+]  d/5*f
      [ opFuncs.sub, opFuncs.mult ],              //  a [-] 2^3    #   d/5     [*] f
      [ 'a', opFuncs.exp, opFuncs.divide, 'f' ],  // [a] # 2 [^] 3 #   d [/] 5  # [f]
      [ null, null, 2, 3, 'd', 5, null, null ] 
    ];

    const parseOutput = debug.parseToFields(text, node=>node.obj);
    expect(parseOutput).toStrictEqual(expectedOutput);
  });

  test('Handles unary minus', () => {
    const text = "-2^3+4^-5";
    const expectedOutput = [ 
      [ 'root' ], 
      [ null, opFuncs.add ],                          //  -2^3     [+]  4^-5
      [ opFuncs.invertSign, opFuncs.exp ],            //  [-] 2^3   #   4 [^] -5
      [ null, opFuncs.exp, 4, opFuncs.invertSign ],   //   2 [^] 3  #  [4] # [-] 5
      [ 2, 3, null, null, null, 5 ]
    ];

    const parseOutput = debug.parseToFields(text, node=>node.obj);
    expect(parseOutput).toStrictEqual(expectedOutput);
  });

  test('Handles nested minuses', () => {
    const text = "-1----2";
    const expectedOutput = [ 
      [ 'root' ], 
      [ null, opFuncs.sub ],                        //  -1    [-] ---2
      [ opFuncs.invertSign, opFuncs.invertSign ],   //  [-] 1  # -- [-] 2
      [ null, 1, null, opFuncs.invertSign ],        //     [1] # - [-] 2
      [ null, null, null, opFuncs.invertSign ],     //  [-] 2
      [ null, 2 ]
    ];

    const parseOutput = debug.parseToFields(text, node=>node.obj);
    expect(parseOutput).toStrictEqual(expectedOutput);
  });

  test('Handles nested parentheses', () => {
    const text = "1^((3+4)*5/(6-7))";
    const expectedOutput = [ 
      [ 'root' ], 
      [ null, opFuncs.exp ],                          //  1 [^] ((3+4)*5/(6-7))
      [ 1 , opFuncs.divide ],                         // [1] # (3+4)*5 [/] 6-7
      [ null, null, opFuncs.mult, opFuncs.sub ],      // 3+4 [*] 5 # 6 [-] 7
      [ opFuncs.add, 5, 6, 7 ],                       // 3 [+] 4 # [5] # [6] # [7]
      [3, 4, null, null, null, null, null, null ] 
    ];

    const parseOutput = debug.parseToFields(text, node=>node.obj);
    expect(parseOutput).toStrictEqual(expectedOutput);
  });

  test('Recognises ident', () => {
    const text = "(1,(2,3,(4,5)),6)";
    const expectedOutput = [ 
      [ 'root' ],
      [ null, opFuncs.extendTuple ],                                    //  (1,(2,3,(4,5)) [,] 6)
      [ opFuncs.startTuple, 6 ],                                        //  (1 [,] (2,3,(4,5)) # [6]
      [ 1, opFuncs.extendTuple, null, null ],                           //  [1] #  (2,3 [,] (4,5))
      [ null, null, opFuncs.startTuple, opFuncs.startTuple ],           //  2 [,] 3 #  (4 [,] 5)
      [ 2, 3, 4, 5 ]
    ];

    const parseOutput = debug.parseToFields(text, node=>node.obj);
    expect(parseOutput).toStrictEqual(expectedOutput);
  });

  test('Handles function calls', () => {
    const text = "f()+g(a)+h(1,2,3)";
    const expectedOutput = [
      [ 'root' ],
      [ null, opFuncs.add ],                                            //  f() + g(a) [+] h(1,2,3)
      [ opFuncs.add, opFuncs.fcall ],                                   //  f() [+] g(a) # h [(] 1,2,3)
      [ opFuncs.fcall,  opFuncs.fcall, "h", opFuncs.extendTuple ],      //  f [(] ) # g [(] a ) # [h] # 1,2 [,] 3 )
      [ "f", null, "g", "a", null, null, opFuncs.startTuple, 3 ],       // [f] # [g] # [a] # 1 [,] 2 # [3]
      [ null, null, null, null, null, null, 1 ,2, null, null ]
    ];

    const parseOutput = debug.parseToFields(text, node=>node.obj);
    expect(parseOutput).toStrictEqual(expectedOutput);
  }); 
});



describe('Throws errors correctly', () => {
  test('Empty expression', () => {

    const text = "";

    function erroneousCall() {
      interpreter.parser(interpreter.lexer(text),text);
    }
    const errorMsg = 
`Parser encountered empty input. Please provide an expression.

>> 
   ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });

  test('Illegal start', () => {

    const text = "*3";

    function erroneousCall() {
      interpreter.parser(interpreter.lexer(text),text);
    }
    const errorMsg = 
`Parser encountered unexpected token '*' at start of expression

>> *3
   ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });

  test('Consecutive operators', () => {

      const text = "1*+2";

      function erroneousCall() {
        interpreter.parser(interpreter.lexer(text),text);
      }
      const errorMsg = 
`Parser encountered unexpected token '+' passed to '*' operator

>> 1*+2
     ^`;

      expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
    });

  test('Consecutive literals', () => {

    const text = "1+2 C";

    function erroneousCall() {
      interpreter.parser(interpreter.lexer(text),text);
    }
    const errorMsg = 
`Parser encountered unexpected token 'C' passed after literal '2'

>> 1+2 C
       ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });

  test('Missing open parenthesis', () => {

    const text = "1+(2-4";

    function erroneousCall() {
      interpreter.parser(interpreter.lexer(text),text);
    }
    const errorMsg = 
`Parser found open bracket with no matching closing bracket

>> 1+(2-4
     ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });

  test('Missing open parenthesis', () => {

    const text = "(1+2)-4)";

    function erroneousCall() {
      interpreter.parser(interpreter.lexer(text),text);
    }
    const errorMsg = 
`Parser encountered ')' with no matching open bracket

>> (1+2)-4)
          ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });

  test('Open parenthesis followed by operator', () => {

    const text = "1+(*2-4)";

    function erroneousCall() {
      interpreter.parser(interpreter.lexer(text),text);
    }
    const errorMsg = 
`Parser encountered unexpected token '*' passed after '('

>> 1+(*2-4)
      ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });

  test('Close parenthesis followed by literal', () => {

    const text = "1+(2-4)str";

    function erroneousCall() {
      interpreter.parser(interpreter.lexer(text),text);
    }
    const errorMsg = 
`Parser encountered unexpected token 'str' passed to after ')'

>> 1+(2-4)str
          ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });

  test('Close parenthesis followed by open parenthesis ")("', () => {

    const text = "1+(2-4)(2)";

    function erroneousCall() {
      interpreter.parser(interpreter.lexer(text),text);
    }
    const errorMsg = 
`Parser encountered unexpected token '(' passed to after ')'

>> 1+(2-4)(2)
          ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });

  test('Empty brackets', () => {

    const text = "1+(  )-2";

    function erroneousCall() {
      interpreter.parser(interpreter.lexer(text),text);
    }
    const errorMsg = 
`Parser encountered empty brackets. Did you mean to call a function?

>> 1+(  )-2
     ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });

  test('double comma', () => {

    const text = "(2,,3)";

    function erroneousCall() {
      interpreter.parser(interpreter.lexer(text),text);
    }
    const errorMsg = 
`Parser encountered unexpected token ',' passed to ',' operator

>> (2,,3)
      ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });
});



