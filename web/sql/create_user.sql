-- Role: trackrecord_user
-- DROP ROLE trackrecord_user;

CREATE ROLE trackrecord_user WITH
  NOLOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;

