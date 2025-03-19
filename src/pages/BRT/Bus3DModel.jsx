import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Bus3DModel = ({ color = '#3366ff', speed = 0 }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const frameIdRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#f0f0f0');

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      1, // We'll update this ratio on resize
      0.1,
      1000
    );
    camera.position.set(5, 3, 5);
    camera.lookAt(0, 0, 0);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    
    // Set initial size
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    renderer.setSize(width, height);
    
    // Make sure the DOM element exists before appending
    if (mountRef.current) {
      // Clear any existing children first
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Handle resizing
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create bus body
    const createBus = () => {
      // Group to contain all bus parts
      const busGroup = new THREE.Group();
      
      // Materials
      const bodyMaterial = new THREE.MeshPhongMaterial({ color });
      const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
      const glassMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x88ccff, 
        transparent: true, 
        opacity: 0.7 
      });
      const lightMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.5
      });
      const grillMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
      const hubcapMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
      
      // Main body of the bus
      const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 1.2);
      const busBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
      busBody.position.y = 0.75;
      busBody.castShadow = true;
      busBody.receiveShadow = true;
      busGroup.add(busBody);
      
      // Top part of the bus
      const topGeometry = new THREE.BoxGeometry(4, 0.8, 1.2);
      const busTop = new THREE.Mesh(topGeometry, bodyMaterial);
      busTop.position.y = 1.9;
      busTop.castShadow = true;
      busTop.receiveShadow = true;
      busGroup.add(busTop);
      
      // Side windows
      const createWindows = () => {
        // Create multiple windows along the bus
        const windowWidth = 0.5;
        const windowHeight = 0.5;
        const windowDepth = 1.22; // Slightly larger than body width
        const windowGeometry = new THREE.BoxGeometry(windowWidth, windowHeight, windowDepth);
        
        // Window positions (along the length of the bus)
        const windowPositions = [-1.4, -0.7, 0, 0.7, 1.4];
        
        windowPositions.forEach(posX => {
          const busWindow = new THREE.Mesh(windowGeometry, glassMaterial);
          busWindow.position.set(posX, 1.6, 0);
          busGroup.add(busWindow);
        });
      };
      createWindows();
      
      // Front windshield
      const frontWindowGeometry = new THREE.BoxGeometry(0.1, 0.7, 1);
      const frontWindow = new THREE.Mesh(frontWindowGeometry, glassMaterial);
      frontWindow.position.set(2, 1.4, 0);
      busGroup.add(frontWindow);
      
      // Front grill
      const grillGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.8);
      const grill = new THREE.Mesh(grillGeometry, grillMaterial);
      grill.position.set(2.05, 0.8, 0);
      busGroup.add(grill);
      
      // Front lights
      const createFrontLights = () => {
        const lightGeometry = new THREE.CircleGeometry(0.15, 16);
        // Left light
        const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
        leftLight.position.set(2.05, 0.8, 0.4);
        leftLight.rotation.y = Math.PI / 2;
        busGroup.add(leftLight);
        
        // Right light
        const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
        rightLight.position.set(2.05, 0.8, -0.4);
        rightLight.rotation.y = Math.PI / 2;
        busGroup.add(rightLight);
      };
      createFrontLights();
      
      // Door
      const doorGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.1);
      const door = new THREE.Mesh(doorGeometry, glassMaterial);
      door.position.set(0.5, 0.6, 0.65);
      busGroup.add(door);
      
      // Create wheels
      const createWheel = (posX, posZ) => {
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(posX, 0.3, posZ);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        busGroup.add(wheel);
        
        // Hubcap
        const hubcapGeometry = new THREE.CircleGeometry(0.15, 16);
        const hubcap = new THREE.Mesh(hubcapGeometry, hubcapMaterial);
        hubcap.position.set(posX, 0.3, posZ + 0.11);
        hubcap.rotation.y = Math.PI / 2;
        busGroup.add(hubcap);
      };
      
      // Create wheels at the four corners
      createWheel(1.5, 0.7);
      createWheel(1.5, -0.7);
      createWheel(-1.5, 0.7);
      createWheel(-1.5, -0.7);
      
      return busGroup;
    };
    
    const bus = createBus();
    scene.add(bus);
    
    // Ground/road
    const roadGeometry = new THREE.PlaneGeometry(20, 20);
    const roadMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xcccccc,
      side: THREE.DoubleSide
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = -0.5;
    road.receiveShadow = true;
    scene.add(road);
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    
    // Animation loop
    const animate = () => {
      controls.update();
      
      // Add animation based on speed
      if (speed > 0) {
        bus.rotation.y += 0.003 * (speed / 20);
      }
      
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of resources
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
      scene.clear();
    };
  }, [color, speed]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        background: '#f5f5f5',
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  );
};

export default Bus3DModel;