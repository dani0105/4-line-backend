-- se encarga de ingresar nuevos usuarios al sistema
CREATE OR REPLACE PROCEDURE public.register(
    _email      character varying,
    _username   character varying,
    _password   character varying,
    INOUT success   BOOLEAN DEFAULT false,
    INOUT id_new    INTEGER DEFAULT NULL)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE 
begin
    if EXISTS(select id from public.user_account where email = _email) THEN 
        success =false;
        return;
    END IF;

    insert into public.user_account 
        (email, username, password)
    values
        (_email,_username, _password) returning user_account.id into id_new;
    success = true;
    return;
end ;
$BODY$;

CREATE OR REPLACE FUNCTION public.login(
    _email      character varying,
    _password   character varying
) 
RETURNS table(
    id integer, 
    username character varying,
    picture character varying
)
LANGUAGE 'plpgsql'
AS $BODY$
begin
    return query
        select 
            user_account.id,
            user_account.username,
            user_account.picture
        from 
            public.user_account 
        where 
            email       = _email AND 
            password    = _password
        FETCH FIRST ROW ONLY;
end ;
$BODY$;

-- Este procedimiento se encarga de registrar un nuevo usuario o cargar sus datos
CREATE OR REPLACE PROCEDURE public.third_party(
    _oauth_uid      character varying,
    INOUT email     character varying,
    INOUT username  character varying,
    INOUT id_new    INTEGER DEFAULT NULL,
    INOUT success   BOOLEAN DEFAULT false)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE 
    _username   character varying;
    _email      character varying;
begin
    select 
        UA.id,
        UA.email,
        UA.username
    into 
        id_new ,
        _email,
        _username
    from 
        public.user_account UA
    where 
        UA.oauth_uid = _oauth_uid AND
        UA.is_active = true;


    if (id_new is null) THEN 
        
        insert into public.user_account 
            (oauth_uid, email, username)
        values
            (_oauth_uid, email, username) returning user_account.id into id_new;
    else
        update public.user_account set
            email= _email
        where
            id= id_new;
        username = _username;
        email = _email;
    END IF;
    success = true;
    return;
end ;
$BODY$;