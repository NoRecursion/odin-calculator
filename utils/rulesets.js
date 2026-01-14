import * as helpers from './helpers.js'

const opFuncs ={ //redo these maybe
    exp:(l,r)=>{return l^r;},
    mult:(l,r)=>{return l*r;},
    divide:(l,r)=>{return l/r;},
    add:(l,r)=>{return l+r;},
    sub:(l,r)=>{return l-r;},
    invertSign:(l,r)=>{return -r;},
    startTuple:(l,r)=>{return [l,r];},
    extendTuple:(l,r)=>{l.push(r); return l;},
}

const prio={ //priority
  literal: 20,
  bracket: 18,
  exp: 8,
  mult: 6,
  add: 4,
  comma: 2,
}

const parseAs = {
  decimal: (context, token)=>{
    const node = helpers.makeTreeNode(Number(token.value),prio.literal,token);
    helpers.extendTip(context,node);
    return;
  },
  ident: (context, token)=>{
    const node = helpers.makeTreeNode(token.value,prio.literal,token);
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
    const node = helpers.makeTreeNode(opFuncs.invertSign,prio.mult,token);
    helpers.extendTip(context,node);
    return;
  },
  startTuple: (context,entry,token)=>{
    const node = helpers.makeTreeNode(opFuncs.startTuple,prio.comma,token);
    helpers.insertR(context,entry,node);
    return;
  },
  extendTuple: (context,entry,token)=>{
    const node = helpers.makeTreeNode(opFuncs.extendTuple,prio.comma,token);
    helpers.insertR(context,entry,node);
    return;
  },
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
  comma: "comma"
}

const validPrefixes={
  literal:[t.Lbracket,t.operator,t.entry,t.comma],
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
  helpers.makeLexRule( 'comma',
    t.comma,
    false,
    /^\,/,
    (context, token)=> {
      const thisPriority = context.priority+prio.comma;
      const entry = helpers.findEntry(context, prio.comma+context.priority);
      const lastType = context.tip.type;
      if (![t.Rbracket,t.ident,t.num].includes(lastType)){throw new Error(`Unexpected token ',' after token of type ${lastType}`);}
      if (entry.right == null){
        if (entry === context.tip){throw new Error(`Comma cannot find left hand expression`)}
        else {throw new Error(`Critical error. Tree data is corrupted. Send input string in bug report.`)}
      }
      const child = entry.right;
      if (child.type == t.comma){
        if (child.priority>thisPriority){parseAs.startTuple(context,entry,token)}
        else if (child.priority==thisPriority){parseAs.extendTuple(context,entry,token)}
        else {throw new Error(`Critical error. Impossible priority structure. Send input string in bug report.`)}
      }
      else if ([t.operator,t.ident,t.num].includes(child.type)){parseAs.startTuple(context,entry,token)}
      else {throw new Error(`Critical error. Cannot find valid child for comma. Send input string in bug report.`)}
      return;
    },
  ),
  helpers.makeLexRule( 'Lparenthesis',
    t.Lbracket,
    false,
    /^\(/,
    (context, token)=> {
      const lastType = context.tip.type;
      if (validPrefixes.literal.includes(lastType)){
        context.priority+=prio.bracket;
        context.bracketStack.push('(')
      }
      else {throw new Error(`Unexpected token '(' after token of type ${lastType}`);}
      return;
    },
  ),
  helpers.makeLexRule( 'Rparenthesis',
    t.Rbracket,
    false,
    /^\)/,
    (context, token)=> {
      const lastBracket = context.bracketStack.pop();
      const lastType = context.tip.type;
      if ([t.Rbracket,t.ident,t.num].includes(lastType)){
        if (lastBracket == '('){context.priority-=prio.bracket;}
        else {throw new Error(`Tried to close ${lastBracket} with )`);}
      }
      else {throw new Error(`Unexpected token '(' after token of type ${lastType}`);}
      return;
    },
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
      const lastType = context.tip.type;
      if (validPrefixes.literal.includes(lastType)){parseAs.decimal(context, token);}
      else {throw new Error(`Unexpected token 'decimal' after token of type ${lastType}`);}
      return;
    },
  ),
  helpers.makeLexRule( 'identity',
    t.ident,
    false,
    /^[A-Za-z_]\w*/,
    (context, token)=> {
      const lastType = context.tip.type;
      if (validPrefixes.literal.includes(lastType)){parseAs.ident(context, token);}
      else {throw new Error(`Unexpected token 'ident' after token of type ${lastType}`);}
      return;
    },
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
      const lastType = context.tip.type;
      if ([t.entry,t.operator,t.Lbracket].includes(lastType)){parseAs.invertSign(context,token);}
      else if ([t.Rbracket,t.ident,t.num]){parseAs.sub(context,token);}
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

