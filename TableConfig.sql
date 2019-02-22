/* This file is to initiate the database and have a scheme on the sminut (SM-in-ut) table. */

CREATE DATABASE knockknock;

CREATE TABLE "sm" (
    sm_id SERIAL PRIMARY KEY,
    sm_name TEXT NOT NULL,
    sm_start BIGINT,
    sm_slut BIGINT
);

CREATE TABLE sminut (
    id SERIAL NOT NULL PRIMARY KEY,
    sm_id INTEGER,
    tid_in BIGINT NOT NULL,
    tid_ut BIGINT,
    kth_id TEXT NOT NULL,
    punkt_in TEXT NOT NULL,
    punkt_ut TEXT
);