import * as helpers from '../helpers.js';
import * as interpreter from '../interpreter.js';
import { tokenRules } from '../rulesets.js';
import * as debug from './debug_tools.js'

const text = "rand(2)";


//console.log(interpreter.parser(interpreter.lexer(text),text))


console.log(interpreter.interpret(text,{angleUnit:"deg"}))

