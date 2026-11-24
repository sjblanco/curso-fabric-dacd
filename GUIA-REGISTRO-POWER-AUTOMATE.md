# Registro, autorización y avance con Power Automate y SharePoint

La página publicada en GitHub Pages no tiene base de datos propia. Un flujo de Power Automate hace de "servidor": recibe las solicitudes de registro, responde si la persona está aprobada y guarda su avance. Todo queda en listas de SharePoint, dentro de Microsoft 365 del Banco.

```
Página (GitHub Pages) ──POST──► Flujo 1 "Curso Fabric · API" ──► Lista InscritosCursoFabric
                                                              └─► Lista AvanceCursoFabric
Lista InscritosCursoFabric ──(elemento nuevo)──► Flujo 2 "Aprobar inscripción" (opcional) ──► correo a usted con Aprobar / Rechazar
```

Mientras no configure `REGISTRO_URL` en `index.html`, la página funciona en modo abierto: cualquiera entra y el avance queda solo en su navegador.

**Licencia:** el disparador "Cuando se recibe una solicitud HTTP" es **premium**. Necesita Power Automate Premium (o un plan por flujo) en la cuenta dueña del flujo.

**Tiempo estimado:** 45 minutos.

---

## 1. Crear las dos listas de SharePoint (10 min)

En el sitio de SharePoint de la DACD:

**Lista InscritosCursoFabric**

| Columna | Tipo |
|---|---|
| Title (renómbrela a **Correo**) | Una línea de texto |
| Nombre | Una línea de texto |
| Perfil | Una línea de texto |
| Area | Una línea de texto |
| Estado | Elección: **Pendiente** (predeterminado), **Aprobado**, **Rechazado** |
| Clave | Una línea de texto (guarda la contraseña cifrada; nunca la contraseña real) |
| Rol | Elección: **Participante** (predeterminado), **Administrador** |
| FechaSolicitud | Fecha y hora |

**Lista AvanceCursoFabric**

| Columna | Tipo |
|---|---|
| Title (renómbrela a **Correo**) | Una línea de texto |
| Nombre | Una línea de texto |
| Perfil | Una línea de texto |
| Lecciones, Simuladores, Preguntas, Nota, Laboratorio, Avance | Número (una columna cada uno) |
| Detalle | Varias líneas de texto (texto sin formato) |
| UltimaActividad | Fecha y hora (incluir hora) |

## 2. Flujo 1: "Curso Fabric · API" (25 min)

En https://make.powerautomate.com cree un **Flujo de nube instantáneo** con el disparador **Cuando se recibe una solicitud HTTP**.

**Disparador**
- Quién puede desencadenar el flujo: **Cualquiera**. La página no inicia sesión en Microsoft.
- Esquema JSON: vacío. La página envía el cuerpo como texto y el paso siguiente lo convierte.

**a) Analizar JSON**
- Contenido (expresión): `json(triggerBody())`
- Esquema: "Usar una carga de ejemplo" y pegue:

```json
{"accion":"avance","clave":"9f2c...","email":"ana@ejemplo.com","nombre":"Ana Mora","perfil":"Analista","area":"DACD","curso":"Fabric F1-01","lecciones":3,"simuladores":1,"preguntas":10,"nota":8,"laboratorio":4,"avance":53,"detalle":"{}","fecha":"2026-11-24T16:00:00.000Z"}
```

Después del esquema generado, quite `email` y `accion` de la lista **required** si aparecen otros campos como obligatorios: no todas las acciones envían todos los campos.

**b) Inicializar variable** `correo` (cadena) = `toLower(trim(body('Analizar_JSON')?['email']))`

**c) Condición: validar el dominio** (evita registros de fuera del Banco)
- `variables('correo')` **termina en** `@SU-DOMINIO-INSTITUCIONAL`
- Rama **No**: **Respuesta** con código 200, el encabezado de CORS del paso **f** y cuerpo `{"estado":"NoPermitido"}`. Luego **Terminar**.

**d) Obtener elementos** (SharePoint) en la lista **InscritosCursoFabric**
- Consulta de filtro: `Title eq '@{variables('correo')}'`
- Recuento superior: 1

**e) Cambiar (Switch)** sobre `body('Analizar_JSON')?['accion']`

