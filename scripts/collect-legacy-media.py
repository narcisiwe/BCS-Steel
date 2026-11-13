#!/usr/bin/env python3
"""Inventory public BCS legacy media without transcoding, upscaling or publishing.
Standard library + existing Pillow, optional existing ffprobe. No installs.
"""
import concurrent.futures as pool
import hashlib, html, io, json, re, subprocess, time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit, unquote
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parents[1]
SITE={'bcslasercut.eu','www.bcslasercut.eu'}
MEDIA_HOSTS=SITE|{'cdn-ru.bitrix24.ru','lipsia24.bitrix24.ru','img.youtube.com','i.ytimg.com'}
IMAGE=re.compile(r'\.(?:jpe?g|png|webp|avif|gif)(?:[?#]|$)',re.I)
VIDEO=re.compile(r'\.(?:mp4|webm|mov|m4v|m3u8|mpd)(?:[?#]|$)',re.I)
CODE=re.compile(r'\.(?:css|js)(?:[?#]|$)',re.I)
YOUTUBE=re.compile(r'(?:youtube\.com/(?:embed/|watch\?v=)|youtu\.be/)([\w-]{11})')

def normalize(url):
 s=urlsplit(html.unescape(url).replace('\\/','/'));return urlunsplit((s.scheme,s.netloc,s.path,s.query,''))

def fetch(url):
 try:
  with urlopen(Request(url,headers={'User-Agent':'BCS-Steel-media-inventory/1.0'}),timeout=12) as r:
   if urlsplit(r.url).hostname not in MEDIA_HOSTS:raise ValueError('Additional redirect host: '+r.url)
   return {'url':url,'final_url':r.url,'mime':r.headers.get_content_type(),'data':r.read()}
 except Exception as e:return {'url':url,'error':str(e)}

def strings(text):
 text=html.unescape(text).replace('\\/','/')
 return re.findall(r'url\(\s*[\'"]?([^\)\'"\s]+)',text)+re.findall(r'''["']([^"'<>\s]+\.(?:jpe?g|png|webp|avif|gif|mp4|webm|mov|m4v|m3u8|mpd|css|js)(?:\?[^"'<>\s]*)?)["']''',text,re.I)

class Parser(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.links=[];self.pairs=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs);variants=[]
  for key,value in attrs:
   if not value:continue
   if key in {'src','href','poster','data-src','data-original','data-full','data-lazy-src','data-background','data-bg','data-source','data-preview'}:
    self.refs.append(value)
    if IMAGE.search(value):variants.append(value)
   if key in {'srcset','data-srcset'}:
    values=[x.strip().split()[0]for x in value.split(',')if x.strip()];self.refs+=values;variants+=values
   if key=='style':self.refs+=strings(value)
  if tag=='a' and d.get('href'):self.links.append(d['href'])
  if variants:self.pairs.append(variants)

