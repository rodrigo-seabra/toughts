const { DataTypes } = require("sequelize");

const db = require("../db/conn");

const User = require("./User");

const Tought = db.define("Tought", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    require: true,
  },
});

Tought.belongsTo(User); // o pensamento pertece ao user
User.hasMany(Tought); // o user detem/ tem o pensamento

module.exports = Tought;
