// Mock data for books
const books = [
    { title: "Electronic Devices and Circuit Theory 11th Edition", status: "available", location: "Shelf A" },
    { title: "Communication Electronics 2nd Edition", status: "unavailable", location: "Shelf B" },
    { title: "Elementary Differential Equations 8th Edition", status: "available", location: "Shelf C" },
    { title: "Applied Numerical Methods with MATLAB for Engineers and Scientists 5th Edition", status: "available", location: "Shelf A" },
    { title: "Mechanics of Materials 2nd Edition", status: "unavailable", location: "Shelf B" },
];

function showBorrowerScreen() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('borrower-screen').style.display = 'block';
    document.getElementById('librarian-screen').style.display = 'none';
    showBackButton();
    displayBooksInList(getFirstFiveBooks(), document.getElementById('bookList'));
}

function getFirstFiveBooks() {
    const uniqueBooks = [];
    const addedTitles = new Set();

    for (const book of books) {
        if (!addedTitles.has(book.title)) {
            uniqueBooks.push(book);
            addedTitles.add(book.title);

            if (uniqueBooks.length >= 5) {
                break;
            }
        }
    }

    return uniqueBooks;
}

function showLibrarianScreen() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('borrower-screen').style.display = 'none';
    document.getElementById('librarian-screen').style.display = 'block';
    displayReservationRequests();
    displayBookInventoryForLibrarian();
    showBackButton();
}

function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('borrower-screen').style.display = 'none';
    document.getElementById('librarian-screen').style.display = 'none';
    hideBackButton();
}

function showBackButton() {
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.style.display = 'inline-block';
    }
}

function hideBackButton() {
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.style.display = 'none';
    }
}

function searchBooks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';

    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchTerm) && book.status === 'available');
    displayBooksInList(filteredBooks, bookList);
}

function displayBooksInList(books, listElement) {
    const borrowerBookList = document.getElementById('bookList');
    borrowerBookList.innerHTML = ''; // Clear existing borrower book list

    books.forEach(book => {
        const li = document.createElement('li');
        li.id = `book-${book.title}`;
        li.className = 'book-item';
        // Show book in the list only if it is available
        li.innerHTML = `${book.title} - <span class="${book.status === 'available' ? 'available' : 'unavailable'}">${book.status}</span>
            <span class="location">Location: ${book.location}</span>
            <button class="reserve-button" onclick="reserveBook('${book.title}')">Reserve</button>`;
        listElement.appendChild(li);
    });
}

function reserveBook(title) {
    const reservationStatus = document.getElementById('reservationStatus');
    const existingReservation = books.find(book => book.title === title && book.status === 'reserved');

    if (existingReservation) {
        reservationStatus.innerHTML = `Reservation request for ${title} already submitted.`;
        return;
    }

    const reservedBook = books.find(book => book.title === title && book.status === 'available');
    if (reservedBook) {
        reservedBook.status = 'reserved';
        reservationStatus.innerHTML = `Reservation request for ${title} submitted. Waiting for approval.`;
        displayReservationRequests();
        // Remove the reserved book from the displayed list
        const reservedBookElement = document.getElementById(`book-${title}`);
        if (reservedBookElement) {
            reservedBookElement.remove();
        }
    } else {
        reservationStatus.innerHTML = `${title} is already reserved or unavailable.`;
    }
}

function makeBookAvailableAgain(title) {
    const returnedBook = books.find(book => book.title === title && book.status === 'unavailable');

    if (returnedBook) {
        returnedBook.status = 'available';
        updateBookStatusInLibrarianScreen(title, 'available');
        // Update the librarian screen with the latest data
        displayBookInventoryForLibrarian();
        // Highlight the returned book on the librarian screen
        highlightReturnedBookOnLibrarianScreen(title);
        // Append the returned book to the borrower screen list if it's not already there
        if (!isBookInBorrowerScreen(returnedBook)) {
            appendBookToBorrowerScreen(returnedBook);
        }
    }
}

function isBookInBorrowerScreen(book) {
    const borrowerBookList = document.getElementById('bookList');
    const existingBooks = borrowerBookList.getElementsByClassName('book-item');

    for (const existingBook of existingBooks) {
        const existingTitle = existingBook.id.replace('book-', '');
        if (existingTitle === book.title) {
            return true;
        }
    }

    return false;
}

function appendBookToBorrowerScreen(book) {
    const bookList = document.getElementById('bookList');

    // Check if the book is available before appending
    if (book.status === 'available') {
        const li = document.createElement('li');
        li.id = `book-${book.title}`;
        li.className = 'book-item';
        li.innerHTML = `${book.title} - <span class="available">Available</span>
        <span class="location">Location: ${book.location}</span>
        <button class="reserve-button" onclick="reserveBook('${book.title}')">Reserve</button>`;
        bookList.appendChild(li);
    }
}

