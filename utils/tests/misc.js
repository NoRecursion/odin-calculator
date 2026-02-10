
import * as helpers from '../helpers.js';
import * as interpreter from '../interpreter.js';
import { tokenRules } from '../rulesets.js';
import * as debug from './debug_tools.js'

const text = "1^((3+4)*5/(6-7))";

//console.log([par].map(node=>node.obj))
//console.log(par)
//debug.printTreeTokens(par)
//debug.printTreeObj(par)
//console.log(tokenRules)\

console.log(debug.parseToFields(text, node=>node.obj))

//console.log(lex)
