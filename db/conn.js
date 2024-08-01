const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "mysql://root:xntSqToDpngnSryQDoCGNJFiDfESQmdD@roundhouse.proxy.rlwy.net:25725/railway",
  {
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

try {
  sequelize.authenticate();
  console.log("Conectamos com sucesso");
} catch (err) {
  console.log(`Não foi possível conectar: ${err}`);
}

module.exports = sequelize;
