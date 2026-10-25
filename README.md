# JVE-Portfolio

A hobby project where I build a portfolio for my girlfriend to use as a development portfolio for her study as well as a personal portfolio for storing and showcasing her works.

This is one of two projects. This is an Express.js API used as the backend for the entire project.

## Built with

* [![Express][Express.js]][Express-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Drizzle][Drizzle]][Drizzle-url]
* [![PostgreSQL][PostgreSQL]][Postgres-url]

Express using TypeScript, connected to a PostgreSQL database via Drizzle ORM. Both API and database hosted using [Koyeb](https://www.koyeb.com/)

[Express.js]: https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB
[Express-url]: https://expressjs.com/
[TypeScript]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Drizzle]: https://img.shields.io/badge/drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black
[Drizzle-url]: https://orm.drizzle.team/
[PostgreSQL]: https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/

## Features

- Numerous endpoints for retrieving portfolio items from given year, module and subject from the database.
- Authorized endpoints for creating, updating and deleting portfolio items using JSON Web Tokens
- Interactive Swagger UI (OpenAPI 3.0) documentation at `/docs` in developer mode (auto-generated via Zod)
## Related

[Hosted website](https://i511801.luna.fhict.nl/)

[Frontend repo](https://github.com/Cavalier1204/JVEPortfolio-FE)
