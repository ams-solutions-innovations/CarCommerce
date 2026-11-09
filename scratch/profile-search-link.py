from pathlib import Path
p=Path('src/pages/profile.autohub.js');s=p.read_text(encoding='utf-8')
needle="  host.innerHTML=`<section class=\"ah-container ah-profile-page\">"
insert="""  if(['settings','favourites'].includes(tab)){const search=prefs.autohubOnboarding?.savedSearch;body=`<section class="ah-profile-settings-card"><h2>${text('ob_saved_preferences','Vaš izbor vozil')}</h2>${search?`<a class="ah-blue-button" href="/oglasi?${escHtml(new URLSearchParams(search.query).toString())}">${icon('search')}${escHtml(search.name)}</a>`:''}<a class="ah-pill" href="/zacetek">${text('ob_edit_choices','Uredi izbire')}</a><a class="ah-pill" href="/poslovni-uvod">${text('bo_step','Poslovni uvod')}</a></section>`+body;}
"""
assert needle in s;s=s.replace(needle,insert+needle);p.write_text(s,encoding='utf-8')
