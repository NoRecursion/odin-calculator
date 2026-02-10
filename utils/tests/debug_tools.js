import * as helpers from '../helpers.js'
import * as interpreter from '../interpreter.js'

export function getFields(tokenList,field){return tokenList.map(token=>token[field])};
export function lexToField(inp,field){return getFields(interpreter.lexer(inp),field)};

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

export function getLayerFields(layer, getter){
    return layer.map(node=>{
        if (node == null){return null;}
        else {return getter(node)}
    })
}

export function listTreeFields(head,getter,maxiter=10){
  let layer = [head];
  let list = [getLayerFields(layer, getter)];
  for (let i=0;i<maxiter;i++){
    layer = sliceNextLayer(layer);
    if (layer == null){return list;}
    list.push(getLayerFields(layer, getter));
  }
  return list;
}

export function parseToFields(text, getter){
  const lex = interpreter.lexer(text);
  let par = interpreter.parser(lex,text);
  return listTreeFields(par, getter);

}