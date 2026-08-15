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
  size?: number | string;
  lineColor?: string;
  sphereColor?: string;
  rotationSpeed?: number;
  initialRotX?: number;
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
    size = 900,
    lineColor = "#5d0f14",
    sphereColor = "#fff9e9",
    rotationSpeed = 0.002,
    initialRotX = 0.2,
    initialRotY = 0,
    enableDrag = true,
    className = "",
    style = {},
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
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
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    /*
     * Camera distance 3.0 ensures the unit-radius sphere
     * (visual half-angle ≈ asin(1/3) ≈ 19.5°) fits comfortably
     * within the 45° FOV (half = 22.5°), leaving ~3° margin
     * on every side and eliminating the rectangular-clipping artifact.
     */
    /*
     * near = 0.1, not 0.01: the closest the camera ever gets is z 1.3 (the
     * country zoom-in), where the nearest geometry sits at ~0.28, so 0.1 is
     * still a comfortable margin — and it buys ~10x the depth-buffer precision,
     * which is what keeps the country lines from sparkling against the sphere
     * when zoomed in.
     */
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3.0;

    const resizeRenderer = () => {
      const rect = container.getBoundingClientRect();
      const fallbackSize = typeof size === "number" ? size : 900;
      const width = Math.max(1, Math.round(rect.width || fallbackSize));
      const height = Math.max(1, Math.round(rect.height || fallbackSize));

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resizeRenderer();
    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(container);

    const radius = 1;
    const group = new THREE.Group();
    scene.add(group);

    /*
     * YXZ keeps horizontal globe spin isolated from the fixed presentation
     * tilt. Country focus logic can then center latitude with translation
     * instead of pitching the globe per country.
     */
    group.rotation.order = "YXZ";

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

    /*
     * Every country ring feeds ONE shared vertex buffer. Giving each ring its
     * own LineSegments meant hundreds of draw calls per frame, which is what
     * made the scroll-driven rotation stutter once the globe was scaled up to
     * full-viewport size.
     */
    const linePositions: number[] = [];

    /* Lifted 0.2% off the surface so the borders aren't exactly coplanar with
       the sphere. Sub-pixel at any real size, but it removes the depth tie that
       makes lines flicker in and out at grazing angles. */
    const lineRadius = radius * 1.002;

    function pushVertex(lat: number, lng: number) {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + 180) * Math.PI) / 180;
      const sinPhi = Math.sin(phi);
      linePositions.push(
        -lineRadius * sinPhi * Math.cos(theta),
        lineRadius * Math.cos(phi),
        lineRadius * sinPhi * Math.sin(theta),
      );
    }

    function addRing(coords: number[][]) {
      for (let i = 0; i < coords.length - 1; i += 1) {
        pushVertex(coords[i][1], coords[i][0]);
        pushVertex(coords[i + 1][1], coords[i + 1][0]);
      }
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

    // Load world topology. The effect can be torn down before this resolves,
    // so nothing is added to the scene after `disposed` flips.
    let disposed = false;
    let lineGeometry: THREE.BufferGeometry | undefined;
    let fallbackGeometry: THREE.WireframeGeometry | undefined;
    let fallbackMat: THREE.LineBasicMaterial | undefined;

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

        if (disposed || !linePositions.length) return;

        lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(linePositions, 3),
        );
        group.add(new THREE.LineSegments(lineGeometry, lineMat));
      } catch {
        if (disposed) return;

        // Fallback: wireframe sphere
        const fallbackSphere = new THREE.SphereGeometry(radius, 32, 32);
        fallbackGeometry = new THREE.WireframeGeometry(fallbackSphere);
        fallbackSphere.dispose();
        fallbackMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(lineColor),
          opacity: 0.15,
          transparent: true,
        });
        group.add(new THREE.LineSegments(fallbackGeometry, fallbackMat));
      }
    })();

    group.rotation.x = initialRotX;
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
      disposed = true;
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      renderer.dispose();
      sphereGeometry.dispose();
      rimGeometry.dispose();
      lineMat.dispose();
      lineGeometry?.dispose();
      fallbackGeometry?.dispose();
      fallbackMat?.dispose();
    };
  }, [initialRotX, initialRotY, lineColor, rotationSpeed, size, sphereColor]);

  return (
    <div
      ref={containerRef}
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
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: "none",
          outline: "none",
        }}
      />
    </div>
  );
});

export default Globe3D;
