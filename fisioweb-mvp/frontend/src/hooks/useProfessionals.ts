import { useState, useEffect } from 'react'
import api from '../services/api'
import { Professional } from '../types'

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<Professional[]>('/professionals')
      .then((res) => setProfessionals(res.data))
      .catch(() => setError('No se pudieron cargar los profesionales'))
      .finally(() => setLoading(false))
  }, [])

  return { professionals, loading, error }
}
