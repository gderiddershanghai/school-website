"""Export encrypted read-only snapshots. Secrets stay in recruitment-private."""
import base64, copy, hashlib, json, os, secrets, shutil, sys
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
ROOT=Path(__file__).resolve().parents[1]
PRIVATE=ROOT/'recruitment-private'
OUT=ROOT/'recruitment'
sys.path.insert(0,str(ROOT/'recruitment-viewer'))
from server import safe_path, status_value, JIM_RECRUITER

def encode(data): return base64.urlsafe_b64encode(data).decode().rstrip('=')
def decode(data): return base64.urlsafe_b64decode(data+'='*((-len(data))%4))
def scrub(value):
    if isinstance(value,dict):
        for key in ('sourceText','sourceDocumentId','sourceEmailId','sourceUrl'): value.pop(key,None)
        for item in value.values(): scrub(item)
    elif isinstance(value,list):
        for item in value: scrub(item)

def build():
    manifest=json.loads((PRIVATE/'manifest.json').read_text(encoding='utf-8-sig'))
    reviews=json.loads((PRIVATE/'review-state.json').read_text(encoding='utf-8-sig'))
    keyfile=PRIVATE/'publish-keys.json'
    keys=json.loads(keyfile.read_text()) if keyfile.exists() else {role:encode(secrets.token_bytes(32)) for role in ('staff','jim')}
    if not keyfile.exists(): keyfile.write_text(json.dumps(keys));keyfile.chmod(0o600)
    OUT.mkdir(exist_ok=True)
    for role in ('staff','jim'):
        folder=OUT/role;folder.mkdir(exist_ok=True)
        files={};candidates=[]
        def asset(doc):
            path=safe_path(PRIVATE,doc.get('path',''))
            if not path: raise ValueError('Missing or unsafe attachment: '+str(doc.get('id')))
            raw=path.read_bytes()
            if doc.get('sha256') and hashlib.sha256(raw).hexdigest()!=doc['sha256']: raise ValueError('Attachment checksum mismatch')
            key=secrets.token_hex(16)
            files[key]={'contentType':doc.get('contentType','application/octet-stream'),'data':base64.b64encode(raw).decode()}
            return key
        for source in manifest['candidates']:
            if role=='jim' and (source.get('recruiter')!=JIM_RECRUITER or source.get('source')=='direct'): continue
            c=copy.deepcopy({k:source.get(k) for k in ('id','name','recruiter','profile')});scrub(c['profile'])
            if source.get('source')=='direct': c['recruiter']='Direct applicant'
            dates=[e['receivedAt'] for e in source.get('emails',[]) if e.get('receivedAt')];c['receivedAt']=min(dates) if dates else None
            review=reviews.get(c['id'],{});c['status']=status_value(review.get('status','New'))
            for k in ('interviewAt','decisionAt','rejectionReason'): c[k]=review.get(k)
            if role=='staff':
                for k in ('notes',): c[k]=review.get(k)
            c['documents']=[]
            for d in source.get('documents',[]):
                if d.get('kind')=='resume': c['documents'].append({'id':d['id'],'name':d['name'],'available':True,'asset':asset(d)})
                if d.get('kind')=='portrait' and d['id']==source.get('portraitDocumentId'): c['portrait']={'asset':asset(d)}
            if review.get('video'):
                v=review['video'];c['video']={'name':v['name'],'asset':asset(v)}
            candidates.append(c)
        payload=json.dumps({'candidates':candidates,'files':files,'readOnly':True,'scope':role,'updatedAt':manifest.get('importedAt')},ensure_ascii=False).encode()
        nonce=secrets.token_bytes(12);key=decode(keys[role]);encrypted=nonce+AESGCM(key).encrypt(nonce,payload,('flying-recruitment-v1:'+role).encode())
        if len(encrypted)>90*1024*1024: raise ValueError('Snapshot exceeds 90 MiB; split video assets before publishing')
        assert AESGCM(key).decrypt(encrypted[:12],encrypted[12:],('flying-recruitment-v1:'+role).encode())==payload
        try: AESGCM(decode(keys['jim' if role=='staff' else 'staff'])).decrypt(encrypted[:12],encrypted[12:],('flying-recruitment-v1:'+role).encode())
        except Exception: pass
        else: raise AssertionError('Role isolation failed')
        (folder/'snapshot.bin').write_bytes(encrypted)
        html=(ROOT/'recruitment-viewer/index.html').read_text(encoding='utf-8').replace('href="/brand.css"','href="../brand.css"').replace('href="/style.css"','href="../style.css"').replace('src="/app.js"','src="../app.js"').replace('src="/logo.png"','src="../logo.png"').replace('href="/"','href="./"')
        html=html.replace('<title>','<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'self\'; style-src \'self\'; font-src \'self\'; img-src \'self\' blob:; media-src blob:; connect-src \'self\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'"><title>',1)
        (folder/'index.html').write_text(html,encoding='utf-8')
        print(role+': '+str(len(candidates))+' candidates; '+str(len(files))+' encrypted files')
    css=(ROOT/'css/style.css').read_text(encoding='utf-8').splitlines()
    (OUT/'brand.css').write_text('\n'.join(css[:3]),encoding='utf-8')
    shutil.copyfile(ROOT/'recruitment-viewer/style.css',OUT/'style.css');shutil.copyfile(ROOT/'images/logo.png',OUT/'logo.png')
    (OUT/'fonts').mkdir(exist_ok=True)
    for name in ('dm-sans-regular.ttf','dm-sans-bold.ttf'): shutil.copyfile(ROOT/'css/fonts'/name,OUT/'fonts'/name)
    js=(ROOT/'recruitment-viewer/app.js').read_text(encoding='utf-8');js=js[:js.index("$('language').onclick=")]
    js=js.replace("/^\\/jim\\/?$/","/\\/jim\\/?$/")
    js=js.replace("$('recruiter').closest('label').hidden=readOnly()","$('recruiter').closest('label').hidden=jimPage")
    js += (ROOT/'recruitment-viewer/encrypted-client.js').read_text(encoding='utf-8')
    (OUT/'app.js').write_text(js,encoding='utf-8')
    links={r:'https://flyingenglish-shanghai.com/recruitment/'+r+'/#'+keys[r] for r in keys}
    (PRIVATE/'invitation-links.json').write_text(json.dumps(links,indent=2));(PRIVATE/'invitation-links.json').chmod(0o600)
    # Fail closed on accidental plaintext files or secret inclusion in public output.
    allowed={'index.html','app.js','style.css','brand.css','logo.png','snapshot.bin','dm-sans-regular.ttf','dm-sans-bold.ttf'}
    for p in OUT.rglob('*'):
        if p.is_file():
            assert p.name in allowed, 'Unexpected public artifact'
            if p.suffix in ('.html','.js','.css'):
                raw=p.read_bytes()
                for key in keys.values(): assert key.encode() not in raw
                for c in manifest['candidates']: assert c['name'].encode() not in raw
    print('Encryption round trips, role isolation and public artifact checks passed. Links saved privately.')
if __name__=='__main__':build()
