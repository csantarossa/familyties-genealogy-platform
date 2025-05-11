# FamilyTies: Technical Guide

Welcome to the FamilyTies technical guide. This guide will cover the following:

1. **Installation**
2. **Stack**

---

## Installation

To install the codebase locally, please follow these steps:

1. Navigate to the GitHub repository.
2. Select the `Clone` button and copy the URI.
3. Open a terminal on your computer, and navigate to the desired directory.
4. Complete the following command: `git clone <copied URI>`.
5. Once cloned, navigate inside the directory and type `npm install` to download the required packages.
6. Create a `.env` file to store the S3 bucket secrets and the database URL. To obtain these secrets, please speak to the code owner.

```
DATABASE_URL=***********
S3_REGION=***********
S3_ACCESS_KEY_ID=***********
S3_SECRET_ACCESS_KEY=***********
S3_BUCKET_NAME=***********
```

7. Enter `npm run dev` to run your local server.
8. Navigate to `http://localhost:3000/` to use the application.

---

## Stack

This app uses the following technologies:

- **Next.js**: We use React for all frontend functionality and Next.js for the API routes.
- **TailwindCSS**: Tailwind is the primary CSS framework.
- **PostgreSQL**: We use a Neon Postgres database.
- **AWS S3**: We use an S3 bucket to manage media storage.
- **Vercel**: The code and database are deployed in Vercel.
- **ShadCN**: ShadCN is our core component library.
- **React-Flow**: React-Flow is the library we used to manage a draggable UI, the nodes, and the edges.

_See the `package.json` file for all other dependencies._

---
