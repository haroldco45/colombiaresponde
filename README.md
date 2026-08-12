# Colombia Responde

PWA instalable que reúne en un solo lugar la información de ayuda tras el **terremoto de magnitud 7,4 del 10 de agosto de 2026** (epicentro: San José del Palmar, Chocó).

Hoy esa información está repartida en decenas de noticias. Esta app la centraliza, la marca como verificada, y **sigue funcionando sin señal**, que es justo donde más se necesita.

---

## Qué hace

| Pestaña | Contenido |
|---|---|
| **Ayudar** | Canales de donación económica verificados, con número de cuenta, NIT y llave Bre-B, cada uno con botón de copiar. Listas de qué sí sirve y qué no sirve donar. |
| **Puntos** | 15 centros de acopio en Bogotá, Cali, Pereira, Manizales, Armenia y Cartagena. Orden por cercanía con GPS opcional y enlace directo a Google Maps. Requisitos para donar sangre. |
| **Personas** | **No publica listas de víctimas.** Enruta a las autoridades competentes (Medicina Legal, Cruz Roja, UNGRD, SGC) y a las líneas de emergencia. |
| **Fraude** | Estafas ya confirmadas en esta emergencia y cinco reglas para verificar antes de transferir. |
| **Info** | Qué es la app, cómo instalarla y fuentes oficiales. |

Bilingüe **español / inglés**, conmutable en caliente sin recargar.

---

## Decisión de diseño legal (importante)

La app **no recolecta, almacena ni transmite ningún dato personal**. No hay formularios, ni registro, ni analítica. La geolocalización es opcional y se procesa exclusivamente en el dispositivo.

Se descartó deliberadamente un módulo de reportes ciudadanos abiertos en la v1: sin moderación humana 24/7 se convierte en vector de desinformación y de estafa, y expone al responsable del tratamiento bajo la **Ley 1581 de 2012**.

Por la misma razón la app **no publica listas de heridos, fallecidos ni desaparecidos**. Esos son datos sensibles de categoría especial y su confirmación corresponde únicamente al Instituto Nacional de Medicina Legal y Ciencias Forenses.

---

## Arquitectura

```
index.html   Aplicación completa (HTML + CSS + JS, sin dependencias)
datos.json   Contenido editable. Se carga al abrir y sobrescribe el SEED embebido.
sw.js        Service worker. Shell cache-first; datos.json network-first.
manifest.json
_headers     Cabeceras de Netlify (datos.json sin caché)
icon-192.png / icon-512.png / icon-maskable-512.png
og-image.png 1200×630
gen_img.py   Script PIL que regenera imagen OG e iconos
```

**El punto clave:** los datos viven en `datos.json`, no dentro del HTML. Para actualizar cifras, cuentas o centros de acopio se edita ese archivo y listo — sin recompilar, sin redeploy. Si el `fetch` falla, la app arranca igual con el `SEED` embebido en `index.html`, así que nunca queda en blanco.

Hora de Colombia en tiempo real vía `Intl.DateTimeFormat` con `timeZone: 'America/Bogota'`.

---

## Despliegue en Netlify

```bash
# Opción 1 — arrastrar la carpeta a app.netlify.com/drop
# Opción 2 — CLI
npm i -g netlify-cli
netlify deploy --prod --dir .
```

Después del despliegue, **actualizar el dominio real** en los meta tags Open Graph de `index.html`
(actualmente apuntan a `https://colombia-responde.netlify.app/`). Sin URL absoluta correcta, la
previsualización al compartir en WhatsApp y X no carga la imagen.

Validar la tarjeta en: `https://cards-dev.twitter.com/validator` y `https://developers.facebook.com/tools/debug/`

---

## Protocolo de actualización de datos

1. Verificar el dato en la fuente oficial (no en una captura de WhatsApp).
2. Editar `datos.json`.
3. Actualizar el campo `actualizado` con la hora real de Colombia en ISO 8601 (`-05:00`).
4. Subir. El service worker trae la versión nueva en la siguiente apertura con señal.

Si se cambia `index.html`, `sw.js` o los iconos, subir también `VERSION` en `sw.js`
(`const VERSION = 'cr-v2'`) para invalidar el caché de los usuarios.

---

## Fuentes

Servicio Geológico Colombiano · UNGRD · Cruz Roja Colombiana · Instituto Nacional de Medicina Legal ·
Alcaldías de Bogotá, Cali, Pereira, Manizales, Armenia y Cartagena · ABACO y Bancos de Alimentos ·
Fundación PLAN.

Las cifras de víctimas son preliminares y están en actualización permanente.

---

## Pendiente para v2

- Módulo de necesidades por vereda, con moderación humana antes de publicar
- Albergues con cupos disponibles en tiempo real
- Rescate y refugio de mascotas
- Primeros auxilios psicológicos offline
- Convenio con una alcaldía o con Cruz Roja para figurar como canal reconocido

---

Desarrollada por **Vibras Positivas HM** — Derechos de Autor Reservados
Caucasia, Antioquia · haroldco45@gmail.com · +57 311 770 0431
