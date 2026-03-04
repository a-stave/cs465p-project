#! /usr/bin/env node

console.log("Populating SQLite database with test data...");

const { connectSequelize } = require("./src/db");
const { Author, Book, Genre, BookInstance } = require("./src/models");

const genres = [];
const authors = [];
const books = [];
const bookinstances = [];

main().catch((err) => console.error(err));

async function main() {
  console.log("Connecting to SQLite...");
  await connectSequelize();

  console.log("Creating data...");
  await createGenres();
  await createAuthors();
  await createBooks();
  await createBookInstances();

  console.log("Done.");
  process.exit(0);
}

// --- CREATE HELPERS ---

async function genreCreate(index, name) {
  const genre = await Genre.create({ name });
  genres[index] = genre;
  console.log(`Added genre: ${name}`);
}

async function authorCreate(index, first_name, family_name, d_birth, d_death) {
  const author = await Author.create({
    first_name,
    family_name,
    date_of_birth: d_birth || null,
    date_of_death: d_death || null,
  });
  authors[index] = author;
  console.log(`Added author: ${first_name} ${family_name}`);
}

async function bookCreate(index, title, summary, isbn, author, genreList) {
  const book = await Book.create({
    title,
    summary,
    isbn,
    AuthorId: author.id, // Set the foreign key for the author association
  });

  if (genreList) {
    await book.setGenres(genreList);
  }

  books[index] = book;
  console.log(`Added book: ${title}`);
}

async function bookInstanceCreate(index, book, imprint, due_back, status) {
  const bookinstance = await BookInstance.create({
    imprint,
    due_back: due_back ?? undefined, // Use undefined to trigger default value, null overrides default
    status: status || "Maintenance",
    BookId: book.id, // Set the foreign key for the book association immediately to avoid error
  });

  bookinstances[index] = bookinstance;
  console.log(`Added bookinstance: ${imprint}`);
}

// --- BATCH CREATION ---

async function createGenres() {
  console.log("Adding genres");
  await Promise.all([
    genreCreate(0, "Fantasy"),
    genreCreate(1, "Science Fiction"),
    genreCreate(2, "French Poetry"),
  ]);
}

async function createAuthors() {
  console.log("Adding authors");
  await Promise.all([
    authorCreate(0, "Patrick", "Rothfuss", "1973-06-06", null),
    authorCreate(1, "Ben", "Bova", "1932-11-08", null),
    authorCreate(2, "Isaac", "Asimov", "1920-01-02", "1992-04-06"),
    authorCreate(3, "Bob", "Billings", null, null),
    authorCreate(4, "Jim", "Jones", "1971-12-16", null),
  ]);
}

async function createBooks() {
  console.log("Adding books");
  await Promise.all([
    bookCreate(
      0,
      "The Name of the Wind (The Kingkiller Chronicle, #1)",
      "I have stolen princesses back from sleeping barrow kings...",
      "9781473211896",
      authors[0],
      [genres[0]],
    ),
    bookCreate(
      1,
      "The Wise Man's Fear (The Kingkiller Chronicle, #2)",
      "Picking up the tale of Kvothe Kingkiller once again...",
      "9788401352836",
      authors[0],
      [genres[0]],
    ),
    bookCreate(
      2,
      "The Slow Regard of Silent Things (Kingkiller Chronicle)",
      "Deep below the University, there is a dark place. Few people know of it: ...",
      "9780756411336",
      authors[0],
      [genres[0]],
    ),
    bookCreate(
      3,
      "Apes and Angels",
      "Humankind headed out to the stars...",
      "9780765379528",
      authors[1],
      [genres[1]],
    ),
    bookCreate(
      4,
      "Death Wave",
      "In Ben Bova's previous novel New Earth...",
      "9780765379504",
      authors[1],
      [genres[1]],
    ),
    bookCreate(
      5,
      "Test Book 1",
      "Summary of test book 1",
      "ISBN111111",
      authors[4],
      [genres[0], genres[1]],
    ),
    bookCreate(
      6,
      "Test Book 2",
      "Summary of test book 2",
      "ISBN222222",
      authors[4],
      null,
    ),
  ]);
}

async function createBookInstances() {
  console.log("Adding book instances");
  await Promise.all([
    bookInstanceCreate(
      0,
      books[0],
      "London Gollancz, 2014.",
      null,
      "Available",
    ),
    bookInstanceCreate(1, books[1], "Gollancz, 2011.", null, "Loaned"),
    bookInstanceCreate(2, books[2], "Gollancz, 2015.", null, null),
    bookInstanceCreate(
      3,
      books[3],
      "New York Tom Doherty Associates, 2016.",
      null,
      "Available",
    ),
    bookInstanceCreate(
      4,
      books[3],
      "New York Tom Doherty Associates, 2016.",
      null,
      "Available",
    ),
    bookInstanceCreate(
      5,
      books[3],
      "New York Tom Doherty Associates, 2016.",
      null,
      "Available",
    ),
    bookInstanceCreate(
      6,
      books[4],
      "New York, NY Tom Doherty Associates, LLC, 2015.",
      null,
      "Available",
    ),
    bookInstanceCreate(
      7,
      books[4],
      "New York, NY Tom Doherty Associates, LLC, 2015.",
      null,
      "Maintenance",
    ),
    bookInstanceCreate(
      8,
      books[4],
      "New York, NY Tom Doherty Associates, LLC, 2015.",
      null,
      "Loaned",
    ),
    bookInstanceCreate(9, books[0], "Imprint XXX2", null, null),
    bookInstanceCreate(10, books[1], "Imprint XXX3", null, null),
  ]);
}