Para no repetir expresiones, agregue antes del Switch una **Redactar** llamada `Inscrito` con `first(body('Obtener_elementos')?['value'])`. La clave que envía la página está en `body('Analizar_JSON')?['clave']`.

**Caso `registro`**
- Condición: `length(body('Obtener_elementos')?['value'])` es igual a `0`
  - **Sí → Crear elemento** en InscritosCursoFabric: Correo = `variables('correo')`, Nombre, Perfil, Area (del JSON), Clave = `body('Analizar_JSON')?['clave']`, Estado = **Pendiente**, FechaSolicitud = `utcNow()`. Luego **Respuesta** `{"estado":"Pendiente"}`.
  - **No → Respuesta** `{"estado":"YaExiste"}`. La persona debe usar "Ingresar".

**Caso `estado`** (ingreso con contraseña)
1. Condición: `length(body('Obtener_elementos')?['value'])` es igual a `0` → **Respuesta** `{"estado":"NoExiste"}`.
2. Si existe, condición: `outputs('Inscrito')?['Clave']` está vacío (contraseña restablecida por usted)
   - **Sí → Actualizar elemento**: Id = `outputs('Inscrito')?['ID']`, Clave = `body('Analizar_JSON')?['clave']`. La contraseña con la que ingresó queda como nueva.
3. Condición: `outputs('Inscrito')?['Clave']` no está vacío **y** es distinto de `body('Analizar_JSON')?['clave']` → **Respuesta** `{"estado":"ClaveIncorrecta"}`.
4. En otro caso → **Respuesta**:

```
{"estado":"@{outputs('Inscrito')?['Estado']?['Value']}","nombre":"@{outputs('Inscrito')?['Nombre']}","perfil":"@{outputs('Inscrito')?['Perfil']}","rol":"@{outputs('Inscrito')?['Rol']?['Value']}"}
```

**Caso `avance`**
1. Condición: la persona existe, `outputs('Inscrito')?['Estado']?['Value']` es igual a `Aprobado` **y** `outputs('Inscrito')?['Clave']` es igual a `body('Analizar_JSON')?['clave']`. Si no se cumple, termine sin hacer nada.
2. **Obtener elementos** en **AvanceCursoFabric** con filtro `Title eq '@{variables('correo')}'` y recuento superior 1.
3. Condición: `length(...)` es igual a `0`
   - **Sí → Crear elemento**; **No → Actualizar elemento** con Id `first(body('Obtener_elementos_2')?['value'])?['ID']`.
   - En ambos: Correo = `variables('correo')`; Nombre, Perfil, Lecciones, Simuladores, Preguntas, Nota, Laboratorio, Avance y Detalle del JSON; UltimaActividad = `utcNow()`.
4. **Respuesta** `{"ok":true}`

**Casos `listar` y `aprobar`** (panel de Administración de la página)

Ambos empiezan con la misma condición: la persona existe, `outputs('Inscrito')?['Rol']?['Value']` es igual a `Administrador` y `outputs('Inscrito')?['Clave']` es igual a `body('Analizar_JSON')?['clave']`. Si no se cumple → **Respuesta** `{"estado":"NoAutorizado"}`.

`listar`:
1. **Obtener elementos** de InscritosCursoFabric (sin filtro, recuento superior 500).
2. **Seleccionar** sobre ese resultado, con las asignaciones `correo` = `item()?['Title']`, `nombre` = `item()?['Nombre']`, `perfil` = `item()?['Perfil']` y `estado` = `item()?['Estado']?['Value']`.
3. **Obtener elementos** de AvanceCursoFabric (sin filtro, recuento superior 500).
4. **Seleccionar** sobre ese resultado: `correo` = `item()?['Title']`, `lecciones`, `simuladores`, `preguntas`, `nota`, `laboratorio`, `avance` (cada uno con `item()?['NombreDeLaColumna']`) y `ultima` = `item()?['UltimaActividad']`.
5. **Respuesta** con cuerpo `{"inscritos": @{body('Seleccionar')}, "avance": @{body('Seleccionar_2')}}`.

`aprobar`:
1. **Obtener elementos** de InscritosCursoFabric con filtro `Title eq '@{toLower(body('Analizar_JSON')?['objetivo'])}'` y recuento superior 1.
2. **Actualizar elemento** con ese Id: Estado = `body('Analizar_JSON')?['estado']` (Aprobado o Rechazado).
3. **Respuesta** `{"ok":true}`.

