import * as helpers from '../helpers.js';
import * as interpreter from '../interpreter.js';
import { tokenRules } from '../rulesets.js';

let lex = interpreter.lexer("-1^2+3*4/4^2")
let par = interpreter.parser(lex)
//console.log([par].map(node=>node.obj))

function sliceNextLayer(layer){
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


function getObjs(layer){
    return layer.map(node=>{
        if (node == null){return null;}
        else {return node.obj}
    })
}

function getTokenVals(layer){
    return layer.map(node=>{
        if (node == null){return null;}
        else {return node.token.value;}
    })
}


function printTree(head,maxiter=10){
  let layer = [head];
  console.log(getTokenVals(layer));
  for (let i=0;i<maxiter;i++){
    layer = sliceNextLayer(layer);
    if (layer == null){return;}
    console.log(getTokenVals(layer));
    //console.log(layer.map(node=>node.obj));
  }
}

function printTreeObj(head,maxiter=10){
  let layer = [head];
  console.log(getObjs(layer));
  for (let i=0;i<maxiter;i++){
    layer = sliceNextLayer(layer);
    if (layer == null){return;}
    console.log(getObjs(layer));
    //console.log(layer.map(node=>node.obj));
  }
}

//console.log(par)
printTree(par)
//console.log(tokenRules)\

