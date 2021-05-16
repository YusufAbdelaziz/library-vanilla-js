const doc = document;
const myStorage = window.localStorage;

function storeBooksInLocalStorage() {
  myStorage.clear;
  myStorage.setItem("myLibrary", JSON.stringify(myLibrary));
}
let myLibrary = [];
initializeModal();
displayBooks();

// This may be converted into ES6 class declaration but for the sake of the project, I'd use the old style.
function Book(title, author, pages, read) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = read;
}
// Adds a book at the front of the list.
function addBookToLibrary(book) {
  myLibrary.unshift(book);
  storeBooksInLocalStorage();
  displayBooks();
}

// Displays the list of books by removing the old books grid before removing a book and then replacing it with the new books grid.
// Note: I actually realized now that using 'key' property in React is pretty efficient since removing the whole list
// from DOM just for a single item removal and building it from the beginning seems tedious.
function displayBooks() {
  const storedLibrary = myStorage.getItem("myLibrary");
  if (storedLibrary != null) {
    myLibrary = JSON.parse(storedLibrary);
    console.log(myLibrary);

    const emptyLibraryDiv = doc.getElementById("empty-library");
    if (emptyLibraryDiv != null) doc.body.removeChild(emptyLibraryDiv);
    const oldBooksGrid = doc.querySelector(".books-grid");
    doc.body.removeChild(oldBooksGrid);
    const newBooksGrid = doc.createElement("div");
    newBooksGrid.classList.add("books-grid");
    doc.body.appendChild(newBooksGrid);
    console.log(newBooksGrid);
    myLibrary.forEach((book, index) =>
      newBooksGrid.appendChild(createBookCard(book, index))
    );
    if (myLibrary.length === 0) {
      const emptyLibraryDiv = doc.createElement("div");
      emptyLibraryDiv.id = "empty-library";
      const header1 = doc.createElement("p");
      const header2 = doc.createElement("p");
      const t1 = doc.createTextNode("Empty library :(");
      const t2 = doc.createTextNode("Start Adding a new book !");
      header1.appendChild(t1);
      header2.appendChild(t2);
      emptyLibraryDiv.append(header1, header2);
      doc.body.appendChild(emptyLibraryDiv);
    }
  }
}
// Creates the book card using other methods as elements generators.
function createBookCard(book, index) {
  const bookCard = doc.createElement("DIV");
  bookCard.classList.add("book-card");
  bookCard.dataset.index = index;
  const infoParas = generateParas(book);
  bookCard.append(...infoParas);
  const modifyGroup = generateModifyGroup(book, index, bookCard);
  bookCard.appendChild(modifyGroup);
  return bookCard;
}
// Generates the paragraphs in the book card.
function generateParas(book) {
  let paras = [];
  for (const key in book) {
    if (Object.hasOwnProperty.call(book, key)) {
      const property = book[key];
      var para = doc.createElement("P");
      var text;
      para.dataset.type = key;
      if (key === "read") {
        text = doc.createTextNode(
          `${capitalizeFirstLetter(key)}: ${property ? "Yes" : "No"}`
        );
      } else {
        text = doc.createTextNode(`${capitalizeFirstLetter(key)}: ${property}`);
      }

      para.appendChild(text);
      paras.push(para);
    }
  }
  console.log(paras);
  return paras;
}

// Generates switch slider and trash icon.
function generateModifyGroup(book, index, bookCard) {
  const switchToggle = generateBookSwitchButton(book, index, bookCard);
  const trashIcon = generateDeleteButton(index);
  const modifyGroup = doc.createElement("div");
  modifyGroup.classList.add("modify-group");
  modifyGroup.append(switchToggle, trashIcon);
  return modifyGroup;
}
// Generates the trash icon button.
function generateDeleteButton(index) {
  const trashIcon = doc.createElement("div");
  trashIcon.innerHTML = `<i class="fa fa-trash-o"></i>`;
  trashIcon.classList.add("trash-icon");
  trashIcon.addEventListener("click", () => removeBook(index));
  return trashIcon;
}
// Generates a switch button in the card that is attached with a listener that switches the read status.
function generateBookSwitchButton(book, index, bookCard) {
  const switchToggle = createSwitchButton(book);
  switchToggle.addEventListener("change", (_) =>
    toggleReadStatus(bookCard, index)
  );
  return switchToggle;
}

