self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Aquí interceptamos la foto ANTES de que el servidor dé el Error 405
    if (event.request.method === 'POST' && url.pathname.endsWith('share-target')) {
        event.respondWith((async () => {
            try {
                const formData = await event.request.formData();
                const file = formData.get('shared_file');
                if (file) {
                    // Guardamos el archivo en la memoria oculta del móvil
                    const cache = await caches.open('docsafe-share');
                    await cache.put('/shared-file', new Response(file, { headers: { 'Content-Type': file.type } }));
                }
            } catch (e) {
                console.error("Error capturando archivo", e);
            }
            // Redirigimos a la app con normalidad (Método GET) para que el servidor no se asuste
            return Response.redirect('./?shared=1', 303);
        })());
    }
});
