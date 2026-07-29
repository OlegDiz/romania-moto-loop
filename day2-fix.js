(() => {
  const day2 = days.find(day => day.d === 2);
  if (!day2) return;

  const urdele = pt('Urdele Pass', 45.3457, 23.6649, 'Highest and most dramatic Transalpina section');
  const oasa = pt('Oașa Lake', 45.5833, 23.6197, 'Natural rest point directly along the Transalpina route');
  const calnic = pt('Câlnic Citadel', 45.8873, 23.6573, 'Optional detour only; excluded from the default navigation route');

  // Day 2 must follow the road in this exact order. Câlnic was previously
  // included as a mandatory waypoint and could pull Google Maps away from
  // the intended Transalpina line or create an awkward final leg.
  day2.st = [urdele, oasa];
  day2.optionalStops = [calnic];
  day2.km = '≈ 235–260 km';
  day2.t = '5–7h';
  day2.note = 'Verified order: Rânca → Urdele Pass → Oașa Lake → Sibiu. Câlnic is optional and is not forced into navigation.';

  // Use the precise ordered waypoints and explicitly avoid ferries.
  const baseGoogleDirections = googleDirections;
  googleDirections = function(day, fromLive = false) {
    if (day.d !== 2) return baseGoogleDirections(day, fromLive);
    const q = new URLSearchParams({
      api: '1',
      destination: coord(day.end),
      travelmode: 'driving',
      avoid: 'ferries'
    });
    if (!fromLive) q.set('origin', coord(day.start));
    q.set('waypoints', [urdele, oasa].map(coord).join('|'));
    return `https://www.google.com/maps/dir/?${q}`;
  };

  // Add the missing Day 2 route point to the overview map and draw the
  // verified segment separately so the overview and Google Maps agree.
  if (typeof map !== 'undefined' && map) {
    L.marker([oasa.lat, oasa.lon]).addTo(map).bindPopup(
      '<b>Oașa Lake</b><br>Day 2 verified waypoint<br><a target="_blank" rel="noopener" href="' + googleSearch('Oașa Lake') + '">Google Maps</a>'
    );
    L.polyline([
      [day2.start.lat, day2.start.lon],
      [urdele.lat, urdele.lon],
      [oasa.lat, oasa.lon],
      [day2.end.lat, day2.end.lon]
    ], { color: '#d97706', weight: 6, opacity: 0.9 }).addTo(map)
      .bindPopup('Verified Day 2 route');
  }

  const originalShowDay = showDay;
  showDay = async function(n) {
    await originalShowDay(n);
    if (n !== 2) return;
    const detail = document.querySelector('#detailContent');
    if (!detail || detail.querySelector('[data-day2-debug]')) return;
    const block = document.createElement('div');
    block.dataset.day2Debug = 'true';
    block.className = 'note';
    block.innerHTML = `
      <b>Day 2 route check</b>
      <p>The default navigation now follows Rânca → Urdele Pass → Oașa Lake → Sibiu.</p>
      <p>Câlnic Citadel remains an optional detour and is opened separately, so it cannot distort the main route.</p>
      <a class="mapBtn secondary" target="_blank" rel="noopener" href="${googleSearch(calnic.name)}">Open optional Câlnic stop</a>`;
    detail.appendChild(block);
  };

  // Rebuild the itinerary cards after replacing the route generator.
  renderDays();
})();