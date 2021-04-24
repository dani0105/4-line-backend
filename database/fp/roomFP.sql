

CREATE OR REPLACE PROCEDURE public.add_room(
    _id_user_account    INTEGER,
    _name               character varying,
    _password           character varying,
    INOUT success       BOOLEAN DEFAULT false,
    INOUt id_new        INTEGER DEFAULT null
)LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    _trash integer;
begin
    insert into public.room 
        (name, password)
    VALUES
        (_name,_password) returning room.id into id_new;
    call add_room_user_account(id_new, _id_user_account,true,success,_trash);
end ;
$BODY$;

CREATE OR REPLACE PROCEDURE public.update_room(
    _id                 INTEGER,
    _name               character varying DEFAULT NULL,
    _password           character varying DEFAULT NULL,
    _is_active          BOOLEAN DEFAULT NULL,
    INOUT success       BOOLEAN DEFAULT false
)LANGUAGE 'plpgsql'
AS $BODY$
begin
    if EXISTS(select id from room where id = _id) THEN
        update public.room set 
            name = COALESCE(_name, name),
            password = COALESCE(_password,password),
            is_active = COALESCE(_is_active,is_active)
        WHERE 
            id = _id;
        success = true;
    END IF;
end ;
$BODY$;


CREATE OR REPLACE FUNCTION get_room(
    _id_user_account    INTEGER,
    _page_number        INTEGER,
    _size               INTEGER
)
RETURNS table(
    id          integer,
    name        character varying,
    total_users BIGINT 
)
AS $$
BEGIN
    RETURN QUERY SELECT 
                    R.id,
                    R.name,
                    (select count(RUA2.id) from room_user_account RUA2 where RUA2.id_room = R.id AND RUA2.is_active = true) as total_users
                from 
                    room R
                INNER JOIN public.room_user_account RUA ON RUA.id_room = R.id
                WHERE
                    R.is_active = true AND
                    RUA.is_active = true AND
                    RUA.id_user_account = _id_user_account
                ORDER BY R.name ASC 
		OFFSET _size * _page_number
		FETCH NEXT _size ROWS ONLY;
END;
$$
LANGUAGE PLPGSQL;






CREATE OR REPLACE PROCEDURE public.add_room_user_account(
    _id_room            INTEGER,
    _id_user_account    INTEGER,
    _is_admin           BOOLEAN DEFAULT false,
    INOUT success       BOOLEAN DEFAULT false,
    INOUT id_new        INTEGER DEFAULT NULL
)LANGUAGE 'plpgsql'
AS $BODY$
DECLARE 
    _trash BOOLEAN;
begin
    select 
        id INTO id_new
    from 
        room_user_account
    where
        id_room         = _id_room AND
        id_user_account = _id_user_account;

    if ( id_new is null) THEN
        insert into room_user_account
            (id_user_account, id_room,is_admin)
        VALUES
            (_id_user_account, _id_room,_is_admin) returning room_user_account.id into id_new;
        success = true ;
    ELSE
        call update_room_user_account(id_new,true,_is_admin,success);
    END IF;
    
end ;
$BODY$;

CREATE OR REPLACE PROCEDURE public.update_room_user_account(
    _id             INTEGER,
    _is_active      BOOLEAN DEFAULT NULL, 
    _is_admin       BOOLEAN DEFAULT NULL,
    INOUT success   BOOLEAN DEFAULT false
)LANGUAGE 'plpgsql'
AS $BODY$
begin
    if(EXISTS(select id from room_user_account where id = _id)) THEN
        update public.room_user_account set 
            is_active = COALESCE(_is_active, is_active),
            is_admin = COALESCE(_is_admin, is_admin)
        WHERE 
            id = _id;
        success = true;
    END IF;
end ;
$BODY$;


CREATE OR REPLACE FUNCTION get_room_user_account(
    _id_room            INTEGER,
    _page_number        INTEGER,
    _size               INTEGER
)
RETURNS table(
    id_user_account integer,
    id              integer,
    username        character varying,
    is_admin        BOOLEAN
)LANGUAGE PLPGSQL
AS $$
BEGIN
    RETURN QUERY SELECT 
                    UA.id as id_user_account,
                    RUA.id,
                    UA.username,
                    RUA.is_admin
                from 
                    public.room_user_account RUA
                INNER JOIN public.user_account UA ON UA.id = RUA.id_user_account
                WHERE
                    UA.is_active = true AND
                    RUA.id_room = _id_room AND
                    RUA.is_active = true
                ORDER BY UA.username ASC 
                OFFSET _size * _page_number
                FETCH NEXT _size ROWS ONLY;
END;
$$

