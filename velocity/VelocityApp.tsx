import { useEffect, useRef, useState } from "react";
import { createEngine, type VelocityEngine, type Quality } from "./engine";
import {
  SCALES,
  LOCATIONS,
  type ScaleId,
  type SpeedUnit,
  formatSpeed,
  formatDistance,
  latHemisphere,
} from "./scales";
import {
  snapshot,
  advanceDistance,
  C_KM_S,
  type MotionSnapshot,
} from "./physics";
import "./velocity.css";
const zeroDistances = () => ({ earth: 0, sun: 0, galaxy: 0, cosmos: 0 });
type Location = { name: string; lat: number; lon: number };
export function VelocityApp() {
  const year = new Date().getUTCFullYear();
  if (year < 1800 || year > 2050)
    return (
      <main className="vel-app" style={{ padding: 32 }}>
        <h1>Check your device date</h1>
        <p>
          Velocity’s orbital model supports 1800–2050. Correct the date and
          reload this page.
        </p>
        <a href="/engage">← Back to Engage</a>
      </main>
    );
  return <VelocityExperience />;
}
function VelocityExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null),
    engineRef = useRef<VelocityEngine | null>(null),
    dialogRef = useRef<HTMLDialogElement>(null),
    stageRef = useRef<HTMLElement>(null);
  const [frame, setFrame] = useState<ScaleId>("earth"),
    [unit, setUnit] = useState<SpeedUnit>("km/h");
  const [location, setLocation] = useState<Location>(LOCATIONS[0]),
    locationRef = useRef(location);
  const [motion, setMotion] = useState<MotionSnapshot>(() =>
    snapshot(new Date(), location.lat, location.lon),
  );
  const [distances, setDistances] = useState(zeroDistances),
    [ready, setReady] = useState(false),
    [loading, setLoading] = useState(0);
  const [sceneError, setSceneError] = useState(""),
    [readoutError, setReadoutError] = useState(""),
    [retry, setRetry] = useState(0);
  const [paused, setPaused] = useState(
    () =>
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.reduceMotion === "on",
  );
  const [rate, setRate] = useState(1),
    [quality, setQuality] = useState<Quality>("balanced"),
    [modal, setModal] = useState<"location" | "science" | null>(null),
    [geoMessage, setGeoMessage] = useState(""),
    [locating, setLocating] = useState(false);
  const sessionRef = useRef({ last: performance.now(), speeds: motion.speeds });
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    locationRef.current = location;
    try {
      const current = snapshot(new Date(), location.lat, location.lon);
      setMotion(current);
      setDistances(zeroDistances());
      sessionRef.current = { last: performance.now(), speeds: current.speeds };
    } catch {
      setReadoutError("Check your device date. This model supports 1800–2050.");
    }
    engineRef.current?.setLocation(location.lat, location.lon);
  }, [location]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      try {
        const now = performance.now(),
          selected = locationRef.current,
          current = snapshot(new Date(), selected.lat, selected.lon),
          previous = sessionRef.current;
        const average = {
          earth: (current.speeds.earth + previous.speeds.earth) / 2,
          sun: (current.speeds.sun + previous.speeds.sun) / 2,
          galaxy: (current.speeds.galaxy + previous.speeds.galaxy) / 2,
          cosmos: (current.speeds.cosmos + previous.speeds.cosmos) / 2,
        };
        setDistances((value) =>
          advanceDistance(value, average, (now - previous.last) / 1000),
        );
        sessionRef.current = { last: now, speeds: current.speeds };
        setMotion(current);
        setReadoutError("");
      } catch {
        setReadoutError(
          "Check your device date. This model supports 1800–2050.",
        );
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let active = true;
    setReady(false);
    setLoading(0);
    setSceneError("");
    try {
      const engine = createEngine({
        canvas,
        lat: location.lat,
        lon: location.lon,
        scale: frame,
        paused,
        quality,
        onReady: () => {
          if (active) setReady(true);
        },
        onProgress: (loaded, total) => {
          if (active) setLoading(Math.round((loaded / total) * 100));
        },
        onError: (message) => {
          if (active) setSceneError(message);
        },
      });
      engineRef.current = engine;
      engine.setRate(rate);
      return () => {
        active = false;
        engine.dispose();
        engineRef.current = null;
      };
    } catch {
      setSceneError(
        "3D is unavailable in this browser. The speed estimates and comparisons still work.",
      );
      setReady(true);
    }
    return () => {
      active = false;
    };
    // Quality intentionally rebuilds GPU resources; ordinary controls use setters.
  }, [quality, retry]);
  useEffect(() => {
    engineRef.current?.setScale(frame);
  }, [frame]);
  useEffect(() => {
    engineRef.current?.setPaused(paused);
  }, [paused]);
  useEffect(() => {
    engineRef.current?.setRate(rate);
  }, [rate]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (modal && !dialog?.open) dialog?.showModal();
    else if (!modal && dialog?.open) dialog.close();
  }, [modal]);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      if (preference.matches) setPaused(true);
    };
    preference.addEventListener("change", change);
    return () => preference.removeEventListener("change", change);
  }, []);
  const def = SCALES.find((s) => s.id === frame)!,
    speed = motion.speeds[frame],
    index = SCALES.findIndex((s) => s.id === frame);
  function choose(id: ScaleId) {
    setFrame(id);
  }
  function resetDistance() {
    setDistances(zeroDistances());
    sessionRef.current = { last: performance.now(), speeds: motion.speeds };
  }
  function locate() {
    if (!navigator.geolocation) {
      setGeoMessage(
        "Location is unavailable. Choose a city or adjust the coordinates.",
      );
      return;
    }
    setLocating(true);
    setGeoMessage("Waiting for location permission…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!alive.current) return;
        setLocation({
          name: "Your selected location",
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setGeoMessage(
          "Location applied on this device. Nothing is sent to a server.",
        );
        setLocating(false);
      },
      () => {
        if (!alive.current) return;
        setGeoMessage(
          "Location was not available. You can choose a place manually.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }
  const animation =
    frame === "earth"
      ? `One turn in ${Math.round(48 / rate)} seconds`
      : frame === "sun"
        ? `One orbit in ${Math.round(60 / rate)} seconds`
        : frame === "galaxy"
          ? `One circuit in ${Math.round(90 / rate)} seconds`
          : "Temperature difference exaggerated";
  return (
    <div className="vel-app">
      <a className="vel-skip" href="#velocity-readout">
        Skip to speed readout
      </a>
      <header className="vel-header">
        <a href="/engage" className="vel-back">
          ← Engage
        </a>
        <a href="/" className="vel-wordmark">
          Entertrainer<span>.</span>
        </a>
        <button className="vel-text" onClick={() => setModal("science")}>
          How we know ↗
        </button>
      </header>
      <main className="vel-main">
        <section
          className="vel-readout"
          id="velocity-readout"
          aria-labelledby="velocity-title"
        >
          <p className="vel-eyebrow">
            <span>VELOCITY</span> A CHANGE OF PERSPECTIVE
          </p>
          <h1 id="velocity-title">{def.headline}</h1>
          <p className="vel-intro">Right now, at your selected location:</p>
          <div className="vel-number">
            <span className="vel-approx" aria-label="approximately">
              ≈
            </span>
            <strong>
              {readoutError
                ? "—"
                : formatSpeed(speed, unit, frame === "galaxy")}
            </strong>
          </div>
          <div className="vel-unit-row">
            <label>
              <span className="vel-sr">Speed unit</span>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as SpeedUnit)}
              >
                <option>km/h</option>
                <option>km/s</option>
                <option>mph</option>
              </select>
            </label>
            <span>
              {frame === "galaxy"
                ? "Galactic model estimate"
                : "Current model estimate"}
            </span>
          </div>
          <p className="vel-relative">
            Relative to <strong>{def.reference}</strong>
          </p>
          {readoutError && (
            <p role="alert" className="vel-error">
              {readoutError}
            </p>
          )}
          <button className="vel-location" onClick={() => setModal("location")}>
            <span className="vel-location-dot" aria-hidden="true" />
            <span>
              <strong>{location.name}</strong>
              <small>
                {latHemisphere(location.lat)} ·{" "}
                {Math.abs(location.lon).toFixed(1)}°
                {location.lon < 0 ? "W" : "E"}
              </small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
          <p className="vel-description">{def.description}</p>
          <dl className="vel-moments">
            <div>
              <dt>In one second</dt>
              <dd>
                {speed < 1
                  ? `${Math.round(speed * 1000)} metres`
                  : formatDistance(speed, "km/s")}
              </dd>
            </div>
            <div>
              <dt>
                Since reset{" "}
                <button
                  aria-label="Reset distance counters"
                  onClick={resetDistance}
                >
                  ↺
                </button>
              </dt>
              <dd>{formatDistance(distances[frame], unit)}</dd>
            </div>
          </dl>
          <p className="vel-clock">
            <time dateTime={new Date(motion.timestamp).toISOString()}>
              {new Date(motion.timestamp).toLocaleTimeString("en-GB", {
                timeZone: "UTC",
              })}{" "}
              UTC
            </time>
            <span>Calculated here · no live tracking</span>
          </p>
        </section>
        <section
          className="vel-stage"
          ref={stageRef}
          aria-label={`${def.name} 3D illustration`}
        >
          <canvas
            ref={canvasRef}
            className="vel-canvas"
            aria-label={`Drag to rotate the ${def.name} view. Pinch or scroll to zoom. Use Reset view to return.`}
            role="img"
          />
          <div className="vel-scene-top">
            <span className="vel-scene-index">0{index + 1} / 04</span>
            <span>{def.label}</span>
            <button onClick={() => engineRef.current?.resetView()}>
              Reset view
            </button>
          </div>
          {!ready && (
            <div className="vel-loading" role="status">
              <span className="vel-loading-orbit" aria-hidden="true" />
              <strong>Preparing your view</strong>
              <span>Surface textures · {loading}%</span>
            </div>
          )}
          {sceneError && (
            <div className="vel-scene-error" role="status">
              <p>{sceneError}</p>
              <button onClick={() => setRetry((n) => n + 1)}>
                Reload scene
              </button>
            </div>
          )}
          <div className="vel-scene-bottom">
            <div>
              <p>{def.period}</p>
              <span>Drag to explore · scroll or pinch to zoom</span>
            </div>
            {frame === "earth" && (
              <button onClick={() => engineRef.current?.focusLocation()}>
                Find my location
              </button>
            )}
          </div>
          <div className="vel-scene-controls">
            <button
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
            >
              {paused ? "Play illustration" : "Pause illustration"}
            </button>
            <label>
              <span className="vel-sr">Illustration speed</span>
              <select
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              >
                <option value={0.5}>0.5× motion</option>
                <option value={1}>1× motion</option>
                <option value={2}>2× motion</option>
              </select>
            </label>
            <label>
              <span className="vel-sr">Render quality</span>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as Quality)}
              >
                <option value="balanced">Balanced · 4K</option>
                <option value="high">High · up to 8K Earth</option>
              </select>
            </label>
          </div>
          <p className="vel-scene-note">
            {animation}. {def.sceneNote}.
          </p>
        </section>
        <nav className="vel-frames" aria-label="Choose a reference frame">
          {SCALES.map((item, i) => (
            <button
              key={item.id}
              onClick={() => choose(item.id)}
              aria-pressed={frame === item.id}
              className={frame === item.id ? "is-selected" : ""}
            >
              <span className="vel-frame-top">
                <span>0{i + 1}</span>
                <span aria-hidden="true">{frame === item.id ? "●" : "↗"}</span>
              </span>
              <strong>{item.name}</strong>
              <span className="vel-card-speed">
                ≈{" "}
                {formatSpeed(
                  motion.speeds[item.id],
                  unit,
                  item.id === "galaxy",
                )}{" "}
                <small>{unit}</small>
              </span>
              <span className="vel-card-caption">
                {item.id === "earth"
                  ? "Your latitude matters"
                  : item.id === "sun"
                    ? "The annual orbit"
                    : item.id === "galaxy"
                      ? "The Sun’s galactic journey"
                      : "The oldest light we can see"}
              </span>
            </button>
          ))}
        </nav>
        <div className="vel-takeaway">
          <span className="vel-takeaway-label">THE THING TO REMEMBER</span>
          <p>{def.fact}</p>
          <button onClick={() => setModal("science")}>
            The science & sources ↗
          </button>
        </div>
      </main>
      <footer className="vel-footer">
        <span>Velocity / Entertrainer</span>
        <span>Different reference frames. No single absolute speed.</span>
      </footer>
      <dialog
        className="vel-dialog"
        ref={dialogRef}
        onCancel={() => setModal(null)}
        onClose={() => setModal(null)}
        aria-labelledby="vel-dialog-title"
      >
        <div className="vel-dialog-head">
          <h2 id="vel-dialog-title">
            {modal === "location"
              ? "Where are you watching from?"
              : "What these numbers mean"}
          </h2>
          <button aria-label="Close dialog" onClick={() => setModal(null)}>
            ×
          </button>
        </div>
        {modal === "location" ? (
          <div className="vel-dialog-content">
            <p>
              Your latitude changes your speed around Earth’s axis. Location
              stays in this session.
            </p>
            <label className="vel-field">
              Choose a place
              <select
                value={
                  LOCATIONS.some((p) => p.name === location.name)
                    ? location.name
                    : "custom"
                }
                onChange={(e) => {
                  const next = LOCATIONS.find((p) => p.name === e.target.value);
                  if (next) setLocation(next);
                }}
              >
                {LOCATIONS.map((p) => (
                  <option key={p.name}>{p.name}</option>
                ))}
                <option value="custom">Custom location</option>
              </select>
            </label>
            <label className="vel-field">
              Latitude: {latHemisphere(location.lat)}
              <input
                type="range"
                min="-90"
                max="90"
                step=".1"
                value={location.lat}
                onChange={(e) =>
                  setLocation({
                    ...location,
                    name: "Custom location",
                    lat: Number(e.target.value),
                  })
                }
              />
            </label>
            <label className="vel-field">
              Longitude: {location.lon.toFixed(1)}°
              <input
                type="range"
                min="-180"
                max="180"
                step=".1"
                value={location.lon}
                onChange={(e) =>
                  setLocation({
                    ...location,
                    name: "Custom location",
                    lon: Number(e.target.value),
                  })
                }
              />
            </label>
            <button
              className="vel-primary"
              onClick={locate}
              disabled={locating}
            >
              {locating ? "Finding location…" : "Use my location"}
            </button>
            <p className="vel-small" role="status">
              {geoMessage ||
                "Your browser asks permission first. No account or server request is needed by Velocity."}
            </p>
            <button className="vel-text" onClick={() => setModal(null)}>
              Apply & return to the view →
            </button>
          </div>
        ) : (
          <div className="vel-dialog-content">
            <p>
              All four speeds can be true at once. They measure the same
              observer against different references, so adding the four
              displayed numbers would be wrong.
            </p>
            <h3>What “current” means</h3>
            <p>
              Estimates update using your device’s date, time and selected
              coordinates. We assume you are stationary on the ground at sea
              level. Walking, driving, altitude and GPS velocity are not
              included. The default equatorial location is an example, not a
              detected position.
            </p>
            <h3>How we calculate it</h3>
            <ul>
              <li>
                Earth: latitude-dependent rotation on the WGS84 ellipsoid.
              </li>
              <li>
                Sun: an approximate Earth–Moon orbit plus your local rotational
                velocity.
              </li>
              <li>
                Milky Way: a 229 km/s circular-orbit model plus the Sun’s
                peculiar motion and the Earth/local vectors. Galactic parameters
                have several-percent uncertainty.
              </li>
              <li>
                Ancient light: the measured 369.82 km/s solar-system CMB dipole
                plus the Earth/local vectors.
              </li>
            </ul>
            <p>
              Vectors include direction. Motions can partly reinforce or partly
              cancel each other. These are educational approximations, not
              precision ephemerides or GPS measurements. The orbital
              approximation is valid for 1800–2050.
            </p>
            <h3>The illustration and the clock</h3>
            <p>
              Animations are accelerated so you can see what moves. Pause and
              motion speed affect only the illustration. Distance uses elapsed
              real time and has a separate counter for each reference frame.
              Changing your selected location resets those counters.
            </p>
            <p>
              Planet sizes and orbital distances are adjusted for visibility.
              Clouds and surface maps are illustrative, not live weather. The
              galaxy is a reconstruction. The CMB sphere is an exaggerated
              temperature diagram, not a physical boundary.
            </p>
            <h3>Primary sources</h3>
            <ul className="vel-sources">
              <li>
                <a
                  href="https://ssd.jpl.nasa.gov/planets/approx_pos.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  JPL · approximate planetary elements ↗
                </a>
              </li>
              <li>
                <a
                  href="https://arxiv.org/abs/1807.06205"
                  target="_blank"
                  rel="noreferrer"
                >
                  Planck 2018 · solar-system CMB dipole ↗
                </a>
              </li>
              <li>
                <a
                  href="https://arxiv.org/abs/1810.09466"
                  target="_blank"
                  rel="noreferrer"
                >
                  Eilers et al. · Milky Way circular velocity ↗
                </a>
              </li>
              <li>
                <a
                  href="https://arxiv.org/abs/0912.3693"
                  target="_blank"
                  rel="noreferrer"
                >
                  Schönrich et al. · the Sun’s peculiar motion ↗
                </a>
              </li>
              <li>
                <a
                  href="https://aa.usno.navy.mil/faq/GAST"
                  target="_blank"
                  rel="noreferrer"
                >
                  US Naval Observatory · sidereal time ↗
                </a>
              </li>
            </ul>
            <h3>Texture credits</h3>
            <p>
              Earth day, night, clouds and Sun:{" "}
              <a
                href="https://www.solarsystemscope.com/textures/"
                target="_blank"
                rel="noreferrer"
              >
                Solar System Scope / INOVE
              </a>
              ,{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noreferrer"
              >
                CC BY 4.0
              </a>
              ; resized and WebP-compressed. Earth normal and specular maps:
              Three.js examples, MIT. No remote texture or API requests are
              required while using the app.
            </p>
            <p className="vel-small">
              This frame is approximately {((speed / C_KM_S) * 100).toFixed(4)}%
              of light speed.
            </p>
          </div>
        )}
      </dialog>
    </div>
  );
}
