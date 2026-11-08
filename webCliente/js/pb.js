import PocketBase from 'https://cdn.jsdelivr.net/npm/pocketbase@0.26.2/dist/pocketbase.es.mjs';
export const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false)