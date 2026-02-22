const { Book, Author, Genre, BookInstance } = require("../models");

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
  res.send("NOT IMPLEMENTED: Book create GET");
};

// Handle book create on POST.
exports.book_create_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book create POST");
};

// Display book delete form on GET.
exports.book_delete_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
};

// Handle book delete on POST.
exports.book_delete_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
};

// Display book update form on GET.
exports.book_update_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update GET");
};

// Handle book update on POST.
exports.book_update_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update POST");
};
