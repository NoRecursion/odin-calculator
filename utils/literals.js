import { factorial, InterpreterError } from "./helpers.js";

function makeNullaryFunc(mather,name){
    const func = (args, settings) =>{
        if (typeof args != null) {throw new InterpreterError(`The ${name} function takes no arguments`);}
        return mather();
    }
    return func;
}

function makeUnaryFunc(mather,name){
    const func = (args, settings) =>{
        if (typeof args != "number") {throw new InterpreterError(`The ${name} function takes 1 argument`);}
        return mather(args);
    }
    return func;
}

function makeBinaryFunc(mather,name){
    const func = (args, settings) =>{
        if (!Array.isArray(args) || args.length != 2) {throw new InterpreterError(`The ${name} function takes 2 arguments`);}
        return mather(args[0],args[1]);
    }
    return func;
}


function makeForwardTrigFunc(mather,name){
    const func = (args, settings) =>{
        if (typeof args != "number") {throw new InterpreterError(`The ${name} function takes 1 argument`);}
        let angleUnit

        if (settings == null){angleUnit = "rad";}
        else {angleUnit = settings.angleUnit}
        switch (angleUnit){
            case "rad":
                break;
            case "deg":
                args = args *3.14159265359/180;
                break
        }
        return mather(args);
    }
    return func;
}

function makeInverseTrigFunc(mather,name){
    const func = (args, settings) =>{
        if (typeof args != "number") {throw new InterpreterError(`The ${name} function takes 1 argument`);}
        let angleUnit
        let correctionFactor

        if (settings == null){angleUnit = "rad";}
        else {angleUnit = settings.angleUnit}
        switch (angleUnit){
            case "rad":
                correctionFactor = 1;
                break;
            case "deg":
                correctionFactor = 180/3.14159265359;
                break
        }
        return mather(args)*correctionFactor;
    }
    return func;
}

export let funcs = {
    "nop":
        (args, settings) =>{
            if (args == null) {return 0;}
            return args;
        },
    "rand":makeNullaryFunc(Math.random,"rand"),
    "ln":makeUnaryFunc(Math.log,"ln"),
    "log":
        (args, settings) =>{
            if (args == null) {throw new InterpreterError("The log function takes at least 1 argument");}
            else if (typeof args == "number") {return Math.log(args)/Math.log(10);}
            else if (args.length <= 2) {return Math.log(args[0])/Math.log(args[1]);}
            else {throw new InterpreterError("The log function takes at most 2 arguments");}
        },
    "sum":
        (args, settings) =>{
            if (!Array.isArray(args)) {throw new InterpreterError("The sum function expects 2 or more arguments");}
            return args.reduce((acc,cur)=>acc+cur);
        },
    "npr": makeBinaryFunc((n,r)=>factorial(n)/factorial(n-r),"nCr"),
    "ncr": makeBinaryFunc((n,r)=>factorial(n)/(factorial(n-r)*factorial(r)),"nCr"),

    "sqrt": makeUnaryFunc(Math.sqrt,"sqrt"),

    "sin": makeForwardTrigFunc(Math.sin,"sin"),
    "cos": makeForwardTrigFunc(Math.cos,"cos"),
    "tan": makeForwardTrigFunc(Math.tan,"tan"),
    "sec": makeForwardTrigFunc((num)=>1/Math.cos(num),"sec"),
    "csc": makeForwardTrigFunc((num)=>1/Math.sin(num),"csc"),
    "cot": makeForwardTrigFunc((num)=>1/Math.tan(num),"cot"),
    "asin": makeInverseTrigFunc(Math.asin,"asin"),
    "acos": makeInverseTrigFunc(Math.acos,"acos"),
    "atan": makeInverseTrigFunc(Math.atan,"atan"),
    "asec": makeInverseTrigFunc((num)=>Math.acos(1/num),"asec"),
    "acsc": makeInverseTrigFunc((num)=>Math.asin(1/num),"acsc"),
    "acot": makeInverseTrigFunc((num)=>Math.atan(1/num),"acot"),
}

export let nums = {
    "pi": Math.PI,
    "e":  Math.E,
    "phi": (1+Math.sqrt(5))/2,
    "ans": 0,
    "mem": 0,
}