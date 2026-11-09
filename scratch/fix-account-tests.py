from pathlib import Path
p=Path('tests/e2e/autohub-accounts.spec.js');s=p.read_text(encoding='utf-8')
s=s.replace("body:JSON.stringify({code:fail===", "headers:{'x-supabase-api-version':'2024-01-01'},body:JSON.stringify({code:fail===")
s=s.replace("expect(f.business().data.tagline).toBe('Servis v Ljubljani');", "await expect.poll(()=>f.business().data.tagline).toBe('Servis v Ljubljani');await expect(page.locator('[data-business-step=\"services\"]')).toBeVisible();")
s=s.replace("expect(f.services()).toHaveLength(1);", "await expect.poll(()=>f.services().length).toBe(1);await expect(page.locator('[data-business-step=\"services\"]')).toBeVisible();")
s=s.replace("aal:mfa?'aal1':'aal1'", "aal:verified?'aal2':'aal1'")
s=s.replace("user_metadata:{display_name:", "factors:mfa?[{id:'factor-1',factor_type:'totp',status:'verified'}]:[],user_metadata:{display_name:")
p.write_text(s,encoding='utf-8')
p=Path('src/pages/onboarding.autohub.js');s=p.read_text(encoding='utf-8').replace("{cat:state.category||'avto'}", "{cat:state.category||'avto',advanced:'1'}");p.write_text(s,encoding='utf-8')
