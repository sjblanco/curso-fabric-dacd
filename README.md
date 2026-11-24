# Guía práctica Microsoft Fabric · Módulo F1-01

Material de estudio interactivo para el equipo de analistas y científicos de datos de la DACD: 8 lecciones guiadas, 4 simuladores, una autoevaluación de 10 preguntas y un laboratorio paso a paso.

- **Página:** GitHub Pages, en https://sjblanco.github.io/curso-fabric-dacd/
- **Registro, inicio de sesión y avance:** Firebase (proyecto `curso-fabric-dacd`, plan gratuito Spark). Firebase solo guarda los datos; no aloja la página.

## Cómo funciona

1. La persona se registra con nombre, perfil, área, correo y contraseña. Su solicitud queda **Pendiente**.
2. La administración la aprueba o la rechaza desde el panel **Administración** de la página.
3. Al aprobarla, la persona entra al curso y ve la ruta de su perfil. Su avance se guarda solo.
4. **Salir** cierra la sesión. **Olvidé mi contraseña** envía un correo para restablecerla.

## Administradores

Un administrador es una cuenta registrada cuyo UID está en la colección `admins` de Firestore:

1. La persona se registra en la página.
2. En la consola de Firebase, en **Authentication > Usuarios**, copie su UID.
3. En **Firestore > Datos**, cree el documento `admins/{UID}` con un campo `nombre`.

## Archivos

| Archivo | Para qué |
|---|---|
| `index.html` | La página completa, con el `firebaseConfig` del proyecto |
| `firestore.rules` | Reglas de seguridad publicadas en Firestore |

La configuración de Firebase en `index.html` no es secreta: la seguridad la dan las reglas de `firestore.rules`.

Si cambia `firestore.rules`, publíquelas en la consola: **Firestore > Reglas**.
