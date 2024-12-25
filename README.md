# trainerapp-server
API in Express (Node.js) for Personal Trainer Application
This REST API was designed a year ago to be consumed by a web/mobile application. It is built with Express.js, uses JWT for authentication, and employs Prisma as the ORM for the database (MariaDB).

This application allows a personal trainer to manage their clients' workouts, diets, and subscriptions. All endpoints are implemented, and the application was fully operational.

It also includes endpoints for the administration panel, where the admin can edit user subscriptions, upload and update video information, modify users' training or diet plans, create video categories, and more.

To launch the server you will need to create accounts on Cloudflare and Cloudinary and provide the tokens in the environment variables.

Development

For development, use the following command:
```
npm run dev
```

This setup uses esbuild instead of tsc for development, as it compiles 100x faster than tsc.

Production

For production, it is recommended to compile the project using tsc, which is configured in the build script:
```
npm run build
```

The server will listen on the port specified in the [environment variables](.env.example)