// Removes a book from the list, and displaying the books again.
function removeBook(index) {
  const newLibrary = myLibrary
    .slice(0, index)
    .concat(myLibrary.slice(index + 1));
  myLibrary = newLibrary;
  storeBooksInLocalStorage();

  displayBooks();
}
// Changes a book 'read' status by only removing the 'Read: readStatus' paragraph since the switch handles its own state.
function toggleReadStatus(bookCardElement, index) {
  const readPara = bookCardElement.querySelector("p[data-type=read]");
  console.log(readPara);
  bookCardElement.removeChild(readPara);
  const book = myLibrary[index];
  book.read = !book.read;
  var para = doc.createElement("p");
  para.dataset.type = "read";
  var text = doc.createTextNode(`Read: ${book.read ? "Yes" : "No"}`);
  para.appendChild(text);
  const lastChild = bookCardElement.lastChild;
  bookCardElement.insertBefore(para, lastChild);
  storeBooksInLocalStorage();
  console.table(myLibrary);
}

function initializeModal() {
  // Get the modal
  var modal = doc.getElementById("myModal");

  // Get the button that opens the modal
  var btn = doc.getElementById("add-button");

  // Get the <span> element that closes the modal
  var span = doc.getElementsByClassName("close")[0];

  // When the user clicks the button, open the modal
  btn.onclick = function () {
    modal.style.display = "block";
  };

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
    removeErrorElements();
    clearInputElementsValues(modal);
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      removeErrorElements();
      clearInputElementsValues(modal);
    }
  };
  initializeSubmitButton(modal);
}

// Initializes the button by adding an event listener to it.
function initializeSubmitButton(modal) {
  const submitButton = doc.getElementById("submit-button");
  submitButton.addEventListener("click", () => {
    const book = extractDataFromModal();
    if (book != null) {
      addBookToLibrary(book);
      modal.style.display = "none";
      removeErrorElements();
      clearInputElementsValues(modal);
    }
  });
}
// Extracts data from inputs in the modal sheet.
function extractDataFromModal() {
  const modal = doc.getElementById("myModal");
  const inputFields = modal.querySelectorAll(".form .input-field input");
  const readSwitchButton = modal.querySelector(".switch-field input");
  var book = new Book();
  let hasError = false;
  book.read = readSwitchButton.checked;
  Array.from(inputFields).forEach((input) => {
    if (
      checkInputValue(input.value, input.name, input.parentElement) &&
      !hasError
    ) {
      console.log(input.name, input.value);
      book[input.name] = input.value;
    } else {
      hasError = true;
    }
  });
  return hasError ? null : book;
}
// Attaches error element to a parent if an error exists.
function checkInputValue(inputValue, inputName, parentElement) {
  switch (inputName) {
    case "title":
      if (inputValue == "" || Number.isInteger(Number(inputValue))) {
        appendErrorElement(inputName, parentElement);
        return false;
      } else {
        return true;
      }
    case "author":
      if (inputValue == "" || Number.isInteger(Number(inputValue))) {
        appendErrorElement(inputName, parentElement);
        return false;
      } else {
        return true;
      }
    case "pages":
      console.log(inputValue);
      if (!Number.isInteger(Number(inputValue)) || inputValue == "") {
        appendErrorElement(inputName, parentElement);
        return false;
      } else {
        return true;
      }
  }
}
// Appends an error element below every input that has an error.
function appendErrorElement(inputName, parentElement) {
  const err = doc.createElement("p");
  const txt = doc.createTextNode(
    `You should not leave ${inputName} empty and please enter valid value.`
  );
  err.appendChild(txt);
  err.classList.add("warning-text");
  var hasAlreadyError = parentElement.querySelector(".warning-text");
  if (hasAlreadyError == null) parentElement.appendChild(err);
}
// Removes the error elements below every input once the modal is exited.
function removeErrorElements() {
  var errorsElements = doc.querySelectorAll(".warning-text");
  Array.from(errorsElements).forEach((element) => {
    const parentElement = element.parentElement;
    parentElement.removeChild(element);
  });
}
// Clears all input elements below every input once the modal is exited.
function clearInputElementsValues(modal) {
  const inputFields = modal.querySelectorAll(".form .input-field input");
  Array.from(inputFields).forEach((input) => (input.value = null));
}
// Creates switch toggle button element.
function createSwitchButton(book) {
  const switchToggle = doc.createElement("div");
  switchToggle.innerHTML = `
  <label class="switch">
    <input type="checkbox" ${book != null ? (book.read ? "checked" : "") : ""}>
    <span class="slider round"></span>
  </label>`;
  return switchToggle;
}
// Capitalizes the first letter of a word.
function capitalizeFirstLetter(str) {
  // converting first letter to uppercase
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);

  return capitalized;
}
