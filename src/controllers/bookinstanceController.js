const { Book, Author, Genre, BookInstance } = require("../models");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = async (req, res, next) => {
  try {
    const allBookInstances = await BookInstance.findAll({
      include: {
        model: Book,
        attributes: ["id", "title"],
      },
      order: [["id", "ASC"]],
    });

    res.render("bookinstance_list", {
      title: "Book Instance List",
      bookinstance_list: allBookInstances,
    });
  } catch (err) {
    next(err);
  }
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async (req, res, next) => {
  try {
    const id = req.params.id;

    const bookInstance = await BookInstance.findByPk(id, {
      include: {
        model: Book,
        attributes: ["id", "title"],
      },
    });

    if (!bookInstance) {
      const err = new Error("Book copy not found");
      err.status = 404;
      return next(err);
    }

    res.render("bookinstance_detail", {
      title: "Book:",
      bookinstance: bookInstance,
    });
  } catch (err) {
    next(err);
  }
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = async (req, res, next) => {
  try {
    const allBooks = await Book.findAll({
      attributes: ["id", "title"],
      order: [["title", "ASC"]],
    });

    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: allBooks,
    });
  } catch (err) {
    next(err);
  }
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request
  async (req, res, next) => {
    const errors = validationResult(req);

    // Build (but do not save) the BookInstance
    const bookInstance = BookInstance.build({
      BookId: req.body.book, // Sequelize FK
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back || null,
    });

    if (!errors.isEmpty()) {
      // Re-fetch books for the form
      const allBooks = await Book.findAll({
        attributes: ["id", "title"],
        order: [["title", "ASC"]],
      });

      return res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: req.body.book, // now a string ID
        errors: errors.array(),
        bookinstance: bookInstance,
      });
    }

    // Save and redirect
    await bookInstance.save();
    res.redirect(bookInstance.url);
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = async (req, res, next) => {
  try {
    const instanceId = req.params.id;

    const bookinstance = await BookInstance.findByPk(instanceId, {
      include: Book, // so we can show book title in the template
    });

    if (!bookinstance) {
      return res.redirect("/catalog/bookinstances");
    }

    res.render("bookinstance_delete", {
      title: "Delete BookInstance",
      bookinstance,
    });
  } catch (err) {
    next(err);
  }
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = async (req, res, next) => {
  try {
    await BookInstance.destroy({
      where: { id: req.body.bookinstanceid },
    });

    res.redirect("/catalog/bookinstances");
  } catch (err) {
    next(err);
  }
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async (req, res, next) => {
  try {
    const instanceId = req.params.id;

    // Get BookInstance and list of all Books
    const [bookinstance, allBooks] = await Promise.all([
      BookInstance.findByPk(instanceId, {
        include: Book, // so we can show the current book title
      }),
      Book.findAll({
        attributes: ["id", "title"],
        order: [["title", "ASC"]],
      }),
    ]);

    if (!bookinstance) {
      const err = new Error("BookInstance not found");
      err.status = 404;
      return next(err);
    }

    res.render("bookinstance_form", {
      title: "Update BookInstance",
      book_list: allBooks,
      selected_book: bookinstance.BookId,
      bookinstance,
    });
  } catch (err) {
    next(err);
  }
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  async (req, res, next) => {
    const errors = validationResult(req);
    const instanceId = req.params.id;

    // Build updated BookInstance object
    const bookinstance = BookInstance.build({
      id: instanceId, // keep same ID
      BookId: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back || null,
    });

    if (!errors.isEmpty()) {
      // Re-fetch books for dropdown
      const allBooks = await Book.findAll({
        attributes: ["id", "title"],
        order: [["title", "ASC"]],
      });

      return res.render("bookinstance_form", {
        title: "Update BookInstance",
        book_list: allBooks,
        selected_book: req.body.book,
        bookinstance,
        errors: errors.array(),
      });
    }

    // Update the record
    await BookInstance.update(
      {
        BookId: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back || null,
      },
      { where: { id: instanceId } },
    );

    res.redirect(bookinstance.url);
  },
];
