-- Create the database once (note the quotes keep the capital U):
--   psql -U postgres -c 'CREATE DATABASE "University";'
-- Then load this file:
--   psql -U postgres -d University -f database/schema.sql

DROP TABLE IF EXISTS instructor;

CREATE TABLE instructor (
  id        VARCHAR(5)    PRIMARY KEY,
  name      VARCHAR(40)   NOT NULL,
  dept_name VARCHAR(40)   NOT NULL,
  salary    NUMERIC(10,2) NOT NULL CHECK (salary >= 0)
);

INSERT INTO instructor (id, name, dept_name, salary) VALUES
 ('10101', 'Srinivasan', 'Comp. Sci.',  65000),
 ('12121', 'Wu',         'Finance',      90000),
 ('15151', 'Mozart',     'Music',        40000),
 ('22222', 'Einstein',   'Physics',      95000),
 ('32343', 'El Said',    'History',      60000),
 ('33456', 'Gold',       'Physics',      87000),
 ('45565', 'Katz',       'Comp. Sci.',   75000),
 ('58583', 'Califieri',  'History',      62000),
 ('76543', 'Singh',      'Finance',      80000),
 ('76766', 'Crick',      'Biology',      72000),
 ('83821', 'Brandt',     'Comp. Sci.',   92000),
 ('98345', 'Kim',        'Elec. Eng.',   80000);
