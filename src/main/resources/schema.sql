DROP TABLE IF EXISTS order_rows;
DROP TABLE IF EXISTS orders;

CREATE SEQUENCE event_seq START WITH 2;
CREATE SEQUENCE event_participation_seq START WITH 1;
CREATE SEQUENCE person_seq START WITH 1;
CREATE SEQUENCE company_seq START WITH 1;


CREATE TABLE event
(
    event_id    BIGINT           NOT NULL PRIMARY KEY DEFAULT nextval('event_seq'),
    name        VARCHAR(64)      NOT NULL,
    description VARCHAR(1500),
    address     VARCHAR(128)     NOT NULL,
    date        TIMESTAMP        NOT NULL,
    price       DOUBLE PRECISION NOT NULL
);

CREATE TABLE person
(
    person_id  BIGINT      NOT NULL PRIMARY KEY DEFAULT nextval('person_seq'),
    first_name VARCHAR(64) NOT NULL,
    last_name  VARCHAR(64) NOT NULL,
    id_code    VARCHAR(11) NOT NULL
);

CREATE TABLE company
(
    company_id    BIGINT       NOT NULL PRIMARY KEY DEFAULT nextval('company_seq'),
    name          VARCHAR(128) NOT NULL,
    register_code VARCHAR(8)   NOT NULL
);

CREATE TABLE event_participation
(
    event_participation_id BIGINT NOT NULL PRIMARY KEY DEFAULT nextval('event_participation_seq'),
    event_id               BIGINT NOT NULL REFERENCES event ON DELETE CASCADE,
    person_id              BIGINT REFERENCES person,
    company_id             BIGINT REFERENCES company,
    num_of_participants    INT,
    payment_type           VARCHAR(64),
    extra_info             VARCHAR(5000)
);
