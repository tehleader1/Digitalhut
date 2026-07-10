-- Pin the pixel analytics functions to trusted schemas.
-- This prevents caller-controlled search_path resolution in exposed RPC/trigger code.

alter function public.digitalhut_pixel_origin_bucket(text)
  set search_path = public, pg_temp;

alter function public.digitalhut_pixel_lane(text, text, jsonb)
  set search_path = public, pg_temp;

alter function public.digitalhut_pixel_is_second_action(text)
  set search_path = public, pg_temp;

alter function public.digitalhut_search_pixel_apply_rollup()
  set search_path = public, pg_temp;

alter function public.digitalhut_search_pixel_summary_read(integer)
  set search_path = public, pg_temp;
