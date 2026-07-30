/**
 * ismersBridge.js
 *
 * STUB — this mirrors the window-global `ISMERSBridge` used by the original
 * static ismers-bridge.js (loaded as a <script> in deplyment.html) that lets
 * Recruitment & Selection hand off "hired" candidates to Deployment &
 * Assignment, and lets Deployment push status back the other way.
 *
 * Replace this file's internals with a call into the real shared bridge
 * module (or the Laravel API, e.g. GET /api/v1/scoring/hires) once that
 * subsystem's teammate has it wired up. The public shape below is kept
 * identical to the original script's API so nothing else needs to change:
 *
 *   ISMERSBridge.keyFor(name, jobOrderRef)
 *   ISMERSBridge.getPendingHires()              -> [{ key, name, jobTitle, client, jobOrderRef }]
 *   ISMERSBridge.getHire(key)                    -> { name, client, jobOrderRef } | undefined
 *   ISMERSBridge.linkDeployment(key, depId, stage, hireInfo?)
 *   ISMERSBridge.updateDeploymentStatus(key, { stage, attendanceRate, score })
 *   ISMERSBridge.onChange(callback)               -> subscribe to bridge updates
 */

const listeners = new Set();
const hires = new Map(); // key -> { name, client, jobOrderRef, jobTitle, linkedDeploymentId }

function keyFor(name, jobOrderRef) {
  return `${name}__${jobOrderRef}`;
}

function getPendingHires() {
  return [...hires.values()].filter((h) => !h.linkedDeploymentId);
}

function getHire(key) {
  return hires.get(key);
}

function linkDeployment(key, deploymentId, stage, hireInfo) {
  const existing = hires.get(key) || {};
  hires.set(key, {
    ...existing,
    ...(hireInfo || {}),
    key,
    linkedDeploymentId: deploymentId,
    stage,
  });
  listeners.forEach((cb) => cb());
}

function updateDeploymentStatus(key, statusUpdate) {
  const existing = hires.get(key);
  if (!existing) return;
  hires.set(key, { ...existing, ...statusUpdate });
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
  linkDeployment,
  updateDeploymentStatus,
  onChange,
};
