document.addEventListener("DOMContentLoaded", () => {
  
  // --- 1. Mouse movement tracking for global page glow effect ---
  document.addEventListener("mousemove", (e) => {
    const glow = document.querySelector(".page-glow");
    if (glow) {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }
  });

  // --- 2. Accordion category toggle logic for showcase ---
  document.addEventListener("click", (e) => {
    const categoryHeader = e.target.closest(".category-header, .category-toggle");
    if (categoryHeader) {
      const parentItem = categoryHeader.closest(".category-item") || categoryHeader.parentElement;
      if (parentItem) {
        const isActive = parentItem.classList.contains("active");
        
        document.querySelectorAll(".category-item").forEach(item => {
          item.classList.remove("active");
        });

        if (!isActive) {
          parentItem.classList.add("active");
        }
      }
    }
  });

  // --- 3. Independent lightbox modal structure generation (Supports Image & Video) ---
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "independent-image-modal";
  modalOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(5, 5, 7, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(8px);
    padding: 1.5rem;
  `;

  const modalBox = document.createElement("div");
  modalBox.style.cssText = `
    position: relative;
    background: rgba(15, 12, 25, 0.85);
    border: 1px solid rgba(88, 85, 247, 0.3);
    border-radius: 16px;
    padding: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    width: 92vw;
    height: 92vh;
    max-width: none;
    max-height: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: scale(0.96);
    transition: transform 0.3s ease;
  `;

  const counterBadge = document.createElement("div");
  counterBadge.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(85, 101, 247, 0.2);
    border: 1px solid rgba(88, 85, 247, 0.3);
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
    padding: 0.35rem 0.9rem;
    border-radius: 20px;
    z-index: 10;
  `;

  const imageWrapper = document.createElement("div");
  imageWrapper.style.cssText = `
    position: relative;
    width: 100%;
    height: calc(100% - 3.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  `;

  const modalImg = document.createElement("img");
  modalImg.style.cssText = `
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    display: block;
  `;

  const modalVideo = document.createElement("video");
  modalVideo.style.cssText = `
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    display: none;
  `;
  modalVideo.autoplay = true;
  modalVideo.muted = true;
  modalVideo.loop = true;
  modalVideo.playsInline = true;

  imageWrapper.appendChild(modalImg);
  imageWrapper.appendChild(modalVideo);

  const captionBar = document.createElement("div");
  captionBar.style.cssText = `
    height: 2rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    width: 100%;
    margin-top: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(168, 85, 247, 0.2);
    border: 1px solid rgba(88, 85, 247, 0.3);
    color: #fff;
    font-size: 1.6rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  `;

  const createArrowBtn = (direction) => {
    const btn = document.createElement("button");
    btn.innerHTML = direction === "prev" ? "&#10094;" : "&#10095;";
    btn.style.cssText = `
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      ${direction === "prev" ? "left: -25px;" : "right: -25px;"}
      background: rgba(15, 12, 25, 0.9);
      border: 1px solid rgba(88, 85, 247, 0.3);
      color: #fff;
      font-size: 1.6rem;
      width: 55px;
      height: 55px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6);
    `;
    return btn;
  };

  const prevBtn = createArrowBtn("prev");
  const nextBtn = createArrowBtn("next");

  modalBox.appendChild(counterBadge);
  modalBox.appendChild(imageWrapper);
  modalBox.appendChild(captionBar);
  modalBox.appendChild(closeBtn);
  modalBox.appendChild(prevBtn);
  modalBox.appendChild(nextBtn);
  modalOverlay.appendChild(modalBox);
  document.body.appendChild(modalOverlay);

  let currentGroupThumbs = [];
  let currentIndex = 0;

  const updateModalContent = () => {
    const activeThumb = currentGroupThumbs[currentIndex];
    if (activeThumb) {
      const videoSrc = activeThumb.getAttribute("data-video");

      const activeEl = videoSrc ? modalVideo : modalImg;
      const inactiveEl = videoSrc ? modalImg : modalVideo;

      activeEl.style.opacity = "0";
      activeEl.style.transform = "scale(0.97)";

      setTimeout(() => {
        inactiveEl.style.display = "none";
        activeEl.style.display = "block";

        if (videoSrc) {
          if (modalVideo.src !== videoSrc) {
            modalVideo.src = videoSrc;
          }
          modalVideo.play().catch(error => {
            if (error.name !== "AbortError") {
              console.error("Error al reproducir el video:", error);
            }
          });
        } else {
          modalVideo.pause();
          modalVideo.src = "";
          const fullSrc = activeThumb.getAttribute("data-full") || activeThumb.src;
          if (modalImg.src !== fullSrc) {
            modalImg.src = fullSrc;
          }
        }

        requestAnimationFrame(() => {
          activeEl.style.transition = "opacity 0.25s ease, transform 0.25s ease";
          activeEl.style.opacity = "1";
          activeEl.style.transform = "scale(1)";
        });
      }, 150);

      counterBadge.textContent = `${currentIndex + 1}/${currentGroupThumbs.length}`;
      
      let title = activeThumb.alt || activeThumb.getAttribute("data-title") || "";
      if (!title) {
        const sourceToCheck = videoSrc || activeThumb.src;
        const parts = sourceToCheck.split("/");
        title = parts[parts.length - 1].split(".")[0];
      }
      captionBar.textContent = title;
    }
  };

  const openModal = (clickedThumb) => {
    const categoryContainer = clickedThumb.closest(".category-item") || clickedThumb.closest("section") || document;
    currentGroupThumbs = Array.from(categoryContainer.querySelectorAll(".gallery-thumb"));
    
    if (currentGroupThumbs.length === 0) {
      currentGroupThumbs = Array.from(document.querySelectorAll(".gallery-thumb"));
    }

    currentIndex = currentGroupThumbs.indexOf(clickedThumb);
    if (currentIndex === -1) currentIndex = 0;

    updateModalContent();

    modalOverlay.style.opacity = "1";
    modalOverlay.style.pointerEvents = "auto";
    modalBox.style.transform = "scale(1)";
  };

  const closeModal = () => {
    modalOverlay.style.opacity = "0";
    modalOverlay.style.pointerEvents = "none";
    modalBox.style.transform = "scale(0.96)";

    modalVideo.pause();
    modalVideo.src = "";
  };

  document.addEventListener("click", (e) => {
    const thumb = e.target.closest(".gallery-thumb");
    if (thumb) {
      e.preventDefault();
      openModal(thumb);
    }
  });

  closeBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentGroupThumbs.length > 0) {
      currentIndex = (currentIndex - 1 + currentGroupThumbs.length) % currentGroupThumbs.length;
      updateModalContent();
    }
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentGroupThumbs.length > 0) {
      currentIndex = (currentIndex + 1) % currentGroupThumbs.length;
      updateModalContent();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (modalOverlay.style.pointerEvents === "auto") {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") prevBtn.click();
      if (e.key === "ArrowRight") nextBtn.click();
    }
  });

});


