import { resolve } from 'node:path'

export const inputFile = (defaultPath: string, argumentsList = process.argv) => {
  let value: string | undefined
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index]
    if (argument.startsWith('--file=')) value = argument.slice('--file='.length)
    else if (argument === '--file') {
      const next = argumentsList[index + 1]
      if (!next || next.startsWith('--')) throw new Error('Missing path after --file.')
      value = next
      index += 1
    }
  }
  if (value !== undefined && !value.trim()) throw new Error('Missing path after --file.')
  return resolve(value ?? defaultPath)
}
