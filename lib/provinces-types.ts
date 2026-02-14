export interface ProvinceDistrict {
  id: number
  name: string
}

export interface Province {
  id: number
  name: string
  districts: ProvinceDistrict[]
}

export interface ProvincesResponse {
  status: string
  data: Province[]
}

export const DEFAULT_COUNTRY = "Türkiye"
