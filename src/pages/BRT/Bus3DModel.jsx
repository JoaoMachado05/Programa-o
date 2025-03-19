import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from 'three';

// Componente de modelo sem rotação automática
const AutocarroModel = () => {
  const [modelError, setModelError] = useState(false);
  const meshRef = useRef();
  
  // Carrega o modelo com tratamento de erros
  const { scene } = useGLTF("/models/scene.gltf", true, 
    (error) => {
      console.error("Erro ao carregar o modelo:", error);
      setModelError(true);
    }
  );

  // Corrige as texturas ausentes aplicando materiais básicos
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          // Verifica se o material tem textura e teve erro de carregamento
          if (child.material && child.material.map instanceof THREE.Texture && 
              child.material.map.image === undefined) {
            console.log("Aplicando material fallback para", child.name);
            
            // Salva as propriedades originais do material
            const originalColor = child.material.color ? child.material.color.clone() : new THREE.Color(0x999999);
            
            // Cria um material básico como fallback
            child.material = new THREE.MeshStandardMaterial({
              color: originalColor,
              metalness: 0.4,
              roughness: 0.7,
            });
          }
        }
      });
    }
  }, [scene]);

  // Se houver erro no carregamento do modelo, mostra um modelo de caixa como fallback
  if (modelError) {
    return (
      <mesh ref={meshRef}>
        <boxGeometry args={[5, 2, 10]} /> {/* Caixa no formato aproximado de um autocarro */}
        <meshStandardMaterial color="dodgerblue" />
      </mesh>
    );
  }

  // Renderiza o modelo se estiver disponível (sem animação de rotação)
  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={[3, 3, 3]} 
      position={[0, 0, 0]} 
      rotation={[0, 0, 0]} // Define uma rotação fixa
    />
  );
};

// Tenta pré-carregar o modelo GLTF
try {
  useGLTF.preload("/models/scene.gltf");
} catch (error) {
  console.warn("Falha ao pré-carregar o modelo:", error);
}

const Autocarro3D = () => {
  // Estado para verificar se o componente Canvas montou com sucesso
  const [canvasError, setCanvasError] = useState(false);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {canvasError && (
        <div 
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            width: "100%", 
            height: "100%", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            backgroundColor: "rgba(0,0,0,0.1)",
            zIndex: 10 
          }}
        >
          <div style={{ padding: "20px", backgroundColor: "white", borderRadius: "5px" }}>
            Não foi possível carregar o modelo 3D. Verifique o console para mais detalhes.
          </div>
        </div>
      )}
      
      <Canvas
        style={{ height: "100%", width: "100%" }}
        camera={{ position: [0, 5, 15], fov: 50 }}
        onError={(error) => {
          console.error("Erro no Canvas:", error);
          setCanvasError(true);
        }}
      >
        <ErrorBoundary fallback={null}>
          {/* Luzes */}
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          
          {/* Modelo do autocarro estático */}
          <AutocarroModel />
          
          {/* Controle de órbita para que o usuário possa mover a câmera */}
          <OrbitControls
            enableZoom={true}
            maxDistance={100}
            minDistance={5}
            enablePan={true}
            enableRotate={true}
            rotateSpeed={1}
            zoomSpeed={1}
            panSpeed={1}
            autoRotate={false}
          />
        </ErrorBoundary>
      </Canvas>
    </div>
  );
};

// Componente de tratamento de erros
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro capturado no ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export default Autocarro3D;