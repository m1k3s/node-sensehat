-- createdb -U mike -f serverstats

\c serverstats;

CREATE TABLE environmental (
  ID SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  temperature REAL,
  humidity REAL,
  pressure REAL
);

CREATE TABLE loadavg (
  ID SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  la1 REAL,
  la5 REAL,
  la15 REAL
);

CREATE TABLE netstats (
  ID SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  bytes_sent BIGINT,
  bytes_recv BIGINT,
  packets_sent BIGINT,
  packets_recv BIGINT,
  tx_rate INTEGER,
  rx_rate INTEGER
);

CREATE TABLE diskstats (
  ID SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_bytes BIGINT,
  write_bytes BIGINT,
  rbytes INTEGER,
  wbytes INTEGER
);


