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
  fcall:(l,r)=>{return l(r);},
}

const prio={ //priority
  literal: 20,
  fcall: 18,
  bracket: 18,
  exp: 8,
  mult: 6,
  add: 4,
  comma: 2,
}

const parseAs = {
  decimal: (ctx, token)=>{
    const node = helpers.makeTreeNode(Number(token.value),prio.literal,token);
    helpers.extendTip(ctx,node);
    return;
  },
  ident: (ctx, token)=>{
    const node = helpers.makeTreeNode(token.value,prio.literal,token);
    helpers.extendTip(ctx,node);
    return;
  },
  exp: (ctx, token)=>{
    const node = helpers.makeTreeNode(opFuncs.exp,prio.exp,token);
    helpers.descendInsert(ctx, node)
    return;
  },
  mult: (ctx, token)=>{
    const node = helpers.makeTreeNode(opFuncs.mult,prio.mult,token);
    helpers.descendInsert(ctx, node)
    return;
  },
  divide: (ctx, token)=>{
    const node = helpers.makeTreeNode(opFuncs.divide,prio.mult,token);
    helpers.descendInsert(ctx, node)
    return;
  },
  add: (ctx, token)=>{
    const node = helpers.makeTreeNode(opFuncs.add,prio.add,token);
    helpers.descendInsert(ctx, node)
    return;
  },
  sub: (ctx, token)=>{
    const node = helpers.makeTreeNode(opFuncs.sub,prio.add,token);
    helpers.descendInsert(ctx, node)
    return;
  },
  invertSign: (ctx, token)=>{
    const node = helpers.makeTreeNode(opFuncs.invertSign,prio.mult,token);
    helpers.extendTip(ctx,node);
    return;
  },
  startTuple: (ctx,entry,token)=>{
    const node = helpers.makeTreeNode(opFuncs.startTuple,prio.comma,token);
    helpers.insertR(ctx,entry,node);
    return;
  },
  extendTuple: (ctx,entry,token)=>{
    const node = helpers.makeTreeNode(opFuncs.extendTuple,prio.comma,token);
    helpers.insertR(ctx,entry,node);
    return;
  },
  fcall: (ctx,token)=>{
    const node = helpers.makeTreeNode(opFuncs.fcall,prio.fcall,token);
    node.type = t.fcall;

    const ident = ctx.tip;
    const entry = ident.parent;
    node.left = ident;
    ident.parent = node;

    helpers.insertR(ctx,entry,node);
    return;
  },
}

const t = { // short for types
  SOE: "SOE", // special tokens for start and end of expression
  EOE: "EOE",
  root: "root", // special type made by parser
  Lbracket: "Lbracket",
  Rbracket: "Rbracket",
  spacer: "spacer",
  comment: "comment",
  num: "num",
  ident: "ident",
  binop: "binop",
  comma: "comma",
  fcall: "fcall",
  minus: "minus",
}

const tGroups={
  prev:{
    lits: [t.ident,t.num],
    ops: [t.binop,t.minus,t.comma,t.fcall], 
  },
  next:{
    lits:[t.Lbracket,t.ident,t.num, t.fcall, t.minus],
    ops:[t.Rbracket,t.binop,t.comma, t.minus, t.EOE],
  }
}

export const specialTokens = {
  SOE: helpers.makeLexRule( "SOE",
      t.SOE,
      false,
      /^[^.]/,
      (ctx, token)=> {
        const nextToken = ctx.tokens[ctx.i+1];
        if (!tGroups.next.lits.includes(nextToken.type)){
          throw new Error(`Unexpected token '${nextToken.value}' at start of expression`);
        }
        return;
      }
  ),
  EOE: helpers.makeLexRule( "EOE",
      t.EOE,
      false,
      /^[^.]/,
      (ctx, token)=> {
        //do nothing
        return;
      }
  ),
  root: helpers.makeLexRule( "root",
      t.root,
      false,
      /^[^.]/,
      (ctx, token)=> {
        throw new Error("Critical Error, attempted to parse root");
      }
  ),
}

