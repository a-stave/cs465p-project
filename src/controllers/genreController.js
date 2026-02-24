const { Book, Author, Genre, BookInstance, sequelize } = require("../models");
const { body, validationResult } = require("express-validator");

// Display list of all Genres.
exports.genre_list = async (req, res, next) => {
  try {
    const allGenres = await Genre.findAll({
      order: [["name", "ASC"]],
    });

    res.render("genre_list", {
      title: "Genre List",
      genre_list: allGenres,
    });
  } catch (err) {
    next(err);
  }
};

exports.genre_detail = async (req, res, next) => {
  try {
    const genreId = req.params.id;

    // Get genre and all books in this genre
    const [genre, booksInGenre] = await Promise.all([
      Genre.findByPk(genreId),
      Book.findAll({
        include: {
          model: Genre,
          where: { id: genreId },
          attributes: [], // don't duplicate genre fields in each book
        },
        attributes: ["id", "title", "summary"],
      }),
    ]);

    if (!genre) {
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }

    res.render("genre_detail", {
      title: "Genre Detail",
      genre,
      genre_books: booksInGenre,
    });
  } catch (err) {
    next(err);
  }
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    const errors = validationResult(req);

    // Create a Genre instance (not saved yet)
    const genre = Genre.build({ name: req.body.name });

    if (!errors.isEmpty()) {
      // Validation errors — re-render form with sanitized values and errors
      return res.render("genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array(),
      });
    }

    // Check if a genre with the same name already exists (case-insensitive)
    const genreExists = await Genre.findOne({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("name")),
        req.body.name.toLowerCase(),
      ),
    });

    if (genreExists) {
      // Genre exists — redirect to its detail page
      return res.redirect(genreExists.url);
    }

    // Save new genre and redirect
    await genre.save();
    res.redirect(genre.url);
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = async (req, res, next) => {
  try {
    const genreId = req.params.id;

    // Get genre and all books that include this genre
    const [genre, booksWithGenre] = await Promise.all([
      Genre.findByPk(genreId),
      Book.findAll({
        include: {
          model: Genre,
          where: { id: genreId },
        },
        attributes: ["id", "title", "summary"],
        order: [["title", "ASC"]],
      }),
    ]);

    if (!genre) {
      return res.redirect("/catalog/genres");
    }

    res.render("genre_delete", {
      title: "Delete Genre",
      genre,
      genre_books: booksWithGenre,
    });
  } catch (err) {
    next(err);
  }
};

// Handle Genre delete on POST.
exports.genre_delete_post = async (req, res, next) => {
  try {
    const genreId = req.params.id;

    const [genre, booksWithGenre] = await Promise.all([
      Genre.findByPk(genreId),
      Book.findAll({
        include: {
          model: Genre,
          where: { id: genreId },
        },
        attributes: ["id", "title", "summary"],
      }),
    ]);

    if (booksWithGenre.length > 0) {
      // Genre is still in use — cannot delete
      return res.render("genre_delete", {
        title: "Delete Genre",
        genre,
        genre_books: booksWithGenre,
      });
    }

    // Safe to delete
    await Genre.destroy({ where: { id: req.body.genreid } });

    res.redirect("/catalog/genres");
  } catch (err) {
    next(err);
  }
};

// Display Genre update form on GET.
exports.genre_update_get = async (req, res, next) => {
  try {
    const genre = await Genre.findByPk(req.params.id);

    if (!genre) {
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }

    res.render("genre_form", {
      title: "Update Genre",
      genre,
    });
  } catch (err) {
    next(err);
  }
};

// Handle Genre update on POST.
exports.genre_update_post = [
  // Validate and sanitize
  body("name", "Genre name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    const genreId = req.params.id;

    // Build a genre object with the updated data
    const genre = Genre.build({
      id: genreId, // IMPORTANT: keep same ID
      name: req.body.name,
    });

    if (!errors.isEmpty()) {
      return res.render("genre_form", {
        title: "Update Genre",
        genre,
        errors: errors.array(),
      });
    }

    // Update the record
    await Genre.update({ name: req.body.name }, { where: { id: genreId } });

    res.redirect(genre.url);
  },
];
