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
{"accion":"avance","email":"ana@ejemplo.com","nombre":"Ana Mora","perfil":"Analista","area":"DACD","curso":"Fabric F1-01","lecciones":3,"simuladores":1,"preguntas":10,"nota":8,"laboratorio":4,"avance":53,"detalle":"{}","fecha":"2026-11-24T16:00:00.000Z"}
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

**Caso `registro`**
1. Condición: `length(body('Obtener_elementos')?['value'])` es igual a `0`
   - **Sí → Crear elemento** en InscritosCursoFabric: Correo = `variables('correo')`, Nombre, Perfil, Area (del JSON), Estado = **Pendiente**, FechaSolicitud = `utcNow()`.
2. **Respuesta** (paso **f**) con cuerpo:
   - Si era nuevo: `{"estado":"Pendiente"}`
   - Si ya existía: `{"estado":"@{first(body('Obtener_elementos')?['value'])?['Estado']?['Value']}","nombre":"@{first(body('Obtener_elementos')?['value'])?['Nombre']}","perfil":"@{first(body('Obtener_elementos')?['value'])?['Perfil']}"}`

**Caso `estado`**
- Condición: `length(body('Obtener_elementos')?['value'])` es igual a `0`
  - **Sí → Respuesta** `{"estado":"NoExiste"}`
  - **No → Respuesta** con el mismo cuerpo de "ya existía" del caso registro.

**Caso `avance`**
1. Condición: la persona existe **y** `first(body('Obtener_elementos')?['value'])?['Estado']?['Value']` es igual a `Aprobado`. Si no, termine sin hacer nada.
2. **Obtener elementos** en **AvanceCursoFabric** con filtro `Title eq '@{variables('correo')}'` y recuento superior 1.
3. Condición: `length(...)` es igual a `0`
   - **Sí → Crear elemento**; **No → Actualizar elemento** con Id `first(body('Obtener_elementos_2')?['value'])?['ID']`.
   - En ambos: Correo = `variables('correo')`; Nombre, Perfil, Lecciones, Simuladores, Preguntas, Nota, Laboratorio, Avance y Detalle del JSON; UltimaActividad = `utcNow()`.
4. **Respuesta** `{"ok":true}`

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

## 5. Probar

1. Abra la página en una ventana de incógnito, regístrese con su correo y confirme que aparece en InscritosCursoFabric como Pendiente.
2. Apruébese (desde el correo o en la lista) y toque **Verificar de nuevo**. Debe entrar al curso.
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
