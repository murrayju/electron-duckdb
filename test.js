import duckdb from "duckdb";
import { RecordBatchReader } from "apache-arrow";

// Stream results by getting an arrowIPCStream, then iterating with an arrow RecordBatchReader
const streamResults = async (con, sql) => {
  console.log("\nstreamResults:", sql);
  const results = [];
  for await (const batch of await RecordBatchReader.from(
    await con.arrowIPCStream(sql)
  )) {
    console.log(
      `batch has ${batch.schema.fields.length} fields, ${batch.numRows} rows, ${batch.numCols} cols`
    );
    for (const row of batch) {
      const result = {};
      for (const [field, val] of row) {
        result[field] = val;
      }
      results.push(result);
    }
  }
  return results;
};

export const test = async () => {
  const db = new duckdb.Database(":memory:");
  const con = db.connect();

  // load the arrow extension
  await new Promise((resolve, reject) => {
    con.exec("INSTALL arrow; LOAD arrow;", (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  // This works correctly (as does any select of columns from a table)
  console.log(
    "working example:",
    await streamResults(con, "select * from generate_series(0, 5) as t(v)")
  );

  // But any scalar query does not iterate any rows (where 1 is expected)
  const sql = "select now() as t";
  // const sql = "select count(*) from generate_series(0, 5)";
  console.log("broken example:", await streamResults(con, sql));

  // The same query works as expected with con.all
  console.log(
    "\ncon.all",
    await new Promise((resolve, reject) => {
      con.all(sql, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    })
  );

  console.log("done");
};
