# Guía práctica Microsoft Fabric · Módulo F1-01

Material de estudio interactivo para el equipo de analistas y científicos de datos de la DACD. Incluye 8 lecciones guiadas, 4 simuladores, una autoevaluación de 10 preguntas y un laboratorio paso a paso.

Es un solo archivo, `index.html`, sin dependencias de servidor. Se publica con GitHub Pages.

## Publicar en GitHub Pages

1. Cree un repositorio en GitHub, por ejemplo `curso-fabric-dacd`.
   - En una cuenta gratuita, GitHub Pages solo funciona con repositorios **públicos**. Con GitHub Pro o una organización con Enterprise puede ser privado.
2. Suba `index.html`, `.nojekyll`, `README.md` y `GUIA-REGISTRO-POWER-AUTOMATE.md`, ya sea con **Add file > Upload files** o con git.
3. En **Settings > Pages**, elija **Deploy from a branch**, rama `main` y carpeta `/ (root)`. Guarde.
4. En uno o dos minutos la página queda en `https://SU-USUARIO.github.io/curso-fabric-dacd/`.

## Registro, autorización y avance

Las personas se registran en la página y quedan pendientes hasta que la jefatura de la DACD las aprueba. Al aprobarlas entran al curso, y su avance se registra en SharePoint mediante Power Automate. Para activarlo, siga `GUIA-REGISTRO-POWER-AUTOMATE.md`.

Cada persona entra con su correo y una contraseña, y puede cerrar la sesión con **Salir**. Mientras `REGISTRO_URL` esté vacío, la página funciona en modo abierto: no hay aprobación, la contraseña se valida solo en la computadora donde la persona se registró y el avance queda en ese navegador.

## Actualizar

Reemplace `index.html` en el repositorio. Si ya configuró `REGISTRO_URL` o `FORMS_URL`, vuelva a pegarlas en la versión nueva.
