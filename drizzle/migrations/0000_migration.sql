
create type public.app_role as enum ('admin','tesouraria','consulta');

create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  email text not null unique,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
grant select, update on public.usuarios to authenticated;
grant all on public.usuarios to service_role;
alter table public.usuarios enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.pode_editar(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles r join public.usuarios u on u.id = r.user_id
    where r.user_id = _user_id and u.ativo and r.role in ('admin','tesouraria'))
$$;

create or replace function public.usuario_ativo(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.usuarios where id = _user_id and ativo)
$$;

create policy "ver usuarios" on public.usuarios for select to authenticated using (true);
create policy "admin atualiza usuarios" on public.usuarios for update to authenticated
  using (public.has_role(auth.uid(),'admin') or id = auth.uid());
create policy "ver roles" on public.user_roles for select to authenticated using (true);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare primeiro boolean;
begin
  select not exists (select 1 from public.usuarios) into primeiro;
  insert into public.usuarios (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email);
  insert into public.user_roles (user_id, role) values (new.id, case when primeiro then 'admin'::public.app_role else 'consulta'::public.app_role end);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.terceiros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  documento text not null unique,
  tipo text not null check (tipo in ('cliente','fornecedor','ambos')),
  email text, telefone text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
create table public.contas_financeiras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('caixa','banco')),
  saldo_inicial numeric(14,2) not null default 0,
  data_saldo_inicial date not null default current_date,
  ativa boolean not null default true
);
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  natureza text not null check (natureza in ('entrada','saida')),
  ativa boolean not null default true
);
create table public.cobrancas (
  id uuid primary key default gen_random_uuid(),
  natureza text not null check (natureza in ('entrada','saida')),
  terceiro_id uuid not null references public.terceiros(id),
  categoria_id uuid not null references public.categorias(id),
  descricao text not null,
  referencia text,
  valor_total numeric(14,2) not null check (valor_total > 0),
  data_emissao date not null default current_date,
  data_vencimento date not null,
  cancelada_em timestamptz,
  motivo_cancelamento text,
  criada_por uuid not null default auth.uid() references public.usuarios(id),
  criada_em timestamptz not null default now()
);
create table public.movimentacoes (
  id uuid primary key default gen_random_uuid(),
  cobranca_id uuid references public.cobrancas(id),
  conta_financeira_id uuid not null references public.contas_financeiras(id),
  categoria_id uuid not null references public.categorias(id),
  natureza text not null check (natureza in ('entrada','saida')),
  valor numeric(14,2) not null check (valor > 0),
  data_movimentacao date not null default current_date,
  forma_pagamento text not null,
  referencia_bancaria text,
  cancelada_em timestamptz,
  cancelada_por uuid references public.usuarios(id),
  motivo_cancelamento text,
  criada_por uuid not null default auth.uid() references public.usuarios(id),
  criada_em timestamptz not null default now()
);
create table public.anexos (
  id uuid primary key default gen_random_uuid(),
  cobranca_id uuid references public.cobrancas(id),
  movimentacao_id uuid references public.movimentacoes(id),
  tipo text not null check (tipo in ('boleto','nota_fiscal','comprovante','outro')),
  nome_original text not null,
  chave_arquivo text not null,
  tamanho integer not null default 0,
  enviado_por uuid not null default auth.uid() references public.usuarios(id),
  enviado_em timestamptz not null default now()
);
create table public.auditoria (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id),
  entidade text not null,
  registro_id uuid not null,
  acao text not null check (acao in ('insert','update','delete','cancel')),
  dados_anteriores jsonb,
  dados_novos jsonb,
  criado_em timestamptz not null default now()
);

grant select, insert, update on public.terceiros, public.contas_financeiras, public.categorias, public.cobrancas, public.movimentacoes to authenticated;
grant select, insert on public.anexos to authenticated;
grant select on public.auditoria to authenticated;
grant all on public.terceiros, public.contas_financeiras, public.categorias, public.cobrancas, public.movimentacoes, public.anexos, public.auditoria to service_role;

