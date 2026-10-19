
create or replace function public.definir_perfil(_user_id uuid, _role public.app_role)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Apenas administradores'; end if;
  if _user_id = auth.uid() and _role <> 'admin' then raise exception 'Você não pode remover seu próprio perfil de administrador'; end if;
  delete from public.user_roles where user_id = _user_id;
  insert into public.user_roles (user_id, role) values (_user_id, _role);
  insert into public.auditoria (usuario_id, entidade, registro_id, acao, dados_novos)
  values (auth.uid(), 'user_roles', _user_id, 'update', jsonb_build_object('role', _role));
end $$;
revoke execute on function public.definir_perfil(uuid, public.app_role) from public, anon;
grant execute on function public.definir_perfil(uuid, public.app_role) to authenticated;
