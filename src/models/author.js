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
        // this.date_of_birth
        //   ? (lifespan += this.date_of_birth.getFullYear())
        //   : (lifespan += "Unknown");
        // this.date_of_death
        //   ? (lifespan += ` - ${this.date_of_death.getFullYear()}`)
        //   : this.date_of_birth
        //     ? (lifespan += " - present")
        //     : false;
        return lifespan;
      },
    },
  },
);

// Getter equivalent to the Mongoose virtual which returns a sanitized full name string for an author (for display or other usage)
// NOTE: For some reason this doesn't work as a virtual property, so I've implemented it as a getter method instead. It can be accessed
// as author.name, as we do in the tutorial.

// Author.prototype.name = function () {
//   let fullName = "";
//   if (this.first_name && this.family_name) {
//     fullName = `${this.family_name}, ${this.first_name}`;
//   }

//   return fullName;
// };

// // Virtual for author's URL
// Author.prototype.url = function () {
//   return `/catalog/author/${this.id}`;
// };

module.exports = Author;
