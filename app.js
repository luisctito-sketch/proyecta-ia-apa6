const $=id=>document.getElementById(id), clean=s=>(s||'').replace(/\s+/g,' ').trim(), norm=s=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(), wc=s=>(s||'').trim()?((s.trim().match(/\S+/g)||[]).length):0, yearOk=y=>/^\d{4}$/.test((y||'').trim());
const authors=v=>(v||'').split(';').map(x=>x.trim()).filter(Boolean);
function joinAuthors(a,lang='es',occ='first'){if(!a.length)return'';if(a.length===1)return a[0];const c=lang==='en'?' & ':' y ';if(a.length===2)return a[0]+c+a[1];if(a.length>=6)return a[0]+' et al.';if(a.length>=3&&a.length<=5&&occ==='later')return a[0]+' et al.';return a.slice(0,-1).join(', ')+c+a[a.length-1]}
function show(el,cls,html){el.className=`output ${cls}`;el.innerHTML=html;el.classList.remove('hidden')}
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function lineAlert(t){const n=wc(t);return n>145?`<li class="warn">${n} palabras: podría superar aproximadamente 10 líneas. Verifica en Word con Times New Roman 12 e interlineado 1,5.</li>`:`<li class="good">${n} palabras: sin alerta evidente respecto al máximo aproximado de 10 líneas.</li>`}

function pLabel(p){return /[-–—,]/.test(p)?'pp.':'p.'}
qBtn.onclick=()=>{const a=authors(qAuthors.value),y=qYear.value.trim(),p=qPage.value.trim(),t=qText.value.trim(),e=qEmphasis.value;if(!a.length||!yearOk(y)||!p||!t)return show(qOut,'bad','<h4>🔵 FALTA INFORMACIÓN</h4><p>Completa autor(es), año, página y fragmento. No se inventarán datos.</p>');const n=wc(t),au=joinAuthors(a),tx=esc(t),pp=pLabel(p);let m,info,title;if(n<40&&e==='author'){title='1A · Menos de 40 palabras · Basada en el autor';m=`${au} (${y}) afirma: “${tx}” (${pp} ${p}).`;info='Dentro del párrafo, entre comillas y sin cursiva; el punto se coloca después de los datos.'}else if(n<40){title='1B · Menos de 40 palabras · Basada en el texto';m=`“${tx}” (${au}, ${y}, ${pp} ${p}).`;info='Dentro del párrafo, entre comillas y sin cursiva; autor, año y página aparecen al final.'}else if(e==='text'){title='2A · Cita larga · Basada en el texto';m=`    ${tx}.
    (${au}, ${y}, ${pp} ${p})`;info='Bloque con sangría, sin comillas ni cursiva; el punto antecede a los datos. El Reglamento permite espacio sencillo en citas largas.'}else{title='2B · Cita larga · Basada en el autor';m=`${au} (${y}) afirma:

    ${tx}. (${pp} ${p})`;info='Autor y año introducen el bloque; al final se coloca la página. El Reglamento permite espacio sencillo en citas largas.'}show(qOut,'ok',`<h4>🟢 ${title}</h4><p><b>${n} palabras.</b> ${info}</p><pre>${m}</pre><p class="small">Si el fragmento tiene exactamente 40 palabras, PROYECTA-IA lo trata como cita larga. Verifica fidelidad y página real.</p>`) };

