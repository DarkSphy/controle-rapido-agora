revoke execute on function public.has_active_subscription(uuid, text) from anon, public;
grant execute on function public.has_active_subscription(uuid, text) to authenticated, service_role;