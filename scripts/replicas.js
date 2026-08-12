/* Colombia Responde — actualiza replicas.json desde el USGS.
   Lo ejecuta un GitHub Action. No toca datos.json: las cuentas
   bancarias y los acopios se editan a mano, siempre.
   Desarrollada por Vibras Positivas HM — Derechos de Autor Reservados */

const fs = require('fs');

const EPI = { lat: 4.99, lng: -76.29 };   // San José del Palmar, Chocó
const RADIO_KM = 300;
const MAG_MIN = 3.0;
const DIAS = 7;

const desde = new Date(Date.now() - DIAS * 864e5).toISOString().slice(0, 10);

const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query'
  + '?format=geojson'
  + `&latitude=${EPI.lat}&longitude=${EPI.lng}&maxradiuskm=${RADIO_KM}`
  + `&minmagnitude=${MAG_MIN}&starttime=${desde}&orderby=time`;

(async () => {
  const res = await fetch(url, { headers: { 'User-Agent': 'colombia-responde' } });
  if (!res.ok) throw new Error('USGS respondió ' + res.status);
  const geo = await res.json();

  const sismos = (geo.features || []).map(f => ({
    mag: Number(f.properties.mag.toFixed(1)),
    lugar: String(f.properties.place || '')
      .replace(/^\d+\s*km\s+/i, '')
      .replace(/, Colombia$/i, ''),
    fecha: new Date(f.properties.time).toISOString(),
    prof: Number((f.geometry.coordinates[2] || 0).toFixed(0))
  }));

  const salida = {
    actualizado: new Date().toISOString(),
    fuente: 'USGS Earthquake Hazards Program',
    criterio: `M${MAG_MIN}+ · ${RADIO_KM} km del epicentro · ${DIAS} días`,
    sismos
  };

  fs.writeFileSync('replicas.json', JSON.stringify(salida, null, 2));
  console.log(`replicas.json actualizado — ${sismos.length} eventos`);
})().catch(e => { console.error(e.message); process.exit(1); });
