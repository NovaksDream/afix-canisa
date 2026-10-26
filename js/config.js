'use strict';
/* Setările de conectare la Supabase.
   Le găsești în Supabase: Project Settings → API (sau „Connect”).
   - url: Project URL, de forma https://xxxx.supabase.co
   - anonKey: cheia „anon” / „publishable”. E făcută să stea în aplicație, e publică.
   NU pune aici cheia „service_role” / „secret”: ea ocolește toate regulile de acces. */
const AFIX_CONFIG = {
  supabase: {
    url: 'https://etfuxfenuzqpqeztezdb.supabase.co',
    anonKey: 'sb_publishable_r7tbkMJC1XXgx3vmZPANcw_NvY8zCmL'
  },
  transferPrice: 19
};
