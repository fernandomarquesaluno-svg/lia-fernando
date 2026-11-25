from pathlib import Path
import subprocess, json, textwrap, sys, importlib.metadata as md, hashlib
import numpy as np
import soundfile as sf
import torch
from scipy.signal import resample_poly
from kokoro import KPipeline

OUT=Path('saida-neural-v2')
OUT.mkdir(exist_ok=True)
VIDEO=Path('assets/videos/Retrospectiva_LIA_100FPS_2026.mp4')
SR=48000
MODEL='hexgrad/Kokoro-82M'
torch.manual_seed(42)
torch.set_num_threads(2)
p=KPipeline(lang_code='p',repo_id=MODEL,device='cpu')
print('Modelo neural carregado', flush=True)
configs={'A': {'speed':[0.96,0.94], 'pause':0.23, 'eq':1.0}, 'B': {'speed':[0.94,0.91], 'pause':0.37, 'eq':1.7}, 'C': {'speed':[0.98,0.92], 'pause':0.28, 'eq':0.8}}
sample='Como comparar pesquisas sobre inteligência artificial e saúde mental? Foi assim que nasceu o Atlas de Evidências.'
scenes=[
(0,8,['Como comparar pesquisas de inteligência artificial sobre indicadores textuais de saúde mental?']),
(8,18,['Reuni trinta e três referências, de dois mil e vinte a dois mil e vinte e seis.','Dessas, vinte e cinco são pesquisas empíricas.']),
(18,30,['A partir das sugestões do professor, criei um mapa interativo de métodos e tarefas.','E um comparador, com critérios e pesos configuráveis.']),
(30,40,['Revisei a origem dos dados, a rotulagem e as condições de acesso.','Nem todos os conjuntos estavam disponíveis.']),
(40,52,['No artigo de Kallstenius, analisei modelos individuais e combinados.','Esses resultados são dos autores do estudo.']),
(52,68,['Em seguida, estudei o DepRoBERTa.','Os pesquisadores usaram postagens do Reddit, removeram duplicatas e reorganizaram os dados.','O treino final reuniu seis mil e seis textos.']),
(68,84,['A solução combina dois modelos, pela média das probabilidades.','No teste oficial, os autores reportaram macro F um de zero vírgula quinhentos e oitenta e três.']),
(84,96,['Transformei o artigo em uma página interativa, com gráficos e um simulador da combinação dos modelos.','O portal também ganhou vídeos explicativos.']),
(96,107,['O próximo passo é tentar uma reprodução parcial, com uma referência de comparação e resultados próprios.']),
(107,115,['Assim, o levantamento tornou-se um Atlas de Evidências.','Documentar, comparar e evoluir.'])]
shorter={
0:['Como comparar pesquisas de inteligência artificial sobre saúde mental?'],
8:['Reuni trinta e três referências de 2020 a 2026.','Vinte e cinco são estudos empíricos.'],
18:['Criei um mapa de relações entre métodos e tarefas.','E um comparador com critérios e pesos.'],
30:['Revisei a origem, a rotulagem e o acesso aos dados.','Nem todos estavam disponíveis.'],
40:['Analisei modelos individuais e combinados no artigo de Kallstenius.','Os resultados são dos autores.'],
52:['O DepRoBERTa usa textos do Reddit.','Os autores removeram duplicatas e reorganizaram os dados.','O treino reuniu seis mil e seis textos.'],
68:['Os modelos combinam suas probabilidades pela média.','No teste oficial, o macro F um dos autores foi zero vírgula quinhentos e oitenta e três.'],
84:['Transformei o estudo em uma página interativa, com gráficos e um simulador.','O portal ganhou vídeos explicativos.'],
96:['O próximo passo é tentar uma reprodução parcial, com comparação e resultados próprios.'],
107:['Assim nasceu o Atlas de Evidências.','Documentar, comparar e evoluir.']}
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
report={'model':MODEL,'python':sys.version,'packages':{k:md.version(k) for k in ['kokoro','torch','misaki','soundfile','numpy','scipy','huggingface-hub','transformers']},'ffmpeg':cmd('ffmpeg','-version').stdout.splitlines()[0],'sample_text':sample,'configs':configs,'voice':VOICE,'sample_results':[],'selection':'B chosen provisionally for the full video; subjective A/B/C review pending','scenes':scenes,'seed':42,'synthesis_count':0,'status':'in progress','limitations':['No direct age, emotion or semantic emphasis control.','Maturity and expressiveness are goals, not measured perceptual outcomes.','Static gentle high-frequency EQ; no dedicated de-esser used.'],'treatment':'highpass, subtle EQ, compressor, two-pass loudness normalization, dynamic soundtrack ducking; no pitch shifting or time stretching'}
def save():
    (OUT/'relatorio_v2.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
save()
for key,cfg in configs.items():
    print('Gerando amostra',key,flush=True)
    parts=[synth(t,(VOICE,sp)) for t,sp in zip(sample_parts,cfg['speed'])]
    report['synthesis_count']+=len(parts)
    a=np.concatenate([parts[0],np.zeros(round(cfg['pause']*SR),np.float32),parts[1]])
    dst,filt,measured=export_processed(a,'amostra_'+key,cfg['eq'])
    cmd('ffmpeg','-v','error','-y','-i',dst,'-c:a','libmp3lame','-b:a','192k',OUT/('amostra_'+key+'.mp3'))
    report['sample_results'].append({'id':key,'seconds':len(a)/SR,'filter':filt,'pre_normalization':measured});save()
duration=float(cmd('ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',VIDEO).stdout)
timeline=np.zeros(round(duration*SR),np.float32)
cues=[];records=[]
# Scene-specific planned cadence and breath spacing, with conservative fit fallbacks.
cadence={0:(.93,.25),8:(.96,.30),18:(.95,.30),30:(.94,.33),40:(.92,.36),52:(.97,.23),68:(.94,.32),84:(.96,.28),96:(.93,.35),107:(.90,.40)}
for start,end,phrases in scenes:
    print('Sintetizando cena',start,end,flush=True)
    base_speed,pause=cadence[start]
    cursor=round((start+.12)*SR)
    limit=round((min(end,duration)-.08)*SR)-cursor
    chosen=None
    for variant,base,pau in [(phrases,base_speed,pause),(phrases,min(1.,base_speed+.04),.20),(shorter[start],base_speed,.25),(shorter[start],1.,.16)]:
        speeds=[min(1.,max(.90,base+(.02 if i==1 and len(variant)>2 else -.015 if i==len(variant)-1 and len(variant)>1 else 0))) for i in range(len(variant))]
        parts=[synth(t,(VOICE,sp)) for t,sp in zip(variant,speeds)]
        report['synthesis_count']+=len(parts)
        gap=round(pau*SR)
        needed=sum(map(len,parts))+gap*(len(parts)-1)
        if needed<=limit:
            chosen=(variant,speeds,pau,parts,needed);break
    if chosen is None:
        report['status']=f'failed to fit scene {start}'
        save();raise RuntimeError(report['status'])
    phrases,speeds,pause,parts,needed=chosen
    records.append({'start':start,'end':end,'voice':VOICE,'speeds':speeds,'pause_seconds':pause,'duration':needed/SR,'spoken_text':phrases})
    report['timings']=records;save()
    for t,a in zip(phrases,parts):
        stop=cursor+len(a);timeline[cursor:stop]=a
        cues.append((cursor,stop,t));cursor=stop+round(pause*SR)
dst,filt,measured=export_processed(timeline,'narracao_v2',1.7)
report['voice_filter']=filt;report['loudnorm_input']=measured;save()
cmd('ffmpeg','-v','error','-y','-i',dst,'-c:a','libmp3lame','-b:a','192k',OUT/'narracao_v2.mp3')
(OUT/'narracao_v2.srt').write_text('\n\n'.join(f'{i}\n{stamp(a)} --> {stamp(b)}\n'+'\n'.join(textwrap.wrap(t,48,break_long_words=False,break_on_hyphens=False)) for i,(a,b,t) in enumerate(cues,1))+'\n',encoding='utf-8')
final=OUT/'Retrospectiva_LIA_Neural_V2.mp4'
mix='[0:a:0]aresample=48000,volume=0.16[bed];[1:a:0]aresample=48000,asplit=2[voice][key];[bed][key]sidechaincompress=threshold=0.025:ratio=4:attack=45:release=480[ducked];[ducked][voice]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.89:latency=1[a]'
cmd('ffmpeg','-v','error','-y','-i',VIDEO,'-i',dst,'-i',OUT/'narracao_v2.srt','-filter_complex',mix,'-map','0:v:0','-map','[a]','-map','2:0','-c:v','copy','-c:a','aac','-b:a','192k','-c:s','mov_text','-metadata:s:s:0','language=por','-t',str(duration),'-movflags','+faststart',final)
cmd('ffmpeg','-v','error','-i',final,'-f','null','-')
def videohash(f):
    return cmd('ffmpeg','-v','error','-i',f,'-map','0:v:0','-c','copy','-f','hash','-hash','sha256','-').stdout.strip()
original_hash=videohash(VIDEO);final_hash=videohash(final)
assert original_hash==final_hash,'Video stream mismatch'
report['video_stream_hash']=original_hash
report['mix_filter']=mix
report['duration']=duration
report['output_probe']=json.loads(cmd('ffprobe','-v','error','-show_streams','-show_format','-of','json',final).stdout)
report['status']='generated and decoded; video stream unchanged; listening review pending'
report['sha256']={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in [VIDEO,final,dst]}
save()
print('V2 exportada e validada tecnicamente',flush=True)
