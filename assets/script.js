document.addEventListener('DOMContentLoaded', () => {
    // Loading Screen Logic
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        const isReloading = document.documentElement.classList.contains('is-reloading');
        
        if (!isReloading) {
            loadingScreen.style.display = 'none';
        } else {
            document.body.style.overflow = 'hidden'; // Prevent scrolling while loading
            const countdownEl = document.getElementById('loading-countdown');
            const loadingBar = document.getElementById('loading-bar');
        
        let progress = 0;
        let duration = 2000; // 2 seconds total loading
        let interval = 20; // 20ms ticks
        
        const loadingInterval = setInterval(() => {
            progress += (interval / duration) * 100;
            if (progress >= 100) {
                progress = 100;
            }
            loadingBar.style.width = `${progress}%`;
            
            // Fast countdown effect with random numbers settling down
            let val1 = (99 - Math.floor(progress)).toString().padStart(2, '0');
            let val2 = Math.floor(Math.random() * 60).toString().padStart(2, '0');
            let val3 = Math.floor(Math.random() * 99).toString().padStart(2, '0');
            
            if (progress >= 100) {
                countdownEl.textContent = "00:00:00";
            } else {
                countdownEl.textContent = `${val1}:${val2}:${val3}`;
            }
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                
                // Allow a brief moment to show 100% and 00:00:00:00, then clear screen
                setTimeout(() => {
                    loadingScreen.classList.add('fade-out');
                    countdownEl.style.animation = 'none'; // stop flickering
                    
                    // After transition completes, restore overflow
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        document.body.style.overflow = '';
                    }, 1200); 
                }, 400); 
            }
        }, interval);
        }
    }

    // Countdown Timer logic
    const timerElement = document.querySelector('.countdown-timer');
    if (timerElement) {
        let hours = 0;
        let minutes = 0;
        let seconds = 30;
        let milliseconds = 0;

        function updateTimer() {
            milliseconds -= 1;
            if (milliseconds < 0) {
                milliseconds = 99;
                seconds -= 1;
            }
            if (seconds < 0) {
                seconds = 59;
                minutes -= 1;
            }
            if (minutes < 0) {
                minutes = 59;
                hours -= 1;
            }

            const h = String(Math.max(0, hours)).padStart(2, '0');
            const m = String(Math.max(0, minutes)).padStart(2, '0');
            const s = String(Math.max(0, seconds)).padStart(2, '0');
            const ms = String(Math.max(0, milliseconds)).padStart(2, '0');

            timerElement.textContent = `${h}:${m}:${s}:${ms}`;
        }

        setInterval(updateTimer, 10);
    }

    // Page Reveal Animation
    const content = document.querySelector('.content-box');
    if (content) {
        const elementsToAnimate = [];
        content.querySelectorAll(':scope > *').forEach(el => {
            if (el.classList.contains('feature-grid')) {
                // Animate cards individually instead of their wrapper to prevent backdrop-filter pop-in
                el.querySelectorAll('.feature-card').forEach(card => elementsToAnimate.push(card));
            } else {
                elementsToAnimate.push(el);
            }
        });
        
        elementsToAnimate.forEach((el, index) => {
            setTimeout(() => {
                el.style.transition = 'all 1s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 300 + index * 100);
        });
    }

    // Nav Link Highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });



    // Three.js 3D Object Logic for Game Page
    const canvasContainer = document.getElementById('three-canvas-container');
    if (canvasContainer && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();

        const width = canvasContainer.clientWidth || window.innerWidth;
        const height = canvasContainer.clientHeight || window.innerHeight;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 150;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        canvasContainer.appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.autoRotate = false;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(50, 50, 50);
        scene.add(dirLight);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 1);
        backLight.position.set(-50, 50, -50);
        scene.add(backLight);

        const fillLight = new THREE.DirectionalLight(0xaaccff, 0.8);
        fillLight.position.set(0, -50, 50);
        scene.add(fillLight);

        // Load a texture to act as the environment reflection map so it doesn't look black
        const textureLoader = new THREE.TextureLoader();
        const envReflect = textureLoader.load('assets/images/VRTexture.png');
        envReflect.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = envReflect;

        let stlMesh;

        const loader = new THREE.STLLoader();
        loader.load('assets/stl/VR Helmet.stl', (geometry) => {
            geometry.center();
            const material = new THREE.MeshStandardMaterial({
                color: 0xffffff, 
                metalness: 1.0, 
                roughness: 0.1, // Adjusted roughness for better reflections with the new texture
                envMapIntensity: 2.0
            });
            stlMesh = new THREE.Mesh(geometry, material);
            
            geometry.computeBoundingBox();
            const box = geometry.boundingBox;
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 60 / maxDim;
            stlMesh.scale.set(scale, scale, scale);

            scene.add(stlMesh);
        });

        const animate3D = () => {
            requestAnimationFrame(animate3D);
            if (stlMesh) {
                stlMesh.rotation.y += 0.003;
            }
            controls.update();
            renderer.render(scene, camera);
        };
        animate3D();

        window.addEventListener('resize', () => {
            const w = canvasContainer.clientWidth || window.innerWidth;
            const h = canvasContainer.clientHeight || window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
    }

    // Global Count-up Timer logic
    const globalTimer = document.createElement('div');
    globalTimer.className = 'global-timer';
    globalTimer.textContent = '00:00:00';
    document.body.appendChild(globalTimer);

    // Persistence logic
    let startTime = sessionStorage.getItem('globalTimerStartTime');
    if (!startTime) {
        startTime = Date.now();
        sessionStorage.setItem('globalTimerStartTime', startTime);
    } else {
        startTime = parseInt(startTime);
    }

    function updateGlobalTimer() {
        const now = Date.now();
        const elapsed = Math.max(0, now - startTime);
        
        const seconds = Math.floor(elapsed / 1000) % 60;
        const minutes = Math.floor(elapsed / (1000 * 60)) % 60;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        
        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        
        globalTimer.textContent = `${h}:${m}:${s}`;
    }

    setInterval(updateGlobalTimer, 1000);
    updateGlobalTimer(); // Run once immediately
});
