import Enmap, { EnmapOptions } from "enmap";
import { exit } from "process";
import Logger from "stumper";

export abstract class Database {
  // The Enmap object, it is fully accessible from the inheriting class
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
}

export abstract class DatabaseWithSchema extends Database {
  private schemaKeyName: string = "schema_version";

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: EnmapOptions<any, any>,
    protected schemaVersion: string,
    protected schemas: Array<IDatabaseSchemaInfo>,
  ) {
    super(options);

    if (!this.hasSchemaVersion()) {
      this.db.set(this.schemaKeyName, this.schemaVersion);
    } else {
      // The database already existed, checking if the versions match
      const currentSchemaIndex = this.getSchemaIndex(
        this.getCurrentSchemaVersion(),
      );
      const expectedSchemaIndex = this.getSchemaIndex(this.schemaVersion);

      if (currentSchemaIndex < expectedSchemaIndex) {
        // The current schema is older than the expected schema, the conversion will be run!
        Logger.warning(
          `The schema version of the ${this.name} DB is ${this.getCurrentSchemaVersion()} when the expected version is ${this.schemaVersion}. The conversion function will be run!`,
          `DatabaseWithSchema:${this.name}`,
        );

        // Create backup of current DB
        const dbBackup = this.backup();

        // Loop through all of the schema versions between the current and the expected. This will allow the database to slowly increment through the schemas.
        for (let i = currentSchemaIndex + 1; i <= expectedSchemaIndex; i++) {
          const schemaInfo = this.schemas[i];
          Logger.warning(
            `Running the conversion function for the schema version ${schemaInfo.version}!`,
            `DatabaseWithSchema:${this.name}`,
          );
          try {
            schemaInfo.conversionFunction();
          } catch (error) {
            Logger.error(
              `There was an error converting the schema from version ${this.getCurrentSchemaVersion()} to ${schemaInfo.version}!`,
              `DatabaseWithSchema:${this.name}`,
            );
            Logger.warning(
              `Restoring the backup of the ${this.name} database!`,
              `DatabaseWithSchema:${this.name}`,
            );
            this.restore(dbBackup);
            exit(1);
          }

          // Update the current schema version
          this.setCurrentSchemaVersion(schemaInfo.version);
        }
      } else if (currentSchemaIndex > expectedSchemaIndex) {
        // The current schema is newer than the expected schema, this could cause unexpected errors!
        Logger.error(
          `The schema version of the ${this.name} DB is ${this.getCurrentSchemaVersion()} when the expected version is ${this.schemaVersion}. This may cause unexpected errors!`,
          `DatabaseWithSchema:${this.name}`,
        );
      } else {
        // The versions match
        Logger.info(
          `The schema version of the ${this.name} DB is ${this.getCurrentSchemaVersion()} which matches the expected version ${this.schemaVersion}.`,
          `DatabaseWithSchema:${this.name}`,
        );
      }
    }
  }

  private hasSchemaVersion(): boolean {
    return this.db.has(this.schemaKeyName);
  }

  private getCurrentSchemaVersion(): string {
    return this.db.get(this.schemaKeyName);
  }

  private setCurrentSchemaVersion(newVersion: string): void {
    this.db.set(this.schemaKeyName, newVersion);
  }

  private getSchemaIndex(schema: string): number {
    return this.schemas.findIndex((val) => val.version == schema);
  }

  private backup(): string {
    return this.db.export();
  }

  private restore(backup: string): void {
    this.db.import(backup, true, true);
  }
}

interface IDatabaseSchemaInfo {
  // The version of the schema
  version: string;

  // The function that will be called to convert the previous schema to this schema
  // If this is the first schema version just pass an empty function
  conversionFunction: () => void;
}
