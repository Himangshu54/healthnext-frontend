import { mkdir, copyFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(root, '..')
const source = join(projectRoot, 'node_modules', '@vladmandic', 'face-api', 'model')
const target = join(projectRoot, 'public', 'models')
const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model.bin',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.bin',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.bin',
]

await mkdir(target, { recursive: true })
await Promise.all(files.map((file) => copyFile(join(source, file), join(target, file))))
