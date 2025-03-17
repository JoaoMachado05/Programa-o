import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const BusStop3D = () => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    // Configuração da cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Configuração da câmera
    const camera = new THREE.PerspectiveCamera(
      75,
      (mountRef.current?.clientWidth || 1) / (mountRef.current?.clientHeight || 1),
      0.1,
      1000
    );
    camera.position.set(5, 3, 5);

    // Configuração do renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current?.clientWidth || 1,
      mountRef.current?.clientHeight || 1
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current?.appendChild(renderer.domElement);

    // Controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 15;

    // Luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Criar a paragem de autocarro
    const createBusStop = () => {
      const busStopGroup = new THREE.Group();

      // Materiais
      const metalMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
      const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x336699 });
      const glassMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x88ccff, 
        transparent: true, 
        opacity: 0.6 
      });
      const seatMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
      const signMaterial = new THREE.MeshPhongMaterial({ color: 0xff9900 });
      const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });

      // Criar piso
      const floorGeometry = new THREE.BoxGeometry(4, 0.1, 1.5);
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.position.set(0, 0.05, 0);
      floor.receiveShadow = true;
      busStopGroup.add(floor);

      // Criar estrutura metálica (3 pilares)
      const createPillar = (x) => {
        const pillarGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8);
        const pillar = new THREE.Mesh(pillarGeometry, metalMaterial);
        pillar.position.set(x, 1.1, -0.7);
        pillar.castShadow = true;
        busStopGroup.add(pillar);
      };
      
      createPillar(-1.7);
      createPillar(0);
      createPillar(1.7);

      // Criar teto
      const roofGeometry = new THREE.BoxGeometry(4, 0.1, 1.5);
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, 2.2, -0.2);
      roof.castShadow = true;
      busStopGroup.add(roof);

      // Criar painel traseiro de vidro
      const backPanelGeometry = new THREE.BoxGeometry(3.8, 1.5, 0.05);
      const backPanel = new THREE.Mesh(backPanelGeometry, glassMaterial);
      backPanel.position.set(0, 1.4, -0.7);
      backPanel.castShadow = true;
      busStopGroup.add(backPanel);

      // Criar painéis laterais de vidro
      const sidePanelGeometry = new THREE.BoxGeometry(0.05, 1.5, 1.4);
      
      const leftPanel = new THREE.Mesh(sidePanelGeometry, glassMaterial);
      leftPanel.position.set(-1.9, 1.4, 0);
      leftPanel.castShadow = true;
      busStopGroup.add(leftPanel);
      
      const rightPanel = new THREE.Mesh(sidePanelGeometry, glassMaterial);
      rightPanel.position.set(1.9, 1.4, 0);
      rightPanel.castShadow = true;
      busStopGroup.add(rightPanel);

      // Criar banco
      const seatGeometry = new THREE.BoxGeometry(3, 0.1, 0.5);
      const seat = new THREE.Mesh(seatGeometry, seatMaterial);
      seat.position.set(0, 0.8, -0.4);
      seat.castShadow = true;
      busStopGroup.add(seat);
      
      // Suporte do banco
      const seatSupportGeometry = new THREE.BoxGeometry(0.1, 0.7, 0.4);
      
      for (let i = -1; i <= 1; i += 1) {
        const support = new THREE.Mesh(seatSupportGeometry, metalMaterial);
        support.position.set(i, 0.4, -0.4);
        support.castShadow = true;
        busStopGroup.add(support);
      }

      // Criar placa informativa
      const signBoardGeometry = new THREE.BoxGeometry(1, 0.8, 0.05);
      const signBoard = new THREE.Mesh(signBoardGeometry, signMaterial);
      signBoard.position.set(0, 1.7, -0.65);
      signBoard.castShadow = true;
      busStopGroup.add(signBoard);

      // Caixa de informações (simulando horário ou nome da paragem)
      const infoBoxGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.02);
      const infoBox = new THREE.Mesh(infoBoxGeometry, new THREE.MeshPhongMaterial({ color: 0xffffff }));
      infoBox.position.set(0, 1.7, -0.62);
      busStopGroup.add(infoBox);

      return busStopGroup;
    };

    // Criar e adicionar a paragem à cena
    const busStop = createBusStop();
    scene.add(busStop);

    // Adicionar o plano do chão
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xcccccc,
      side: THREE.DoubleSide 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Loop de animação
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Redimensionar quando a janela mudar de tamanho
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Limpeza
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default BusStop3D;