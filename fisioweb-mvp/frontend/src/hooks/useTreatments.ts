import { useState, useEffect } from 'react'
import api from '../services/api'
import { Treatment } from '../types'

export function useTreatments() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<Treatment[]>('/treatments')
      .then((res) => setTreatments(res.data))
      .catch(() => setError('No se pudieron cargar los tratamientos'))
      .finally(() => setLoading(false))
  }, [])

  return { treatments, loading, error }
}
