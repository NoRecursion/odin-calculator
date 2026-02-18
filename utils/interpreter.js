import { specialTokens, tokenRules, t } from './rulesets.js';
import * as helpers from './helpers.js';
import * as lits from './literals.js';

export function lexer(text){
  let tokenFoundFlag;
  let tokenList = [];
  let i = 0;
  let match = null;
  let remaining = text;


  const SOE = helpers.makeToken("SOE", i, specialTokens.SOE);
  tokenList.push(SOE);
  while(i<text.length){

    tokenFoundFlag = false;

    for(const r of tokenRules){

      match = remaining.match(r.regex);
      if(match){
        tokenFoundFlag = true;
        if(!r.ignore){
          const token = helpers.makeToken(match[0],i,r);
          tokenList.push(token);
        };
        i += match[0].length;
        remaining = text.slice(i);
        break;
      }

    }
    
    if(!tokenFoundFlag){
      throw helpers.InterpreterError.lexerUnexpectedToken(text,i);
    }
  }

  const EOE = helpers.makeToken("EOE", i, specialTokens.EOE);
  tokenList.push(EOE);
  return tokenList;
}

export function parser(tokenList,text){
  const rootToken= helpers.makeToken(null,null,specialTokens.root);
  const root= helpers.makeTreeNode("root",0,rootToken);

  const ctx={
    root: root,
    tip: root,
    tokens: tokenList,
    i: 0,
    bracketStack: [null],
    priority: 0,
    text:text,
  }

  for (ctx.i; ctx.i<tokenList.length; ctx.i++){
    const token = tokenList[ctx.i];
    token.parseRule(ctx,token);
  }
  
  const lastBracket = ctx.bracketStack.pop();
  if (lastBracket != null){
    throw helpers.InterpreterError.parserError(ctx,lastBracket,`Parser found open bracket with no matching closing bracket`);
  }

  return ctx.root;
}

export function findIdent(node,text){
  const litName = node.obj.toLowerCase();
  let retVal;
  if (node.parent.type == t.fcall && node.parent.evalStep == 1) {
    retVal = lits.funcs[litName];
    if (retVal == null) {throw helpers.InterpreterError.evaluatorError(node,text,`No such function ${node.obj}`)}
  } else {
    retVal = lits.nums[litName];
    if (retVal == null) {throw helpers.InterpreterError.evaluatorError(node,text,`No such constant ${node.obj}`)}
  }
  return retVal;
}

export function evalNode(node,settings,text){
  let l=null;
  let r=null;
  if (node.left!=null) {l = node.left.evalValue;}
  if (node.right!=null) {r = node.right.evalValue;}

  switch (node.type){
    case t.root:
      break;
    case t.EOE:
    case t.num:
      node.evalValue = node.obj;
      break;
    case t.ident:
      node.evalValue = findIdent(node,text);
      break;
    case t.fcall: //needs to be own special thing this one
      try{
        node.evalValue = l(r,settings);
      }catch(e){
        throw helpers.InterpreterError.evaluatorError(node,text,e.message)
      }
      break;
    case t.comma:
      node.evalValue = node.obj(l,r)
      break;
    case t.binop:
    case t.minus:
    case t.factorial:
      if (Array.isArray(l) ||Array.isArray(r)) {
        throw helpers.InterpreterError.evaluatorError(node,text,`the '${node.token.value}' operator does not accept tuples`)
      }
      node.evalValue = node.obj(l,r)
      break;
    default:
      throw helpers.InterpreterError.evaluatorError(node,text,
        `Critical error: evaluator encountered unexpected node of type ${node.type} in tree with token ${node.token}`)
  }

}

export function evaluator(root, settings, text){

  let node = root;

  while (root.evalStep < 3){

    if (node.evalStep < 1 && node.left!=null){
      node.evalStep = 1;
      node = node.left;

    } else if (node.evalStep < 2 && node.right!=null){
      node.evalStep = 2;
      node = node.right;

    } else{
      node.evalStep = 3;
      evalNode(node,settings,text);
      node = node.parent;
    }
  }

  return root.right.evalValue;
}

export function interpret(text, settings){

  const tokens = lexer(text);
  const tree = parser(tokens, text);
  const answer = evaluator(tree, settings, text);
  return answer;
}