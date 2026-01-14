import { tokenRules } from './rulesets.js';
import * as helpers from './helpers.js'

function lexer(text){

  let tokenFoundFlag;
  let tokenList = [];
  let i = 0;
  let match = null;
  let remaining = text;

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

  return tokenList;
}

function parser(tokenList){
  const entryToken= helpers.makeToken(null,null,{name:"entry",type:"entry",
    parseRule:()=>{throw new Error("Critical Error, attempted to parse entry")},})

  const entryPoint= helpers.makeTreeNode("entry",0,entryToken);

  const context={
    entry: entryPoint,
    tip: entryPoint,
    tail: tokenList,
    bracketStack: ['0'],
    priority: 0,
  }

  for (let i =0; i<tokenList.length; i++){
    const token = tokenList[i];
    context.tail = tokenList.slice(i+1);
    token.parseRule(context,token);
  }
  
  return context.entry;
}

export {
  lexer,
  parser,
}