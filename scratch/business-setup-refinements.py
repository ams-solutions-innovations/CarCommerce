from pathlib import Path
p=Path('src/pages/business-onboarding.autohub.js');s=p.read_text(encoding='utf-8')
s=s.replace('profileCompleteness(business):0','profileCompleteness(business,services.length):0')
s=s.replace("else if(step==='services'){for(const selected", "else if(step==='services'){services=await listServices();for(const selected")
needle="<label class=\"ah-account-field\">${text('bo_logo','Logotip')}"
insert="""<h3>${text('bo_hours','Delovni čas')}</h3>${['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((day,index)=>field('hours_'+day,text('bo_day_'+day,['Ponedeljek','Torek','Sreda','Četrtek','Petek','Sobota','Nedelja'][index]),business?.workingHours?.[day],'maxlength="60" placeholder="08:00–16:00"')).join('')}"""
assert needle in s;s=s.replace(needle,insert+needle)
s=s.replace("contact,logo:business?.logo", "contact,workingHours:Object.fromEntries(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day=>[day,String(data.get('hours_'+day)||'').trim()])),logo:business?.logo")
p.write_text(s,encoding='utf-8')
p=Path('src/pages/accounts.autohub.js');s=p.read_text(encoding='utf-8').replace("if(!button)return;if(button.dataset.accountKind)", "if(!button||busy)return;if(button.dataset.accountKind)")
p.write_text(s,encoding='utf-8')
for lang in ['sl','en']:
 import json
 p=Path('public/lang/'+lang+'.json');data=json.loads(p.read_text(encoding='utf-8'));data['ob_saved_preferences']='Vaš izbor vozil' if lang=='sl' else 'Your vehicle selection';data['bo_hours']='Delovni čas' if lang=='sl' else 'Opening hours'
 for day,sl,en in zip(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],['Ponedeljek','Torek','Sreda','Četrtek','Petek','Sobota','Nedelja'],['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']):data['bo_day_'+day]=sl if lang=='sl' else en
 p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
