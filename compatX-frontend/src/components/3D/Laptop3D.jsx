import { Canvas } from "@react-three/fiber";

import { OrbitControls, useGLTF, Float, Html, GizmoHelper, GizmoViewport } from "@react-three/drei";

import { Suspense } from "react";

function LaptopModel() {
  // AUTO-LOADING YOUR FILE FROM PUBLIC
  const { scene } = useGLTF("/models/cyberpunk_laptop.glb");
  //  console.log(scene); 

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.6}
      floatIntensity={1.3}
    >
                    <primitive
                object={scene}
                scale={1.1}
                position={[ -0.4, -0.5, 0 ]}
                rotation={[ 0, -0.25, 0 ]}
                />


    </Float>
  );
}

export default function Laptop3D() {
  return (
    <div className="w-[300px] h-[300px] md:w-[420px] md:h-[420px] mx-auto">
      <Canvas camera={{ position: [0, 1, 4.5], fov: 45 }}>
        

        <Suspense fallback={<Html>Loading model...</Html>}>

          {/* Lights */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[0, 2, 2]} intensity={2} color="#a78bfa" />
          <pointLight position={[-2, -2, -1]} intensity={1.1} color="#818cf8" />

          {/* Model */}
          <LaptopModel />

          {/* User rotation */}
          <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.8} />

        </Suspense>
      </Canvas>
    </div>
  );
}
