function makeToken(value, position, rule){
  const token = {
    value: rule.tokenizer(value),
    position: position,
    type: rule.type,
    name: rule.name,
  }
  return token;
}

class LexerError extends Error {
  constructor(message) {
    super(message);
    /*
    this.name = 'LexerError';
    this.index = index;
    this.text = text;
    */
  }
}

function makeLexErrorMsg(input,index){
  let msg =
`Unexpected token found at index ${index}

${'>> ' + input}
${' '.repeat(index+3) + '^'}`

  return msg
}

module.exports = {
  makeToken,
  makeLexErrorMsg,
  LexerError,
}