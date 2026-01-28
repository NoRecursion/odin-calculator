import * as helpers from '../helpers.js';
import * as interpreter from '../interpreter.js';
import { tokenRules } from '../rulesets.js';
import * as debug from './debug_tools.js'


let lex = interpreter.lexer("foo(bar(1,2),3)")
let par = interpreter.parser(lex)

//console.log([par].map(node=>node.obj))
//console.log(par)
//debug.printTreeTokens(par)
//debug.printTreeObj(par)
//console.log(tokenRules)\

console.log(debug.listTreeObj(par))
