from html.parser import HTMLParser
from pathlib import Path
import re
root=Path(__file__).parent/'public'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.ids=[];self.h1=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='img':assert 'alt' in a
  for key in ('src','href'):
   if key in a:self.refs.append(a[key])
p=Page();p.feed((root/'index.html').read_text())
assert p.h1==1 and len(p.ids)==len(set(p.ids))
for ref in p.refs+re.findall(r"url\(['\"]?([^)'\"]+)",(root/'style.css').read_text()):
 if ref.startswith('#'):assert ref[1:] in p.ids,ref
 elif not ref.startswith(('http:','https:','data:')):assert (root/ref).is_file(),ref
for stem in re.findall(r"(?:main|accent):'([^']+)'",(root/'app.js').read_text()):assert (root/'assets'/f'{stem}.webp').is_file()
print('PASS: local links, images, fonts, anchors, unique IDs, heading and collection assets')
