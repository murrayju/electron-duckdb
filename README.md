# electron-duckdb

## Crashing Electron with DuckDB

In this repo, I'm highlighting what appears to be a bug in DuckDB when used with Electron. To reproduce:

```bash
npm install
npm run test-electron
```

You should see the following error:

```bash
libc++abi: terminating due to uncaught exception of type Napi::Error: External buffers are not allowed
/path/to/Electron exited with signal SIGABRT
```

I've traced the problem down to [this line](https://github.com/duckdb/duckdb/blob/7512d7ff4f5b8afd86f247335e5c4f75538bf43f/tools/nodejs/lib/duckdb.js#L143), where the `nextIpcBuffer()` call seems to be what is triggering the `External buffers are not allowed` error.

You can then test that the same code executes find in a standard node environment:

```bash
npm run test-node
```

## Streaming data out of DuckDB

In addition to the electron problems, even in node I'm having trouble streaming data out of DuckDB row by row. I expected passing the `arrowIPCStream` into an arrow `RecordBatchReader` would accomplish this. However, I only get the fields, and no row data. This can be observed by running:

```bash
npm run test-node
```
