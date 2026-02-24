const { Book, Author, Genre, BookInstance, sequelize } = require("../models");
const { body, validationResult } = require("express-validator");

// Display home page with counts of various entities.
// From tutorial: "Note that the code is very simple because we ASSUME that the database
// queries succeed. If any database operations fail, the exception that is thrown will
// cause the Promise to reject, and Express will pass the error to the `next` middleware
// handler in the chain."
exports.index = async (req, res, next) => {
  try {
    const [
      numBooks,
      numBookInstances,
      numAvailableBookInstances,
      numAuthors,
      numGenres,
    ] = await Promise.all([
      Book.count(), // count all books in .db file
      BookInstance.count(),
      BookInstance.count({ where: { status: "Available" } }), // filtered count
      Author.count(),
      Genre.count(),
    ]);

    res.render("index", {
      title: "Local Library Home",
      book_count: numBooks,
      book_instance_count: numBookInstances,
      book_instance_available_count: numAvailableBookInstances,
      author_count: numAuthors,
      genre_count: numGenres,
    });
  } catch (err) {
    next(err);
  }
};

// Display list of all books.
exports.book_list = async (req, res, next) => {
  try {
    const allBooks = await Book.findAll({
      attributes: ["id", "title"], // include only needed fields
      include: {
        model: Author,
        attributes: ["id", "first_name", "family_name"],
      },
      order: [["title", "ASC"]],
    });

    res.render("book_list", {
      title: "Book List",
      book_list: allBooks,
    });
  } catch (err) {
    next(err);
  }
};

// Display detail page for a specific book.
exports.book_detail = async (req, res, next) => {
  try {
    const bookId = req.params.id;

    // Get book details (with Author + Genres) and all its BookInstances
    const [book, bookInstances] = await Promise.all([
      Book.findByPk(bookId, {
        include: [
          {
            model: Author,
            attributes: ["id", "first_name", "family_name"],
          },
          {
            model: Genre,
            attributes: ["id", "name"],
            through: { attributes: [] }, // hide join table
          },
        ],
      }),

      BookInstance.findAll({
        where: { BookId: bookId },
        order: [["id", "ASC"]],
      }),
    ]);

    if (!book) {
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }

    res.render("book_detail", {
      title: book.title,
      book,
      book_instances: bookInstances,
    });
  } catch (err) {
    next(err);
  }
};

// Display book create form on GET.
exports.book_create_get = async (req, res, next) => {
  try {
    // Get all authors and genres for the form
    const [allAuthors, allGenres] = await Promise.all([
      Author.findAll({ order: [["family_name", "ASC"]] }),
      Genre.findAll({ order: [["name", "ASC"]] }),
    ]);

    res.render("book_form", {
      title: "Create Book",
      authors: allAuthors,
      genres: allGenres,
    });
  } catch (err) {
    next(err);
  }
};

// Handle book create on POST.
exports.book_create_post = [
  // Convert genre to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body("isbn", "ISBN must not be empty.").trim().isLength({ min: 1 }).escape(),

  body("genre.*").escape(),

  // Process request
  async (req, res, next) => {
    const errors = validationResult(req);

    // Build (but do not save) the Book instance
    const book = Book.build({
      title: req.body.title,
      summary: req.body.summary,
      isbn: req.body.isbn,
      AuthorId: req.body.author, // Sequelize FK
    });

    if (!errors.isEmpty()) {
      // Re-fetch authors and genres
      const [allAuthors, allGenres] = await Promise.all([
        Author.findAll({ order: [["family_name", "ASC"]] }),
        Genre.findAll({ order: [["name", "ASC"]] }),
      ]);

      // Mark selected genres as checked
      for (const genre of allGenres) {
        if (req.body.genre.includes(String(genre.id))) {
          genre.checked = true;
        }
      }

      return res.render("book_form", {
        title: "Create Book",
        authors: allAuthors,
        genres: allGenres,
        book,
        errors: errors.array(),
      });
    }

    // Save book first (so it gets an ID)
    await book.save();

    // Then save many-to-many genres
    if (req.body.genre.length > 0) {
      await book.setGenres(req.body.genre);
    }

    res.redirect(book.url);
  },
];

