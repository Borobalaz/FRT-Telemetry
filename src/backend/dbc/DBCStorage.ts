export class DBCStorage {
  private dbName = "dbcStorage";
  private storeName = "dbcs";

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "fileName" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveDBC(fileName: string, contents: string) {
    const db = await this.getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      tx.objectStore(this.storeName).put({ fileName, contents });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async loadAllDBCs() {
    const db = await this.getDB();
    return new Promise<{ fileName: string; contents: string }[]>((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readonly");
      const req = tx.objectStore(this.storeName).getAll();

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteDBC(fileName: string) {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    tx.objectStore(this.storeName).delete(fileName);
  }
}

export const dbcStorage = new DBCStorage();
