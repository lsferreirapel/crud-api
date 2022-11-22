import knex from "knex";

export default knex({
  client: "better-sqlite3",
  connection: {
    filename: "./db/crud.db",
  },
  useNullAsDefault: true,
});
