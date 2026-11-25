from pathlib import Path
import subprocess, json, textwrap, sys, importlib.metadata as md, hashlib
import numpy as np
import soundfile as sf
import torch
from scipy.signal import resample_poly
from kokoro import KPipeline

OUT=Path('saida-video-curto')
OUT.mkdir(exist_ok=True)
VIDEO=Path('assets/videos/Retrospectiva_LIA_100FPS_2026.mp4')
SR=48000
MODEL='hexgrad/Kokoro-82M'
torch.manual_seed(42)
torch.set_num_threads(2)
p=KPipeline(lang_code='p',repo_id=MODEL,device='cpu')
print('Modelo neural carregado', flush=True)
def cmd(*args):
    return subprocess.run([str(x) for x in args],check=True,capture_output=True,text=True)
def synth(text,cfg):
    voice,speed=cfg
    chunks=[]
    for _,_,a in p(text,voice=voice,speed=speed):
        if a is not None:
            chunks.append(a.detach().cpu().numpy() if hasattr(a,'detach') else np.asarray(a))
    if not chunks: raise RuntimeError('Sem áudio: '+text)
    a=resample_poly(np.concatenate(chunks).astype(np.float32),2,1)
    if not np.isfinite(a).all() or np.max(np.abs(a))<1e-5: raise RuntimeError('Áudio inválido')
    n=min(240,len(a)//2)
    if n:
        a[:n]*=np.linspace(0,1,n); a[-n:]*=np.linspace(1,0,n)
    return a
def stamp(samples):
    ms=round(samples*1000/SR)
    h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'
def norm(src,dst):
    filt='loudnorm=I=-16:TP=-2:LRA=7'
    r=cmd('ffmpeg','-hide_banner','-i',src,'-af',filt+':print_format=json','-f','null','-')
    x=json.loads(r.stderr[r.stderr.rfind('{'):r.stderr.rfind('}')+1])
    measured=':'.join(f'{k}={x[v]}' for k,v in [('measured_I','input_i'),('measured_TP','input_tp'),('measured_LRA','input_lra'),('measured_thresh','input_thresh'),('offset','target_offset')])
    cmd('ffmpeg','-v','error','-y','-i',src,'-af',filt+':'+measured+':linear=true,aresample=48000','-c:a','pcm_s24le',dst)
    return x
# No direct age or emotion parameter is available in Kokoro. The timbre is retained.
VOICE='pm_alex'
sample_parts=['Como comparar pesquisas sobre inteligência artificial e saúde mental?','Foi assim que nasceu o Atlas de Evidências.']
def polish(src,dst,eq):
    # Gentle tonal shaping, dynamic control, no pitch shifting.
    filt=f'highpass=f=72,equalizer=f=170:t=q:w=0.85:g={eq},equalizer=f=320:t=q:w=1.1:g=-0.8,equalizer=f=6600:t=q:w=1.4:g=-1.5,acompressor=threshold=0.12:ratio=1.7:attack=18:release=160:knee=2.8:makeup=1'
    cmd('ffmpeg','-v','error','-y','-i',src,'-af',filt,'-ar','48000','-c:a','pcm_s24le',dst)
    return filt
def export_processed(audio,stem,eq):
    raw=OUT/(stem+'_raw.wav'); shaped=OUT/(stem+'_shaped.wav'); dst=OUT/(stem+'.wav')
    sf.write(raw,audio,SR,subtype='PCM_24')
    filt=polish(raw,shaped,eq)
    measured=norm(shaped,dst)
    raw.unlink();shaped.unlink()
    return dst,filt,measured

import http.server, threading, functools, shutil, tempfile, math, os
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
W,H,FPS=1920,1080,30
DURATION=54
scenes=[
(0,8,'01 / LEVANTAMENTO','Da literatura ao Atlas',['O projeto começou com pesquisas sobre inteligência artificial e indicadores textuais de saúde mental.'],['Tudo começou com pesquisas sobre inteligência artificial e saúde mental.'],.94),
(8,17,'02 / EVIDÊNCIAS','33 estudos catalogados',['Com trinta e três trabalhos catalogados, surgiu a necessidade de organizar e relacionar essas evidências.'],['Trinta e três estudos passaram a compor uma base estruturada de evidências.'],.95),
(17,27,'03 / EXPLORAÇÃO','Métodos, tarefas e fichas',['O Atlas ganhou um mapa de relações entre métodos e tarefas, e fichas padronizadas para explorar os estudos.'],['Criei um mapa de métodos e tarefas, com fichas padronizadas dos estudos.'],.96),
(27,37,'04 / COMPARAÇÃO','Critérios e pesos configuráveis',['A comparação tornou-se interativa, com critérios e pesos ajustáveis conforme o objetivo de cada análise.'],['Agora é possível comparar estudos, ajustando critérios e pesos para cada análise.'],.94),
(37,46,'05 / APROFUNDAMENTO','Por dentro do DepRoBERTa',['O estudo do DepRoBERTa ganhou uma página com sua metodologia, arquitetura e resultados publicados pelos autores.'],['O DepRoBERTa ganhou uma página com metodologia, simulador e resultados dos autores.'],.97),
(46,54,'06 / RESULTADO','Atlas de Evidências',['O levantamento tornou-se um ambiente interativo de exploração e comparação científica.'],['Do levantamento, nasceu um ambiente de exploração e comparação científica.'],.92)
]
report={'model':MODEL,'voice':VOICE,'library_versions':{k:md.version(k) for k in ['kokoro','misaki','torch','transformers','huggingface-hub','playwright','pillow','numpy','scipy','soundfile']},'ffmpeg':cmd('ffmpeg','-version').stdout.splitlines()[0],'duration':DURATION,'video_resolution':[W,H],'fps':FPS,'synthesis_count':0,'scenes':[],'status':'in progress','scope':'Existing Atlas functionality only. No reproduction or own experimental outcomes claimed.','audio_direction':'Kokoro V2; speed per scene, subtle EQ, compression, loudness normalization; no pitch shift.'}
def save():
    (OUT/'relatorio_video_curto.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
save()
timeline=np.zeros(DURATION*SR,np.float32)
cues=[]
for start,end,label,title,phrases,short,speed in scenes:
    print('Narrando',label,flush=True)
    cursor=round((start+.28)*SR)
    limit=round((end-.38)*SR)-cursor
    for text,sp in [(phrases[0],speed),(phrases[0],1.0),(short[0],speed),(short[0],1.0)]:
        a=synth(text,(VOICE,sp));report['synthesis_count']+=1
        if len(a)<=limit: break
    else: raise RuntimeError('Cena não cabe: '+label)
    timeline[cursor:cursor+len(a)]=a
    cues.append((cursor,cursor+len(a),text))
    report['scenes'].append({'scene':label,'start':start,'end':end,'speech':text,'speed':sp,'speech_seconds':len(a)/SR})
    save()
dst,filt,measured=export_processed(timeline,'narracao_video_curto',1.7)
report['voice_filter']=filt;report['loudnorm_input']=measured
cmd('ffmpeg','-v','error','-y','-i',dst,'-c:a','libmp3lame','-b:a','192k',OUT/'narracao_video_curto.mp3')
srt=OUT/'legendas_video_curto.srt'
srt.write_text('\n\n'.join(f'{i}\n{stamp(a)} --> {stamp(b)}\n'+'\n'.join(textwrap.wrap(t,52,break_long_words=False,break_on_hyphens=False)) for i,(a,b,t) in enumerate(cues,1))+'\n',encoding='utf-8')
save()
# Serve the checked-out site; capture the actual interactions, not a fabricated UI.
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(Path.cwd())))
threading.Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:'+str(server.server_address[1])
work=Path(tempfile.mkdtemp(prefix='atlas-video-'))
captures=[]
def shot(page,scene,sub,anchor=None):
    if anchor:
        page.locator(anchor).first.evaluate("(el)=>el.scrollIntoView({block:'start',behavior:'instant'})")
    page.wait_for_timeout(450)
    png=work/f'capture_{scene}_{len(captures)}.png'
    page.screenshot(path=str(png),animations='disabled')
    captures.append({'scene':scene,'subtitle':sub,'path':str(png),'url':page.url.replace(url,'')})
