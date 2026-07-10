import * as THREE from 'three'

/** Assigns a mesh center point into a coarse body zone id. */
export function assignMeshToZone(center: THREE.Vector3): string {
  if (center.y >= 1.2) return 'upper'
  if (center.y >= 0.8) return 'core'
  if (center.y >= 0.38) return 'mid'
  return 'lower'
}

/** Builds a zone map for all meshes in a loaded GLTF scene. */
export function buildMeshZoneMap(root: THREE.Object3D): Map<THREE.Mesh, string> {
  const zoneMap = new Map<THREE.Mesh, string>()
  const box = new THREE.Box3()
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return
    box.setFromObject(node)
    const center = new THREE.Vector3()
    box.getCenter(center)
    zoneMap.set(node, assignMeshToZone(center))
  })
  return zoneMap
}
