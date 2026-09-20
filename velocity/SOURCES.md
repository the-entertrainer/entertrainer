# Velocity: model and source notes

All vectors use kilometres and seconds in a common approximate J2000 equatorial
frame. The UI shows their magnitudes, never a sum of displayed scalar speeds.
The observer is stationary on the WGS84 ellipsoid at sea level. There is no GPS
velocity, walking/driving, altitude correction, or server telemetry.

- **Earth spin:** WGS84 equatorial radius 6378.137 km, eccentricity squared
  0.00669437999014, sidereal day 86164.0905 s. Longitude and Greenwich mean
  sidereal angle set the velocity direction. UTC approximates UT1; precession,
  nutation, polar motion and tidal effects are omitted.
  [USNO sidereal time](https://aa.usno.navy.mil/faq/GAST).
- **Sun:** Kepler solution using JPL's approximate Earth–Moon barycentre
  elements and rates for 1800–2050, plus local spin. Uses solar GM
  1.32712440018e11 km³/s² and AU 149597870.7 km. This is not a high-precision
  Earth ephemeris: the Earth–Moon offset and planetary perturbations are omitted.
  [JPL elements, table 1](https://ssd.jpl.nasa.gov/planets/approx_pos.html).
- **Milky Way:** local circular velocity 229 km/s, plus solar peculiar motion
  (U,V,W) = (11.1,12.24,7.25) km/s, plus observer heliocentric velocity.
  Standard ICRS/Galactic rotation matrix; the model has several-percent galactic
  systematic uncertainty. Readouts are deliberately rounded. The approximate
  210 Myr circuit assumes 8.2 kpc and this solar speed, not a measured orbital period.
  [Eilers et al. 2019](https://arxiv.org/abs/1810.09466),
  [Schönrich et al. 2010](https://arxiv.org/abs/0912.3693).
- **CMB:** solar dipole 369.82 km/s towards Galactic longitude 264.021°,
  latitude 48.253°, plus observer heliocentric velocity.
  [Planck 2018 results I](https://arxiv.org/abs/1807.06205).

Updates use the device clock. Real elapsed distance integrates independent frame
speeds with a monotonic clock and trapezoidal averaging. Browser suspension may
reduce integration accuracy over long gaps. Illustration rate and pause do not
change distance; changing location resets counters. Unsupported dates show an
error rather than extrapolating the orbital model.

## Rendering scope

Three.js WebGL, PBR materials, ACES filmic tone mapping, restrained bloom, normal
and ocean roughness maps, night-side emission, cloud alpha/shadows and an
approximate atmospheric limb. This is a real-time browser renderer, not Blender
or Eevee, and is not a physically complete atmospheric simulation.

Earth has an ellipsoidal surface and a marked selected latitude. Default Earth
rotation and Sun direction start from the device time; playback is accelerated.
The Sun view retains orbital eccentricity and Kepler timing but changes object
sizes and distances for readability. The galaxy is a seeded barred-spiral point
reconstruction, not a star catalogue or an outside photograph. The CMB view is a
labelled, exaggerated dipole diagram, not a physical shell or Planck sky map.
Clouds are static illustrative texture data, not current weather. Sun imagery
is an equirectangular surface map, not a flat disk photograph wrapped on a sphere.

Texture provenance and license notices: `public/velocity/ATTRIBUTION.md`.
