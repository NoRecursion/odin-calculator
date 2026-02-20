export function factorial(n){
  if (n<0) {return Infinity}
  if (n==Infinity) {return Infinity}
  if (n==0) {return 1;}

  let total = 1;
  for(let i = 1; i<=n; i++){
    total *= i;
  }
  return total;
}

export function makeToken(value, position, rule){
  const token = {
    value: value,
    position: position,
    type: rule.type,
    name: rule.name,
    parseRule: rule.parseRule,
  }
  return token;
}

export function makeTreeNode(obj,priority,token){
  const node = {
    parent: null,
    obj: obj,
    evalStep: 0,  // 0: unvisited, 1: evaluating left branch, 2: evaluatin right branch, 3: evaluated
    evalValue: null,
    priority: priority,
    type: token.type,
    token: token,
    left: null,
    right: null,
  }
  return node
}

function indexErrorMsg(text,index){
  let msg =`
${'>> ' + text}
${' '.repeat(index+3) + '^'}`

  return msg
}

export class InterpreterError extends Error {
  constructor(message,phase) {
    super(message);
    this.name = "InterpreterError";
    this.phase = phase;
  }

  static lexerUnexpectedToken(text,index){
    const errMessage = `Lexer encountered unexpected character at index ${index}\n` + indexErrorMsg(text,index);
    return new InterpreterError(errMessage,"lexer");
    
  }

  static parserError(ctx,token,message){
    const errMessage = message + `\n` + indexErrorMsg(ctx.text,token.position);
    return new InterpreterError(errMessage,"parser");
  }

  static evaluatorError(node,text,message){
    const errMessage = message + `\n` + indexErrorMsg(text,node.token.position);
    return new InterpreterError(errMessage,"evaluator");
  }
}

export function insertR(ctx,entry,node){
  node.priority += ctx.priority;
  const child = entry.right;
  if (child!= null){
    node.left = child;
    child.parent = node;
  }
  entry.right = node;
  node.parent = entry;
  ctx.tip = node;
  return;
}

export function extendTip(ctx,node){
  node.priority += ctx.priority;
  let entry = ctx.tip;
  entry.right = node;
  node.parent = entry;
  ctx.tip = node;
}

export function descendInsert(ctx, node){
  node.priority += ctx.priority;

  let entry = ctx.root;
  while (entry.right!=null){
      if (entry.right.priority>=node.priority){break;}
      entry = entry.right
  }
  const child = entry.right;
  if (child!= null){
      node.left = child;
      child.parent = node;
  }
  entry.right = node;
  node.parent = entry;
  ctx.tip = node;
  return;
}

export function findEntry(ctx, priority){
  let entry = ctx.root;
  while (entry.right!=null){
      if (entry.right.priority>=priority){break;}
      entry = entry.right
  }
  return entry;
}

export function makeLexRule(name,type,ignore,regex,parseRule){
  if (typeof type !='string'||type ==''){throw new Error("type must be a nonempty string");}
  if (typeof name !='string'||name ==''){throw new Error("name must be a nonempty string");}
  if (typeof ignore !='boolean'){throw new Error("ignore must be a boolean");}
  if (!(regex instanceof RegExp)||regex.source[0]!='^'){throw new Error("regex needs to be a Regular Expression starting with '^'");}
  if (typeof parseRule !='function'){throw new Error("unexpected parseRule for rule");}
  return {
    name:name,
    type:type,
    ignore:ignore,
    regex:regex,
    parseRule:parseRule
  }
}

export function makeSimpleOperatorParseRule(parser,validSuffixes){
  const binopParser= (ctx, token)=> {
    const nextToken = ctx.tokens[ctx.i+1];
    if (!validSuffixes.includes(nextToken.type)){
      throw InterpreterError.parserError(ctx,nextToken,
        `Parser encountered unexpected token '${nextToken.value}' passed to '${token.value}' operator`);
    }
    else {parser(ctx,token);}
  }
  return binopParser;
}