function pPrompt(){const a=authors(pAuthors.value),y=pYear.value.trim(),s=pSource.value.trim(),d=pData.value.trim();if(!a.length||!yearOk(y)||!s||!d)return null;const au=joinAuthors(a);return `ACTÚA COMO COPILOTO ACADÉMICO PARA PARAFRASEO SEGÚN APA 6.

TEXTO ORIGINAL:
${s}

FUENTE REAL PROPORCIONADA:
${d}

AUTOR(ES): ${au}
AÑO: ${y}

INSTRUCCIONES:
1. No inventes autor, año, página, DOI, URL ni datos bibliográficos.
2. Conserva fielmente la idea central.
3. No hagas simple sustitución por sinónimos: cambia también estructura sintáctica, orden de exposición e integración de ideas.
4. Entrega DOS modelos: A) BASADO EN EL AUTOR: ${au} (${y})...; B) BASADO EN EL TEXTO: ... (${au}, ${y}).
5. Usa redacción científica e impersonal.
6. Indica qué expresiones del original evitaste repetir literalmente.
7. No cambies términos técnicos indispensables si alterarían el sentido.
8. El estudiante puede elegir un modelo o modificarlo manteniendo el sentido y la cita.
9. Si faltan datos verificables, indica FALTA INFORMACIÓN.`}
pBtn.onclick=()=>{if(!pConfirmed.checked)return show(pOut,'warn','<h4>🟡 Fuente no confirmada</h4><p>Confirma que consultaste la fuente real.</p>');const pr=pPrompt();if(!pr)return show(pOut,'bad','<h4>🔵 FALTA INFORMACIÓN</h4><p>Completa autor(es), año, texto original y datos de fuente.</p>');const au=joinAuthors(authors(pAuthors.value)),y=pYear.value.trim();show(pOut,'ok',`<h4>🟢 Dos modelos a producir</h4><p><b>Modelo A:</b> ${au} (${y}) [paráfrasis con palabras propias].</p><p><b>Modelo B:</b> [Paráfrasis con palabras propias] (${au}, ${y}).</p><p class="small">Copia la solicitud para que ChatGPT redacte ambos a partir del texto real.</p>`)};
pCopy.onclick=async()=>{const pr=pPrompt();if(!pr||!pConfirmed.checked)return alert('Completa los datos y confirma la fuente.');await navigator.clipboard.writeText(pr);alert('Solicitud copiada.')};


pcBtn.onclick=()=>{const a=pcAuthor.value.trim(),y=pcYear.value.trim(),t=pcText.value.trim();if(!a||!yearOk(y)||!t)return show(pcOut,'bad','<h4>🔵 FALTA INFORMACIÓN</h4><p>Completa apellido, año y tu paráfrasis.</p>');const ae=a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),start=new RegExp('^\\s*'+ae+'\\s*\\('+y+'\\)','i').test(t),end=new RegExp('\\('+ae+'\\s*,\\s*'+y+'\\)\\.?\\s*$','i').test(t);if(start)return show(pcOut,'ok',`<h4>🟢 Paráfrasis basada en el autor</h4><p>La forma detectada corresponde a <b>${esc(a)} (${y}) ...</b></p><p class="small">Esta comprobación revisa la forma de la cita, no la fidelidad conceptual.</p>`);if(end)return show(pcOut,'ok',`<h4>🟢 Paráfrasis basada en el texto</h4><p>La forma detectada corresponde a <b>... (${esc(a)}, ${y}).</b></p><p class="small">Esta comprobación revisa la forma de la cita, no la fidelidad conceptual.</p>`);show(pcOut,'warn','<h4>🟡 REVISAR</h4><p>Se indicó autor y año, pero la redacción no coincide claramente con los dos modelos. Revisa la posición del autor-año y la puntuación.</p>')};
const stop=new Set('el la los las un una unos unas de del al y e o u en para por con sin que se su sus es son fue han ha como mas muy esto esta este estos estas lo le les ante bajo entre hacia hasta sobre tras desde durante mediante porque cuando donde cual cuales tambien si ya no'.split(' '));
function toks(s){return norm(s).replace(/[^a-z0-9áéíóúñü\s-]/gi,' ').split(/\s+/).filter(Boolean)}
function content(s){return toks(s).filter(x=>x.length>3&&!stop.has(x)&&!/^[0-9]+$/.test(x))}
function sim(a,b){const A=new Set(content(a)),B=new Set(content(b));if(!A.size||!B.size)return 0;let n=0;A.forEach(x=>B.has(x)&&n++);return n/Math.min(A.size,B.size)}
function sharedWords(a,b){const B=new Set(content(b)),seen=new Set(),out=[];for(const w of content(a)){if(B.has(w)&&!seen.has(w)){seen.add(w);out.push(w)}}return out.slice(0,14)}
function phrases(a,b){const A=toks(a),bn=norm(b),out=[];for(let n=6;n>=3;n--){for(let i=0;i<=A.length-n;i++){const g=A.slice(i,i+n).join(' ');if(g.length>=14&&bn.includes(g)&&!out.some(p=>p.includes(g)||g.includes(p)))out.push(g);if(out.length>=8)return out}}return out}
cmpBtn.onclick=()=>{const a=cmpOriginal.value.trim(),b=cmpPara.value.trim();if(!a||!b)return show(cmpOut,'bad','<h4>🔵 FALTA INFORMACIÓN</h4><p>Pega el texto original y tu paráfrasis.</p>');const pct=Math.round(sim(a,b)*100),ph=phrases(a,b),sw=sharedWords(a,b);let cls='ok',level='Baja a moderada',msg='No se detecta una coincidencia léxica elevada, pero la idea igualmente debe citarse.';if(pct>=70){cls='bad';level='Muy alta';msg='La paráfrasis conserva demasiadas palabras del original. Reestructura antes de utilizarla.'}else if(pct>=50){cls='warn';level='Moderada-alta';msg='Todavía se parece bastante al original. Cambia estructura y expresiones completas.'}else if(pct>=35){cls='warn';level='Moderada';msg='Hay coincidencias apreciables. Revisa especialmente las secuencias mostradas.'}const phh=ph.length?ph.map(x=>`<span class="pill">${esc(x)}</span>`).join(''):'<span class="small">No se detectaron secuencias largas idénticas.</span>',ww=sw.length?sw.map(x=>`<span class="wpill">${esc(x)}</span>`).join(''):'<span class="small">No se detectaron palabras de contenido destacadas.</span>';show(cmpOut,cls,`<h4>${pct>=70?'🔴':pct>=35?'🟡':'🟢'} Similitud aproximada: ${pct}% · ${level}</h4><div class="meter"><span style="width:${Math.min(pct,100)}%;background:${pct>=70?'#b42318':pct>=35?'#b87300':'#16834b'}"></span></div><p>${msg}</p><div class="matchgrid"><div><b>Frases que todavía se parecen</b><div class="pills">${phh}</div></div><div><b>Palabras de contenido repetidas</b><div class="pills">${ww}</div></div></div><h4>Cómo alejar la paráfrasis sin perder la idea central</h4><ul><li>Reorganiza el orden de las ideas.</li><li>Cambia expresiones completas, no solo palabras aisladas.</li><li>Sintetiza varias oraciones cuando sea posible.</li><li>Integra la idea con tus propios conectores.</li><li>Conserva términos técnicos indispensables si cambiarlos altera el significado.</li><li>Mantén siempre la cita autor-año.</li></ul><p class="small">Este porcentaje es una aproximación léxica local; no equivale a un índice institucional de similitud o plagio.</p>`) };