def go(page,path):
    page.goto(url+path,wait_until='domcontentloaded')
    page.wait_for_timeout(800)
    page.evaluate("document.fonts.ready")
    page.add_style_tag(content='html { scroll-behavior: auto !important; }')
atlas='/atividades/atlas/index.html'
with sync_playwright() as p:
    exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chromium-browser')
    browser=p.chromium.launch(executable_path=exe,headless=True,args=['--no-sandbox','--disable-dev-shm-usage']) if exe else p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1600,'height':820},device_scale_factor=1)
    go(page,'/atividades/levantamento/index.html')
    shot(page,0,'Ponto de partida: levantamento bibliográfico')
    go(page,'/atividades/atlas/matriz-cientifica-33.html')
    shot(page,0,'Organização das referências','h1')
    go(page,atlas)
    page.wait_for_function("document.querySelector('#studyCards') && !document.querySelector('#studyCards .loading')")
    shot(page,8,'Base científica: 33 referências')
    shot(page,8,'Resultados e distribuição dos estudos','#resultados')
    shot(page,17,'Mapa real de relações','#conexoes')
    page.locator('#query').fill('DepRoBERTa')
    page.wait_for_timeout(500)
    shot(page,17,'Busca e ficha científica: DepRoBERTa','#estudos')
    page.locator('#clearFilters').click()
    page.locator('#rankTransformers').click()
    shot(page,27,'Perfil de critérios: transformadores','#weightedLab')
    slider=page.locator('#rankCriteria input[type=range]').first
    slider.evaluate("(el)=>{el.value='5';el.dispatchEvent(new Event('input',{bubbles:true}));}")
    shot(page,27,'Peso alterado e ranking recalculado','#weightedLab')
    page.locator('#comparePresets button').first.click()
    shot(page,27,'Comparação lado a lado','#lado-a-lado')
    go(page,'/atividades/deproberta/index.html')
    shot(page,37,'Etapas da solução descrita no artigo','#metodo')
    page.locator('#blend').evaluate("(el)=>{el.value='70';el.dispatchEvent(new Event('input',{bubbles:true}));}")
    shot(page,37,'Simulador ilustrativo da combinação','#ensemble')
    go(page,atlas)
    shot(page,46,'Atlas de Evidências: portal consolidado')
    shot(page,46,'Exploração e comparação científica','#conexoes')
    browser.close()
