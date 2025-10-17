import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('e46-3d');
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 100);
camera.position.set(3.6, 1.6, 4.6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.0, 0);
controls.minDistance = 2.0;
controls.maxDistance = 10.0;
controls.maxPolarAngle = Math.PI * 0.49;

scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.6));
const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(5, 8, 6); scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.4); fill.position.set(-6, 3, -4); scene.add(fill);

const ground = new THREE.Mesh(new THREE.CircleGeometry(8, 64),
    new THREE.MeshStandardMaterial({ color:0x0b0c10, metalness:0, roughness:1, transparent:true, opacity:0.85 }));
ground.rotation.x = -Math.PI/2; ground.position.y = 0.01; scene.add(ground);

const loader = new GLTFLoader();
loader.load('assets/e46.glb', (gltf)=>{
    const root = gltf.scene;
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    const scale = 3.4 / Math.max(size.x, size.z);
    root.scale.setScalar(scale);
    root.position.sub(center.multiplyScalar(scale)).add(new THREE.Vector3(0, size.y*scale*0.5, 0));
    scene.add(root);
}, undefined, ()=>{
    const warn = document.createElement('div');
    warn.className = 'hint'; warn.style.bottom = 'unset'; warn.style.top = '12px'; warn.style.right = '12px';
    warn.textContent = 'Missing 3D model at assets/e46.glb';
    container.appendChild(warn);
});

const onResize = ()=>{
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h); camera.aspect = w/h; camera.updateProjectionMatrix();
};
window.addEventListener('resize', onResize);

(function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
})();


// Датасет движков тут
const ENGINES = {
    "318i": { code:["M43","N42","N46"], power:118, torque:175, zero100:10.0, economy:7.2, note:"Peppy urban, frugal" },
    "320i": { code:["M52TU","M54B22"], power:170, torque:210, zero100:8.2, economy:7.8, note:"Silky six intro" },
    "325i": { code:["M54B25"], power:189, torque:245, zero100:7.2, economy:8.1, note:"Sweet spot" },
    "330i": { code:["M54B30"], power:225, torque:300, zero100:6.5, economy:8.6, note:"Strong all‑rounder" },
    "330i-zhp": { code:["M54B30 (ZHP)"], power:235, torque:300, zero100:6.4, economy:8.7, note:"Sharper cams, tune" },
    "320d": { code:["M47/M47N"], power:150, torque:330, zero100:8.9, economy:5.4, note:"Torque + economy" },
    "330xd": { code:["M57D30"], power:204, torque:410, zero100:7.0, economy:7.2, note:"AWD torque" }
};

// Перфоманс карточки
const perfCards = document.getElementById('perf-cards');
function renderPerf(engineKey){
    const e = ENGINES[engineKey];
    perfCards.innerHTML = `
        <div class="spec">
          <div class="k">Engine code</div>
          <div class="v">${e.code.join(", ")}</div>
        </div>
        <div class="spec">
          <div class="k">Power</div>
          <div class="v">${e.power} hp</div>
        </div>
        <div class="spec">
          <div class="k">Torque</div>
          <div class="v">${e.torque} Nm</div>
        </div>
        <div class="spec">
          <div class="k">0–100 km/h</div>
          <div class="v">${e.zero100} s</div>
        </div>
        <div class="spec">
          <div class="k">Economy</div>
          <div class="v">${e.economy} L/100km</div>
        </div>
        <div class="spec">
          <div class="k">Character</div>
          <div class="v">${e.note}</div>
        </div>
      `;
}
renderPerf('318i');

// Интерактив Engine-tab
document.getElementById('engine-tabs').addEventListener('click', (e)=>{
    const t = e.target.closest('.chip[data-engine]');
    if(!t) return;
    document.querySelectorAll('#engine-tabs .chip').forEach(c=>c.classList.remove('active'));
    t.classList.add('active');
    const key = t.getAttribute('data-engine');
    renderPerf(key);
});

// Проявление на скроле + предзагрузка пикч
const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
        }
    });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

const imgIO = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            const img = entry.target;
            const src = img.getAttribute('data-src');
            if(src){ img.src = src; img.removeAttribute('data-src'); }
            imgIO.unobserve(img);
        }
    });
},{rootMargin:'200px'});
document.querySelectorAll('img[data-src]').forEach(img=>imgIO.observe(img));

// Design tabs
document.querySelectorAll('[data-design-tab]').forEach(tab=>{
    tab.addEventListener('click', ()=>{
        document.querySelectorAll('[data-design-tab]').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        const name = tab.getAttribute('data-design-tab');
        document.querySelectorAll('#design-panels .panel').forEach(p=>{
            p.hidden = p.getAttribute('data-panel') !== name;
        });
    });
});

// Подсветка для галлереи
const lightbox = document.querySelector('.lightbox');
const lbImg = lightbox.querySelector('img');
document.getElementById('gallery-grid').addEventListener('click', (e)=>{
    const img = e.target.closest('img');
    if(!img) return;
    const src = img.currentSrc || img.src || img.getAttribute('data-src');
    lbImg.src = src;
    lbImg.alt = img.alt || '';
    lightbox.classList.add('active');
});
function closeLightbox(){ lightbox.classList.remove('active'); lbImg.src = ""; }
window.closeLightbox = closeLightbox;
lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox(); });

// Бектутоп
const topBtn = document.querySelector('.float-top');
const topIO = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.boundingClientRect.y < 0){ topBtn.classList.add('visible'); }
        if(entry.isIntersecting && entry.boundingClientRect.y >= 0){ topBtn.classList.remove('visible'); }
    });
});
topIO.observe(document.querySelector('header'));

// Export JSON
function exportJSON(){
    const data = {
        model:"BMW E46 Sedan",
        colors:["Schwarz II (668)","Black Sapphire (475)"],
        engines: ENGINES,
        chassis:{ steering:"hydraulic", balance:"50:50", suspension:["MacPherson","Z‑axle"] },
        years:"1998–2005"
    };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "bmw-e46-sedan-black-specs.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
}
window.exportJSON = exportJSON;