export const tokenRules = [
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
    (ctx, token)=> {
      const nextToken = ctx.tokens[ctx.i+1];
      if (!tGroups.next.lits.includes(nextToken.type)){
        throw new Error(`Unexpected token '${nextToken.value}' passed to ',' operator`);
      }

      const thisPriority = ctx.priority+prio.comma;
      const entry = helpers.findEntry(ctx, prio.comma+ctx.priority);
      const lastType = ctx.tip.type;
      if (entry.right == null){
        throw new Error(`Critical error. Tree data is corrupted. Send input string in bug report.`);
      }
      const child = entry.right;
      if (child.type == t.comma){
        if (child.priority>thisPriority){parseAs.startTuple(ctx,entry,token);}
        else if (child.priority==thisPriority){parseAs.extendTuple(ctx,entry,token);}
        else {throw new Error(`Critical error. Impossible priority structure. Send input string in bug report.`);}
      }
      else {parseAs.startTuple(ctx,entry,token);}
      return;
    },
  ),
  helpers.makeLexRule( 'Lparenthesis',
    t.Lbracket,
    false,
    /^\(/,
    (ctx, token)=> {
      const nextToken = ctx.tokens[ctx.i+1];
      let emptyCall = (nextToken.type == t.Rbracket);

      if (emptyCall){}
      else if (!tGroups.next.lits.includes(nextToken.type)){
        throw new Error(`Left parenthesis followed by Unexpected token '${nextToken.value}'`);
      }

      if (ctx.tip.type == t.ident){
        ctx.priority+=prio.bracket;
        ctx.bracketStack.push('f');
        parseAs.fcall(ctx,token);
      }else {
        if (emptyCall){
          throw new Error(`Empty brackets not allowed. Did you mean to call a function?`)
        }
        ctx.priority+=prio.bracket;
        ctx.bracketStack.push('(');
      }
      return;
    },
  ),
  helpers.makeLexRule( 'Rparenthesis',
    t.Rbracket,
    false,
    /^\)/,
    (ctx, token)=> {

      const nextToken = ctx.tokens[ctx.i+1];
      if (!tGroups.next.ops.includes(nextToken.type)){
        throw new Error(`Unexpected token '${nextToken.value}' passed to after ')'`);
      }

      const lastBracket = ctx.bracketStack.pop();

      if (lastBracket == '('){ctx.priority-=prio.bracket;}
      else if (lastBracket == 'f'){ctx.priority-=prio.bracket;}
      else if (lastBracket == '0'){throw new Error(`Unexpected token ')' with no matching open bracket`);}
      else {throw new Error(`Tried to close ${lastBracket} with )`);}

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

    (ctx, token)=> {
      const nextToken = ctx.tokens[ctx.i+1];
      if (tGroups.next.ops.includes(nextToken.type)){parseAs.decimal(ctx, token);}
      else {throw new Error(`Unexpected token '${nextToken.value}' passed after literal '${token.value}'`);}
      return;
    },
  ),
  helpers.makeLexRule( 'identity',
    t.ident,
    false,
    /^[A-Za-z_]\w*/,
    (ctx, token)=> {
      const nextToken = ctx.tokens[ctx.i+1];
      if (tGroups.next.ops.includes(nextToken.type)){parseAs.ident(ctx, token);}
      else if (nextToken.type == t.Lbracket){parseAs.ident(ctx, token);} //Allow the bracket to parse the function call
      else {throw new Error(`Unexpected token '${nextToken.value}' passed after literal '${token.value}'`);}
      return;
    },
  ),
  helpers.makeLexRule( 'hat',
    t.binop,
    false,
    /^\^/,
    helpers.makeBinaryOperatorParseRule(parseAs.exp,tGroups.next.lits),
  ),
  helpers.makeLexRule( 'slash',
    t.binop,
    false,
    /^\//,
    helpers.makeBinaryOperatorParseRule(parseAs.divide,tGroups.next.lits),
  ),
  helpers.makeLexRule( 'star',
    t.binop,
    false,
    /^\*/,
    helpers.makeBinaryOperatorParseRule(parseAs.mult,tGroups.next.lits),
  ),
  helpers.makeLexRule( 'dash',
    t.minus,
    false,
    /^\-/,
    (ctx, token)=>{
      const nextToken = ctx.tokens[ctx.i+1];
      if (!tGroups.next.lits.includes(nextToken.type)){
        throw new Error(`Unexpected token '${nextToken.value}' passed to '${token.value}' operator`);
      }

      if (tGroups.prev.ops.includes(ctx.tip.type)){parseAs.invertSign(ctx,token);}
      else if (ctx.tip.type == t.root){parseAs.invertSign(ctx,token);}
      else {parseAs.sub(ctx,token);}
    },
  ),
  helpers.makeLexRule( 'plus',
    t.binop,
    false,
    /^\+/,
    helpers.makeBinaryOperatorParseRule(parseAs.add,tGroups.next.lits),
  ),
]


