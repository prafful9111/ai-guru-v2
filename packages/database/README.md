# @repo/database

This package contains the Prisma schema and client for the application.

## Setup

1. Copy `.env.example` to `.env` (if it exists, otherwise create one provided below).
2. Set the `DATABASE_URL` in `.env`.

\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
\`\`\`

## commands

- \`pnpm db:generate\`: Generates the Prisma Client.
- \`pnpm db:push\`: Pushes the schema to the database.
