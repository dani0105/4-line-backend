CREATE OR REPLACE PROCEDURE public.register_user(
    _email      character varying,
    _username   character varying,
    _password   character varying,
    INOUT success   BOOLEAN DEFAULT false,
    INOUT id_new    INTEGER DEFAULT NULL)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE 
begin
    if EXISTS(select id from public.user_account where username = _username AND password = _password) THEN 
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


CREATE OR REPLACE FUNCTION public.login_user(
    _oauth_uid  character varying DEFAULT NULL,
    _username   character varying DEFAULT NULL,
    _password   character varying DEFAULT NULL
) 
RETURNS table(id integer, email character varying, picture character varying)
LANGUAGE 'plpgsql'
AS $BODY$
begin
    return query
        select 
            user_account.id,
            user_account.email,
            user_account.picture
        from 
            public.user_account 
        where 
            oauth_uid = COALESCE(_oauth_uid,oauth_uid) or 
            (username = _username AND password = _password)
        FETCH FIRST ROW ONLY;
end ;
$BODY$;

CREATE OR REPLACE PROCEDURE public.third_party(
    _oauth_uid  character varying,
    _email      character varying,
    _picture    character varying,
    INOUT success   BOOLEAN DEFAULT false,
    INOUT id_new    INTEGER DEFAULT NULL)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE 
begin
    select id into id_new from 
        public.user_account 
    where 
        oauth_uid = _oauth_uid;

    success =True;
    if (id_new is null) THEN 
        
        insert into public.user_account 
            (oauth_uid, email, picture)
        values
            (_oauth_uid, _email, _picture) returning user_account.id into id_new;

        return;
    END IF;
    return;
end ;
$BODY$;