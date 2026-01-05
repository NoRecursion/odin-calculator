const rules =  require('./rules');
const helpers = require('./helpers.js');



function lexer(text){

  let tokenFoundFlag;
  let tokens = [];
  let i = 0;
  let match = null;
  let remaining = text;

  while(i<text.length){

    tokenFoundFlag = false;

    for(r of rules.lexRules){

      match = remaining.match(r.regex);
      if(match){
        tokenFoundFlag = true;
        if(!r.ignore){
          const token = helpers.makeToken(match[0],i,r);
          tokens.push(token);
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

  return tokens;
}


module.exports = {
  lexer,
}