# trainerapp-server
API en Express (Node.js) para aplicación de entrenador personal

Esta API REST la diseñe hace un año para consumirla desde una aplicación web/movil. Esta hecha en Express.js, uso JWT para la autenticación y Prisma como ORM para la BBDD (MariaDB)

Esta aplicación ofrece a un entrenador personal gestionar los entrenamientos, dietas y suscripciones de sus clientes. Estan implementados todos los endspoints y la aplicación llego a estar activa.

Tambien contiene los endspoints para el panel de administración donde el administrador puede editar las suscripciones de los usuarios, subir y editar información de los videos, editar el entrenamiento o dieta de los usuarios, crear categorías de videos...


Para lanzar el servidor se necesita crear una cuenta en Cloudflare y en Cloudfinary y dar los tokens en las variables de entorno.

Para desarrollo usar npm run dev, se usa esbuild en vez de tsc para desarrollo por que compila 100x mas rápido que tsc
```
npm run dev
```

Para producción se recomienda compilar usando tsc que esta configurando en el script build.
```
npm run build
```

El servidor escuchará en el puerto indicado en las [variables de entorno](.env.example)
