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
    priority: priority,
    token: token,
    left: null,
    right: null,
  }
  return node
}

export class LexerError extends Error {
  constructor(message) {
    super(message);
    /*
    this.name = 'LexerError';
    this.index = index;
    this.text = text;
    */
  }
}

export function makeLexErrorMsg(input,index){
  let msg =
`Unexpected token found at index ${index}

${'>> ' + input}
${' '.repeat(index+3) + '^'}`

  return msg
}

export function insertR(context,entry,node){
  node.priority += context.priority;
  const branch = entry.right;
  if (branch!= null){
      node.left = branch;
      branch.parent = node;
  }
  entry.right = node;
  node.parent = entry;
  context.tip = node;
  return;
}

export function extendTip(context,node){
  node.priority += context.priority;
  let entry = context.tip;
  entry.right = node;
  node.parent = entry;
  context.tip = node;
}

export function descendInsert(context, node){
  node.priority += context.priority;

  let entry = context.entry;
  while (entry.right!=null){
      if (entry.right.priority>=node.priority){break;}
      entry = entry.right
  }
  const branch = entry.right;
  if (branch!= null){
      node.left = branch;
      branch.parent = node;
  }
  entry.right = node;
  node.parent = entry;
  context.tip = node;
  return;
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

export function makeBinaryOperatorParseRule(parser,validPrefixes){
  const func= (context, token)=> {
    const symbol = token.value;

    const lastType = context.tip.token.type;
    if (validPrefixes.includes(lastType)) {parser(context, token);}
    else {throw new Error(`Unexpected token ${symbol} after token of type ${lastType}`);}
    return;
  }
  return func;
}