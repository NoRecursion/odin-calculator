import * as interpreter from '../interpreter.js'
import * as helpers from '../helpers.js'
import * as debug from './debug_tools.js'

const fac = helpers.factorial;
const nPr = (n,r)=>fac(n)/fac(n-r);
const nCr = (n,r)=>fac(n)/(fac(n-r)*fac(r));
const deg = 3.14159265359/180;
const settingRad = {angleUnit:"rad"};
const settingDeg = {angleUnit:"deg"};


describe('Correctly calculates', () => {

  test('Empty expression', () => {
    const text = " ";
    const expectedOutput = 0;

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });

  test('1+1', () => {
    const text = "1+1";
    const expectedOutput = 1+1;

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('1+2*3!/4^5', () => {
    const text = "1+2*3!/4^5";
    const expectedOutput = 1+2*fac(3)/4**5;

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });

  test('(1+(2*3)!)/4^sqrt(5)', () => {
    const text = "(1+(2*3)!)/4^sqrt(5)";
    const expectedOutput = (1+fac(2*3))/4**(5**(1/2));

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });

  test('PI + e + pHi + Ans + meM', () => {
    const text = "PI + e + pHi + Ans + meM";
    const expectedOutput = Math.PI+Math.E+(1+Math.sqrt(5))/2+0+0;

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });

  test('logarithms', () => {
    const text = "ln(2)+log(5)+lOg(4,7)";
    const expectedOutput = Math.log(2)+Math.log(5)/Math.log(10)+Math.log(4)/Math.log(7);

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });

  test('counting', () => {
    const text = "nCr(10,4)+nPr(20,5)";
    const expectedOutput = nCr(10,4)+nPr(20,5);

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });

  test('sin+cos+tan in rad', () => {
    const text = "sin(1)+cos(2)+tan(3)";
    const expectedOutput = Math.sin(1)+Math.cos(2)+Math.tan(3);

    const output = interpreter.interpret(text,settingRad);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('sin+cos+tan in deg', () => {
    const text = "sin(10)+cos(20)+tan(30)";
    const expectedOutput = Math.sin(10*deg)+Math.cos(20*deg)+Math.tan(30*deg);

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('csc+sec+cot in rad', () => {
    const text = "csc(1)+sec(2)+cot(3)";
    const expectedOutput = 1/Math.sin(1)+1/Math.cos(2)+1/Math.tan(3);

    const output = interpreter.interpret(text,settingRad);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('csc+sec+cot in deg', () => {
    const text = "csc(10)+sec(20)+cot(30)";
    const expectedOutput = 1/Math.sin(10*deg)+1/Math.cos(20*deg)+1/Math.tan(30*deg);

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('asin+acos+atan in rad', () => {
    const text = "asin(0.1)+acos(0.2)+atan(3)";
    const expectedOutput = Math.asin(0.1)+Math.acos(0.2)+Math.atan(3);

    const output = interpreter.interpret(text,settingRad);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('asin+acos+atan in deg', () => {
    const text = "asin(0.1)+acos(0.2)+atan(3)";
    const expectedOutput = Math.asin(0.1)/deg+Math.acos(0.2)/deg+Math.atan(3)/deg;

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('acsc+asec+acot in rad', () => {
    const text = "acsc(2)+asec(3)+acot(4)";
    const expectedOutput = Math.asin(1/2)+Math.acos(1/3)+Math.atan(1/4);

    const output = interpreter.interpret(text,settingRad);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('acsc+asec+acot in deg', () => {
    const text = "acsc(2)+asec(3)+acot(4)";
    const expectedOutput = Math.asin(1/2)/deg+Math.acos(1/3)/deg+Math.atan(1/4)/deg;

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });
})

describe('Handles undefined results and edge cases', () => {
  test('1/0', () => {
    const text = "1/0";
    const expectedOutput = Infinity;

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('0/0', () => {
    const text = "0/0";
    const expectedOutput = NaN;

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('nCr(4,5)', () => {
    const text = "nCr(4,5)";
    const expectedOutput = 0;

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('ln(0)', () => {
    const text = "ln(0)";
    const expectedOutput = -Infinity;

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });
  test('ln(0)+1/0', () => {
    const text = "ln(0)+1/0";
    const expectedOutput = NaN;

    const output = interpreter.interpret(text,settingDeg);
    expect(output).toStrictEqual(expectedOutput);
  });
})

describe('Throws errors correctly', () => {
  test('Nonexistant variable', () => {

    const text = "1+foo";

    function erroneousCall() {
      interpreter.interpret(text,settingRad)
    }
    const errorMsg = 
`No such constant foo

>> 1+foo
     ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });
  test('Nonexistant function', () => {

    const text = "1+func(1)";

    function erroneousCall() {
      interpreter.interpret(text,settingRad)
    }
    const errorMsg = 
`No such function func

>> 1+func(1)
     ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });
  test('Feeding tuple to operator', () => {

    const text = "1*(2,3)";

    function erroneousCall() {
      interpreter.interpret(text,settingRad)
    }
    const errorMsg = 
`The '*' operator does not accept tuples

>> 1*(2,3)
    ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });

  test('Feeding inputs to nullary function', () => {

    const text = "rand(2)";

    function erroneousCall() {
      interpreter.interpret(text,settingRad)
    }
    const errorMsg = 
`The rand function takes no arguments

>> rand(2)
       ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });

  test('Feeding multiple inputs to unary function', () => {

    const text = "sin(2,3)";

    function erroneousCall() {
      interpreter.interpret(text,settingRad)
    }
    const errorMsg = 
`The sin function takes 1 argument

>> sin(2,3)
      ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });
  test('Feeding no inputs to unary function', () => {

    const text = "ln()";

    function erroneousCall() {
      interpreter.interpret(text,settingRad)
    }
    const errorMsg = 
`The ln function takes 1 argument

>> ln()
     ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });
  
  test('Feeding 3 inputs to binary function', () => {

    const text = "nCr(2,3,4)";

    function erroneousCall() {
      interpreter.interpret(text,settingRad)
    }
    const errorMsg = 
`The nCr function takes 2 arguments

>> nCr(2,3,4)
      ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });
  test('Feeding 1 input to binary function', () => {

    const text = "nCr(2)";

    function erroneousCall() {
      interpreter.interpret(text,settingRad)
    }
    const errorMsg = 
`The nCr function takes 2 arguments

>> nCr(2)
      ^`;

    expect(erroneousCall).toThrow(new helpers.InterpreterError(errorMsg));
  });
})