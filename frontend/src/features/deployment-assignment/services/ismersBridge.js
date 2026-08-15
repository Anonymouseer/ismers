/**
 * ismersBridge.js
 *
 * Real-time synchronization bridge between Recruitment & Selection and
 * Deployment & Assignment subsystems. Persists pending hires and onboarding
 * snapshots to localStorage and provides reactive event subscriptions.
 */

const BRIDGE_STORAGE_KEY = 'ismers_bridge_hires_v2';
const listeners = new Set();

function loadStoredHires() {
  const map = new Map();
  if (typeof window === 'undefined') return map;
  try {
    const raw = localStorage.getItem(BRIDGE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(([k, v]) => map.set(k, v));
      }
    }
  } catch (e) {
    console.warn('Could not read ISMERSBridge storage:', e);
  }
  return map;
}

function persistStoredHires(map) {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify([...map.entries()]);
    localStorage.setItem(BRIDGE_STORAGE_KEY, serialized);
  } catch (e) {
    console.warn('Could not save ISMERSBridge storage:', e);
  }
}

const hires = loadStoredHires();

function keyFor(name, jobOrderRef) {
  return `${name}__${jobOrderRef || 'DEFAULT'}`;
}

function getPendingHires() {
  return [...hires.values()].filter((h) => !h.linkedDeploymentId);
}

function getHire(key) {
  return hires.get(key);
}

function upsertHire(key, hireInfo) {
  const existing = hires.get(key) || {};
  const merged = {
    ...existing,
    ...(hireInfo || {}),
    key,
  };
  hires.set(key, merged);
  persistStoredHires(hires);
  listeners.forEach((cb) => cb());
}

function linkDeployment(key, deploymentId, stage, hireInfo) {
  const existing = hires.get(key) || {};
  const merged = {
    ...existing,
    ...(hireInfo || {}),
    key,
    linkedDeploymentId: deploymentId,
    stage,
  };
  hires.set(key, merged);
  persistStoredHires(hires);
  listeners.forEach((cb) => cb());
}

function updateDeploymentStatus(key, statusUpdate) {
  const existing = hires.get(key);
  if (!existing) return;
  const merged = { ...existing, ...statusUpdate };
  hires.set(key, merged);
  persistStoredHires(hires);
  listeners.forEach((cb) => cb());
}

function onChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export const ISMERSBridge = {
  keyFor,
  getPendingHires,
  getHire,
  upsertHire,
  linkDeployment,
  updateDeploymentStatus,
  onChange,
};

