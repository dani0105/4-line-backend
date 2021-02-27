CREATE OR REPLACE PROCEDURE public.nombre(
    INOUT success   BOOLEAN DEFAULT false)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE 
begin
    
    return;
end ;
$BODY$;

CREATE OR REPLACE FUNCTION public.nombre() 
RETURNS table()
LANGUAGE 'plpgsql'
AS $BODY$
begin
    
end ;
$BODY$;