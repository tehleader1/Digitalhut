-- Makes browser telemetry safe to retry without double-counting rollups.
-- Existing rows do not carry clientEventId and are intentionally unaffected.

do $$
declare duplicate_groups bigint;
begin
  select count(*) into duplicate_groups
  from (
    select metadata ->> 'clientEventId'
    from public.digitalhut_search_pixel_events
    where nullif(metadata ->> 'clientEventId', '') is not null
    group by 1
    having count(*) > 1
  ) duplicates;
  if duplicate_groups > 0 then
    raise exception 'digitalhut clientEventId preflight found % duplicate groups; stop release and reconcile without deleting event evidence', duplicate_groups;
  end if;
end
$$;

create unique index if not exists digitalhut_search_pixel_events_client_event_id_uidx
  on public.digitalhut_search_pixel_events ((metadata ->> 'clientEventId'))
  where nullif(metadata ->> 'clientEventId', '') is not null;

comment on index public.digitalhut_search_pixel_events_client_event_id_uidx is
  'Rejects duplicate browser telemetry retries before insert triggers can increment audience rollups twice.';
