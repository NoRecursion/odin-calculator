import * as helpers from '../helpers.js'
import * as interpreter from '../interpreter.js'

export function getFields(tokenList,field){return tokenList.map(token=>token[field])};
export function lexToFields(inp,field){return getFields(interpreter.lexer(inp),field)};

export function sliceNextLayer(layer){
  let out =[];
  let allnull=true;
  for (const node of layer){
    if (node == null){
      continue}
    else{
      out.push(node.left);
      out.push(node.right);
      if(node.left!=null || node.right!=null){allnull = false;}
    }
  }
  if (allnull) {return null}
  return out;
}

export function logTestLexer(inp, func){
  console.log(`testing: ${inp}`);
  console.log(func(inp));
  return;
}

export function getObjs(layer){
    return layer.map(node=>{
        if (node == null){return null;}
        else {return node.obj}
    })
}
export function getTokenVals(layer){
    return layer.map(node=>{
        if (node == null){return null;}
        else {return node.token.value;}
    })
}

export function listTreeTokens(head,maxiter=10){
  let layer = [head];
  let list = [getTokenVals(layer)];
  for (let i=0;i<maxiter;i++){
    layer = sliceNextLayer(layer);
    if (layer == null){return list;}
    list.push(getTokenVals(layer));
  }
  return list;
}

export function listTreeObj(head,maxiter=10){
  let layer = [head];
  let list = [getObjs(layer)];
  for (let i=0;i<maxiter;i++){
    layer = sliceNextLayer(layer);
    if (layer == null){return list;}
    list.push(getObjs(layer));
  }
  return list;
}

export function printTreeTokens(head,maxiter=10){
  let layer = [head];
  console.log(getTokenVals(layer));
  for (let i=0;i<maxiter;i++){
    layer = sliceNextLayer(layer);
    if (layer == null){return;}
    console.log(getTokenVals(layer));
  }
}

export function printTreeObj(head,maxiter=10){
  let layer = [head];
  console.log(getObjs(layer));
  for (let i=0;i<maxiter;i++){
    layer = sliceNextLayer(layer);
    if (layer == null){return;}
    console.log(getObjs(layer));
  }
}