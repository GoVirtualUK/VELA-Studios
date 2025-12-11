import React, { Suspense, useEffect, ReactNode, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, useVideoTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { MediaType, MediaSource } from '../types';
import { Loader } from './Loader';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Simple Error Boundary Component for R3F
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error("360 Viewer Error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Html center>
          <div className="text-red-500 bg-black/80 p-4 rounded border border-red-500 text-center w-64">
            <p className="font-bold mb-2">Failed to load media</p>
            <p className="text-xs text-gray-300">The image URL could not be accessed. Please try uploading a file directly.</p>
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

// Component to render Image Spheres
const ImageSphere: React.FC<{ url: string }> = ({ url }) => {
  const texture = useTexture(url);
  // Equirectangular images need to be mapped to the inside of the sphere
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
};

// Component to render Video Spheres
interface VideoSphereProps {
  url: string;
}

const VideoSphere: React.FC<VideoSphereProps> = ({ url }) => {
  // useVideoTexture manages the video element lifecycle
  const texture = useVideoTexture(url, {
    unsuspend: 'canplay',
    muted: false,
    loop: true,
    start: true,
    playsInline: true,
  });

  // Store pointer down position to distinguish click vs drag
  const pointerDownPos = useRef<{ x: number, y: number } | null>(null);

  const handlePointerDown = (e: any) => {
    // e.clientX/Y are available on R3F pointer events
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: any) => {
    // Prevent event from bubbling to other 3D objects if any
    e.stopPropagation();
    
    if (!pointerDownPos.current) return;

    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If movement is significant (e.g. > 5px), consider it a drag interaction and do not toggle video
    if (distance > 5) {
      return;
    }

    const video = texture.image;
    if (video instanceof HTMLVideoElement) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  return (
    <mesh 
      scale={[-1, 1, 1]} 
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
};

// Camera reset helper
const CameraReset: React.FC = () => {
    const { camera } = useThree();
    useEffect(() => {
        camera.position.set(0, 0, 0.1); // Slightly offset from center to ensure controls work smoothly
    }, [camera]);
    return null;
}

interface ViewerProps {
  media: MediaSource;
}

export const Viewer: React.FC<ViewerProps> = ({ media }) => {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
        <CameraReset />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={-0.5} // Negative speed feels more natural for "dragging the world" inside a sphere
        />
        
        <ErrorBoundary key={media.url}>
          <Suspense fallback={<Html center><Loader /></Html>}>
            {media.type === MediaType.IMAGE ? (
              <ImageSphere url={media.url} />
            ) : (
              <VideoSphere url={media.url} />
            )}
          </Suspense>
        </ErrorBoundary>
      </Canvas>
    </div>
  );
};