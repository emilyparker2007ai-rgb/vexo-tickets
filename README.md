# Vexo Tickets

Sitio estático de venta de entradas para los partidos de la Selección Argentina. El pedido se cierra
por WhatsApp: no hay pagos en el sitio.

- Datos (partidos, precios, número de WhatsApp): `js/data.js` (`WHATSAPP_NUMBER`, solo dígitos, ej. 5491100000000).
- Se genera desde el prototipo con `python3 build.py <carpeta> --base-url https://<dominio>`.
- Render: sitio estático (`render.yaml`), sin paso de build.
- Videos de fondo: Pexels (licencia libre). Créditos en `media/credits.json`.
