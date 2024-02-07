import Enmap, { EnmapOptions } from "enmap";
import Logger from "stumper";

export default abstract class Database {
  protected db: Enmap;
  protected name: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(protected options: EnmapOptions<any, any>) {
    this.db = new Enmap(options);
    this.name = options.name || "Database";
  }

  // Add methods below that will be shared across all databases
  wipe(): void {
    Logger.info("Wiping database", this.name);
    this.db.clear();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAllKeysAndValues(): Array<{ key: string | number; value: any }> {
    const arr = Array.from(this.db);
    return arr.map((val) => {
      return { key: val[0], value: val[1] };
    });
  }
}
