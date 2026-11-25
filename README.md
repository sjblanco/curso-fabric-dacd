# Ruta de conocimiento Microsoft Fabric · DACD

Material de estudio interactivo para el equipo de analistas y científicos de datos de la DACD. Cada módulo trae lecciones guiadas, simuladores, una autoevaluación de 10 preguntas y un laboratorio paso a paso.

| Módulo | Página |
|---|---|
| Portada: registro, ingreso, Mis módulos, Mi ruta y Administración | `index.html` |
| F1-01 · Introducción a la analítica de punta a punta | `f1-01.html` |
| F1-02 · Lakehouses en Fabric | `f1-02.html` |
| F1-03 · Data warehouses en Fabric | `f1-03.html` |
| F1-04 · Ciencia de datos en Fabric | `f1-04.html` |
| F1-05 · Modelos semánticos a escala | `f1-05.html` |

Cada página de módulo se navega por pestañas (Inicio, Lecciones, Simuladores, Autoevaluación, Laboratorio, Insumos). Las pestañas se controlan con el atributo `data-tab` de cada sección; los simuladores usan `data-sub`.

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

## Agregar módulos sin perder el avance

- El avance del F1-01 está en la raíz del documento `progress/{uid}`; cada módulo nuevo guarda el suyo en `mods.<id>` (por ejemplo, `mods.f102`).
- Cada página guarda solo sus propios campos (`mergeFields`), así que una página nunca borra el avance de otro módulo.
- Dentro de un módulo, el avance se guarda por posición: no reordene ni borre lecciones, pasos ni preguntas; agregue al final.
