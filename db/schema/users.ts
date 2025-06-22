// import { pgTable, text } from 'drizzle-orm/pg-core'
// import type { UserStatus } from '@entities/user/user-status'

// export const user = pgTable('user', {
//   id: text('id').primaryKey(),
//   name: text('name').notNull(),
//   email: text('email').notNull().unique(),
//   status: text('status').$type<UserStatus>().notNull(),
// })

import { pgTable, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
});