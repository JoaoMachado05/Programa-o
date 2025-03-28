import React, { useState, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

const BusStop3D = () => {
  const [proximoAutocarro, setProximoAutocarro] = useState("0 min");

  // Simulação de atualização do horário (para testar antes da ligação ao backend)
  useEffect(() => {
    const atualizarHorario = () => {
      const minutos = Math.floor(Math.random() * 60).toString();
      setProximoAutocarro(`${minutos} min`);
    };

    const intervalo = setInterval(atualizarHorario, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(intervalo);
  }, []);

  // Carregar texturas para os detalhes
  const horarioTexture = useLoader(THREE.TextureLoader, "/horario.jpg");
  const anuncioTexture = useLoader(THREE.TextureLoader, "/ad.jpg");

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Cena 3D - Ocupando mais espaço na tela */}
      <Canvas 
        style={{ width: "100%", height: "100%", background: "#87CEEB" }} 
        camera={{ position: [0, 3, 8], fov: 50 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 6, 4]} intensity={1.2} castShadow />
        <hemisphereLight args={["#87CEEB", "#6C9", 0.7]} />

        {/* Passeio (Base da paragem) */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[6, 0.1, 4]} />
          <meshStandardMaterial color="darkgray" />
        </mesh>

        {/* Estrutura da Paragem */}
        <group position={[0, 0, 0]}>
          {/* Câmera de Segurança - Modelo Domo */}
          <group position={[1.2, 1.7, -0.52]}>
            {/* Base da Câmera */}
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
              <meshStandardMaterial color="white" metalness={0.3} roughness={0.5} />
            </mesh>

            {/* Corpo Giratório da Câmera */}
            <mesh position={[0, -0.05, 0]} rotation={[0.5, 0, 0]} castShadow>
              <sphereGeometry args={[0.12, 32, 32]} />
              <meshStandardMaterial color="white" metalness={0.4} roughness={0.3} />
            </mesh>

            {/* Lente da Câmera */}
            <mesh position={[0, -0.1, 0.08]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.05, 32]} />
              <meshStandardMaterial color="black" />
            </mesh>

            {/* LEDs Infravermelhos */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(angle) * 0.07, -0.08, 0.09 + Math.sin(angle) * 0.07]}>
                  <sphereGeometry args={[0.008, 16, 16]} />
                  <meshStandardMaterial color="gray" emissive="red" emissiveIntensity={0.5} />
                </mesh>
              );
            })}
          </group>

          {/* Telhado metálico */}
          <mesh position={[0, 1.8, 0]} castShadow>
            <boxGeometry args={[3.2, 0.1, 1.5]} />
            <meshStandardMaterial color="lightgrey" metalness={1.5} roughness={0.3} />
          </mesh>

          {/* Borda ao redor do vidro lateral */}
          <group>
            {/* Borda inferior */}
            <mesh position={[1.45, 0.19, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <boxGeometry args={[1.4, 0.05, 0.05]} />
              <meshStandardMaterial color="black" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Borda direita */}
            <mesh position={[1.45, 1, 0.7]} castShadow>
              <boxGeometry args={[0.05, 1.68, 0.05]} />
              <meshStandardMaterial color="black" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Borda painel traseiro */}
            <mesh position={[0, 0.19, -0.65]} castShadow>
              <boxGeometry args={[2.8, 0.05, 0.05]} />
              <meshStandardMaterial color="black" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>

          {/* Pilar de Suporte na Esquina */}
          <mesh position={[1.45, 0.9, -0.65]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1.8, 16]} />
            <meshStandardMaterial color="black" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Pilar de Suporte na Esquina 2*/}
          <mesh position={[-1.45, 0.9, -0.65]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1.8, 16]} />
            <meshStandardMaterial color="black" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Parede Lateral de Vidro */}
          <mesh position={[1.45, 1, 0]}>
            <boxGeometry args={[0.05, 1.6, 1.4]} />
            <meshStandardMaterial color="skyblue" transparent opacity={0.3} />
          </mesh>

          {/* Pilares laterais metálicos */}
          <mesh position={[-1.45, 0.9, 0]} castShadow>
            <boxGeometry args={[0.1, 1.7, 1.5]} />
            <meshStandardMaterial color="black" metalness={1.5} roughness={0.4} />
          </mesh>

          {/* Painéis de vidro */}
          <mesh position={[0, 1.03, -0.65]}>
            <boxGeometry args={[2.8, 1.6, 0.05]} />
            <meshStandardMaterial color="skyblue" transparent opacity={0.3} />
          </mesh>

          {/* Banco de Madeira */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.1, 0.4]} />
            <meshStandardMaterial color="brown" />
          </mesh>

          {/* Suporte do banco */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>

          {/* Placa de horários com a imagem aplicada */}
          <mesh position={[0, 1.4, -0.55]} castShadow>
            <boxGeometry args={[1.2, 0.6, 0.02]} />
            <meshStandardMaterial map={horarioTexture} />
          </mesh>

          {/* Cartaz Publicitário na Lateral */}
          <mesh position={[-1.4, 0.97, 0]} castShadow>
            <boxGeometry args={[0.05, 1.5, 1]} />
            <meshStandardMaterial map={anuncioTexture} />
          </mesh>

          {/* Poste da Paragem */}
          <mesh position={[2.2, 1, 0.2]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 2, 16]} />
            <meshStandardMaterial color="gray" />
          </mesh>

          {/* Painel Informativo Estilo TV */}
          <group position={[2.2, 1.75, 0.2]} rotation={[0, 0, 0]}>
            {/* Estrutura da TV (Bordas) */}
            <mesh castShadow>
              <boxGeometry args={[0.75, 0.4, 0.06]} />
              <meshStandardMaterial color="black" />
            </mesh>

            {/* Tela da TV (Parte Interna) */}
            <mesh position={[0, 0, 0.03]} castShadow>
              <boxGeometry args={[0.65, 0.3, 0.02]} />
              <meshStandardMaterial color="darkgray" />
            </mesh>

            {/* Texto com o Próximo Autocarro */}
            <Text position={[0, 0.07, 0.05]} fontSize={0.072} color="white" anchorX="center" anchorY="middle">
              Próximo Autocarro:
            </Text>
            <Text position={[0, -0.05, 0.05]} fontSize={0.12} color="white" anchorX="center" anchorY="middle">
              {proximoAutocarro}
            </Text>
          </group>

          {/* Máquina de Tickets */}
          <group position={[-1, -0.1, 1]} rotation={[0, Math.PI / 10, 0]}>
            {/* Base da Máquina */}
            <mesh position={[0, 0.6, 0]} castShadow>
              <boxGeometry args={[0.15, 1.2, 0.15]} />
              <meshStandardMaterial color="black" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Parte Amarela */}
            <mesh position={[0, 1.2, 0.07]} castShadow>
              <boxGeometry args={[0.2, 0.25, 0.02]} />
              <meshStandardMaterial color="yellow" />
            </mesh>

            {/* Ecrã da Máquina */}
            <mesh position={[0, 1.25, 0.08]} castShadow>
              <boxGeometry args={[0.15, 0.1, 0.01]} />
              <meshStandardMaterial color="#333333" />
            </mesh>

            {/* Texto do Ecrã */}
            <Text position={[0, 1.26, 0.09]} fontSize={0.02} color="white" anchorX="center" anchorY="middle">
              Validar Bilhete
            </Text>

            {/* Leitor de Bilhetes */}
            <mesh position={[0, 1.15, 0.08]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.015, 32]} />
              <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Botão de Confirmação */}
            <mesh position={[0, 1.05, 0.08]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.01, 32]} />
              <meshStandardMaterial color="red" emissive="red" emissiveIntensity={1} />
            </mesh>
          </group>
        </group>

        {/* Controles para visualizar melhor - configurados para focar melhor na paragem */}
        <OrbitControls 
          enableRotate={true} 
          enableZoom={true} 
          enablePan={true} 
          minDistance={2} 
          maxDistance={7} 
          target={[0, 1, 0]} 
          minPolarAngle={0.2} 
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
      </Canvas>
    </div>
  );
};

export default BusStop3D;