function highlightReturnedBookOnLibrarianScreen(title) {
    const returnedBookElement = document.getElementById(`librarian-book-${title}`);
    if (returnedBookElement) {
        returnedBookElement.style.backgroundColor = 'lightgreen';
        setTimeout(() => {
            returnedBookElement.style.backgroundColor = ''; // Reset background color after a short delay
        }, 2000); // Adjust the delay duration as needed
    }
}

function displayReservationRequests() {
    const reservationRequests = books.filter(book => book.status === 'reserved');
    const librarianScreen = document.getElementById('librarian-screen');
    const reservationList = document.createElement('ul');
    reservationList.className = 'book-list';

    reservationRequests.forEach(book => {
        const li = document.createElement('li');
        li.className = 'book-item';
        li.innerHTML = `${book.title} - <span class="reserved">Reserved</span>
        <span class="location">Location: ${book.location}</span>
        <button class="approve-button" onclick="approveReservation('${book.title}')">Approve Reservation</button>`;
        reservationList.appendChild(li);
    });

    librarianScreen.innerHTML = `<h2>Reservation Requests</h2>`;
    librarianScreen.appendChild(reservationList);
}

function approveReservation(title) {
    const reservedBook = books.find(book => book.title === title && book.status === 'reserved');

    if (reservedBook) {
        reservedBook.status = 'unavailable';
        displayReservationRequests();
        displayBookInventoryForLibrarian();
        updateBookStatusInLibrarianScreen(title, 'unavailable');
        // Move the reservation status message below the "All Books" heading
        const reservationStatus = document.getElementById('reservationStatus');
        const allBooksHeading = document.getElementById('allBooksHeading'); // Assuming you add an id to the heading
        reservationStatus.innerHTML = `Reservation for ${title} has been approved. The book is now unavailable.`;
        allBooksHeading.insertAdjacentElement('afterend', reservationStatus);
    }
}

function updateBookStatusInLibrarianScreen(title, status) {
    const librarianBookElement = document.getElementById(`librarian-book-${title}`);
    if (librarianBookElement) {
        const statusSpan = librarianBookElement.querySelector('.status');
        if (statusSpan) {
            statusSpan.textContent = status;
        }
    }
}

// Function to show the move dropdown for the librarian
function showMoveDropdown(title) {
    const dropdown = document.getElementById(`locationDropdown-${title}`);
    if (dropdown) {
        dropdown.style.display = 'inline-block';
        dropdown.style.width = '100%'; // Set the width to 100%
    }
}

// Function to move the book to the selected location for the librarian
function moveBook(title, newLocation) {
    const movedBook = books.find(book => book.title === title);
    if (movedBook) {
        movedBook.location = newLocation;
        // Update the librarian screen with the latest data
        displayBookInventoryForLibrarian();
        // Highlight the moved book on the librarian screen
        highlightMovedBookOnLibrarianScreen(title);
    }
}

// Function to highlight the moved book on the librarian screen
function highlightMovedBookOnLibrarianScreen(title) {
    const movedBookElement = document.getElementById(`librarian-book-${title}`);
    if (movedBookElement) {
        movedBookElement.style.backgroundColor = 'lightblue';
        setTimeout(() => {
            movedBookElement.style.backgroundColor = ''; // Reset background color after a short delay
        }, 2000); // Adjust the delay duration as needed
    }
}

function displayBookInventoryForLibrarian() {
    const librarianScreen = document.getElementById('librarian-screen');
    let bookInventory = document.getElementById('librarian-book-inventory');

    if (!bookInventory) {
        bookInventory = document.createElement('ul');
        bookInventory.id = 'librarian-book-inventory';
        bookInventory.className = 'book-list';
        librarianScreen.innerHTML += `<h2>Book Inventory</h2>`;
        librarianScreen.appendChild(bookInventory);
    }

    bookInventory.innerHTML = ''; // Clear existing book inventory

    // Sort books with unavailable status first
    const sortedBooks = [...books].sort((a, b) => {
        if (a.status === 'unavailable' && b.status === 'available') {
            return -1;
        } else if (a.status === 'available' && b.status === 'unavailable') {
            return 1;
        } else {
            return 0;
        }
    });

    sortedBooks.forEach(book => {
        const li = document.createElement('li');
        li.id = `librarian-book-${book.title}`; // Add an id for each book element
        li.className = 'book-item';
li.innerHTML = `${book.title} - 
    <span class="${book.status === 'available' ? 'available' : 'unavailable'} status">${book.status}</span>
    <span class="location">Location: ${book.location}</span>
    ${book.status === 'unavailable' ?
        `<div class="move-container">
            <button class="returned-button" onclick="makeBookAvailableAgain('${book.title}')">Returned</button>
            <span class="location-dropdown" id="locationDropdown-${book.title}">
                <select class="small-dropdown" onchange="moveBook('${book.title}', this.value)">
                    <option value="Shelf A">Shelf A</option>
                    <option value="Shelf B">Shelf B</option>
                    <option value="Shelf C">Shelf C</option>
                </select>
            </span>
        </div>` : ''
    }`;

        bookInventory.appendChild(li);
    });
}

// Initial display
showLoginScreen();