"""Uses preinstalled Python Playwright/Chromium. Never sends real enquiries."""
import functools, os, threading, unittest
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
class BrowserChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.url=f'http://127.0.0.1:{cls.server.server_port}/'
        cls.p=sync_playwright().start()
        cls.browser=cls.p.chromium.launch(executable_path=os.environ.get('BCS_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox'])
    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.p.stop();cls.server.shutdown();cls.server.server_close();cls.thread.join()
    def setUp(self):
        self.context=self.browser.new_context(viewport={'width':1440,'height':900})
        self.page=self.context.new_page();self.errors=[];self.page.on('pageerror',lambda e:self.errors.append(str(e)))
        if os.environ.get('BCS_ALLOW_FONTS') != '1':self.page.route('https://fonts.googleapis.com/**',lambda r:r.abort())
    def tearDown(self):
        self.context.close();self.assertEqual(self.errors,[])
    def test_layout_all_languages_and_slides(self):
        self.page.goto(self.url,wait_until='networkidle');self.page.evaluate('userPaused=true;updatePlayback()')
        for width in [320,375,390,720,768,1024,1050,1051,1200,1201,1440]:
            self.page.set_viewport_size({'width':width,'height':900})
            for lang in ['lv','ru','en']:
                self.page.select_option('#languageSelect',lang);self.page.wait_for_timeout(30)
                for slide in range(4):
                    self.page.evaluate('(n)=>applySlide(n,false)',slide)
                    with self.subTest(width=width,lang=lang,slide=slide):
                        result=self.page.evaluate('''()=>{const hero=document.querySelector('.hero').getBoundingClientRect(),f=document.querySelector('.hero-features').getBoundingClientRect(),nav=document.querySelector('.slide-nav').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-innerWidth,cut:f.bottom-hero.bottom,overlap:innerWidth<=720?f.bottom-nav.top:0}}''')
                        self.assertLessEqual(result['overflow'],1,result)
                        self.assertLessEqual(result['cut'],0,result)
                        self.assertLessEqual(result['overlap'],0,result)
    def test_language_url_reload_and_no_javascript(self):
        self.page.goto(self.url);self.page.select_option('#languageSelect','ru')
        self.assertTrue(self.page.url.endswith('/ru/'));self.page.reload()
        self.assertEqual(self.page.locator('html').get_attribute('lang'),'ru')
        self.assertIn('Металлообработка',self.page.title())
        self.page.goto(self.url+'en/');self.assertEqual(self.page.locator('html').get_attribute('lang'),'en')
        nojs=self.browser.new_context(java_script_enabled=False);p=nojs.new_page();p.goto(self.url+'ru/')
        self.assertEqual(p.locator('[data-i18n=navServices]').text_content(),'Услуги');nojs.close()
    def test_mobile_menu_keyboard_and_anchor(self):
        self.page.set_viewport_size({'width':390,'height':844});self.page.goto(self.url)
        self.page.locator('#menuBtn').click();self.assertEqual(self.page.locator('#menuBtn').get_attribute('aria-expanded'),'true')
        self.page.keyboard.press('Escape');self.assertEqual(self.page.locator('#menuBtn').get_attribute('aria-expanded'),'false')
        self.assertEqual(self.page.evaluate('document.activeElement.id'),'menuBtn')
        self.page.locator('#menuBtn').click();self.page.locator('.main-nav a[href="#services"]').click();self.page.wait_for_timeout(1100)
        self.assertEqual(self.page.locator('#menuBtn').get_attribute('aria-expanded'),'false')
        self.assertGreaterEqual(self.page.locator('#services').evaluate('e=>e.getBoundingClientRect().top'),65)
    def test_reduced_motion_and_manual_slides(self):
        self.page.emulate_media(reduced_motion='reduce');self.page.goto(self.url);self.page.wait_for_timeout(6500)
        self.assertEqual(self.page.locator('.hero').get_attribute('data-slide'),'0')
        self.assertTrue(self.page.locator('#slidePause').is_disabled())
        self.page.locator('[data-slide="2"].slide-dot').click();self.page.wait_for_timeout(200)
        self.assertEqual(self.page.locator('.hero').get_attribute('data-slide'),'2')
        self.assertEqual(self.page.locator('[data-slide="2"].slide-dot').get_attribute('aria-current'),'true')
    def test_slider_visibility_pause_and_interruption(self):
        self.page.goto(self.url)
        self.page.evaluate('document.querySelector("#contacts").scrollIntoView({behavior:"instant"})');self.page.wait_for_timeout(150)
        self.assertFalse(self.page.evaluate('heroVisible'))
        self.page.evaluate('window.scrollTo({top:0,behavior:"instant"})');self.page.wait_for_timeout(150)
        self.page.locator('#slidePause').click();self.assertEqual(self.page.locator('#slidePause').get_attribute('aria-pressed'),'true')
        self.page.evaluate('applySlide(1);applySlide(3);applySlide(2)');self.page.wait_for_timeout(250)
        self.assertEqual(self.page.locator('.slide-dot.active').get_attribute('data-slide'),'2')
        self.assertEqual(self.page.locator('[data-i18n=heroTitle1]').text_content(),self.page.evaluate('slides[2].title1[currentLanguage]'))
    def configure_endpoint(self):
        self.page.route('**/js/config.js',lambda route:route.fulfill(content_type='application/javascript',body='window.BCS_CONFIG={formEndpoint:"https://forms.example.test/enquiry"};'))
    def fill_form(self):
        self.page.locator('[name=name]').fill('Test User');self.page.locator('[name=email]').fill('test@example.com')
        self.page.locator('[name=message]').fill('Test drawing')
    def test_form_multipart_acceptance_and_file(self):
        self.configure_endpoint();requests=[]
        def accept(route):
            requests.append(route.request.post_data_buffer)
            route.fulfill(status=202,content_type='application/json',body='{"accepted":true}',headers={'Access-Control-Allow-Origin':'*'})
        self.page.route('https://forms.example.test/enquiry',accept)
        self.page.goto(self.url+'en/');self.fill_form()
        self.page.locator('[name=drawing]').set_input_files({'name':'drawing.pdf','mimeType':'application/pdf','buffer':b'%PDF-test'})
        self.page.locator('button[type=submit]').click();self.page.wait_for_function('document.querySelector("#formStatus").textContent.includes("accepted")')
        self.assertEqual(len(requests),1);self.assertIn(b'%PDF-test',requests[0]);self.assertIn(b'name="language"',requests[0])
        self.assertEqual(self.page.locator('[name=name]').input_value(),'')
    def test_form_failure_retry_and_invalid_upload(self):
        self.configure_endpoint();calls=[]
        def reject(route):calls.append(1);route.fulfill(status=500,body='error',headers={'Access-Control-Allow-Origin':'*'})
        self.page.route('https://forms.example.test/enquiry',reject)
        self.page.goto(self.url+'en/');self.fill_form()
        self.page.locator('[name=drawing]').set_input_files({'name':'bad.exe','mimeType':'application/octet-stream','buffer':b'bad'})
        self.page.locator('button[type=submit]').click();self.assertEqual(calls,[])
        self.page.locator('[name=drawing]').set_input_files([])
        self.page.locator('button[type=submit]').click();self.page.wait_for_function('document.querySelector("#formStatus").textContent.includes("Could not")')
        self.assertEqual(self.page.locator('[name=name]').input_value(),'Test User')
        self.assertTrue(self.page.locator('button[type=submit]').is_enabled());self.assertEqual(len(calls),1)
        self.page.select_option('#languageSelect','ru');self.assertEqual(self.page.locator('[name=service]').input_value(),'laser')
    def test_email_fallback_is_explicit(self):
        self.page.goto(self.url+'en/')
        self.assertIn('manually',self.page.locator('#formNotice').inner_text())
        self.assertIn('Prepare email',self.page.locator('button[type=submit]').text_content())
    def test_scroll_zoom_pins_and_reverses(self):
        self.page.set_viewport_size({'width':1440,'height':1000})
        self.page.goto(self.url,wait_until='networkidle');self.page.wait_for_timeout(150)
        self.assertTrue(self.page.locator('#heroScrollStage').evaluate('e=>e.classList.contains("is-pinned")'))
        initial=float(self.page.locator('.hero').evaluate('e=>e.style.getPropertyValue("--hero-zoom")'))
        self.page.evaluate('window.scrollTo({top:320,behavior:"instant"})');self.page.wait_for_timeout(150)
        self.assertAlmostEqual(self.page.locator('.hero').bounding_box()['y'],0,delta=1)
        zoom=float(self.page.locator('.hero').evaluate('e=>e.style.getPropertyValue("--hero-zoom")'))
        self.assertGreater(zoom,initial)
        self.page.evaluate('window.scrollTo({top:0,behavior:"instant"})');self.page.wait_for_timeout(150)
        self.assertAlmostEqual(float(self.page.locator('.hero').evaluate('e=>e.style.getPropertyValue("--hero-zoom")')),initial,places=3)
        self.page.emulate_media(reduced_motion='reduce');self.page.wait_for_timeout(150)
        self.assertFalse(self.page.locator('#heroScrollStage').evaluate('e=>e.classList.contains("is-pinned")'))
        self.assertEqual(self.page.locator('.hero-bg').evaluate('e=>getComputedStyle(e).transform'),'none')
        self.assertEqual(self.page.locator('#heroScrollStage').evaluate('e=>e.style.height'),'')
    def test_motion_visibility_fallback_and_translations(self):
        self.page.goto(self.url+'ru/',wait_until='networkidle')
        self.page.locator('.hero-actions a[href="#services"]').click();self.page.wait_for_timeout(1100)
        self.assertEqual(self.page.locator('#services h2').text_content(),'Наши услуги')
        self.assertEqual(self.page.locator('#services h2').evaluate('e=>getComputedStyle(e).clipPath'),'none')
        self.page.select_option('#languageSelect','en')
        self.assertEqual(self.page.locator('#services h2').text_content(),'Our services')
        # Failure of the optional motion controller must not hide content.
        self.page.route('**/js/motion.js',lambda route:route.abort())
        self.page.reload(wait_until='networkidle')
        self.assertFalse(self.page.locator('html').evaluate('e=>e.classList.contains("motion-enabled")'))
        self.assertTrue(self.page.locator('#services h2').is_visible())
    def test_browser_evidence(self):
        directory=Path(os.environ.get('BCS_EVIDENCE_DIR','/tmp/bcs-modernization-evidence'));directory.mkdir(parents=True,exist_ok=True)
        self.page.goto(self.url);self.page.evaluate('userPaused=true;updatePlayback()')
        for width,height,name in [(1440,900,'desktop'),(768,900,'tablet'),(390,844,'mobile')]:
            self.page.set_viewport_size({'width':width,'height':height});self.page.evaluate('window.scrollTo({top:0,behavior:"instant"})');self.page.wait_for_timeout(150)
            self.page.screenshot(path=str(directory/f'{name}.png'))
if __name__=='__main__':unittest.main(verbosity=2)
