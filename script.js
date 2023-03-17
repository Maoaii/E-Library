const container = document.querySelector(".library");
const form = document.querySelector(".add-books");
const submitButton = document.querySelector("#submit");
const popupButton = document.querySelector(".popup-btn");
const closePopupButton = document.querySelector("#close");
const storagePopup = document.querySelector(".cookie-overlay");
const acceptLocalStorageButton = document.querySelector(".accept-local-storage");
const declineLocalStorageButton = document.querySelector(".decline-local-storage");
const clearStorageButton = document.querySelector(".clear-storage");

let myLibrary = [];
let bookIndex = 0;
let acceptLocalStorage = true;
retrieveData();
displayBooks();

form.addEventListener("submit", addBookToLibrary);
closePopupButton.addEventListener("click", (e) => {
    form.classList.toggle("open-popup");
    clearInputs();
});
popupButton.addEventListener("click", (e) => {
    form.classList.toggle("open-popup");
    clearInputs();
})
acceptLocalStorageButton.addEventListener("click", (e) => {
    localStorage.setItem("accept-local-storage", true);
    acceptLocalStorage = true;
    storagePopup.remove();
    saveAllData();
});
declineLocalStorageButton.addEventListener("click", (e) => {
    localStorage.setItem("accept-local-storage", false);
    acceptLocalStorage = false;
    storagePopup.remove();
    e.target.parentElement.remove();
});
clearStorageButton.addEventListener("click", (e) => {
    storagePopup.remove();
    localStorage.clear();
    location.reload();
});


function Book(title, author, numPages, read, index) {
    this.title = title;
    this.author = author;
    this.numPages = numPages;
    this.read = read;
    this.index = index;
}


function addBookToLibrary(event) {
    event.preventDefault();

    const title = document.querySelector("#name").value;
    const author = document.querySelector("#author").value;
    const numPages = document.querySelector("#pages").value;
    const read = document.querySelector("#read").checked;

    const index = bookIndex++ % 60000;
    const newBook = new Book(title, author, numPages, read, index);
    myLibrary.push(newBook);

    displayBook(newBook);
    saveData('books', myLibrary);
    saveData('bookIndex', bookIndex);
    form.classList.toggle("open-popup");
}

function clearInputs() {
    const inputs = document.querySelectorAll("input");

    inputs.forEach(input => {
        input.value = "";
        input.checked = false;
    });
}

function displayBooks() {
    myLibrary.forEach(book => {
        displayBook(book);
    });
}

function displayBook(newBook) {
        const bookContainer = document.createElement("div");
        const title = document.createElement("h2");
        const author = document.createElement("p");
        const pages = document.createElement("p");
        const read = document.createElement("button");
        const deleteBook = document.createElement("button");

        bookContainer.classList.add("book");
        bookContainer.setAttribute("data-id", newBook.index);

        title.textContent = newBook.title;
        author.textContent = newBook.author;
        pages.textContent = `Total pages: ${newBook.numPages}`;
        read.textContent = "Read";
        deleteBook.textContent = "Delete book";

        
        read.classList.add("read-button")
        read.classList.add("toggle-btn")
        deleteBook.classList.add("delete-button");
        deleteBook.classList.add("toggle-btn");
        if (newBook.read) {
            read.classList.toggle("read");
        }

        read.addEventListener("click", (e) => {
            read.classList.toggle("read");
            const clickedBookIndex = e.target.parentElement.dataset.id;
            const book = myLibrary.find((book) => book.index == clickedBookIndex);
            book.read = !book.read;
            saveData('books', myLibrary);
        });
        deleteBook.addEventListener("click", (e) => {
            const book = e.target.parentElement;
            book.remove();
            const a = myLibrary.find((book) => book.index == e.target.parentElement.dataset.id);
            myLibrary.splice(myLibrary.indexOf(a), 1);
            saveData('books', myLibrary);
        });

        bookContainer.appendChild(title);
        bookContainer.appendChild(author);
        bookContainer.appendChild(pages);
        bookContainer.appendChild(read);
        bookContainer.appendChild(deleteBook);

        container.appendChild(bookContainer);
}

function saveAllData() {
    saveData('books', myLibrary);
    saveData('bookIndex', bookIndex);
    saveData('accept-local-storage', acceptLocalStorage);
}

function saveData(key, obj) {
    if (storageAvailable('localStorage') && acceptLocalStorage == true) {
        localStorage.setItem(key, JSON.stringify(obj));
    }
}

function retrieveData() {
    const books = localStorage.getItem("books");
    const index = localStorage.getItem("bookIndex");
    const canStore = localStorage.getItem("accept-local-storage");
    if (books) {
        myLibrary = JSON.parse(books);
    }

    if (index) {
        bookIndex = JSON.parse(index);
    }

    if (canStore) {
        acceptLocalStorage = JSON.parse(canStore);
    }
}

function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}