aBtn.onclick=()=>{const a=authors(aList.value),y=aYear.value.trim();if(!a.length||!yearOk(y))return show(aOut,'bad','<h4>🔵 FALTA INFORMACIÓN</h4><p>Ingresa apellidos y año válido.</p>');const au=joinAuthors(a,aLang.value,aOccurrence.value);show(aOut,'ok',`<h4>🟢 Formas orientativas</h4><p><b>Autor:</b> ${au} (${y}) ...</p><p><b>Texto:</b> ... (${au}, ${y}).</p><p class="small">Autores ingresados: ${a.length}.</p>`)};

const defs={
book:[['authors','Autor(es)','Apellido, A. A.','full'],['year','Año','2006',''],['title','Título','', 'full'],['city','Ciudad, País','', ''],['publisher','Editorial','', '']],
ebook:[['authors','Autor(es)','','full'],['year','Año','',''],['title','Título','','full'],['url','URL o DOI real','','full']],
chapter:[['authors','Autor(es) del capítulo','','full'],['year','Año','',''],['chapter','Título del capítulo','','full'],['editor','Editor del libro','',''],['book','Título del libro','','full'],['pages','Páginas','53-62',''],['city','Ciudad, País','',''],['publisher','Editorial','','']],
journal:[['authors','Autor(es)','','full'],['year','Año','',''],['article','Título del artículo','','full'],['journal','Revista','','full'],['volume','Volumen','',''],['number','Número','',''],['pages','Páginas','','']],
journalDoi:[['authors','Autor(es)','','full'],['year','Año','',''],['article','Título del artículo','','full'],['journal','Revista','','full'],['volume','Volumen','',''],['number','Número','',''],['pages','Páginas','',''],['doi','DOI real','','full']],
journalOnline:[['authors','Autor(es)','','full'],['year','Año','',''],['article','Título del artículo','','full'],['journal','Revista','','full'],['volume','Volumen','',''],['number','Número','',''],['pages','Páginas','',''],['url','URL real','','full']],
thesis:[['authors','Autor(es)','','full'],['year','Año','',''],['title','Título','','full'],['degree','Tipo de trabajo','tesis de pregrado',''],['institution','Institución','','full'],['place','Lugar','','']],
report:[['organization','Organización autora','','full'],['year','Año','',''],['title','Título del informe','','full'],['publication','Número de publicación (si existe)','',''],['url','URL real','','full']],
web:[['authors','Autor o entidad','','full'],['date','Fecha','2024 / 5 de mayo de 2024',''],['title','Título de la página','','full'],['publisher','Casa publicadora / sitio','','full'],['url','URL real','','full']],
conference:[['authors','Autor(es)','','full'],['date','Fecha','',''],['title','Título de la ponencia','','full'],['president','Responsable del evento','',''],['event','Nombre del evento','','full'],['organization','Organización','','full'],['place','Lugar','','']]
};
function renderFields(){rFields.innerHTML=defs[rType.value].map(([id,l,ph,cl])=>`<div class="${cl}"><label>${l}</label><input data-ref="${id}" placeholder="${ph}"></div>`).join('')}renderFields();rType.onchange=renderFields;
function rd(){const d={};document.querySelectorAll('[data-ref]').forEach(x=>d[x.dataset.ref]=x.value.trim());return d}
function required(type,d){const optional=new Set(['publication','number','pages']);return defs[type].filter(x=>!optional.has(x[0])).every(x=>d[x[0]])}
function buildRef(t,d){switch(t){case'book':return`${d.authors} (${d.year}). ${d.title}. ${d.city}: ${d.publisher}.`;case'ebook':return/^10\./.test(d.url)?`${d.authors} (${d.year}). ${d.title}. doi: ${d.url}`:`${d.authors} (${d.year}). ${d.title}. Recuperado de ${d.url}`;case'chapter':return`${d.authors} (${d.year}). ${d.chapter}. En ${d.editor} (Ed.), ${d.book} (pp. ${d.pages}). ${d.city}: ${d.publisher}.`;case'journal':return`${d.authors} (${d.year}). ${d.article}. ${d.journal}, ${d.volume}${d.number?`(${d.number})`:''}, ${d.pages}.`;case'journalDoi':return`${d.authors} (${d.year}). ${d.article}. ${d.journal}, ${d.volume}${d.number?`(${d.number})`:''}, ${d.pages}. doi: ${d.doi}`;case'journalOnline':return`${d.authors} (${d.year}). ${d.article}. ${d.journal}, ${d.volume}${d.number?`(${d.number})`:''}, ${d.pages}. Recuperado de ${d.url}`;case'thesis':return`${d.authors} (${d.year}). ${d.title} (${d.degree}). ${d.institution}, ${d.place}.`;case'report':return`${d.organization} (${d.year}). ${d.title}${d.publication?` (${d.publication})`:''}. Recuperado de ${d.url}`;case'web':return`${d.authors} (${d.date}). ${d.title}. ${d.publisher}. Recuperado de ${d.url}`;case'conference':return`${d.authors} (${d.date}). ${d.title}. En ${d.president} (Presidencia), ${d.event}. Evento llevado a cabo por ${d.organization}, ${d.place}.`}}
rBtn.onclick=()=>{const t=rType.value,d=rd();if(!rConfirmed.checked)return show(rOut,'warn','<h4>🟡 Fuente no confirmada</h4><p>Confirma que los datos provienen de la fuente real.</p>');if(!required(t,d))return show(rOut,'bad','<h4>🔵 FALTA INFORMACIÓN</h4><p>Completa los campos necesarios. No se inventarán datos.</p>');show(rOut,'ok',`<h4>🟢 Referencia orientativa APA 6</h4><p>${buildRef(t,d)}</p><p class="small">Aplica sangría francesa en Word y verifica todos los datos con la fuente original.</p>`)};