Para el esquema de **Analizar JSON**, agregue también las propiedades `objetivo` y `estado` (texto).

**f) Configuración de cada acción Respuesta**
- Código de estado: `200`
- Encabezados:
  - `Content-Type`: `application/json`
  - `Access-Control-Allow-Origin`: `https://sjblanco.github.io`

Sin el encabezado `Access-Control-Allow-Origin` el navegador no deja que la página lea la respuesta, y la verificación de aprobación falla.

Guarde el flujo y copie la **URL de HTTP POST** del disparador.

## 3. Flujo 2 (opcional): aprobar desde el correo (10 min)

Cree un **Flujo de nube automatizado**:
1. Disparador: **Cuando se crea un elemento** (SharePoint), lista InscritosCursoFabric.
2. **Iniciar y esperar una aprobación**, tipo "Aprobar/Rechazar: primero en responder". Asignado a: su correo. Título: `Inscripción curso Fabric: @{triggerOutputs()?['body/Nombre']}`. Detalles: correo, perfil y área.
3. Condición: el resultado es `Approve`.
   - **Sí → Actualizar elemento**: Estado = Aprobado. Opcional: **Enviar correo** a la persona con el enlace del curso.
   - **No → Actualizar elemento**: Estado = Rechazado.

Sin este flujo, apruebe a mano cambiando la columna **Estado** en la lista.

## 4. Conectar la página (2 min)

En `index.html`, busque esta línea (cerca del final) y pegue la URL del flujo 1 entre las comillas:

```js
const REGISTRO_URL='';
```

Suba el archivo al repositorio. GitHub Pages se actualiza en uno o dos minutos.

## Su rol de administrador

Después de registrarse en la página, abra la lista InscritosCursoFabric y en su fila cambie **Estado** a Aprobado y **Rol** a Administrador. Al volver a ingresar, verá la sección **Administración**: personas registradas, su estado, su avance y botones para aprobar o rechazar sin entrar a SharePoint. Solo las filas con Rol = Administrador ven ese panel; elegir el perfil "Jefatura" al registrarse no da acceso.

## Contraseñas

- La página nunca envía la contraseña real: la cifra en el navegador (PBKDF2 con SHA-256) y envía solo el resultado. En la columna **Clave** se ve un texto largo; es normal.
- **Si alguien olvida su contraseña:** borre el contenido de su columna **Clave** en InscritosCursoFabric. La próxima vez que ingrese, la contraseña que escriba quedará como nueva.
- **Salir:** el botón Salir cierra la sesión en ese navegador. Si otra persona usa la misma computadora, tiene que ingresar con su propio correo y contraseña.

## 5. Probar

1. Abra la página en una ventana de incógnito, regístrese con su correo y una contraseña, y confirme que aparece en InscritosCursoFabric como Pendiente, con la columna Clave llena.
2. Apruébese (desde el correo o en la lista) y toque **Verificar de nuevo**. Debe entrar al curso. Pruebe también **Salir** e **Ingresar** con una contraseña equivocada: debe rechazarla.
3. Marque una lección como leída y confirme que aparece su fila en AvanceCursoFabric.
4. Revise el **historial de ejecuciones** del flujo si algo no ocurre.

## 6. Ver el avance del equipo

- La lista **AvanceCursoFabric** es su tablero: una fila por persona, ordenable por Avance.
- Para gráficos, use **Integrar > Power BI > Visualizar la lista**, o conecte Power BI Desktop a la lista.
- Para Excel: **Exportar > Exportar a Excel**.

## Lo que esta solución protege y lo que no

- **Protege:** solo las personas aprobadas registran avance, y solo se aceptan correos del dominio del Banco.
- **No protege el contenido:** la página está en un repositorio público de GitHub, así que el material puede leerse desde el código. La aprobación controla quién participa y queda registrado; no oculta el material. Para un curso formativo sin datos del Banco esto es aceptable; no ponga en la página información interna o confidencial.
- La URL del flujo queda visible en el código de la página. Por eso el flujo valida el dominio del correo y solo guarda avance de personas aprobadas.