server.shutdown()
report['captures']=[{k:v for k,v in c.items() if k!='path'} for c in captures];save()
# Build a clean widescreen presentation of actual page captures.
fontroot=Path('/usr/share/fonts/truetype/dejavu')
def font(size,bold=False):return ImageFont.truetype(str(fontroot/('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')),size)
f24=font(24); f25b=font(25,True); f42=font(42,True);f27=font(27)
def frame(c,scene_idx,title,idx,total):
    im=Image.new('RGB',(W,H),'#0d1623');d=ImageDraw.Draw(im)
    d.rectangle((0,0,1920,8),fill='#42bfb7')
    d.text((70,35),'ATLAS DE EVIDÊNCIAS  /  EVOLUÇÃO DO PROJETO',font=f25b,fill='#83cfc8')
    d.text((70,77),title,font=f42,fill='#f3f6fa')
    d.text((1845,44),f'{scene_idx+1:02d} / 06',font=f24,fill='#aebed0',anchor='ra')
    src=Image.open(c['path']).convert('RGB')
    src.thumbnail((1780,830),Image.Resampling.LANCZOS)
    x=(W-src.width)//2;y=145
    d.rounded_rectangle((x-4,y-4,x+src.width+4,y+src.height+4),radius=9,fill='#3a4b60')
    im.paste(src,(x,y))
    d.text((70,1070-38),c['subtitle'],font=f27,fill='#e4edf5')
    d.text((1845,1070-38),'LIAA • UNIPAMPA',font=f24,fill='#aebed0',anchor='ra')
    d.rectangle((70,1015,1850,1019),fill='#314259')
    d.rectangle((70,1015,70+int(1780*(idx+1)/total),1019),fill='#42bfb7')
    return im
segments=[];idx=0
for si,(start,end,label,title,_,__,___) in enumerate(scenes):
    group=[c for c in captures if c['scene']==start]
    frames=(end-start)*FPS
    lengths=[frames//len(group)]*len(group);lengths[-1]+=frames-sum(lengths)
    for c,n in zip(group,lengths):
        still=work/f'frame_{idx:02d}.png';frame(c,si,title,idx,len(captures)).save(still)
        out=work/f'shot_{idx:02d}.mp4'
        # Subtle editorial camera motion on real captured UI; no replacement of content.
        vf=f"scale=3840:2160,zoompan=z='1+0.016*on/{max(n-1,1)}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d={n}:s=1920x1080:fps=30,format=yuv420p"
        cmd('ffmpeg','-v','error','-y','-threads','2','-i',still,'-vf',vf,'-frames:v',str(n),'-an','-c:v','libx264','-preset','ultrafast','-crf','21','-threads','2',out)
        segments.append(out);idx+=1
concat=work/'concat.txt'
concat.write_text(''.join("file '"+str(x)+"'\n" for x in segments))
silent=work/'silent.mp4'
cmd('ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',concat,'-c','copy',silent)
final=OUT/'Atlas_Evolucao_Video_Curto.mp4'
mix='[1:a:0]aresample=48000,volume=0.11,afade=t=out:st=52:d=2[bed];[2:a:0]aresample=48000,asplit=2[voice][key];[bed][key]sidechaincompress=threshold=0.025:ratio=4:attack=45:release=480[ducked];[ducked][voice]amix=inputs=2:duration=shortest:normalize=0,alimiter=limit=0.89:latency=1[a]'
# Burn legible captions, also provide SRT independently. Preserve original soundtrack as quiet bed.
vf="subtitles="+str(srt)+":force_style='FontName=DejaVu Sans,FontSize=17,PrimaryColour=&H00FFFFFF,OutlineColour=&H00101922,BorderStyle=3,Outline=5,Shadow=0,Alignment=2,MarginV=40'"
cmd('ffmpeg','-v','error','-y','-i',silent,'-i',VIDEO,'-i',dst,'-filter_complex','[0:v]'+vf+'[v];'+mix,'-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','20','-threads','2','-c:a','aac','-b:a','192k','-t',str(DURATION),'-movflags','+faststart',final)
cmd('ffmpeg','-v','error','-i',final,'-f','null','-')
report['probe']=json.loads(cmd('ffprobe','-v','error','-show_streams','-show_format','-of','json',final).stdout)
report['status']='generated and decoded; perceptual review pending'
report['sha256']={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in [final,dst,srt]}
save()
shutil.copy(work/'frame_00.png',OUT/'capa.png')
print('Vídeo curto exportado',flush=True)
