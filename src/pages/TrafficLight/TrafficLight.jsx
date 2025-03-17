import React from "react";

const Semaforo = ({ estado, position }) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0, 1, 0.6]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={estado === "vermelho" ? "red" : "gray"} />
      </mesh>
      <mesh position={[0, 0, 0.6]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={estado === "amarelo" ? "yellow" : "gray"} />
      </mesh>
      <mesh position={[0, -1, 0.6]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={estado === "verde" ? "green" : "gray"} />
      </mesh>
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 5, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  );
};

export default Semaforo;