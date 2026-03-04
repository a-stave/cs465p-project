const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const { DateTime } = require("luxon");

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
      name() {
        let fullName = "";
        if (this.first_name && this.family_name) {
          fullName = `${this.family_name}, ${this.first_name}`;
        }
        return fullName;
      },
      url() {
        return `/catalog/author/${this.id}`;
      },
      // Virtual for author's lifespan (e.g. "1920 - 1999" or "1920 - present" or "Unknown")
      lifespan() {
        let lifespan = "";
        this.date_of_birth
          ? (lifespan += DateTime.fromJSDate(this.date_of_birth).toLocaleString(
              DateTime.DATE_SHORT,
            ))
          : (lifespan += "Unknown");
        this.date_of_death
          ? (lifespan += ` - ${DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_SHORT)}`)
          : this.date_of_birth
            ? (lifespan += " - present")
            : false;
        return lifespan;
      },
      date_of_birth_yyyy_mm_dd() {
        return this.date_of_birth
          ? DateTime.fromJSDate(this.date_of_birth).toISODate() // "YYYY-MM-DD"
          : "";
      },
      date_of_death_yyyy_mm_dd() {
        return this.date_of_death
          ? DateTime.fromJSDate(this.date_of_death).toISODate()
          : "";
      },
    },
  },
);

module.exports = Author;
