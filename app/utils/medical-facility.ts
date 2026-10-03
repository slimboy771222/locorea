const facilityTypeLabels: Record<string, string> = {
  '의원': 'Clinic',
  '병원': 'Hospital',
  '종합병원': 'General hospital',
  '상급종합병원': 'Tertiary hospital',
  '보건소': 'Public health center',
  '보건지소': 'Public health branch',
  '한의원': 'Korean medicine clinic',
  '치과의원': 'Dental clinic',
  '치과병원': 'Dental hospital',
  '응급의료센터': 'Emergency medical center',
  '권역응급의료센터': 'Regional emergency medical center',
  '지역응급의료센터': 'Local emergency medical center',
  '지역응급의료기관': 'Emergency medical facility',
}

export const formatMedicalFacilityType = (facilityName: string | null) => facilityName ? (facilityTypeLabels[facilityName] ?? facilityName) : null
