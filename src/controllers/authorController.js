const { Book, Author, Genre, BookInstance } = require("../models");
const { body, validationResult } = require("express-validator");

exports.author_list = async (req, res, next) => {
  try {
    const allAuthors = await Author.findAll({
      order: [["family_name", "ASC"]],
    });

    res.render("author_list", {
      title: "Author List",
      author_list: allAuthors,
    });
  } catch (err) {
    next(err);
  }
};

// Display detail page for a specific Author.
exports.author_detail = async (req, res, next) => {
  try {
    const authorId = req.params.id;

    // Get author and all books written by this author
    const [author, allBooksByAuthor] = await Promise.all([
      Author.findByPk(authorId),

      Book.findAll({
        where: { AuthorId: authorId },
        attributes: ["id", "title", "summary"],
        order: [["title", "ASC"]],
      }),
    ]);

    if (!author) {
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }

    res.render("author_detail", {
      title: "Author Detail",
      author,
      author_books: allBooksByAuthor,
    });
  } catch (err) {
    next(err);
  }
};

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
};

// Handle Author create on POST.
exports.author_create_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric() // Note: this will fail if the name contains spaces or hyphens, but it's just an example
    .withMessage("First name has non-alphanumeric characters."),

  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),

  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    const errors = validationResult(req);

    // Build (but do not save) the Author instance
    const author = Author.build({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth || null,
      date_of_death: req.body.date_of_death || null,
    });

    if (!errors.isEmpty()) {
      // Re-render form with sanitized values and errors
      return res.render("author_form", {
        title: "Create Author",
        author,
        errors: errors.array(),
      });
    }

    // Save and redirect
    await author.save();
    res.redirect(author.url);
  },
];

// Display Author delete form on GET.
exports.author_delete_get = async (req, res, next) => {
  try {
    const authorId = req.params.id;

    // Get author and all books written by this author
    const [author, allBooksByAuthor] = await Promise.all([
      Author.findByPk(authorId),

      Book.findAll({
        where: { AuthorId: authorId },
        attributes: ["id", "title", "summary"],
        order: [["title", "ASC"]],
      }),
    ]);

    if (!author) {
      // No results — redirect to author list
      return res.redirect("/catalog/authors");
    }

    res.render("author_delete", {
      title: "Delete Author",
      author,
      author_books: allBooksByAuthor,
    });
  } catch (err) {
    next(err);
  }
};

// Handle Author delete on POST.
exports.author_delete_post = async (req, res, next) => {
  try {
    const authorId = req.params.id;

    // Get author and all books written by this author
    const [author, allBooksByAuthor] = await Promise.all([
      Author.findByPk(authorId),
      Book.findAll({
        where: { AuthorId: authorId },
        attributes: ["id", "title", "summary"],
        order: [["title", "ASC"]],
      }),
    ]);

    if (allBooksByAuthor.length > 0) {
      // Author has books — re-render the delete page
      return res.render("author_delete", {
        title: "Delete Author",
        author,
        author_books: allBooksByAuthor,
      });
    }

    // Author has no books — safe to delete
    await Author.destroy({ where: { id: req.body.authorid } });

    res.redirect("/catalog/authors");
  } catch (err) {
    next(err);
  }
};

// Display Author update form on GET.
exports.author_update_get = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id);

    if (!author) {
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }

    res.render("author_form", {
      title: "Update Author",
      author,
    });
  } catch (err) {
    next(err);
  }
};

// Handle Author update on POST.
exports.author_update_post = [
  // Validate and sanitize fields.
  body("first_name", "First name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("family_name", "Family name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  async (req, res, next) => {
    const errors = validationResult(req);
    const authorId = req.params.id;

    // Build an author object with the updated data
    const author = Author.build({
      id: authorId, // IMPORTANT: keep same ID
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth || null,
      date_of_death: req.body.date_of_death || null,
    });

    if (!errors.isEmpty()) {
      return res.render("author_form", {
        title: "Update Author",
        author,
        errors: errors.array(),
      });
    }

    // Update the record
    await Author.update(
      {
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth || null,
        date_of_death: req.body.date_of_death || null,
      },
      { where: { id: authorId } },
    );

    res.redirect(author.url);
  },
];
