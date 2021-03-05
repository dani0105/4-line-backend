
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