def main():
 for directory in ['equipment','projects','videos']:(ROOT/'public/media'/directory).mkdir(parents=True,exist_ok=True)
 pages={};codes={};media={};failures=[];external=set();videos={};pending=['https://bcslasercut.eu/','https://bcslasercut.eu/LV/','https://bcslasercut.eu/RU/','https://bcslasercut.eu/DE/','https://bcslasercut.eu/robots.txt','https://bcslasercut.eu/sitemap.xml'];seen=set();pairs=[]
 def discover(url,parent):
  url=normalize(urljoin(parent,url));s=urlsplit(url)
  if s.scheme not in {'https','http'} or any(c.isspace() for c in url):return
  for ident in YOUTUBE.findall(url):videos[ident]={'url':'https://www.youtube.com/watch?v='+ident,'found_on':parent,'status':'embedded YouTube; stream URL not yet resolved; no file downloaded'}
  if IMAGE.search(url) or VIDEO.search(url):
   # Ignore CMS UI decorations; preserve production photographs and video previews.
   if '/bitrix/'in s.path and '/landing/'not in s.path:return
   media.setdefault(url,{'url':url,'found_on':set()})['found_on'].add(parent)
  elif CODE.search(url):
   if s.hostname in SITE or (s.hostname in MEDIA_HOSTS and '/landing/assets/' in s.path):codes.setdefault(url,parent)
   else:external.add(url)
 def parse_page(result):
  url=result['url']
  if 'error'in result:failures.append({'url':url,'reason':result['error']});return
  text=result['data'].decode('utf-8',errors='replace')
  if 'html'in result['mime']:
   pages[url]={'title':re.findall(r'<title>(.*?)</title>',text,re.S),'lang':re.findall(r'<html[^>]*lang=[\'"]([^\'"]+)',text),'sha256':hashlib.sha256(result['data']).hexdigest()}
   p=Parser();p.feed(text)
   for ref in p.refs+strings(text):discover(ref,result['final_url'])
   pairs.extend([[normalize(urljoin(url,v))for v in group]for group in p.pairs])
   for ref in p.links:
    link=normalize(urljoin(url,ref));s=urlsplit(link)
    if s.hostname in SITE and s.scheme in {'https','http'} and not re.search(r'\.[a-z0-9]{2,6}$',s.path,re.I) and '/pub/'not in s.path and '/preview/'not in s.path:pending.append(link)
   for ident in YOUTUBE.findall(text.replace('\\/','/')):videos[ident]={'url':'https://www.youtube.com/watch?v='+ident,'found_on':url,'status':'embedded YouTube; stream URL not yet resolved; no file downloaded'}
  else:
   for ref in re.findall(r'<loc>(.*?)</loc>|^Sitemap:\s*(\S+)',text,re.M):pending.append(next(x for x in ref if x))
 with pool.ThreadPoolExecutor(max_workers=4) as workers:
  while pending and len(seen)<40:
   batch=[]
   for url in pending:
    if url not in seen and urlsplit(url).hostname in SITE:seen.add(url);batch.append(url)
   pending=[]
   if not batch:break
   for result in workers.map(fetch,batch):parse_page(result)
  print('Pages read:',len(pages),'code references:',len(codes),'media references:',len(media),flush=True)
  # Read every same-site CSS/JS document linked by the HTML, then nested imports.
  scanned=set()
  for depth in range(3):
   batch=[u for u in codes if u not in scanned];scanned.update(batch)
   if not batch:break
   for result in workers.map(fetch,batch):
    if 'error'in result:failures.append({'url':result['url'],'reason':result['error']});continue
    text=result['data'].decode('utf-8',errors='replace')
    for ref in strings(text):discover(ref,result['final_url'])
    for ident in YOUTUBE.findall(text.replace('\\/','/')):videos.setdefault(ident,{'url':'https://www.youtube.com/watch?v='+ident,'found_on':result['url'],'status':'embedded YouTube; stream URL not yet resolved; no file downloaded'})
  print('Code documents checked:',len(scanned),'media candidates:',len(media),flush=True)
  allowed=[u for u in media if urlsplit(u).hostname in MEDIA_HOSTS]
  for u in media:
   if u not in allowed:media[u]['status']='additional host requires access';external.add(u)
  for result in workers.map(fetch,allowed):
   record=media[result['url']]
   if 'error'in result:record['status']='download blocked/failed';record['reason']=result['error'];continue
   data=result['data'];record.update({k:result[k]for k in ['final_url','mime']});record['bytes']=len(data);record['sha256']=hashlib.sha256(data).hexdigest()
   if IMAGE.search(record['url']):
    try:
     from PIL import Image
     with Image.open(io.BytesIO(data))as im:record['width'],record['height']=im.size;im.verify()
    except Exception as e:record['status']='invalid image';record['reason']=str(e);continue
   elif not result['mime'].startswith('video/'):
    record['status']='stream manifest or non-video response; needs review';continue
   record['_data']=data;record['status']='candidate downloaded'
 # Select largest accessible variant from each explicit img/srcset group.
 for group in pairs:
  available=[media[u]for u in group if u in media and '_data'in media[u]]
  if len(available)<2:continue
  best=max(available,key=lambda r:(r.get('width',0)*r.get('height',0),r['bytes']))
  for record in available:
   if record is not best and record.get('width',0)*record.get('height',0)<=best.get('width',0)*best.get('height',0):
    record['status']='smaller linked variant omitted';record['preferred_url']=best['url']
 # Fold repeated Bitrix timestamp filenames only when a strictly larger image exists.
 groups={}
 for r in media.values():
  name=Path(urlsplit(r['url']).path).name
  key=re.sub(r'(?:_[12]x)+(?=\.)','',name)
  if '_data'in r and r['status']=='candidate downloaded':groups.setdefault(key,[]).append(r)
 for group in groups.values():
  best=max(group,key=lambda r:(r.get('width',0)*r.get('height',0),r['bytes']))
  for r in group:
   if r is not best and r.get('width',0)*r.get('height',0)<best.get('width',0)*best.get('height',0):r['status']='smaller linked variant omitted';r['preferred_url']=best['url']
 hashes={}
 for r in media.values():
  if '_data'not in r:continue
  if r['status']!='candidate downloaded':del r['_data'];continue
  if r['sha256']in hashes:r['status']='exact duplicate omitted';r['saved_as']=hashes[r['sha256']];del r['_data'];continue
  video=r['mime'].startswith('video/')
  category='videos'if video else 'projects'
  # Gallery photos are provisionally projects; visually classify equipment below.
  name=re.sub(r'[^\w.() -]','_',unquote(Path(urlsplit(r.get('final_url',r['url'])).path).name))or r['sha256'][:16]
  if not video and (re.search(r'logo|snowflake|^marta\.|^pixel\.', name, re.I) or max(r.get('width',0),r.get('height',0))<200):
   r.pop('_data');r['status']='decorative/logo/tracking image omitted from production selection';continue
  classification=json.loads((ROOT/'scripts/legacy-media-classification.json').read_text())
  category=classification.get(name,category)
  dest=ROOT/'public/media'/category/name
  if dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest()!=r['sha256']:dest=dest.with_name(dest.stem+'-'+r['sha256'][:8]+dest.suffix)
  dest.write_bytes(r.pop('_data'));r['saved_as']=str(dest.relative_to(ROOT));r['status']='saved unchanged bytes';hashes[r['sha256']]=r['saved_as']
  if video:
   try:r['video']=json.loads(subprocess.run(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height:format=duration,bit_rate','-of','json',str(dest)],capture_output=True,text=True,check=True).stdout)
   except Exception as e:r['probe_error']=str(e)
 records=[]
 for r in media.values():r['found_on']=sorted(r['found_on']);records.append(r)
 manifest={'checked_at':datetime.now(timezone.utc).isoformat(),'pages':pages,'code_documents_checked':sorted(scanned),'resources':records,'videos':list(videos.values()),'failures':failures,'external_code_or_hosts':sorted(external),'page_limit_reached':bool(pending)}
 (ROOT/'public/media/media-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 render_inventory(manifest)
 print('Saved files:',len(hashes),'YouTube references:',len(videos),'failed media:',sum(r.get('status')=='download blocked/failed' for r in records),flush=True)

def render_inventory(m):
 lines=['# MEDIA_INVENTORY','',f"Проверено UTC: {m['checked_at']}",'','Источник: https://bcslasercut.eu/','',f"Прочитано HTML-страниц: {len(m['pages'])}; проверено CSS/JS: {len(m['code_documents_checked'])}; найдено медиа-URL: {len(m['resources'])}.",'','## Метод и ограничения','',
 'Проверены HTML, lazy data-src, srcset/data-srcset, picture/source, background-image/url(), ссылки CSS/JS, robots.txt, sitemap и внутренние языковые ссылки. Корень старого сайта — английская версия; LV/RU/DE обнаружены по ссылкам и sitemap. Дополнительная DE также включена.',
 '', 'Сохраняются неизменённые байты наибольших реально доступных связанных вариантов; абсолютные оригиналы камеры, не опубликованные на сайте, подтвердить невозможно. Увеличение изображений и перекодирование видео не выполняются. Точные дубликаты определяются SHA-256. Меньшие связанные варианты остаются в списке, но не в подборке. Категории требуют визуальной проверки перед использованием.',
 '', 'Сайт и страницы не заменяют изображения автоматически. Публикация не выполнялась. Если ресурс заблокирован, его URL и причина указаны ниже. Прямые URL потоков YouTube нельзя выдумать: нужен доступный проигрыватель/экстрактор.',
 '', '## Страницы','']
 for u,p in m['pages'].items():lines.append(f"- {u} — {'; '.join(p['title'])}")
 lines+=['','## Медиа','', '| Файл / предпочтительный вариант | Разрешение | Байты | Статус | Исходный URL |','|---|---|---:|---|---|']
 for r in m['resources']:
  size=f"{r['width']} × {r['height']}"if 'width'in r else 'не получено'
  lines.append(f"| {r.get('saved_as',r.get('preferred_url','—'))} | {size} | {r.get('bytes','—')} | {r['status']}: {r.get('reason','')} | {r['url']} |")
 lines+=['','## Видео','']
 for v in m['videos']:lines.append(f"- {v['url']} — {v['status']}; страница: {v['found_on']}")
 lines+=['','## Недоступные страницы и CSS/JS','']+[f"- {f['url']} — {f['reason']}" for f in m['failures']]
 lines+=['','## Внешние ссылки CSS/JS и дополнительные хосты','']+[f'- {u}'for u in m['external_code_or_hosts']]
 lines+=['','## Повторное извлечение','', '`python3 scripts/collect-legacy-media.py`','', 'Нужен доступ к доменам старого сайта, cdn-ru.bitrix24.ru и lipsia24.bitrix24.ru. Ошибка CONNECT 403 означает блокировку сетевым прокси до получения ресурса, а не отказ самого сайта. YouTube-видео требует отдельного разрешённого инструмента для проверки максимального качества.']
 (ROOT/'MEDIA_INVENTORY.md').write_text('\n'.join(lines)+'\n')
if __name__=='__main__':main()
