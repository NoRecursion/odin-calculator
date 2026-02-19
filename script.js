import * as interpreter from "./utils/interpreter.js";
import * as lits from "./utils/literals.js";

const display = document.getElementById("display");
const input = document.getElementById("input");
const history = document.getElementById("history");

const panel = document.getElementById("button-panel");

document.addEventListener('mousedown', (e) => {
  if (e.target !== input) {
    e.preventDefault();
  }
})

input.onblur = ()=>{
    input.focus();
    const i = input.selectionStart-5;
    setTimeout(() => {
        input.scrollLeft = input.scrollWidth*i/input.value.length;;
        }, 0)
};

function moveCursor(n){
    const i = input.selectionStart;
    input.scrollLeft += input.scrollWidth*n/input.value.length;
    const curPos = i + n;
    input.setSelectionRange(curPos,curPos);
}

function clearText(){
    input.value = "";
}

function deleteChar() {
    const i = input.selectionStart;
    if (i==0) {return}
    input.value = input.value.slice(0, i-1)+input.value.slice(i);
    input.scrollLeft -= input.scrollWidth/input.value.length;
    const curPos = i - 1;
    input.setSelectionRange(curPos,curPos);
}

function appendText(text) {
    const i = input.selectionStart;
    input.value = input.value.slice(0,i)+text+input.value.slice(i);
    input.scrollLeft += input.scrollWidth*text.length/input.value.length;
    const curPos = i + text.length;
    input.setSelectionRange(curPos,curPos);
}

function execute(){
    const text = input.value;
    history.innerText = text;
    input.value = interpreter.interpret(text);
}
function addToM(addORsub){
    const text = input.value;
    const value = interpreter.interpret(text);
    if (addORsub){
        lits.nums.m += value;
    }
    else{
        lits.nums.m -= value;
    }
}

function makeCalcBtn(title, func){
    const button = document.createElement("button");
    button.classList.add("calcBtn");
    button.title = title;
    button.textContent = title;
    button.onclick= (event) => {
        func(event)
    }
    return button;
}

const calcChars = "0.123456789()+-*/^!%"
const calcConsts = ["Ans","M","pi","e","phi"]
const calcFuncs = [
    [
        
    ], // nullary

    [
        "sqrt", "ln", "log",
        "sin", "cos", "tan",
        "asin", "acos", "atan",
    ], // unary

    [
        "mod", "nCr", "rand"
    ], // binary
]


const b=(()=>{
    const buttons = {};

    buttons["CLR"] = makeCalcBtn("CLR",(e)=>clearText());
    buttons["Del"] = makeCalcBtn("Del",(e)=>deleteChar());
    buttons["="] = makeCalcBtn("=",(e)=>execute());
    buttons["="].id="btn-equals";
    buttons["M+"] = makeCalcBtn("M+",(e)=>addToM(true));
    buttons["M-"] = makeCalcBtn("M-",(e)=>addToM(false));
    for (const c of calcChars){
        buttons[c] = makeCalcBtn(c,(e)=> appendText(c));
    }
    for (const c of calcConsts){
        buttons[c] = makeCalcBtn(c,(e)=> appendText(c));
    }
    for (let i=0;i<calcFuncs.length;i++){
        const commas = Math.max(0,i-1);
        for (const f of calcFuncs[i]){
            buttons[f] = makeCalcBtn(f,(e)=>{
                appendText(f+'('+ ','.repeat(commas)+')')
                moveCursor(-i)
            })
        }
    }
    return buttons;
})()
/*
panel.appendChild(b["Del"])
panel.appendChild(b["CLR"])
panel.appendChild(b["="])

panel.appendChild(b["rand"])
panel.appendChild(b["sin"])
panel.appendChild(b["nCr"])
*/
const BASICPANEL = [
    ["Ans","(",")","^"],
    ["7","8","9","/"],
    ["4","5","6","*"],
    ["1","2","3","-"],
    ["0",".","%","+"],
    ["CLR","Del","="],
]

const ADVANCEDPANEL = [
    ["sqrt","sin","M"],
    ["pi","cos","M+"],
    ["ln","tan","M-"],
    ["log","asin","rand"],
    ["e","acos","!"],
    ["mod","atan","nCr"],
]

function makeSubPanel(grid){
    const subpnl = document.createElement("div");
    subpnl.classList.add("subpanel");
    for (const row of grid){
        let div = document.createElement("div");
        div.classList.add("btn-row");
        for (const name of row){
            div.appendChild(b[name]);
        }
        subpnl.appendChild(div);
    }
    return subpnl;
}

const subpanelLeft = makeSubPanel(BASICPANEL);
const subpanelRight = makeSubPanel(ADVANCEDPANEL);



panel.appendChild(subpanelLeft)

panel.appendChild(subpanelRight)
