/* kb.js */

const Keyboard = window.SimpleKeyboard.default;

/* https://virtual-keyboard.js.org */
let keyboard = new Keyboard({
  onChange: input => onChange(input),
  onKeyPress: button => onKeyPress(button),
  newLineOnEnter: true,
  preventMouseDownDefault: true,
  layout: {
    default: [
      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
      "{tab} q w e r t y u i o p [ ] \\",
      "{lock} a s d f g h j k l ; ' {enter}",
      "{shift} z x c v b n m , . / {shift}",
      "{space}"
    ],
    shift: [
      "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
      "{tab} Q W E R T Y U I O P { } |",
      '{lock} A S D F G H J K L : " {enter}',
      "{shift} Z X C V B N M < > ? {shift}",
      "{space}"
    ],
    caps: [
      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
      "{tab} Q W E R T Y U I O P [ ] \\",
      "{lock} A S D F G H J K L ; ' {enter}",
      "{shift} Z X C V B N M , . / {shift}",
      "{space}"
    ]
  },
  buttonTheme: [{
      class: "no-exp",
      buttons: "{space} {lock} {shift}"
    },
  ],
  display: {
    '{bksp}': '\u232b',
    '{tab}': 'tab',
    '{lock}': 'CAPS',
    '{enter}': 'return',
    '{shift}': 'shift',
    '{space}': 'space'
  }
});

/* input listeners */
$(".input").each((i, elem) => {
  var input = $(`#${elem.id}`);
  input.focus(onInputFocus);
  input.on('input', (e) => { keyboard.setInput(event.target.value) });
});

// current input
var selectedInput;

/* update the current input when an input is focused */
function onInputFocus(event) {
  selectedInput = event.target.id;
  keyboard.setOptions({ inputName: event.target.id });
  keyboard.setInput(event.target.value);
}

/* on keyboard text buffer changed */
function onChange(input) {
  $(`#${selectedInput}`).val(input);
  var caretPosition = keyboard.caretPosition;
  if (caretPosition !== null) {
    setCaretPos(keyboard.options.inputName, caretPosition);
  }
}

/* function to set the caret position */
function setCaretPos(inputId, pos) {
  var elem = $(`#${inputId}`).get(0);
  if (elem.setSelectionRange) {
    elem.focus();
    elem.setSelectionRange(pos, pos);
  }
}

/* handle key press for shift / caps */
function onKeyPress(button) {
  let currentLayout = keyboard.options.layoutName;
  // shift function
  if (button === "{shift}" || currentLayout === "shift") {
    let shiftToggle = currentLayout === "shift" ? "default" : "shift";
    keyboard.setOptions({ layoutName: shiftToggle });
  }
  // caps lock function
  if (button === "{lock}") {
    let shiftToggle = currentLayout === "caps" ? "default" : "caps";
    keyboard.setOptions({ layoutName: shiftToggle });
  }
}

regWordBank();
preventFocLoss();

/* register the click handler for the word bank buttons */
function regWordBank() {
  $('#words button').off();
  $('#words button').click((e) => {
    if(delMode) {
      removeWord(e.currentTarget.id); // handle delete mode
    } else {
      var elem = $('#' + keyboard.options.inputName);
      var input = elem.val();
      var cursorPos = elem.prop('selectionStart');
      var cursorEnd = elem.prop('selectionEnd');
      var word = e.currentTarget.innerHTML;
      var text = input.substring(0, cursorPos) + word + input.substring(cursorEnd, input.length);
      keyboard.setInput(text);
      keyboard.options.onChange(text);
      setCaretPos(keyboard.options.inputName, cursorPos + word.length);
    }
  });
}

/* prevents focus loss when pressing word bank buttons */
function preventFocLoss() {
  $("#words button").mousedown((e) => {
    e.preventDefault();
  });
}

$("#new-word+button").click(addWord);

/* adds a new word to the word bank */
function addWord() {
  // get stored word bank
  var storedWords = getStoredWordBank();
  // get the word from the new word box
  var word = $("#new-word").val();
  word = word.trim();
  // check that new word isn't null or all whitespace, and that it isn't already added
  if(word && !storedWords.includes(word)) {
    storedWords.push(word); // add the new word to local storage array
    addWordBankButton(word); // add new button
  }
  if(storedWords.length === 1) {
    $('#empty-msg').hide();
  }
  $("#new-word").val(""); // clear the new word box
  setItem("wordbank", JSON.stringify(storedWords)); // save the new array
}

/* remove word from word bank */
function removeWord(wordId) {
  // get stored word bank
  var storedWords = getStoredWordBank();
  var elem = $(`#${wordId}`);
  var word = elem.html();
  var idx = storedWords.indexOf(word);
  storedWords.splice(idx, 1);
  elem.remove();
  if(storedWords.length === 0) {
    $('#empty-msg').show();
  }
  setItem("wordbank", JSON.stringify(storedWords)); // save the new array
}

/* get the word bank from local storage */
function getStoredWordBank() {
  // get stored word bank
  var storedWords = JSON.parse(getItem("wordbank"));
  storedWords = storedWords == null ? new Array() : storedWords; // initialize if null
  return storedWords;
}

var widx = 0; // word index
/* adds a new word bank button */
function addWordBankButton(word) {
  $("#words").append(`<button type='button' class='word btn btn-light me-2 mb-2' id='w${widx}'>${word}</button>`);
  preventFocLoss(); // redo focus loss prevention
  regWordBank(); // redo click handlers
  widx++;
}

// load word bank
loadWordBank();

/* loads the saved word bank from local storage */
function loadWordBank() {
  var bank = JSON.parse(getItem("wordbank"));
  if(bank != null && bank.length !== 0) {
    bank.forEach((e) => { addWordBankButton(e) });
  } else {
    $('#empty-msg').show();
  }
}

/* clear word bank when the clear button is clicked */
$("#clear").click((e) => {
  $("#words").html("");
  setItem("wordbank", null);
});

/* wordbank delete mode */
var delMode = false;
$("#del").click((e) => {
  delMode = e.currentTarget.checked;
  $("#wordbank-header").toggleClass('bg-danger', delMode);
  $("#new-word").attr('disabled', delMode);
  //$("#new-word+button").attr('disabled', delMode);
  if (delMode) {
    $("#wordbank-delmode").html("** Delete mode is enabled!");
  } else {
    $("#wordbank-delmode").html("");
  }
});
