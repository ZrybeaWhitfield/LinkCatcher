import localforage from "localforage";

localforage.config({
  name: "linkcatcher",
  storeName: "linkcatcher_data",
});

export async function addCapturedLink(capturedLink) {
    const key = `link_${capturedLink.id}`;
    await localforage.setItem(key, capturedLink);
    return capturedLink;
}

export async function listCapturedLinks() {
    const links = [];
    await localforage.iterate((value, key) => {
        if (key.startsWith('link_')) {
            links.push(value);
            links.sort((captureA, captureB) => captureB.capturedAt - captureA.capturedAt);
        }
    });
    return links;
}