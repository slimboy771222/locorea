export const parseCsv = (contents: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index]
    const next = contents[index + 1]
    if (character === '"' && quoted && next === '"') { field += '"'; index += 1 }
    else if (character === '"') quoted = !quoted
    else if (character === ',' && !quoted) { row.push(field); field = '' }
    else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(field)
      if (row.some(value => value.trim())) rows.push(row)
      row = []; field = ''
    }
    else field += character
  }
  if (quoted) throw new Error('CSV has an unterminated quoted field.')
  if (field || row.length) { row.push(field); if (row.some(value => value.trim())) rows.push(row) }
  return rows
}

export const normalizeCsvHeaders = (headers: string[]) => headers.map((header, index) => {
  const normalized = header.trim()
  return index === 0 ? normalized.replace(/^\uFEFF/, '') : normalized
})
