const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class CarReview extends Model {}

CarReview.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    carReview: {
      type: DataTypes.STRING(10000),
      allowNull: false,
    },
    date_reviewcreated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    carmake: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    carmodel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creator_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "user",
        key: "id",
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "CarReview",
  }
);

module.exports = CarReview;
