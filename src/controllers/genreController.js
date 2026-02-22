const { Book, Author, Genre, BookInstance } = require("../models");

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
exports.genre_create_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre create GET");
};

// Handle Genre create on POST.
exports.genre_create_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre create POST");
};

// Display Genre delete form on GET.
exports.genre_delete_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre delete GET");
};

// Handle Genre delete on POST.
exports.genre_delete_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre delete POST");
};

// Display Genre update form on GET.
exports.genre_update_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
};

// Handle Genre update on POST.
exports.genre_update_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
};
