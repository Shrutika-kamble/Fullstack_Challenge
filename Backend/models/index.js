const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING(60), allowNull: false },
  email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(200), allowNull: false },
  address: { type: DataTypes.STRING(400), allowNull: true },
  role: { type: DataTypes.ENUM('admin','user','store_owner'), allowNull: false, defaultValue: 'user' }
});

const Store = sequelize.define('Store', {
  name: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(120), allowNull: true },
  address: { type: DataTypes.STRING(400), allowNull: true }
});

const Rating = sequelize.define('Rating', {
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min:1, max:5 } }
});

// Relations
User.hasMany(Rating, { foreignKey: 'userId' });
Rating.belongsTo(User, { foreignKey: 'userId' });

Store.hasMany(Rating, { foreignKey: 'storeId' });
Rating.belongsTo(Store, { foreignKey: 'storeId' });

// If a store is owned by a user (store owner)
User.hasMany(Store, { foreignKey: 'ownerId' });
Store.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

module.exports = { sequelize, User, Store, Rating };
