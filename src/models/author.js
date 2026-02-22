const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Author = sequelize.define(
  "Author",
  {
    first_name: {
      type: DataTypes.STRING(100), // Max Length 100
      allowNull: false,
    },
    family_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true, // allow null for unknown birth dates
    },
    date_of_death: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    getterMethods: {
      // Model virtuals can be defined here as Sequelize getter methods
    },
  },
);

// Getter equivalent to the Mongoose virtual which returns a sanitized full name string for an author (for display or other usage)
Author.prototype.name = function () {
  let fullName = "";
  if (this.first_name && this.family_name) {
    fullName = `${this.family_name}, ${this.first_name}`;
  }

  return fullName;
};

// Virtual for author's URL
Author.prototype.url = function () {
  return `/catalog/author/${this.id}`;
};

module.exports = Author;
