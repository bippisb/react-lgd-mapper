import { loadPyodide, PyodideInterface } from "pyodide";

let pyodide: PyodideInterface | null = null;

const setupPyodide = async (pyodide: PyodideInterface) => {
    await pyodide.loadPackage("micropip")
    // install pandas and networkx
    await pyodide.runPythonAsync(`
    import micropip
    await micropip.install('pandas')
    `)
}

export const getPyodide = async () => {
    if (pyodide === null) {
        pyodide = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full',
        });
        await setupPyodide(pyodide);
    }
    return pyodide;
}

export const loadCsvFile = async (file: File, lgdColumns: string[]): Promise<Map<string, string>[]> => {
    const pyodide = await getPyodide();
    pyodide.FS.writeFile('/in_file.csv', await file.text(), { encoding: 'utf8' });
    pyodide.runPython(`
    import pandas as pd
    raw_df = pd.read_csv('/in_file.csv')
    lgd_cols = ${JSON.stringify(lgdColumns)}
    df = raw_df[lgd_cols].drop_duplicates()
    del raw_df
    records = df.to_dict(orient='records')
    del df
    `)
    return pyodide.globals.get("records").toJs();
}
