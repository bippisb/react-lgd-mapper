import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import adminHierarchyParquet from "../assets/adminhierarchy.parquet?url";
import discoveredVariationParquet from "../assets/discoveredvariation.parquet?url";
import entityParquet from "../assets/entity.parquet?url";
import levelParquet from "../assets/level.parquet?url";
import variationParquet from "../assets/variation.parquet?url";

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
    mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
    },
    eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: eh_worker,
    },
};

let db: duckdb.AsyncDuckDB | null = null;

export const getDuckDB = async (): Promise<duckdb.AsyncDuckDB> => {
    if (db === null) {
        db = await instantiateDuckDB();
    }
    return db;
}

const instantiateDuckDB = async () => {
    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    // Instantiate the asynchronus version of DuckDB-wasm
    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    await loadLocalGovernmentDirectory(db);
    return db
}

export const loadDatasetAsTable = async (file: File): Promise<string[]> => {
    const db = await getDuckDB();
    await db.registerFileHandle(file.name, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
    const c = await db.connect();
    await c.query(`
    CREATE TABLE dataset AS
        SELECT * FROM '${file.name}';
    `);
    const columnNames: string[] = await getColumnNames("dataset");

    console.log("loaded dataset")
    return columnNames;
}

export const getDBConnection = async () => {
    const db = await getDuckDB();
    const c = await db.connect();
    return c;
}

export const getColumnNames = async (tableName: string, c?: duckdb.AsyncDuckDBConnection): Promise<string[]> => {
    c = !c? await getDBConnection() : c;
    const first_row = await c.query(`SELECT * FROM ${tableName};`);
    c.close();
    const columnNames = first_row.schema.fields.map((a: any) => a.name);
    console.log(tableName, "columns", columnNames)
    return columnNames;
}

export const getUniqueRecords = async (lgdColumns: string[]) => {
    const db = await getDuckDB();
    const c = await db.connect();
    const unique_rows = await c.query(`
    SELECT DISTINCT ${lgdColumns.join(", ")}
    FROM dataset
    ORDER BY ${lgdColumns.join(", ")};
    `)
    c.close();
    const unique_records = unique_rows.toArray().map((a: any) => a.toJSON());
    console.log(unique_records);
    return unique_records;
}

export const loadLocalGovernmentDirectory = async (db: duckdb.AsyncDuckDB) => {
    const c = await db.connect();
    const loadAsTable = async (tableName: string, url: string) => {
        return await c.query(`
        CREATE TABLE ${tableName} AS
            SELECT * FROM 'http://localhost:5173${url}'
        `);
    }
    const tables = {
        "entity": entityParquet,
        "adminhierarchy": adminHierarchyParquet,
        "variation": variationParquet,
        "discoveredVariation": discoveredVariationParquet,
        "level": levelParquet,
    };
    for (let [key, value] of Object.entries(tables)) {
        const t = await loadAsTable(key, value);
        console.log(t);
    }
    c.close();
}