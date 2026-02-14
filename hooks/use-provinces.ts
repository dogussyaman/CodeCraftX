"use client"

import { useState, useEffect, useMemo } from "react"
import type { Province, ProvinceDistrict, ProvincesResponse } from "@/lib/provinces-types"

const PROVINCES_URL = "/provinces.json"

let cached: Province[] | null = null

export function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>(cached ?? [])
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    if (cached) {
      setProvinces(cached)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(PROVINCES_URL)
      .then((res) => res.json())
      .then((body: ProvincesResponse) => {
        if (cancelled) return
        const list = Array.isArray(body?.data) ? body.data : []
        cached = list
        setProvinces(list)
      })
      .catch(() => {
        if (!cancelled) setProvinces([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const getDistricts = useMemo(() => {
    return (provinceName: string): ProvinceDistrict[] => {
      if (!provinceName?.trim()) return []
      const p = provinces.find(
        (x) => x.name?.trim().toLowerCase() === provinceName.trim().toLowerCase()
      )
      return Array.isArray(p?.districts) ? p.districts : []
    }
  }, [provinces])

  const provinceList = useMemo(
    () => provinces.map((p) => ({ id: p.id, name: p.name })),
    [provinces]
  )

  return {
    provinces: provinceList,
    provincesFull: provinces,
    getDistricts,
    loading,
  }
}
