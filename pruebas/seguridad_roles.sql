-- Prueba de seguridad por rol de Bio-centralis.
-- Entra como un usuario de cada rol (y como visitante sin sesion) e intenta ver/hacer lo que NO debe.
-- Es de solo lectura: siempre termina con un error a proposito ("RESULT ...") para que NADA se guarde.
-- Uso: ejecutar completo en el editor SQL de Supabase. Todo renglon con "FALLA" requiere revision.
do $$
declare
  rr record; r text := ''; n int; ok boolean; cuerpo text;
  roles text[] := array['chofer','supervisor','rh','administrativo','monitoreo','direccion_ceo'];
  rol text; uid uuid;
  -- tabla sensible, roles que SI pueden ver filas (el resto debe ver 0). datos_bancarios: el Gerente Operativo ve solo los de sus sedes (por diseno).
  sens jsonb := '{
    "datos_bancarios":["rh","direccion_ceo","supervisor"],
    "examenes_toxicologicos":["rh","direccion_ceo"],
    "permisos":["rh","direccion_ceo","supervisor","administrativo","monitoreo","chofer"],
    "chk_pins":[],
    "cuenta_reclamos":[],
    "reclamo_intentos":[],
    "vinculacion_intentos":[]
  }';
  t text;
begin
  -- 1) Visitante sin sesion: no debe poder leer ninguna tabla ni llamar funciones delicadas
  set local role anon;
  for rr in select c.relname from pg_class c join pg_namespace s on s.oid=c.relnamespace where s.nspname='public' and c.relkind='r' loop
    begin execute format('select count(*) from public.%I', rr.relname) into n; r := r || E'\nFALLA visitante lee '||rr.relname;
    exception when insufficient_privilege then null; end;
  end loop;
  foreach t in array array['exportar_respaldo_completo()','verificar_integridad_auditoria()'] loop
    begin execute 'select * from public.'||t; r := r || E'\nFALLA visitante ejecuta '||t;
    exception when insufficient_privilege then null; end;
  end loop;
  reset role;

  -- 2) Cada rol: tablas sensibles, respaldo, alta de publicaciones y de usuarios
  foreach rol in array roles loop
    select id into uid from public.profiles where role::text = rol and activo limit 1;
    if uid is null then r := r || E'\n(sin usuario de prueba para '||rol||')'; continue; end if;
    perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role','authenticated')::text, true);
    set local role authenticated;
    for t in select jsonb_object_keys(sens) loop
      begin execute format('select count(*) from public.%I', t) into n;
        ok := (sens->t) ? rol;
        if n > 0 and not ok then r := r || E'\nFALLA '||rol||' ve '||n||' filas de '||t; end if;
      exception when insufficient_privilege then null; end;
    end loop;
    begin perform public.exportar_respaldo_completo();
      if rol <> 'direccion_ceo' then r := r || E'\nFALLA '||rol||' exporta el respaldo completo'; end if;
    exception when others then null; end;
    begin insert into public.publicaciones(contenido) values ('prueba');
      if rol not in ('rh','direccion_ceo') then r := r || E'\nFALLA '||rol||' publica en el Muro'; end if;
    exception when insufficient_privilege then null;
              when others then r := r || E'\n(error inesperado en prueba de Muro con '||rol||': '||sqlerrm||')'; end;
    begin update public.profiles set role = 'direccion_ceo' where id = uid;
      get diagnostics n = row_count;
      if n > 0 and rol <> 'direccion_ceo' then r := r || E'\nFALLA '||rol||' se pudo subir de rol'; end if;
    exception when others then null; end;
    reset role;
  end loop;
  raise exception 'RESULT %', case when r = '' then 'TODO BIEN: ningun rol hizo ni vio lo que no debe' else r end;
end $$;
