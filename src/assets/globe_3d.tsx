import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

export type Globe3DHandle = {
  /** The Three.js Group containing the globe sphere + country lines */
  group: THREE.Group | undefined;
  /** The Three.js camera (animate camera.position.z for zoom) */
  camera: THREE.PerspectiveCamera | undefined;
  /** Toggle idle auto-rotation on/off */
  setAutoRotate: (enabled: boolean) => void;
  /** Toggle pointer-drag rotation on/off */
  setDragEnabled: (enabled: boolean) => void;
};

type Globe3DProps = {
  size?: number;
  lineColor?: string;
  sphereColor?: string;
  rotationSpeed?: number;
  initialRotY?: number;
  enableDrag?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

type GlobeInternals = {
  group?: THREE.Group;
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  scene?: THREE.Scene;
};

type GeoGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

type TopoJsonApi = {
  feature: (
    world: { objects: { countries: unknown } },
    countries: unknown,
  ) => { features: Array<{ geometry: GeoGeometry }> };
};

const Globe3D = forwardRef<Globe3DHandle, Globe3DProps>(function Globe3D(
  {
    size = 420,
    lineColor = "#5d0f14",
    sphereColor = "#fff9e9",
    rotationSpeed = 0.002,
    initialRotY = -0.5,
    enableDrag = true,
    className = "",
    style = {},
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internals = useRef<GlobeInternals>({});
  const autoRotateRef = useRef(true);
  const dragEnabledRef = useRef(enableDrag);

  // Keep dragEnabledRef in sync with prop
  useEffect(() => {
    dragEnabledRef.current = enableDrag;
  }, [enableDrag]);

  useImperativeHandle(ref, () => ({
    get group() {
      return internals.current.group;
    },
    get camera() {
      return internals.current.camera;
    },
    setAutoRotate(enabled: boolean) {
      autoRotateRef.current = enabled;
    },
    setDragEnabled(enabled: boolean) {
      dragEnabledRef.current = enabled;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    camera.position.z = 2.6;

    const radius = 1;
    const group = new THREE.Group();
    scene.add(group);

    // Sphere fill (the "body" of the globe)
    const sphereGeometry = new THREE.SphereGeometry(radius, 64, 64);
    group.add(
      new THREE.Mesh(
        sphereGeometry,
        new THREE.MeshBasicMaterial({ color: new THREE.Color(sphereColor) }),
      ),
    );

    // Subtle rim/outline shadow
    const rimGeometry = new THREE.SphereGeometry(radius + 0.018, 64, 64);
    group.add(
      new THREE.Mesh(
        rimGeometry,
        new THREE.MeshBasicMaterial({
          color: 0x333333,
          transparent: true,
          opacity: 0.12,
          side: THREE.BackSide,
        }),
      ),
    );

    // Country border lines
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(lineColor),
    });

    function ll2v(lat: number, lng: number) {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + 180) * Math.PI) / 180;
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      );
    }

    function addRing(coords: number[][]) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < coords.length - 1; i += 1) {
        pts.push(ll2v(coords[i][1], coords[i][0]));
        pts.push(ll2v(coords[i + 1][1], coords[i + 1][0]));
      }
      if (!pts.length) return;
      group.add(
        new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(pts),
          lineMat,
        ),
      );
    }

    function addFeature(geom: GeoGeometry) {
      if (geom.type === "Polygon") {
        (geom.coordinates as number[][][]).forEach(addRing);
      }
      if (geom.type === "MultiPolygon") {
        (geom.coordinates as number[][][][]).forEach((polygon) =>
          polygon.forEach(addRing),
        );
      }
    }

    // Load world topology
    void (async () => {
      try {
        const [topoSrc, world] = await Promise.all([
          fetch(
            "https://unpkg.com/topojson-client@3/dist/topojson-client.min.js",
          ).then((r) => r.text()),
          fetch("https://unpkg.com/world-atlas@2/countries-110m.json").then(
            (r) => r.json(),
          ),
        ]);

        const topoModule = { exports: {} };
        new Function("module", "exports", topoSrc)(
          topoModule,
          topoModule.exports,
        );

        const topojson = topoModule.exports as TopoJsonApi;
        topojson
          .feature(world, world.objects.countries)
          .features.forEach((f) => addFeature(f.geometry));
      } catch {
        // Fallback: wireframe sphere
        group.add(
          new THREE.LineSegments(
            new THREE.WireframeGeometry(
              new THREE.SphereGeometry(radius, 32, 32),
            ),
            new THREE.LineBasicMaterial({
              color: new THREE.Color(lineColor),
              opacity: 0.15,
              transparent: true,
            }),
          ),
        );
      }
    })();

    group.rotation.x = 0.28;
    group.rotation.y = initialRotY;

    /* ─── Pointer drag ─── */
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let animationId = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (!dragEnabledRef.current) return;
      isDragging = true;
      prevX = event.clientX;
      prevY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const dx = event.clientX - prevX;
      const dy = event.clientY - prevY;
      group.rotation.y += dx * 0.005;
      group.rotation.x += dy * 0.003;
      group.rotation.x = Math.max(-1.2, Math.min(1.2, group.rotation.x));
      prevX = event.clientX;
      prevY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      isDragging = false;
      canvas.releasePointerCapture(event.pointerId);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    /* ─── Render loop ─── */
    function animate() {
      animationId = requestAnimationFrame(animate);

      // Auto-rotate only when enabled and not dragging
      if (!isDragging && autoRotateRef.current) {
        group.rotation.y += rotationSpeed;
      }

      renderer.render(scene, camera);
    }

    animate();

    internals.current = { group, camera, renderer, scene };

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      renderer.dispose();
      sphereGeometry.dispose();
      rimGeometry.dispose();
      lineMat.dispose();
    };
  }, [initialRotY, lineColor, rotationSpeed, size, sphereColor]);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        background: "transparent",
        cursor: enableDrag ? "grab" : "default",
        userSelect: "none",
        flexShrink: 0,
        touchAction: "none",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: size, height: size }}
      />
    </div>
  );
});

export default Globe3D;
