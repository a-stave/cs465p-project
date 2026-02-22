const { Book, Author, Genre, BookInstance } = require("../models");

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
exports.author_create_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author create GET");
};

// Handle Author create on POST.
exports.author_create_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author create POST");
};

// Display Author delete form on GET.
exports.author_delete_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
};

// Handle Author delete on POST.
exports.author_delete_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
};

// Display Author update form on GET.
exports.author_update_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST.
exports.author_update_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};
