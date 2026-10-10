require("dotenv").config();
const sequelize = require("../config/db");

(async () => {
  try {
    const [cols] = await sequelize.query(
      "SHOW COLUMNS FROM main_customers LIKE 'is_delivered'"
    );
    if (cols.length) {
      console.log("is_delivered already exists");
    } else {
      await sequelize.query(
        "ALTER TABLE main_customers ADD COLUMN is_delivered TINYINT NOT NULL DEFAULT 0"
      );
      console.log("added is_delivered");
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