revBtn.onclick=()=>{const t=revText.value.trim(),type=revType.value,a=revAuthor.value.trim(),y=revYear.value.trim();if(!t)return show(revOut,'bad','<h4>🔵 FALTA INFORMACIÓN</h4><p>Pega el párrafo completo.</p>');const ck=[],ha=a?norm(t).includes(norm(a)):false,hy=yearOk(y)?t.includes(y):false,hp=/\bp{1,2}\.\s*\d+/i.test(t),hq=/[“"][^”"]+[”"]/.test(t),fp=/\b(yo|nosotros|nosotras|mi|mis|nuestro|nuestra)\b/i.test(t),badp=/\bpágs?\.|\bpags?\./i.test(t);ck.push(a?(ha?`<li class="good">Se detecta ${a}.</li>`:`<li class="badtext">No se detecta ${a}.</li>`):'<li class="warn">No indicaste apellido esperado.</li>');ck.push(yearOk(y)?(hy?`<li class="good">Se detecta ${y}.</li>`:`<li class="badtext">No se detecta ${y}.</li>`):'<li class="warn">No indicaste año válido.</li>');if(badp)ck.push('<li class="badtext">Se detecta «pág.» o «págs.». Corrige a «p.» para una página o «pp.» para varias.</li>');if(type==='direct'){ck.push(hp?'<li class="good">Se detecta página.</li>':'<li class="badtext">La cita textual requiere página.</li>');ck.push(hq?'<li class="good">Se detectan comillas; coherente si la cita es menor de 40 palabras.</li>':'<li class="warn">No se detectan comillas; solo sería correcto para bloque de 40+ palabras.</li>')}else ck.push('<li class="good">En parafraseo, la guía exige autor y año.</li>');ck.push(fp?'<li class="warn">Se detecta primera persona.</li>':'<li class="good">No se detecta primera persona.</li>');ck.push(lineAlert(t));const bad=(ck.join('').match(/badtext/g)||[]).length,warn=(ck.join('').match(/class="warn"/g)||[]).length;show(revOut,bad?'bad':warn?'warn':'ok',`<h4>${bad?'🔴 REQUIERE CORRECCIÓN':warn?'🟡 REVISAR':'🟢 CUMPLE FORMALMENTE'}</h4><ul>${ck.join('')}</ul><p class="small">Esta revisión formal no prueba por sí sola que la fuente exista ni que el contenido sea fiel al original.</p>`)};

function audit(){return`ACTÚA COMO COPILOTO ACADÉMICO ESPECIALIZADO EN APA 6 PARA PROYECTO DE GRADO.

PRIORIDAD:
1. Para presentación física aplica primero el Reglamento institucional: papel carta; Times New Roman 12 en texto principal; interlineado 1,5; máximo 10 líneas por párrafo; margen izquierdo 3,5 cm y los demás 2,5 cm; citas largas pueden usar espacio sencillo.
2. Aplica APA 6 para citas y referencias cuando el Reglamento no especifica.

CITAS TEXTUALES: distingue cuatro casos: menos de 40 basada en autor; menos de 40 basada en texto; cita larga basada en texto; cita larga basada en autor. Toda cita textual lleva autor, año y página. Usa p. para una página y pp. para varias.

PARAFRASEO: distingue basado en autor y basado en texto. No basta cambiar sinónimos; conserva la idea con estructura propia.

INTEGRIDAD: no inventes autores, años, páginas, DOI, URL, editoriales, títulos ni fuentes. Si falta un dato, indica FALTA INFORMACIÓN. Toda idea ajena debe citarse y toda cita debe corresponder con la referencia final.

PÁRRAFO:
${revText.value.trim()||'[NO INGRESADO]'}

TIPO: ${revType.value}
AUTOR: ${revAuthor.value.trim()||'[NO INDICADO]'}
AÑO: ${revYear.value.trim()||'[NO INDICADO]'}

TEXTO ORIGINAL:
${pSource.value.trim()||cmpOriginal.value.trim()||'[NO INGRESADO]'}

PARÁFRASIS:
${cmpPara.value.trim()||pcText.value.trim()||'[NO INGRESADA]'}

DATOS REALES DE LA FUENTE:
${pData.value.trim()||'[NO INGRESADOS]'}

RESPONDE CON: A) tipo de cita; B) qué está bien; C) qué falta; D) regla institucional que prevalece si hay conflicto; E) cómo corregir sin inventar; F) tipo de paráfrasis; G) frases concretas demasiado parecidas al original y cómo transformarlas sin alterar el sentido; H) dos modelos de parafraseo si se solicitan; I) control aproximado de 10 líneas; J) correspondencia cita-referencia.`}
auditBtn.onclick=async()=>{await navigator.clipboard.writeText(audit());auditStatus.textContent='Prompt de auditoría APA 6 copiado.'};
