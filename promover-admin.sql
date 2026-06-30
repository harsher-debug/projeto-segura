-- ════════════════════════════════════════════════════════════════
-- Promover usuário a Administrador — Imobiliária Segura
-- ════════════════════════════════════════════════════════════════
--
-- COMO USAR:
--   1. Crie sua conta normalmente pela tela /entrar (escolha qualquer
--      perfil, ex: Locatário — o perfil de login não trava o acesso,
--      o que define suas permissões reais é a tabela user_roles)
--   2. No painel do Supabase, vá em SQL Editor
--   3. Substitua 'seu-email@exemplo.com' pelo e-mail que você usou
--      no cadastro
--   4. Rode este script
--   5. Faça logout e login novamente no site para o acesso de admin
--      ser aplicado
--
-- Isso te dá acesso total ao Dashboard Administrativo (/app/dashboard),
-- CRM, gestão de imóveis, leads, e a ambos os portais (proprietário e
-- locatário) para fins de suporte e gerenciamento.
-- ════════════════════════════════════════════════════════════════

insert into public.user_roles (user_id, role)
select id, 'admin'::app_role
from auth.users
where email = 'seu-email@exemplo.com'
on conflict (user_id, role) do nothing;

-- Verificar se funcionou:
select u.email, ur.role
from auth.users u
join public.user_roles ur on ur.user_id = u.id
where u.email = 'seu-email@exemplo.com';
