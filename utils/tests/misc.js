
import * as helpers from '../helpers.js';
import * as interpreter from '../interpreter.js';
import { tokenRules } from '../rulesets.js';
import * as debug from './debug_tools.js'

const text = "(2,,3)";



//console.log(debug.parseToFields(text, node=>node.obj))

interpreter.parser(interpreter.lexer(text),text);
