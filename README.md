# Streaming data out of DuckDB

I'm working on building out a streaming interface for DuckDB that handles arbitrary SQL and streams back any results. I have something that works for "normal" selects that return rows of data, but I'm finding that it does not work as expected for what I'll call "scalar" queries, like `select 1` or `select count(*) from table`. I'm not sure if this is a bug or if I'm doing something wrong.

See the code comments for more explanation. You can run the test with:

```bash
npm run test-node
```

Note: the `test-electron` script crashes due to [duckdb#9172](https://github.com/duckdb/duckdb/issues/9172).