// Display book delete form on GET.
exports.book_delete_get = async (req, res, next) => {
  try {
    const bookId = req.params.id;

    const [book, allBookInstances] = await Promise.all([
      Book.findByPk(bookId, {
        include: Author, // so we can show book.author.name
      }),
      BookInstance.findAll({
        where: { BookId: bookId },
        order: [["imprint", "ASC"]],
      }),
    ]);

    if (!book) {
      return res.redirect("/catalog/books");
    }

    res.render("book_delete", {
      title: "Delete Book",
      book,
      book_instances: allBookInstances,
    });
  } catch (err) {
    next(err);
  }
};

// Handle book delete on POST.
exports.book_delete_post = async (req, res, next) => {
  try {
    const bookId = req.params.id;

    const [book, allBookInstances] = await Promise.all([
      Book.findByPk(bookId, { include: Author }),
      BookInstance.findAll({ where: { BookId: bookId } }),
    ]);

    if (allBookInstances.length > 0) {
      // Book still has instances — cannot delete
      return res.render("book_delete", {
        title: "Delete Book",
        book,
        book_instances: allBookInstances,
      });
    }

    // Safe to delete
    await Book.destroy({ where: { id: req.body.bookid } });

    res.redirect("/catalog/books");
  } catch (err) {
    next(err);
  }
};

// Display book update form on GET.
exports.book_update_get = async (req, res, next) => {
  try {
    const bookId = req.params.id;

    // Get book, authors, and genres
    const [book, allAuthors, allGenres] = await Promise.all([
      Book.findByPk(bookId, {
        include: [Author, Genre], // so we get book.Genres
      }),
      Author.findAll({ order: [["family_name", "ASC"]] }),
      Genre.findAll({ order: [["name", "ASC"]] }),
    ]);

    if (!book) {
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }

    // Mark selected genres as checked
    const bookGenreIds = book.Genres.map((g) => g.id);

    for (const genre of allGenres) {
      if (bookGenreIds.includes(genre.id)) {
        genre.checked = true;
      }
    }

    res.render("book_form", {
      title: "Update Book",
      authors: allAuthors,
      genres: allGenres,
      book,
    });
  } catch (err) {
    next(err);
  }
};

// Handle book update on POST.
exports.book_update_post = [
  // Convert genre to array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request
  async (req, res, next) => {
    const errors = validationResult(req);
    const bookId = req.params.id;

    // Build a book object with the updated data
    const book = Book.build({
      id: bookId, // IMPORTANT: keep the same ID
      title: req.body.title,
      summary: req.body.summary,
      isbn: req.body.isbn,
      AuthorId: req.body.author,
    });

    if (!errors.isEmpty()) {
      // Re-fetch authors and genres
      const [allAuthors, allGenres] = await Promise.all([
        Author.findAll({ order: [["family_name", "ASC"]] }),
        Genre.findAll({ order: [["name", "ASC"]] }),
      ]);

      // Mark selected genres
      for (const genre of allGenres) {
        if (req.body.genre.includes(String(genre.id))) {
          genre.checked = true;
        }
      }

      return res.render("book_form", {
        title: "Update Book",
        authors: allAuthors,
        genres: allGenres,
        book,
        errors: errors.array(),
      });
    }

    // Update the book record
    await Book.update(
      {
        title: req.body.title,
        summary: req.body.summary,
        isbn: req.body.isbn,
        AuthorId: req.body.author,
      },
      { where: { id: bookId } },
    );

    // Update many-to-many genres
    const updatedBook = await Book.findByPk(bookId);
    await updatedBook.setGenres(req.body.genre);

    res.redirect(updatedBook.url);
  },
];
