import { asyncRun } from "../pyodide.worker";

const script = `
  import pandas as pd
  import io
  from pyodide.ffi import to_js
  from js import csv_file_text, lgd_columns

  csv_buffer = io.StringIO(csv_file_text)
  raw_df = pd.read_csv(csv_buffer, low_memory=False)

  df = raw_df[lgd_columns].drop_duplicates()
  del raw_df
  records = df.to_dict(orient='records')
  del df
  to_js(records)
`;

export const getUniqueRecords = async (file: File, lgdColumns: string[]) => {
  try {
    const fileText = await file.text();
    const context = {
      csv_file_text: fileText,
      lgd_columns: lgdColumns,
    };
    console.log(context);
    const { results, error } = await asyncRun(script, context);
    if (results) {
      return results
    } else if (error) {
      console.log("pyodideWorker error: ", error);
    }
  } catch (e) {
    console.log(
      `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`,
    );
  }
}