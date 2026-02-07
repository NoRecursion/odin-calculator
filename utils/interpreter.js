import { specialTokens, tokenRules } from './rulesets.js';
import * as helpers from './helpers.js'

function lexer(text){
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
      throw new helpers.LexerError(helpers.makeLexErrorMsg(text,i));
    }
  }

  const EOE = helpers.makeToken("EOE", i, specialTokens.EOE);
  tokenList.push(EOE);
  return tokenList;
}

function parser(tokenList){
  const rootToken= helpers.makeToken(null,null,specialTokens.root);
  const root= helpers.makeTreeNode("root",0,rootToken);

  const ctx={
    root: root,
    tip: root,
    tokens: tokenList,
    i: 0,
    bracketStack: ['0'],
    priority: 0,
  }

  for (ctx.i; ctx.i<tokenList.length; ctx.i++){
    const token = tokenList[ctx.i];
    token.parseRule(ctx,token);
  }
  
  return ctx.root;
}

export {
  lexer,
  parser,
}