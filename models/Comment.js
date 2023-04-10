// Here we define the comment sequilize model

const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");
class Comment extends Model {}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    comment_description: {
      type: DataTypes.STRING,
    },
    date_commentcreated: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    carReview_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "CarReview",
        key: "id",
      },
    },
    commenter_id: {
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
    underscored: false,
    modelName: "comment",
  }
);
module.exports = Comment;
