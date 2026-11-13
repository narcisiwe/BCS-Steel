import hashlib
import json
import re
import subprocess
import unittest
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self):super().__init__();self.elements=[];self.duplicates=[]
    def handle_starttag(self,tag,attrs):
        keys=[k for k,v in attrs]
        self.duplicates.extend(k for k in keys if keys.count(k)>1)
        self.elements.append((tag,dict(attrs)))

def snapshot():
    return {str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [ROOT/'index.html',ROOT/'ru/index.html',ROOT/'en/index.html',ROOT/'sitemap.xml']}

class SiteChecks(unittest.TestCase):
    def test_generated_pages_are_repeatable(self):
        before=snapshot()
        subprocess.run(['node','scripts/build-locales.mjs'],cwd=ROOT,check=True,capture_output=True)
        self.assertEqual(before,snapshot(),'Generated pages drift on a repeated build')
    def test_all_local_pages_and_assets(self):
        for lang in ['lv','ru','en']:
            page=ROOT/('index.html' if lang=='lv' else f'{lang}/index.html')
            doc=Document();text=page.read_text();doc.feed(text)
            with self.subTest(lang=lang):
                self.assertFalse(doc.duplicates)
                self.assertIn(f'<html lang="{lang}">',text)
                ids=[a['id'] for _,a in doc.elements if 'id'in a];self.assertEqual(len(ids),len(set(ids)))
                self.assertEqual(sum(1 for t,a in doc.elements if t=='h1'),1)
                for tag,attrs in doc.elements:
                    for attr in ['src','href']:
                        value=attrs.get(attr,'')
                        if value.startswith('#'):self.assertIn(value[1:],ids)
                        elif value and not re.match(r'[a-z]+:',value):self.assertTrue((page.parent/value).exists(),value)
                    if tag=='img':
                        for key in ['alt','width','height']:self.assertIn(key,attrs)
                    for candidate in attrs.get('srcset','').split(','):
                        if candidate.strip():self.assertTrue((page.parent/candidate.strip().split()[0]).is_file())
                self.assertTrue(any(t=='link' and a.get('rel')=='canonical' for t,a in doc.elements))
                self.assertEqual({a['hreflang'] for t,a in doc.elements if t=='link' and 'hreflang'in a},{'lv','ru','en','x-default'})
    def test_js_syntax(self):
        for file in ['js/config.js','js/script.js','js/motion.js','scripts/build-locales.mjs']:
            subprocess.run(['node','--check',file],cwd=ROOT,check=True,capture_output=True)
    def test_imported_original_hashes_and_unique_files(self):
        manifest=json.loads((ROOT/'public/media/media-manifest.json').read_text())
        saved=[r for r in manifest['resources'] if r['status']=='saved unchanged bytes']
        self.assertGreater(len(saved),0)
        hashes=[]
        for record in saved:
            file=ROOT/record['saved_as']
            with self.subTest(file=str(file)):
                self.assertEqual(file.stat().st_size,record['bytes'])
                self.assertEqual(hashlib.sha256(file.read_bytes()).hexdigest(),record['sha256'])
                self.assertTrue(record['url'].startswith('https://'))
                self.assertGreater(record['width'],0);self.assertGreater(record['height'],0)
                hashes.append(record['sha256'])
        self.assertEqual(len(hashes),len(set(hashes)))
    def test_sitemap(self):
        tree=ET.parse(ROOT/'sitemap.xml');locs=[e.text for e in tree.iter() if e.tag.endswith('loc')]
        self.assertEqual(locs,['https://narcisiwe.github.io/BCS-Steel/','https://narcisiwe.github.io/BCS-Steel/ru/','https://narcisiwe.github.io/BCS-Steel/en/'])
    def test_imported_media_are_not_wired_into_pages(self):
        for f in ['index.html','ru/index.html','en/index.html','css/styles.css','js/script.js']:
            self.assertNotIn('public/media/',(ROOT/f).read_text())
if __name__=='__main__':unittest.main()
