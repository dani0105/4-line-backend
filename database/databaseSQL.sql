
/*
    Tabla que contiene a todos los usuarios que se registran en la plataforma con Login de Facebook o login normal
*/
CREATE TABLE user_account
(
    id          SERIAL          PRIMARY KEY,
    oauth_uid   varchar(100)    unique DEFAULT NULL,
    email       varchar(100)    unique DEFAULT NULL,
    picture     varchar(255)    DEFAULT NULL,
    username    varchar(50)     DEFAULT null,    
    password    varchar(250)    DEFAULT null,
    is_active   BOOLEAN         DEFAULT TRUE,
    created_at  DATE        DEFAULT CURRENT_DATE
);


CREATE TABLE game
(
    id              SERIAL  PRIMARY KEY,
    id_player1      integer,
    id_player2      integer,
    player_winner   integer,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATE    DEFAULT CURRENT_DATE,
    CONSTRAINT player1_id FOREIGN KEY (id_player1) REFERENCES user_account (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
            NOT VALID,
    CONSTRAINT player2_id FOREIGN KEY (id_player2) REFERENCES user_account (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
            NOT VALID
);

CREATE TABLE room
(
    id              SERIAL  PRIMARY KEY,
    id_user_account integer,
    name            VARCHAR(250),
    password        VARCHAR(250),
    is_active       BOOLEAN
);

CREATE TABLE room_user_account
(
    id              SERIAL  PRIMARY KEY,
    id_user_account integer,
    id_room         integer,
    is_active       BOOLEAN,
    CONSTRAINT user_account_id FOREIGN KEY (id_user_account) REFERENCES user_account (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT room_id FOREIGN KEY (id_room) REFERENCES room (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);