alter table public.terceiros enable row level security;
alter table public.contas_financeiras enable row level security;
alter table public.categorias enable row level security;
alter table public.cobrancas enable row level security;
alter table public.movimentacoes enable row level security;
alter table public.anexos enable row level security;
alter table public.auditoria enable row level security;

do $$ declare t text; begin
  foreach t in array array['terceiros','contas_financeiras','categorias','cobrancas','movimentacoes','anexos'] loop
    execute format('create policy "ler %1$s" on public.%1$I for select to authenticated using (public.usuario_ativo(auth.uid()))', t);
    execute format('create policy "inserir %1$s" on public.%1$I for insert to authenticated with check (public.pode_editar(auth.uid()))', t);
  end loop;
  foreach t in array array['terceiros','contas_financeiras','categorias','cobrancas','movimentacoes'] loop
    execute format('create policy "atualizar %1$s" on public.%1$I for update to authenticated using (public.pode_editar(auth.uid()))', t);
  end loop;
end $$;
create policy "ler auditoria" on public.auditoria for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- Validação de baixa no servidor
create or replace function public.validar_movimentacao()
returns trigger language plpgsql security definer set search_path = public as $$
declare c record; pago numeric;
begin
  if new.cobranca_id is not null and new.cancelada_em is null then
    select * into c from public.cobrancas where id = new.cobranca_id;
    if c.cancelada_em is not null then raise exception 'Cobrança cancelada'; end if;
    if c.natureza <> new.natureza then raise exception 'Natureza diferente da cobrança'; end if;
    select coalesce(sum(valor),0) into pago from public.movimentacoes
      where cobranca_id = new.cobranca_id and cancelada_em is null and id <> new.id;
    if new.valor > c.valor_total - pago then raise exception 'Valor excede o saldo restante da cobrança'; end if;
  end if;
  if tg_op = 'UPDATE' and old.cancelada_em is null and new.cancelada_em is not null then
    if coalesce(trim(new.motivo_cancelamento),'') = '' then raise exception 'Motivo do cancelamento obrigatório'; end if;
    new.cancelada_por := auth.uid();
  end if;
  return new;
end $$;
create trigger trg_validar_mov before insert or update on public.movimentacoes
  for each row execute function public.validar_movimentacao();

create or replace function public.validar_cobranca_cancel()
returns trigger language plpgsql as $$
begin
  if old.cancelada_em is null and new.cancelada_em is not null and coalesce(trim(new.motivo_cancelamento),'') = '' then
    raise exception 'Motivo do cancelamento obrigatório';
  end if;
  return new;
end $$;
create trigger trg_validar_cob before update on public.cobrancas
  for each row execute function public.validar_cobranca_cancel();

create or replace function public.registrar_auditoria()
returns trigger language plpgsql security definer set search_path = public as $$
declare a text;
begin
  if tg_op = 'INSERT' then a := 'insert';
  elsif tg_op = 'DELETE' then a := 'delete';
  elsif (to_jsonb(new) ? 'cancelada_em') and (to_jsonb(old)->>'cancelada_em') is null and (to_jsonb(new)->>'cancelada_em') is not null then a := 'cancel';
  else a := 'update'; end if;
  insert into public.auditoria (usuario_id, entidade, registro_id, acao, dados_anteriores, dados_novos)
  values (auth.uid(), tg_table_name, coalesce(new.id, old.id), a,
    case when tg_op <> 'INSERT' then to_jsonb(old) end,
    case when tg_op <> 'DELETE' then to_jsonb(new) end);
  return coalesce(new, old);
end $$;
do $$ declare t text; begin
  foreach t in array array['terceiros','contas_financeiras','categorias','cobrancas','movimentacoes','anexos'] loop
    execute format('create trigger trg_audit_%1$s after insert or update or delete on public.%1$I for each row execute function public.registrar_auditoria()', t);
  end loop;
end $$;

create policy "ler anexos storage" on storage.objects for select to authenticated
  using (bucket_id = 'anexos' and public.usuario_ativo(auth.uid()));
create policy "enviar anexos storage" on storage.objects for insert to authenticated
  with check (bucket_id = 'anexos' and public.pode_editar(auth.uid()));
