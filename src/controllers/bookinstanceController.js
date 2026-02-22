const { Book, Author, Genre, BookInstance } = require("../models");

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
  res.send("NOT IMPLEMENTED: BookInstance create GET");
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance create POST");
};

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance delete GET");
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance delete POST");
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
};
