import { pgTable, text, date } from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().unique().notNull(),
  address: text().notNull(),
  state: text().notNull(),
  zipCode: text().notNull(),
  country: text().notNull(),
  dateOfBirth: date({ mode: "date" }),
});
