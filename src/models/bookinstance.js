const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const { DateTime } = require("luxon");

const BookInstance = sequelize.define(
  "BookInstance",
  {
    imprint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Available", "Maintenance", "Loaned", "Reserved"),
      allowNull: false,
      defaultValue: "Maintenance",
    },
    due_back: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    // NOTE: Book is added in `index.js` after all models are loaded
  },
  {
    getterMethods: {
      url() {
        return `/catalog/bookinstance/${this.id}`;
      },
      due_back_formatted() {
        return DateTime.fromJSDate(this.due_back).toLocaleString(
          DateTime.DATE_MED_WITH_WEEKDAY,
        );
      },
    },
  },
);

module.exports = BookInstance;
