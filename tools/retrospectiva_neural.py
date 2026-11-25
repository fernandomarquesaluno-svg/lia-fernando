from pathlib import Path
import subprocess, json, textwrap, sys, importlib.metadata as md, hashlib
import numpy as np
import soundfile as sf
import torch
from scipy.signal import resample_poly
from kokoro import KPipeline

OUT=Path('saida-neural')
OUT.mkdir(exist_ok=True)
VIDEO=Path('assets/videos/Retrospectiva_LIA_100FPS_2026.mp4')
SR=48000
MODEL='hexgrad/Kokoro-82M'
torch.manual_seed(42)
torch.set_num_threads(2)
p=KPipeline(lang_code='p',repo_id=MODEL,device='cpu')
configs={'A':('pm_alex',1.0),'B':('pm_alex',0.95),'C':('pm_santa',1.0)}
sample='Como comparar pesquisas sobre inteligência artificial e saúde mental? Foi assim que nasceu o Atlas de Evidências.'
scenes=[
(0,8,['Como comparar pesquisas de inteligência artificial sobre indicadores textuais de saúde mental?']),
(8,18,['Reuni trinta e três referências, de dois mil e vinte a dois mil e vinte e seis.','Vinte e cinco são pesquisas empíricas.']),
(18,30,['Com as sugestões do professor, criei um mapa de métodos e tarefas.','E um comparador com critérios e pesos configuráveis.']),
(30,40,['Revisei a origem dos dados, a rotulagem e as condições de acesso.','Nem todos os conjuntos de dados estavam disponíveis.']),
(40,52,['No artigo de Kallstenius, analisei modelos individuais e combinados.','Os resultados são dos autores do estudo.']),
(52,68,['Em seguida, estudei o DepRoBERTa.','Os pesquisadores usaram postagens do Reddit, removeram duplicatas e reorganizaram os dados.','O treino final reuniu seis mil e seis textos.']),
(68,84,['A solução combina dois modelos pela média das probabilidades.','No teste oficial, os autores reportaram macro F um de zero vírgula quinhentos e oitenta e três.']),
(84,96,['Transformei o artigo em uma página interativa, com gráficos e um simulador da combinação dos modelos.','O portal recebeu vídeos explicativos.']),
(96,107,['O próximo passo científico é tentar uma reprodução parcial, com uma referência de comparação e resultados próprios.']),
(107,115,['Assim, o levantamento tornou-se um Atlas de Evidências.','Documentar, comparar e evoluir.'])]
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
report={'model':MODEL,'python':sys.version,'packages':{k:md.version(k) for k in ['kokoro','torch','misaki','soundfile','numpy','scipy','huggingface-hub']},'ffmpeg':cmd('ffmpeg','-version').stdout.splitlines()[0],'sample_text':sample,'configs':configs,'sample_results':[],'selection':'B provisional; no subjective listening review performed','scenes':scenes,'seed':42,'synthesis_count':0,'status':'in progress'}
def save():
    (OUT/'relatorio.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
save()
for key,cfg in configs.items():
    a=synth(sample,cfg);report['synthesis_count']+=1
    sf.write(OUT/f'amostra_{key}.wav',a,SR,subtype='PCM_24')
    report['sample_results'].append({'id':key,'seconds':len(a)/SR});save()
duration=float(cmd('ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',VIDEO).stdout)
timeline=np.zeros(round(duration*SR),np.float32)
cues=[];records=[]
for start,end,phrases in scenes:
    chosen=configs['B']
    parts=[synth(t,chosen) for t in phrases];report['synthesis_count']+=len(parts)
    cursor=round((start+.1)*SR)
    needed=sum(map(len,parts))+round(.13*SR)*(len(parts)-1)
    # If the slower delivery does not fit, use natural 1.0x. No post-synthesis stretching.
    if cursor+needed>round((min(end,duration)-.06)*SR):
        chosen=configs['A']
        parts=[synth(t,chosen) for t in phrases];report['synthesis_count']+=len(parts)
        needed=sum(map(len,parts))+round(.13*SR)*(len(parts)-1)
    records.append({'start':start,'end':end,'voice':chosen[0],'speed':chosen[1],'duration':needed/SR})
    report['timings']=records;save()
    if cursor+needed>round((min(end,duration)-.06)*SR):
        raise RuntimeError(f'Scene {start} exceeds window; no truncated or stretched audio')
    for t,a in zip(phrases,parts):
        stop=cursor+len(a);timeline[cursor:stop]=a
        cues.append((cursor,stop,t));cursor=stop+round(.13*SR)
sf.write(OUT/'raw.wav',timeline,SR,subtype='PCM_24')
report['loudnorm_input']=norm(OUT/'raw.wav',OUT/'narracao_neural.wav')
cmd('ffmpeg','-v','error','-y','-i',OUT/'narracao_neural.wav','-c:a','libmp3lame','-b:a','192k',OUT/'narracao_neural.mp3')
(OUT/'narracao_neural.srt').write_text('\n\n'.join(f'{i}\n{stamp(a)} --> {stamp(b)}\n'+'\n'.join(textwrap.wrap(t,48,break_long_words=False,break_on_hyphens=False)) for i,(a,b,t) in enumerate(cues,1))+'\n',encoding='utf-8')
final=OUT/'Retrospectiva_LIA_Neural.mp4'
cmd('ffmpeg','-v','error','-y','-i',VIDEO,'-i',OUT/'narracao_neural.wav','-i',OUT/'narracao_neural.srt','-filter_complex','[0:a:0]volume=0.08[bed];[1:a:0]aresample=48000[voice];[bed][voice]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.89:latency=1[a]','-map','0:v:0','-map','[a]','-map','2:0','-c:v','copy','-c:a','aac','-b:a','192k','-c:s','mov_text','-metadata:s:s:0','language=por','-t',str(duration),'-movflags','+faststart',final)
cmd('ffmpeg','-v','error','-i',final,'-f','null','-')
report['duration']=duration;report['status']='generated and decoded; listening review pending';report['sha256']={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in [VIDEO,final,OUT/'narracao_neural.wav']};save()
(OUT/'raw.wav').unlink()
