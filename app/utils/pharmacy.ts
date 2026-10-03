const commonKoreanNotes: Record<string, string> = {
  '토요일,일요일휴무': 'Closed on Saturdays and Sundays',
  '일요일휴무': 'Closed on Sundays',
  '공휴일휴무': 'Closed on public holidays',
}

export const formatPharmacyNote = (note: string) => commonKoreanNotes[note.replace(/\s+/g, '')] ?? note

export const pharmacyTelHref = (phone: string) => {
  const normalized = phone.replace(/[\s-]/g, '')
  return normalized.startsWith('0') ? `tel:+82${normalized.slice(1)}` : `tel:${normalized}`
}
