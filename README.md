This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Para ejecutar este proyecto localmente, sigue estos pasos:

Instala las dependencias:
bash
npm i

Inicia el servidor de desarrollo:
bash
npm run dev

Migraciones de Prisma (si no has realizado el setup con KiraMase):
bash
npx prisma migrate --name init
npx prisma generate

Variables de Entorno
Asegúrate de que tu archivo .env contenga las siguientes variables:
env
DATABASE_URL=""         # Utilice PostgreSQL con Prisma
GITHUB_CLIENT_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""
AUTH_SECRET=""          # Added by `npx auth`. Read more: https://cli.authjs.dev
#####################################################################################################################################
Breve documentacion de como se implementaron funciones clave.-

1. Autenticación y Manejo de Sesión
Descripción: Implementación de autenticación de usuarios utilizando Auth.js(NextAuth).

Características:

Los usuarios pueden registrarse e iniciar sesión con su correo electrónico.

Posibilidad de cerrar sesión de manera segura.

Descripcion deL desarrollo: 
Implementando NextAuth con Kirimase CLI queda a disposicion funciones como useSession, signIn, signOut, en la pagina principal '/' (login) se utiliza signIn en el proceso para autenticar al usuario comparando su email y clave con lo contenido en la tabla Users de la DB, con useSession manejamos la sesion, su validez de acuerdo a su vida (maxAge) la cual es 24 horas, signOut presente en el hover de Profile cierra la sesion del usuario con seguridad. El registro de nuevo usuario verifica el usuario no exista antes en la DB y en el front end se verificael email y la password cumplan con lo requerido, si es asi el registro es exitoso y se guarda en la DB e nuevo usuario.

2. Subida de Datos a una Base de Datos
Descripción: Los usuarios pueden agregar información personal a través de la aplicación.

Características:

Cada entrada incluye campos como nombre, cédula, teléfono, dirección y salario.

Creación de reportes que listan los usuarios con mejor salario y calculan la media y promedios.

Descripcion deL desarrollo: 
Para poder guardar informacion personal de un User, es decir, entries, se modifico el schema.prisma para albergar una nueva tabla Entry que esta relacionada con el User a traves de UserEmail. La pagina Data y Table manejan el GET y POST de estos datos relacionados al usuario actualmente logeado, en Table solo se hace GET y se muestran los datos, y en Data se implementaron las funciones de POST tambien, la barra de busqueda con criterio y el ordenamiento con criterio, se genera un reporte en Excel usando el import XLSX conteniendo 3 paginas, informacion, mejores salarios y calculos de mediana y promedio.

3. Manejo de Formularios con Validaciones
Descripción: Implementación de validaciones en los formularios para garantizar la exactitud de los datos ingresados.

Características:

Validaciones como verificar que la cédula sea un número válido y que el salario sea un número positivo.

Mensajes de error claros en caso de que las validaciones no se cumplan.

Tecnología: Uso de librerías de validación como zod en el backend y validaciones en el frontend.

4. Presentación de Datos de la Base de Datos
Descripción: Los usuarios autenticados pueden ver y buscar entradas de información personal.

Características:

Implementación del data table de shadcn para mostrar las entradas.

Página donde se muestran las entradas ordenadas por criterios relevantes.

Barra de búsqueda para buscar entradas utilizando diferentes criterios como nombre, cédula o dirección.

Tecnología: Uso de Shadcn para la presentación de datos.

5. Despliegue en la Nube
Descripción: Asegurarse de que la aplicación esté desplegada en la nube.

Objetivo:
Configuración de variables de entorno y despliegue sin errores.

Despliegue de la aplicación en Vercel.

Descripcion deL desarrollo: 
Algunos retos del muy bien explicado proceso de deployment en Vercel fueron: La incompatibilidad de vercel con bcrypt, por lo cual cambie bcrypt por bcryptjs para continuar con el build sin problemas, y la ausencia de conexion valida de BD, primero subi una .env variable de DATABASE_URL la cual era localhost y por tanto fuera del contexto nuevo, aprendi a usar supabase (pude usar railway tambien) para mi db en linea, cambie el DATABASE_URL e hice las migraciones y se logro el build funcional.
#####################################################################################################################################
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
