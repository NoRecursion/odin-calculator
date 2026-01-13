import * as helpers from './helpers.js'

const opFuncs ={
    exp:(l,r)=>{return l^r;},
    mult:(l,r)=>{return l*r;},
    divide:(l,r)=>{return l/r},
    add:(l,r)=>{return l+r},
    sub:(l,r)=>{return l-r;},
    signInvert:(l,r)=>{return -r;},
}

const prio={ //priority
    literal: 20,
    bracket: 18,
    exp: 6,
    mult: 4,
    add: 2,
}

const parseAs = {
  decimal: (context, token)=>{
    const node = helpers.makeTreeNode(Number(token.value),prio.literal,token);
    helpers.extendTip(context,node);
    return;
  },
  exp: (context, token)=>{
    const node = helpers.makeTreeNode(opFuncs.exp,prio.exp,token);
    helpers.descendInsert(context, node)
    return;
  },
  mult: (context, token)=>{
    const node = helpers.makeTreeNode(opFuncs.mult,prio.mult,token);
    helpers.descendInsert(context, node)
    return;
  },
  divide: (context, token)=>{
    const node = helpers.makeTreeNode(opFuncs.divide,prio.mult,token);
    helpers.descendInsert(context, node)
    return;
  },
  add: (context, token)=>{
    const node = helpers.makeTreeNode(opFuncs.add,prio.add,token);
    helpers.descendInsert(context, node)
    return;
  },
  sub: (context, token)=>{
    const node = helpers.makeTreeNode(opFuncs.sub,prio.add,token);
    helpers.descendInsert(context, node)
    return;
  },
  invertSign: (context, token)=>{
    const node = helpers.makeTreeNode(opFuncs.signInvert,prio.mult,token);
    helpers.extendTip(context,node);
    return;
  }
}

const t = { // short for types
  entry: "entry", // special type made by parser
  Lbracket: "Lbracket",
  Rbracket: "Rbracket",
  spacer: "spacer",
  comment: "comment",
  num: "num",
  ident: "ident",
  operator: "operator",
}



const tokenRules = [
  helpers.makeLexRule( 'whitespace',
    t.spacer,
    true,     
    /^\s+/,
    (val)=>val,
  ),
  helpers.makeLexRule( 'line_comment',
    t.comment,
    true,     
    /^\/\/[^\n]*/,
    (val)=>val,
  ),
  helpers.makeLexRule( 'block_comment',
    t.comment,
    true,     
    /^\/\*[\s\S]*?\*\//,
    (val)=>val,
  ),
  helpers.makeLexRule( 'Lparenthesis', //TODO
    t.Lbracket,
    false,
    /^\(/,
    (val)=>val,
  ),
  helpers.makeLexRule( 'Rparenthesis',  //TODO
    t.Rbracket,
    false,
    /^\)/,
    (val)=>val,
  ),
  helpers.makeLexRule( 'Lsquare',  //TODO
    t.Lbracket,
    false,
    /^\[/,
    (val)=>val,
  ),
  helpers.makeLexRule( 'Rsquare', //TODO
    t.Rbracket,
    false,
    /^\]/,
    (val)=>val,
  ),
  helpers.makeLexRule( 'Lcurly', //TODO
    t.Lbracket,
    false,
    /^\{/,
    (val)=>val,
  ),
  helpers.makeLexRule( 'Rcurly',  //TODO 
    t.Rbracket,
    false,
    /^\}/,
    (val)=>val,
  ),
  helpers.makeLexRule( 'decimal',
    t.num,
    false,
    /^[0-9]+(\.[0-9]+)?/,

    (context, token)=> {
      const lastType = context.tip.token.type;
      if ([t.Lbracket,t.operator,t.entry].includes(lastType)){parseAs.decimal(context, token);}
      else {throw new Error(`Unexpected token 'decimal' after token of type ${lastType}`);}
      return;
    },
  ),
  helpers.makeLexRule( 'identity', //TODO
    t.ident,
    false,
    /^[A-Za-z_]\w*/,
    (val)=>val,
  ),
  helpers.makeLexRule( 'hat',
    t.operator,
    false,
    /^\^/,
    helpers.makeBinaryOperatorParseRule(parseAs.exp,[t.Rbracket,t.ident,t.num]),
  ),
  helpers.makeLexRule( 'slash',
    t.operator,
    false,
    /^\//,
    helpers.makeBinaryOperatorParseRule(parseAs.divide,[t.Rbracket,t.ident,t.num]),
  ),
  helpers.makeLexRule( 'star',
    t.operator,
    false,
    /^\*/,
    helpers.makeBinaryOperatorParseRule(parseAs.mult,[t.Rbracket,t.ident,t.num]),
  ),
  helpers.makeLexRule( 'dash',
    t.operator,
    false,
    /^\-/,
    (context, token)=>{
      const lastType = context.tip.token.type;
      if ([t.entry,t.operator,t.Lbracket].includes(lastType)){parseAs.invertSign(context,token);}
      else if ([t.Rbracket,t.ident,t.num]){arseAs.sub(context,token);}
      else {throw new Error(`Unexpected token '-' after token of type ${lastType}`);}
    },
  ),
  helpers.makeLexRule( 'plus',
    t.operator,
    false,
    /^\+/,
    helpers.makeBinaryOperatorParseRule(parseAs.add,[t.Rbracket,t.ident,t.num]),
  ),
]


export {
  tokenRules,
};

