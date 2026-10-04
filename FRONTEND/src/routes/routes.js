export const NAV = [
  ['Overview', '⌂'],
  ['Live Monitoring', '◉'],
  ['AI Risk Analysis', '✦'],
  ['Energy System', '⚡'],
  ['Delivery / Trip', '⌁'],
  ['Reports', '▤'],
  ['Settings', '⚙'],
];

export function routeNameFromHash(hash = window.location.hash) {
  const route = decodeURIComponent(hash.replace(/^#\/?/, ''));
  return NAV.some(([name]) => name === route) ? route : 'Overview';
}

export function routeHash(name) {
  return `#/${encodeURIComponent(name)}`;
}
