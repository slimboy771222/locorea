import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'

type ImportEnvironment = {
  url: string
  serviceRoleKey: string
  credentialType: 'secret' | 'legacy service_role'
}

const selectedEnvFile = (argumentsList = process.argv) => {
  let value: string | undefined

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index]
    if (argument.startsWith('--env-file=')) {
      if (value !== undefined) throw new Error('Specify --env-file only once.')
      value = argument.slice('--env-file='.length)
    }
    else if (argument === '--env-file') {
      if (value !== undefined) throw new Error('Specify --env-file only once.')
      const next = argumentsList[index + 1]
      if (!next || next.startsWith('--')) throw new Error('Missing path after --env-file.')
      value = next
      index += 1
    }
  }

  if (value !== undefined && !value.trim()) throw new Error('Missing path after --env-file.')
  return resolve(value ?? '.env')
}

export const loadImportEnvironment = (): ImportEnvironment => {
  const path = selectedEnvFile()
  let values: Record<string, string | undefined>

  try {
    values = parseEnv(readFileSync(path, 'utf8'))
  }
  catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`Environment file not found: ${path}`)
    }
    throw error
  }

  const url = values.LOCOREA_IMPORT_SUPABASE_URL ?? process.env.LOCOREA_IMPORT_SUPABASE_URL
  const serviceRoleKey = values.LOCOREA_IMPORT_SERVICE_ROLE_KEY ?? process.env.LOCOREA_IMPORT_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('Missing LOCOREA_IMPORT_SUPABASE_URL. Server-side content scripts require the import URL.')
  }
  if (!serviceRoleKey) {
    throw new Error('Missing LOCOREA_IMPORT_SERVICE_ROLE_KEY. Server-side content scripts require the import credential.')
  }

  let host: string
  try {
    host = new URL(url).hostname
  }
  catch {
    throw new Error('Invalid LOCOREA_IMPORT_SUPABASE_URL.')
  }

  const credentialType = validateImportCredential(serviceRoleKey)
  console.log(`Target Supabase host: ${host}`)
  console.log(`Credential type: ${credentialType}`)

  return { url, serviceRoleKey, credentialType }
}

const invalidCredential = (): never => {
  throw new Error('Invalid import credential.\nA Supabase secret/service_role credential is required.')
}

const validateImportCredential = (credential: string): ImportEnvironment['credentialType'] => {
  if (credential.startsWith('sb_secret_')) return 'secret'
  if (credential.startsWith('sb_publishable_')) return invalidCredential()

  const segments = credential.split('.')
  if (segments.length !== 3) return invalidCredential()

  try {
    const payload = JSON.parse(Buffer.from(segments[1], 'base64url').toString('utf8')) as { role?: unknown }
    if (payload.role === 'service_role') return 'legacy service_role'
  }
  catch {
    return invalidCredential()
  }

  return invalidCredential()
}
