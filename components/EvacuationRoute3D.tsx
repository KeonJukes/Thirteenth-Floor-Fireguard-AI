import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

interface EvacuationRoute3DProps {
  fireFloor: number;
  residentFloor: number;
  onClose: () => void;
}

const EvacuationRoute3D: React.FC<EvacuationRoute3DProps> = ({ fireFloor, residentFloor, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2D2D2D);
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);
    
    // Label renderer
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none'; // Allow clicking through
    currentMount.appendChild(labelRenderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);
    const firePointLight = new THREE.PointLight(0xFF6B00, 500, 100);
    firePointLight.position.set(0, (fireFloor - 0.5) * 3, 0);
    scene.add(firePointLight);


    // Building constants
    const TOTAL_FLOORS = 16;
    const FLOOR_HEIGHT = 3;
    const BUILDING_WIDTH = 20;
    const BUILDING_DEPTH = 15;
    const stairwellX = BUILDING_WIDTH / 2 - 2;
    const exitZ = BUILDING_DEPTH / 2 + 2;

    // Create a text label in 3D space
    const createLabel = (text: string, className: string) => {
      const div = document.createElement('div');
      div.className = className;
      div.textContent = text;
      return new CSS2DObject(div);
    };
    
    // Add floor labels
    const fireLabel = createLabel('🔥 Fire on this Floor', 'p-2 bg-fire-red text-white text-sm rounded-md font-bold');
    fireLabel.position.set(BUILDING_WIDTH / 2 + 1, (fireFloor - 1) * FLOOR_HEIGHT + 0.5, 0);
    scene.add(fireLabel);

    if(fireFloor !== residentFloor) {
      const residentLabel = createLabel('👤 You Are Here', 'p-2 bg-fire-gold text-black text-sm rounded-md font-bold');
      residentLabel.position.set(BUILDING_WIDTH / 2 + 1, (residentFloor - 1) * FLOOR_HEIGHT + 0.5, 0);
      scene.add(residentLabel);
    }


    // Build floors and signs
    for (let i = 1; i <= TOTAL_FLOORS; i++) {
        const floorY = (i - 1) * FLOOR_HEIGHT;
        
        const floorGeometry = new THREE.BoxGeometry(BUILDING_WIDTH, 0.1, BUILDING_DEPTH);
        let floorMaterial: THREE.Material = new THREE.MeshStandardMaterial({ color: 0x383838, transparent: true, opacity: 0.1 });

        if (i === fireFloor) {
            floorMaterial = new THREE.MeshBasicMaterial({ color: 0xE53E3E, transparent: true, opacity: 0.3 });
        } else if (i === residentFloor) {
            floorMaterial = new THREE.MeshBasicMaterial({ color: 0xE0A34A, transparent: true, opacity: 0.2 });
        }
        
        const floorPlane = new THREE.Mesh(floorGeometry, floorMaterial);
        floorPlane.position.set(0, floorY, 0);
        scene.add(floorPlane);

        const edges = new THREE.EdgesGeometry(floorGeometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x4A5568, linewidth: 1, opacity: 0.3, transparent: true }));
        line.position.set(0, floorY, 0);
        scene.add(line);

        // Add floor number label
        const floorLabel = createLabel(`Floor ${i}`, 'text-fire-text-secondary text-xs font-mono');
        floorLabel.position.set(-BUILDING_WIDTH / 2 - 4, floorY + FLOOR_HEIGHT / 2, 0);
        scene.add(floorLabel);

        // Exit signs
        const exitSignGeo = new THREE.PlaneGeometry(2, 1);
        const exitSignMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, toneMapped: false });
        const exitSign = new THREE.Mesh(exitSignGeo, exitSignMat);
        exitSign.position.set(stairwellX, floorY + 1.5, BUILDING_DEPTH / 2 - 0.01);
        scene.add(exitSign);
        
        const exitSignLabel = createLabel('EXIT', 'text-black text-xs font-extrabold');
        exitSignLabel.position.copy(exitSign.position);
        scene.add(exitSignLabel);
    }
    
    // Main Exit Door Sign
    const mainExitSign = createLabel('FINAL EXIT', 'p-2 text-lg bg-green-500 text-black font-extrabold rounded');
    mainExitSign.position.set(0, 1.5, exitZ);
    scene.add(mainExitSign);
    
    // Realistic fire particle effect
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    const fireColor1 = new THREE.Color(0xFF6B00); // Orange
    const fireColor2 = new THREE.Color(0xE53E3E); // Red
    const fireColor3 = new THREE.Color(0xE0A34A); // Gold/Yellow

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Initial position
      positions[i3 + 0] = (Math.random() - 0.5) * BUILDING_WIDTH * 0.7;
      positions[i3 + 1] = Math.random() * 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * BUILDING_DEPTH * 0.7;

      // Initial velocity
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          Math.random() * 1.5 + 1,
          (Math.random() - 0.5) * 0.5
        )
      );
      
      // Initial color
      const color = new THREE.Color().lerpColors(fireColor1, fireColor2, Math.random());
      if (Math.random() > 0.5) color.lerp(fireColor3, Math.random() * 0.6);
      colors[i3 + 0] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.35,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.position.set(0, (fireFloor - 1) * FLOOR_HEIGHT, 0);
    scene.add(particleSystem);


    // Evacuation path
    const points = [];
    const residentY = (residentFloor - 1) * FLOOR_HEIGHT + 0.5;
    
    points.push(new THREE.Vector3(0, residentY, 0));
    points.push(new THREE.Vector3(stairwellX, residentY, BUILDING_DEPTH / 2 - 2));

    for (let i = residentFloor; i >= 1; i--) {
        const floorY = (i - 1) * FLOOR_HEIGHT + 0.5;
        points.push(new THREE.Vector3(stairwellX, floorY, BUILDING_DEPTH / 2 - 2));
    }

    const groundFloorY = 0.5;
    points.push(new THREE.Vector3(stairwellX, groundFloorY, exitZ));
    points.push(new THREE.Vector3(0, groundFloorY, exitZ));

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.2, 8, false);
    const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xE0A34A, toneMapped: false });
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tubeMesh);

    camera.position.set(BUILDING_WIDTH * 1.5, TOTAL_FLOORS * FLOOR_HEIGHT / 2, BUILDING_DEPTH * 1.5);
    camera.lookAt(0, TOTAL_FLOORS * FLOOR_HEIGHT / 2, 0);

    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        
        // Animate fire particles
        const positionAttribute = particleSystem.geometry.attributes.position;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Update position with velocity
            positionAttribute.array[i3 + 0] += velocities[i].x * delta;
            positionAttribute.array[i3 + 1] += velocities[i].y * delta;
            positionAttribute.array[i3 + 2] += velocities[i].z * delta;

            // Add turbulence/sway
            velocities[i].x += (Math.random() - 0.5) * delta * 0.5;

            // When particle rises too high, reset it
            if (positionAttribute.array[i3 + 1] > FLOOR_HEIGHT * 1.5) {
                positionAttribute.array[i3 + 0] = (Math.random() - 0.5) * BUILDING_WIDTH * 0.7;
                positionAttribute.array[i3 + 1] = Math.random() * 0.5;
                positionAttribute.array[i3 + 2] = (Math.random() - 0.5) * BUILDING_DEPTH * 0.7;
                velocities[i].y = Math.random() * 1.5 + 1; // Reset upward speed
                velocities[i].x = (Math.random() - 0.5) * 0.5; // Reset sway
            }
        }
        positionAttribute.needsUpdate = true;
        
        firePointLight.intensity = 300 + Math.sin(clock.getElapsedTime() * 5) * 100;

        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        labelRenderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
        currentMount.removeChild(labelRenderer.domElement);
      }
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [fireFloor, residentFloor]);

  return (
    <div className="w-full h-full bg-fire-dark rounded-xl shadow-2xl relative animate-fade-in">
        <div ref={mountRef} className="w-full h-full rounded-xl overflow-hidden"></div>
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-fire-card text-white font-bold py-2 px-4 rounded-lg hover:bg-fire-border transition z-10"
        >
            Close View
        </button>
    </div>
  );
};

export default EvacuationRoute3D;