"""Private local recruitment archive: Python 3.10+, no dependencies."""
import argparse, hashlib, hmac, json, mimetypes, secrets, threading, time, os, tempfile
from datetime import datetime
import re
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit, parse_qs
HERE = Path(__file__).resolve().parent
STATUSES = ('New', 'To interview', 'Interviewed', 'Offer', 'Hired', 'On hold', 'Rejected')
LEGACY = {'Reviewing':'New', 'Interview':'To interview', 'Offered':'Offer'}
JIM_RECRUITER = 'Jim Althans \u00b7 Gold Star'
MAX_VIDEO = 250 * 1024 * 1024
def status_value(value): return LEGACY.get(value, value) if value in STATUSES or value in LEGACY else 'New'
def resume(doc): return doc.get('kind') == 'resume'
def now_iso(): return time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
def valid_date(value):
    if value in ('', None): return True
    if not isinstance(value,str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})',value): return False
    try: return datetime.fromisoformat(value.replace('Z','+00:00')).tzinfo is not None
    except ValueError: return False

def safe_path(root, relative):
    rel = Path(relative)
    if rel.is_absolute() or '..' in rel.parts: return None
    current = root
    for part in rel.parts:
        current = current / part
        if current.is_symlink(): return None
    try:
        current.resolve().relative_to(root.resolve())
        return current if current.is_file() else None
    except (OSError, ValueError): return None

