-- Not something drizzle-kit can generate from db/schema.ts — this touches
-- auth.users, a Supabase-managed table outside our schema. Hand-written,
-- applied through the normal `npm run db:migrate` flow like any other
-- migration so every environment gets it consistently.
--
-- Auto-creates a `customers` row the moment a new Supabase Auth user is
-- created, keeping customers.id in sync with auth.users.id (spec section
-- 5: "id matches Supabase auth.users.id"). Pulls name/phone from the
-- signup call's metadata if the client provided them
-- (supabase.auth.signUp({ options: { data: { name, phone } } })).
--
-- security definer + a pinned search_path: this needs to write into
-- public.customers (which has RLS enabled) from a context that isn't the
-- new user's own session — standard, documented Supabase pattern for this
-- exact trigger, not a project-specific choice.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (id, email, name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