// --- 4. 3D INTERACTIVE MODEL VIEWER (Three.js + GLTFLoader) ---
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("canvas-3d-container");
  const loader = document.getElementById("model-loader");

  if (!container) return;

  // Escena, Cámara y Renderizador
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(4, 3, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer);

  // Iluminación profesional
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x33e7ff, 3);
  dirLight1.position.set(5, 10, 7);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2);
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  // Contenedor principal para el modelo 3D
  const group = new THREE.Group();
  scene.add(group);

  // Carga del modelo 3D real mediante GLTFLoader
  const loaderInstance = new THREE.GLTFLoader();
  const modelPath = 'hydra_material/models/mannequin_v2.glb';

  loaderInstance.load(
    modelPath,
    (gltf) => {
      const model = gltf.scene;
      
      // Ajustes de escala y posición del modelo personalizado
      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);
      
      group.add(model);

      // Ocultar texto de carga una vez completado
      if (loader) {
        loader.style.opacity = "0";
        setTimeout(() => loader.remove(), 400);
      }
    },
    (xhr) => {
      if (xhr.total) {
        const percent = (xhr.loaded / xhr.total) * 100;
        if (loader) loader.textContent = `Loading 3D Asset... ${Math.round(percent)}%`;
      }
    },
    (error) => {
      console.error("Error al cargar el modelo 3D:", error);
      if (loader) loader.textContent = "Error loading model file.";
    }
  );

  // Control interactivo de rotación con Mouse / Touch
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    group.rotation.y += deltaX * 0.008;
    group.rotation.x += deltaY * 0.008;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  container.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  window.addEventListener("touchmove", (e) => {
    if (!isDragging || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    group.rotation.y += deltaX * 0.008;
    group.rotation.x += deltaY * 0.008;

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  window.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Zoom con la rueda del mouse
  container.addEventListener("wheel", (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.003;
    camera.position.z = Math.max(2.5, Math.min(9, camera.position.z));
  }, { passive: false });

  // Loop de animación principal
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Rotación automática sutil cuando no se está arrastrando el modelo
    if (!isDragging) {
      group.rotation.y += 0.004;
      group.rotation.x = Math.sin(elapsedTime * 0.5) * 0.05;
    }

    renderer.render(scene, camera);
  }
  animate();

  // Responsive adaptativo ante cambios de tamaño de ventana
  window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
});
