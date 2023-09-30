const duckdb = require("duckdb");
const { RecordBatchReader } = require("apache-arrow");

module.exports = {
  test: async () => {
    const sql = "select generate_series(5) as foo, generate_series(5) as bar";
    const db = new duckdb.Database(":memory:");
    const con = db.connect();

    // not sure if this is necessary, but load the arrow extension
    await new Promise((resolve, reject) => {
      con.exec("INSTALL arrow; LOAD arrow;", (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    // confirm that the extension is loaded
    const ext = await new Promise((resolve, reject) => {
      con.all(
        "select extension_name FROM duckdb_extensions() where loaded = true and installed = true",
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });
    console.log("extensions", ext);

    // show that simple queries work
    const result = await new Promise((resolve, reject) => {
      con.all(sql, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
    console.log("con.all", result);

    // attempt to use an arrow stream
    const stream = await con.arrowIPCStream(sql);

    // traced the problem through the source to here: https://github.com/duckdb/duckdb/blob/7512d7ff4f5b8afd86f247335e5c4f75538bf43f/tools/nodejs/lib/duckdb.js#L143
    // you can uncomment the following to see it crashes on this call (which happens in the iterator below)
    // const rawBuffer = await stream.stream_result.nextIpcBuffer();
    // console.log("rawBuffer", rawBuffer);

    // Use an arrow RecordBatchReader to iterate over the stream
    // on node, this executes without error
    const reader = await RecordBatchReader.from(stream);
    for await (const batch of reader) {
      console.log(batch.schema.fields, batch.numRows, batch.numCols);
      // however, we only get the fields, and no rows
      for (const row of batch) {
        console.log(row);
        for (const [field, val] of row) {
          console.log(field, val);
        }
      }
    }

    console.log("done");
  },
};
