import http.client, json, tempfile, threading, unittest
from pathlib import Path
from server import ArchiveServer, safe_path

class SecurityTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.root=Path(self.temp.name)
        (self.root/'cv.pdf').write_bytes(b'%PDF-1.4 test')
        (self.root/'manifest.json').write_text(json.dumps({'candidates':[{'id':'one','name':'Test','documents':[{'id':'doc','name':'cv.pdf','path':'cv.pdf','kind':'resume'},{'id':'bad','path':'../outside.pdf','kind':'resume'}],'quarantinedDocuments':[{'name':'hidden'}]}],'quarantinedDocuments':[{'name':'secret'}]}))
        self.server=ArchiveServer(('127.0.0.1',0),self.root,'a'*32)
        self.thread=threading.Thread(target=self.server.serve_forever,daemon=True);self.thread.start()
        self.cookie=''
    def tearDown(self):
        self.server.shutdown();self.server.server_close();self.thread.join();self.temp.cleanup()
    def request(self,path,method='GET',data=None,extra=None):
        conn=http.client.HTTPConnection('127.0.0.1',self.server.server_port)
        headers={'Origin':f'http://127.0.0.1:{self.server.server_port}','Content-Type':'application/json','Cookie':self.cookie,**(extra or {})}
        conn.request(method,path,json.dumps(data) if data is not None else None,headers)
        res=conn.getresponse(); result=(res.status,dict(res.getheaders()),res.read());conn.close();return result
    def login(self):
        status,headers,_=self.request('/api/login','POST',{'code':'a'*32})
        self.assertEqual(status,200);self.cookie=headers['Set-Cookie'].split(';')[0]
        self.assertIn('HttpOnly',headers['Set-Cookie']);self.assertIn('SameSite=Strict',headers['Set-Cookie'])
    def test_portraits_require_explicit_selection_and_auth(self):
        (self.root/'photo.jpg').write_bytes(b'photo fixture')
        m=json.loads((self.root/'manifest.json').read_text())
        c=m['candidates'][0]
        c['documents'] += [{'id':'photo','name':'photo.jpg','path':'photo.jpg','kind':'portrait'},{'id':'passport','path':'photo.jpg','kind':'supporting'}]
        c['portraitDocumentId']='photo'
        (self.root/'manifest.json').write_text(json.dumps(m))
        self.assertEqual(self.request('/portraits/one/photo')[0],401)
        self.login()
        result=json.loads(self.request('/api/candidates')[2])['candidates'][0]
        self.assertEqual(result['portrait'],{'id':'photo'})
        self.assertNotIn('photo',[d['id'] for d in result['documents']])
        self.assertEqual(self.request('/portraits/one/photo')[0],200)
        self.assertEqual(self.request('/portraits/one/passport')[0],404)
        self.assertEqual(self.request('/documents/one/photo')[0],404)
        c['portraitDocumentId']='passport'
        (self.root/'manifest.json').write_text(json.dumps(m))
        self.assertEqual(self.request('/portraits/one/photo')[0],404)
        self.assertEqual(self.request('/portraits/one/passport')[0],404)
    def test_authentication_and_logout(self):
        self.assertEqual(self.request('/')[0],200)
        for p in ['/api/candidates','/documents/one/doc','/manifest.json','/../recruitment-private/access-code.txt']:
            self.assertEqual(self.request(p)[0],401)
        self.assertEqual(self.request('/api/login','POST',{'code':'wrong'})[0],401)
        self.login();self.assertEqual(self.request('/documents/one/doc')[0],200)
        self.assertEqual(self.request('/api/logout','POST',{})[0],200)
        self.assertEqual(self.request('/documents/one/doc')[0],401)
    def test_host_origin_and_expired_cookie(self):
        self.assertEqual(self.request('/',extra={'Host':'evil.example'})[0],403)
        self.assertEqual(self.request('/api/login','POST',{'code':'a'*32},{'Origin':'https://evil.example'})[0],403)
        self.login()
        for token in self.server.sessions:self.server.sessions[token]=0
        self.assertEqual(self.request('/api/candidates')[0],401)
    def test_manifest_and_traversal(self):
        self.login();status,_,body=self.request('/api/candidates');self.assertEqual(status,200)
        data=json.loads(body);self.assertNotIn('quarantinedDocuments',data)
        self.assertNotIn('quarantinedDocuments',data['candidates'][0])
        self.assertTrue(data['candidates'][0]['documents'][0]['available'])
        self.assertNotIn('path',data['candidates'][0]['documents'][0])
        self.assertFalse(data['candidates'][0]['documents'][1]['available'])
        self.assertEqual(self.request('/documents/one/bad')[0],404)
        self.assertEqual(self.request('/server.py')[0],404)
        self.assertIsNone(safe_path(self.root,'../outside.pdf'))
        self.assertIsNone(safe_path(self.root,str(self.root/'cv.pdf')))
    def test_attachment_and_preview_headers(self):
        self.login()
        for suffix,disposition in [('', 'attachment'),('?preview=1','inline')]:
            status,headers,body=self.request('/documents/one/doc'+suffix)
            self.assertEqual(status,200);self.assertTrue(headers['Content-Disposition'].startswith(disposition));self.assertEqual(headers['Cache-Control'],'no-store')
    def test_status_validation_and_authorization(self):
        self.assertEqual(self.request('/api/status','POST',{'candidateId':'one','status':'To interview'})[0],401)
        self.login()
        self.assertEqual(self.request('/api/status','POST',{'candidateId':'one','status':'To interview'},{'Origin':'https://evil.example'})[0],403)
        for status in ['auto-rejected', None, ['New']]:
            self.assertEqual(self.request('/api/status','POST',{'candidateId':'one','status':status})[0],400)
        self.assertEqual(self.request('/api/status','POST',{'candidateId':'missing','status':'New'})[0],404)
        self.assertFalse((self.root/'review-state.json').exists())
    def test_status_persistence_and_import_independence(self):
        self.login()
        manifest=(self.root/'manifest.json').read_bytes()
        data=json.loads(self.request('/api/candidates')[2])
        self.assertEqual(data['candidates'][0]['status'],'New')
        self.assertEqual(self.request('/api/status','POST',{'candidateId':'one','status':'To interview'})[0],200)
        self.assertEqual((self.root/'manifest.json').read_bytes(),manifest)
        self.assertEqual(json.loads((self.root/'review-state.json').read_text())['one']['status'],'To interview')
        # A new import and server restart must preserve the separately stored review.
        (self.root/'manifest.json').write_text(json.dumps({'candidates':[{'id':'one','name':'Updated','documents':[],'visaReview':{'status':'needs_review','reason':'Check document','evidence':['Recruiter email']}}]}))
        self.server.shutdown();self.server.server_close();self.thread.join()
        self.server=ArchiveServer(('127.0.0.1',0),self.root,'a'*32)
        self.thread=threading.Thread(target=self.server.serve_forever,daemon=True);self.thread.start()
        self.cookie='';self.login()
        candidate=json.loads(self.request('/api/candidates')[2])['candidates'][0]
        self.assertEqual(candidate['status'],'To interview')
        self.assertEqual(candidate['visaReview']['status'],'needs_review')
        self.assertEqual(self.request('/review-state.json')[0],404)
    def test_corrupt_state_is_not_overwritten(self):
        self.login();(self.root/'review-state.json').write_text('broken')
        self.assertEqual(self.request('/api/status','POST',{'candidateId':'one','status':'New'})[0],503)
        self.assertEqual((self.root/'review-state.json').read_text(),'broken')
    def binary_request(self,path,body,headers=None):
        conn=http.client.HTTPConnection('127.0.0.1',self.server.server_port)
        conn.request('POST',path,body,{'Origin':f'http://127.0.0.1:{self.server.server_port}','Cookie':self.cookie,'Content-Type':'video/mp4',**(headers or {})})
        res=conn.getresponse();result=(res.status,dict(res.getheaders()),res.read());conn.close();return result
    def test_resume_only_enforced(self):
        self.login()
        data=json.loads((self.root/'manifest.json').read_text())
        data['candidates'][0]['documents'] += [{'id':'passport','kind':'supporting','path':'cv.pdf','name':'passport.pdf'},{'id':'unknown','path':'cv.pdf','name':'CV.pdf'}]
        (self.root/'manifest.json').write_text(json.dumps(data))
        public=json.loads(self.request('/api/candidates')[2])
        self.assertEqual(len(public['candidates'][0]['documents']),2)
        self.assertEqual(self.request('/documents/one/passport')[0],404)
        self.assertEqual(self.request('/documents/one/unknown')[0],404)
    def test_review_dates_notes_and_history(self):
        self.login()
        (self.root/'review-state.json').write_text(json.dumps({'one':{'custom':'preserve','status':'Interview'}}))
        before=json.loads(self.request('/api/candidates')[2])['candidates'][0]
        self.assertEqual(before['status'],'To interview')
        self.assertFalse(before['statusHistory'])
        payload={'candidateId':'one','status':'Offer','notes':'Team note','interviewAt':'2026-11-01T09:30:00+08:00'}
        self.assertEqual(self.request('/api/review','POST',payload)[0],200)
        state=json.loads((self.root/'review-state.json').read_text())['one']
        self.assertEqual(state['custom'],'preserve');self.assertEqual(state['notes'],'Team note')
        self.assertTrue(state['decisionAt']);self.assertEqual(len(state['statusHistory']),1)
        self.assertEqual(state['statusHistory'][0]['from'],'To interview')
        payload['decisionAt']='2026-11-02T15:00:00+08:00'
        self.assertEqual(self.request('/api/review','POST',payload)[0],200)
        state=json.loads((self.root/'review-state.json').read_text())['one']
        self.assertEqual(len(state['statusHistory']),1);self.assertEqual(state['decisionAt'],payload['decisionAt'])
        for bad in ['2026-11-01T09:30','not a date','2026-99-01T09:00:00+08:00']:
            payload['interviewAt']=bad;self.assertEqual(self.request('/api/review','POST',payload)[0],400)
    def test_video_upload_and_range(self):
        body=b'\x00\x00\x00\x20ftypisom'+b'0'*100
        path='/api/video?candidateId=one&name=intro.mp4'
        self.assertEqual(self.binary_request(path,body)[0],405)
        self.login()
        self.assertEqual(self.binary_request(path,body)[0],405)
        self.assertFalse((self.root/'review-state.json').exists())
        (self.root/'intro.mp4').write_bytes(body)
        video={'id':'local-video','path':'intro.mp4','name':'intro.mp4','contentType':'video/mp4','size':len(body)}
        (self.root/'review-state.json').write_text(json.dumps({'one':{'video':video}}))
        url='/videos/one/'+video['id']
        self.assertEqual(self.request(url)[2],body)
        for requested,want in [('bytes=0-3',body[:4]),('bytes=12-',body[12:]),('bytes=-5',body[-5:]),('bytes=100-999',body[100:])]:
            status,headers,chunk=self.request(url,extra={'Range':requested});self.assertEqual(status,206);self.assertEqual(chunk,want);self.assertIn('Content-Range',headers)
        for requested in ['bytes=999-','bytes=5-3','bytes=-0','bytes=0-1,3-4','bytes=-']:
            self.assertEqual(self.request(url,extra={'Range':requested})[0],416)
        saved_cookie=self.cookie;self.cookie='';self.assertEqual(self.request(url)[0],401);self.cookie=saved_cookie
    def test_rejection_reason_round_trip(self):
        self.login()
        reason={'en':'Insufficient experience','zh':'Experience requirement'}
        payload={'candidateId':'one','status':'Rejected','rejectionReason':reason}
        self.assertEqual(self.request('/api/review','POST',payload)[0],200)
        candidate=json.loads(self.request('/api/candidates')[2])['candidates'][0]
        self.assertEqual(candidate['rejectionReason'],reason)
        payload['rejectionReason']={'en':'x'*501}
        self.assertEqual(self.request('/api/review','POST',payload)[0],400)
    def test_jim_scope(self):
        from server import JIM_RECRUITER
        import hashlib
        self.server.jim_access_hash=hashlib.sha256(('b'*32).encode()).digest()
        m=json.loads((self.root/'manifest.json').read_text())
        m['candidates'][0]['recruiter']=JIM_RECRUITER
        m['candidates'].append({'id':'other','name':'Other','recruiter':'Barry','documents':[{'id':'cv','path':'cv.pdf','kind':'resume'}]})
        (self.root/'manifest.json').write_text(json.dumps(m))
        (self.root/'review-state.json').write_text(json.dumps({'one':{'status':'Rejected','notes':'private','rejectionReason':{'en':'private'},'statusHistory':[]}}))
        status,headers,_=self.request('/api/jim/login','POST',{'code':'b'*32})
        self.assertEqual(status,200)
        self.cookie=headers['Set-Cookie'].split(';')[0]
        candidates=json.loads(self.request('/api/candidates')[2])['candidates']
        self.assertEqual([c['id'] for c in candidates],['one'])
        for field in ['notes','statusHistory','visaReview']:
            self.assertNotIn(field,candidates[0])
        self.assertEqual(candidates[0]['rejectionReason'],{'en':'private'})
        self.assertEqual(self.request('/documents/other/cv')[0],404)
        self.assertEqual(self.request('/documents/one/doc')[0],200)
        self.assertEqual(self.request('/api/review','POST',{'candidateId':'one','status':'Hired'})[0],403)

    def test_not_qualified_persists_with_reason(self):
        self.login()
        payload={'candidateId':'one','status':'Not qualified','rejectionReason':{'en':'Insufficient post-graduation experience'}}
        self.assertEqual(self.request('/api/review','POST',payload)[0],200)
        candidate=json.loads(self.request('/api/candidates')[2])['candidates'][0]
        self.assertEqual(candidate['status'],'Not qualified')
        self.assertEqual(candidate['rejectionReason'],payload['rejectionReason'])
        self.assertTrue(candidate['decisionAt'])

    def test_rate_limit(self):
        for _ in range(10):self.request('/api/login','POST',{'code':'wrong'})
        self.assertEqual(self.request('/api/login','POST',{'code':'wrong'})[0],429)

if __name__=='__main__':unittest.main()
