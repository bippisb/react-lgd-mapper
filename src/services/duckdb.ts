import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

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
    return db
}

export const getColumnNames = async (file: File): Promise<string[]> => {
    const db = await getDuckDB();
    await db.registerFileHandle(file.name, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
    const c = await db.connect();
    await c.query(`
    CREATE TABLE dataset AS
        SELECT * FROM '${file.name}'
    `);
    const first_row = await c.query("SELECT * FROM dataset LIMIT 1;");
    c.close();
    return first_row.schema.fields.map(a => a.name);
}

export const getUniqueRecords = async (lgdColumns: string[]) => {
    const db = await getDuckDB();
    const c = await db.connect();
    const unique_rows = await c.query(`
    SELECT DISTINCT ${lgdColumns.join(", ")} FROM dataset;
    `)
    c.close();
    const unique_records = unique_rows.toArray().map(a => a.toJSON());
    console.log(unique_records);
    return unique_records;
}