class ArchiveServer(ThreadingHTTPServer):
    daemon_threads = True
    def __init__(self, address, data_root, code, jim_code=None):
        self.data_root = data_root.resolve()
        self.access_hash = hashlib.sha256(code.encode()).digest()
        self.jim_access_hash = hashlib.sha256(jim_code.encode()).digest() if jim_code else None
        self.session_scopes = {}
        self.sessions, self.attempts, self.lock = {}, [], threading.Lock()
        super().__init__(address, Handler)

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args): pass
    def reply(self, status, body=b'', mime='text/plain; charset=utf-8', headers=None):
        if isinstance(body, str): body = body.encode()
        self.send_response(status)
        for key,value in {'Content-Type':mime,'Content-Length':str(len(body)),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'SAMEORIGIN','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; frame-src 'self'; media-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'",**(headers or {})}.items(): self.send_header(key,value)
        self.end_headers()
        self.wfile.write(body)
    def valid_host(self):
        return self.headers.get('Host') in (f'127.0.0.1:{self.server.server_port}', f'localhost:{self.server.server_port}')
    def session(self):
        try: token = SimpleCookie(self.headers.get('Cookie',''))['recruitment_session'].value
        except (KeyError, ValueError): return None
        with self.server.lock: expiry = self.server.sessions.get(token,0)
        return token if expiry > time.time() else None
    def scope(self):
        token=self.session()
        if not token: return None
        with self.server.lock: return self.server.session_scopes.get(token)
    def can_view(self, candidate):
        return self.scope()=='staff' or (self.scope()=='jim' and candidate.get('recruiter')==JIM_RECRUITER and candidate.get('source')!='direct')
    def can_view_id(self, candidate_id):
        return any(str(c.get('id'))==candidate_id and self.can_view(c) for c in self.manifest().get('candidates',[]))
    def manifest(self):
        path = safe_path(self.server.data_root,'manifest.json')
        return json.loads(path.read_text(encoding='utf-8-sig')) if path else {'candidates':[],'notes':['No applications imported yet.']}
    def review_state(self):
        path = self.server.data_root / 'review-state.json'
        if path.is_symlink(): raise ValueError('Invalid review state path')
        if not path.exists(): return {}
        state = json.loads(path.read_text(encoding='utf-8-sig'))
        if not isinstance(state, dict): raise ValueError('Invalid review state')
        return state
    def save_review_state(self, state):
        target = self.server.data_root / 'review-state.json'
        if target.is_symlink(): raise ValueError('Invalid review state path')
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=self.server.data_root, prefix='.review-', suffix='.tmp', delete=False) as f:
                temporary = Path(f.name)
                json.dump(state, f, indent=2)
                f.flush()
                os.fsync(f.fileno())
            os.replace(temporary, target)
        finally:
            if temporary and temporary.exists(): temporary.unlink()
    def do_GET(self):
        if not self.valid_host(): return self.reply(403,'Invalid host')
        url=urlsplit(self.path)
        assets={'/jim':('index.html','text/html; charset=utf-8'),'/jim/':('index.html','text/html; charset=utf-8'),'/':('index.html','text/html; charset=utf-8'),'/app.js':('app.js','text/javascript; charset=utf-8'),'/style.css':('style.css','text/css; charset=utf-8')}
        if url.path in assets:
            name,mime=assets[url.path]
            return self.reply(200,(HERE/name).read_bytes(),mime)
        brand_assets={'/brand.css':(HERE.parent/'css/style.css','text/css; charset=utf-8'),'/fonts/dm-sans-regular.ttf':(HERE.parent/'css/fonts/dm-sans-regular.ttf','font/ttf'),'/fonts/dm-sans-bold.ttf':(HERE.parent/'css/fonts/dm-sans-bold.ttf','font/ttf'),'/logo.png':(HERE.parent/'images/logo.png','image/png')}
        if url.path in brand_assets:
            path,mime=brand_assets[url.path]
            body='\n'.join(path.read_text(encoding='utf-8').splitlines()[:3]).encode() if url.path=='/brand.css' else path.read_bytes()
            return self.reply(200,body,mime)
        if not self.session(): return self.reply(401,'Please sign in')
        if url.path in ('/api/candidates','/api/jim/candidates'):
            try:
                manifest=self.manifest()
                with self.server.lock: reviews=self.review_state()
                jim_view=self.scope()=='jim' or url.path=='/api/jim/candidates'
                data={'importedAt':manifest.get('importedAt'), 'candidates':[], 'readOnly':jim_view, 'scope':'jim' if jim_view else 'staff'}
                for source in manifest.get('candidates',[]):
                    if not self.can_view(source) or (jim_view and (source.get('recruiter')!=JIM_RECRUITER or source.get('source')=='direct')): continue
                    candidate={key:source.get(key) for key in ('id','name','recruiter','profile','visaReview')}
                    if source.get('source')=='direct': candidate['recruiter']='Direct applicant'
                    dates=[e.get('receivedAt') for e in source.get('emails',[]) if e.get('receivedAt')]
                    candidate['receivedAt']=min(dates) if dates else None
                    review=reviews.get(str(source.get('id')), {})
                    if not isinstance(review,dict): review={}
                    candidate['status']=status_value(review.get('status','New'))
                    for key in ('interviewAt','decisionAt','notes','statusHistory','rejectionReason'): candidate[key]=review.get(key)
                    candidate['documents']=[]
                    portrait=next((d for d in source.get('documents',[]) if d.get('kind')=='portrait' and d.get('id')==source.get('portraitDocumentId')),None)
                    if portrait and safe_path(self.server.data_root,portrait.get('path','')):
                        candidate['portrait']={'id':portrait['id']}
                    for doc in source.get('documents',[]):
                        if not resume(doc): continue
                        public={key:doc.get(key) for key in ('id','name','contentType','receivedAt','size','kind')}
                        public['available']=bool(safe_path(self.server.data_root,doc.get('path','')))
                        candidate['documents'].append(public)
                    allowed={str(d['id']) for d in candidate['documents']}
                    def scrub_evidence(value):
                        if isinstance(value,dict):
                            if 'sourceDocumentId' in value and str(value.get('sourceDocumentId')) not in allowed:
                                value.pop('sourceDocumentId',None);value.pop('sourceText',None)
                            for child in list(value.values()): scrub_evidence(child)
                        elif isinstance(value,list):
                            for child in value: scrub_evidence(child)
                    scrub_evidence(candidate.get('profile'))
                    if jim_view:
                        for key in ('notes','statusHistory','visaReview'): candidate.pop(key,None)
                        def remove_internal_evidence(value):
                            if isinstance(value,dict):
                                for key in ('sourceText','sourceDocumentId','sourceEmailId','sourceUrl'): value.pop(key,None)
                                for child in value.values(): remove_internal_evidence(child)
                            elif isinstance(value,list):
                                for child in value: remove_internal_evidence(child)
                        remove_internal_evidence(candidate.get('profile'))
                    video=review.get('video')
                    if isinstance(video,dict) and safe_path(self.server.data_root,video.get('path','')):
                        candidate['video']={key:video.get(key) for key in ('id','name','contentType','size')}
                    data['candidates'].append(candidate)
                return self.reply(200,json.dumps(data),'application/json')
            except (OSError, ValueError): return self.reply(503,'Import updating. Try again shortly.')
        if url.path.startswith('/videos/'):
            parts=url.path.split('/')
            if len(parts)!=4: return self.reply(404)
            try:
                if not self.can_view_id(parts[2]): return self.reply(404)
                with self.server.lock: video=self.review_state().get(parts[2],{}).get('video',{})
                if video.get('id')!=parts[3]: return self.reply(404)
                path=safe_path(self.server.data_root,video.get('path',''))
                if not path: return self.reply(404)
                return self.stream_video(path,video,parse_qs(url.query).get('download')==['1'])
            except (OSError,ValueError): return self.reply(404)
        if url.path.startswith('/portraits/'):
            parts=url.path.split('/')
            if len(parts)!=4: return self.reply(404)
            try:
                if not self.can_view_id(parts[2]): return self.reply(404)
                doc=next(d for c in self.manifest().get('candidates',[]) if str(c.get('id'))==parts[2] and self.can_view(c) for d in c.get('documents',[]) if str(d.get('id'))==parts[3] and d.get('kind')=='portrait' and c.get('portraitDocumentId')==d.get('id'))
                path=safe_path(self.server.data_root,doc.get('path',''))
                if not path: return self.reply(404)
                mime=mimetypes.guess_type(path.name)[0]
                if mime not in ('image/jpeg','image/png','image/webp'): return self.reply(404)
                return self.reply(200,path.read_bytes(),mime)
            except (StopIteration,OSError,ValueError): return self.reply(404)
        if url.path.startswith('/documents/'):
            parts=url.path.split('/')
            if len(parts)!=4: return self.reply(404)
            try:
                if not self.can_view_id(parts[2]): return self.reply(404)
                doc=next(d for c in self.manifest().get('candidates',[]) if str(c.get('id'))==parts[2] and self.can_view(c) for d in c.get('documents',[]) if str(d.get('id'))==parts[3] and resume(d))
            except (StopIteration,OSError,ValueError): return self.reply(404,'Document not found')
            path=safe_path(self.server.data_root,doc.get('path',''))
            if not path: return self.reply(404,'Document has not been downloaded')
            mime=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
            inline=mime in ('application/pdf','image/jpeg','image/png','image/gif','image/webp') and parse_qs(url.query).get('preview')==['1']
            disposition='inline' if inline else 'attachment'
            return self.reply(200,path.read_bytes(),mime,{'Content-Disposition':f"{disposition}; filename*=UTF-8''{quote(path.name,safe='')}"})
        self.reply(404,'Not found')
    def do_POST(self):
        if not self.valid_host() or self.headers.get('Origin')!='http://'+self.headers.get('Host',''): return self.reply(403,'Invalid origin')
        if self.session() and self.scope()!='staff' and self.path!='/api/logout': return self.reply(403,'Read-only recruiter access')
        if urlsplit(self.path).path=='/api/video': return self.reply(405,'Website uploads are disabled',headers={'Allow':'GET'})
        if self.headers.get('Content-Type','').split(';')[0]!='application/json': return self.reply(415)
        try:
            length=int(self.headers.get('Content-Length','0'))
            if not 1<=length<=65536: return self.reply(413)
            data=json.loads(self.rfile.read(length))
            if not isinstance(data,dict): return self.reply(400)
        except (ValueError,OSError): return self.reply(400)
        if self.path in ('/api/login','/api/jim/login'):
            now=time.time()
            with self.server.lock:
                self.server.attempts=[t for t in self.server.attempts if t>now-60]
                if len(self.server.attempts)>=10: return self.reply(429,'Too many attempts. Wait one minute.')
                self.server.attempts.append(now)
            code=data.get('code','')
            scope='jim' if self.path=='/api/jim/login' else 'staff'
            expected=self.server.jim_access_hash if scope=='jim' else self.server.access_hash
            if not expected or not isinstance(code,str) or not hmac.compare_digest(hashlib.sha256(code.encode()).digest(),expected): return self.reply(401,'Incorrect access code')
            token=secrets.token_urlsafe(32)
            with self.server.lock:
                self.server.sessions={k:v for k,v in self.server.sessions.items() if v>now}
                self.server.session_scopes={k:v for k,v in self.server.session_scopes.items() if k in self.server.sessions}
                self.server.sessions[token]=now+28800
                self.server.session_scopes[token]=scope
            return self.reply(200,'{}','application/json',{'Set-Cookie':f'recruitment_session={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800'})
        if self.path in ('/api/status','/api/review'):
            if not self.session(): return self.reply(401, 'Please sign in')
            candidate_id, status = data.get('candidateId'), data.get('status')
            if not isinstance(candidate_id, str) or not isinstance(status, str) or status not in STATUSES:
                return self.reply(400, 'Choose a valid candidate and status')
            if any(key in data and not valid_date(data[key]) for key in ('interviewAt','decisionAt')): return self.reply(400,'Invalid date')
            if 'rejectionReason' in data and (not isinstance(data['rejectionReason'],dict) or any(k not in ('en','zh') or not isinstance(v,str) or len(v)>500 for k,v in data['rejectionReason'].items())): return self.reply(400,'Invalid rejection reason')
            if 'notes' in data and (not isinstance(data['notes'],str) or len(data['notes'])>10000): return self.reply(400,'Invalid notes')
            try:
                if not any(str(c.get('id')) == candidate_id for c in self.manifest().get('candidates', [])):
                    return self.reply(404, 'Candidate not found')
                with self.server.lock:
                    state=self.review_state()
                    review=state.get(candidate_id,{})
                    if not isinstance(review,dict): raise ValueError('Invalid review')
                    previous=status_value(review.get('status','New'))
                    stamp=now_iso()
                    if previous!=status:
                        review.setdefault('statusHistory',[]).append({'from':previous,'to':status,'at':stamp})
                        if status in ('Offer','Hired','Rejected') and 'decisionAt' not in data: review['decisionAt']=stamp
                    review.update({'status':status,'updatedAt':stamp})
                    for key in ('interviewAt','decisionAt','notes','rejectionReason'):
                        if key in data: review[key]=data[key] or None
                    state[candidate_id]=review
                    self.save_review_state(state)
                return self.reply(200, json.dumps(state[candidate_id]), 'application/json')
            except (OSError, ValueError): return self.reply(503, 'Could not save status. Please retry.')
        if self.path=='/api/logout':
            token=self.session()
            with self.server.lock:
                self.server.sessions.pop(token,None)
                self.server.session_scopes.pop(token,None)
            return self.reply(200,'{}','application/json',{'Set-Cookie':'recruitment_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'})
        self.reply(404)
    def stream_video(self,path,video,download=False):
        size=path.stat().st_size;start=0;end=size-1;status=200
        requested=self.headers.get('Range')
        if requested:
            match=re.fullmatch(r'bytes=(\d*)-(\d*)',requested)
            if not match or not any(match.groups()): return self.reply(416,headers={'Content-Range':f'bytes */{size}'})
            left,right=match.groups()
            if left:
                start=int(left);end=min(int(right),size-1) if right else size-1
            else:
                count=int(right)
                if count==0: return self.reply(416,headers={'Content-Range':f'bytes */{size}'})
                start=max(0,size-count)
            if start>=size or end<start: return self.reply(416,headers={'Content-Range':f'bytes */{size}'})
            status=206
        self.send_response(status)
        headers={'Content-Type':video['contentType'],'Content-Length':str(end-start+1),'Accept-Ranges':'bytes','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Disposition':("attachment" if download else "inline")+"; filename*=UTF-8''"+quote(video['name'],safe='')}
        if status==206: headers['Content-Range']=f'bytes {start}-{end}/{size}'
        for key,value in headers.items(): self.send_header(key,value)
        self.end_headers()
        with path.open('rb') as file:
            file.seek(start);remaining=end-start+1
            while remaining:
                chunk=file.read(min(65536,remaining))
                if not chunk: break
                self.wfile.write(chunk);remaining-=len(chunk)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir',type=Path,default=HERE.parent/'recruitment-private')
    parser.add_argument('--port',type=int,default=8765)
    args=parser.parse_args()
    args.data_dir.mkdir(parents=True,exist_ok=True)
    secret=args.data_dir/'access-code.txt'
    if secret.is_symlink(): raise SystemExit('Access code must not be a symlink')
    if not secret.exists():
        with secret.open('x',encoding='utf-8') as f: f.write(secrets.token_urlsafe(24)+'\n')
        secret.chmod(0o600)
    code=secret.read_text(encoding='utf-8').strip()
    if len(code)<24: raise SystemExit('Access code must be at least 24 characters')
    jim_secret=args.data_dir/'jim-access-code.txt'
    if jim_secret.is_symlink(): raise SystemExit('Jim access code must not be a symlink')
    if not jim_secret.exists():
        with jim_secret.open('x',encoding='utf-8') as f: f.write(secrets.token_urlsafe(24)+'\n')
        jim_secret.chmod(0o600)
    jim_code=jim_secret.read_text(encoding='utf-8').strip()
    if len(jim_code)<24 or hmac.compare_digest(jim_code,code): raise SystemExit('Jim access code must be distinct and at least 24 characters')
    server=ArchiveServer(('127.0.0.1',args.port),args.data_dir,code,jim_code)
    print(f'Local recruitment viewer: http://127.0.0.1:{server.server_port}',flush=True)
    print('Read recruitment-private/access-code.txt locally for your access code.',flush=True)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()
if __name__=='__main__': main()
