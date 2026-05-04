// Tasas de pobreza e indigencia (% de la población) — Encuesta Permanente de Hogares (EPH), INDEC.
// Datos semestrales para 31 aglomerados urbanos.
// Cobertura desde 2016-S2 (cuando se retoma la publicación oficial con metodología actualizada).
// 2024-S1 corresponde a la medición del primer semestre del gobierno Milei (post-devaluación dic-23).

export interface PovertyPoint {
  period: string // 'YYYY-S1' o 'YYYY-S2'
  year: number
  semester: 1 | 2
  povertyRate: number // % personas bajo línea de pobreza (CBT)
  indigenceRate: number // % personas bajo línea de indigencia (CBA)
}

export const povertyArgentina: PovertyPoint[] = [
  { period: '2016-S2', year: 2016, semester: 2, povertyRate: 30.3, indigenceRate: 6.1 },
  { period: '2017-S1', year: 2017, semester: 1, povertyRate: 28.6, indigenceRate: 6.2 },
  { period: '2017-S2', year: 2017, semester: 2, povertyRate: 25.7, indigenceRate: 4.8 },
  { period: '2018-S1', year: 2018, semester: 1, povertyRate: 27.3, indigenceRate: 4.9 },
  { period: '2018-S2', year: 2018, semester: 2, povertyRate: 32.0, indigenceRate: 6.7 },
  { period: '2019-S1', year: 2019, semester: 1, povertyRate: 35.4, indigenceRate: 7.7 },
  { period: '2019-S2', year: 2019, semester: 2, povertyRate: 35.5, indigenceRate: 8.0 },
  { period: '2020-S1', year: 2020, semester: 1, povertyRate: 40.9, indigenceRate: 10.5 },
  { period: '2020-S2', year: 2020, semester: 2, povertyRate: 42.0, indigenceRate: 10.5 },
  { period: '2021-S1', year: 2021, semester: 1, povertyRate: 40.6, indigenceRate: 10.7 },
  { period: '2021-S2', year: 2021, semester: 2, povertyRate: 37.3, indigenceRate: 8.2 },
  { period: '2022-S1', year: 2022, semester: 1, povertyRate: 36.5, indigenceRate: 8.8 },
  { period: '2022-S2', year: 2022, semester: 2, povertyRate: 39.2, indigenceRate: 8.1 },
  { period: '2023-S1', year: 2023, semester: 1, povertyRate: 40.1, indigenceRate: 9.3 },
  { period: '2023-S2', year: 2023, semester: 2, povertyRate: 41.7, indigenceRate: 11.9 },
  { period: '2024-S1', year: 2024, semester: 1, povertyRate: 52.9, indigenceRate: 18.1 },
  { period: '2024-S2', year: 2024, semester: 2, povertyRate: 38.1, indigenceRate: 8.2 },
  { period: '2025-S1', year: 2025, semester: 1, povertyRate: 31.6, indigenceRate: 6.9 },
]

// Variación interanual de la Canasta Básica Total (CBT) y la Canasta Básica Alimentaria (CBA),
// comparadas con el IPC general. La CBA pondera más fuerte los alimentos, que en muchos años
// suben por encima del nivel general — y por eso la línea de pobreza “se mueve más rápido”
// que la inflación promedio que ven los hogares en el resto del consumo.
export interface CanastaPoint {
  year: number
  cbtChange: number // % anual
  cbaChange: number // % anual (alimentos)
  ipcChange: number // % anual (IPC general)
}

export const canastaArgentina: CanastaPoint[] = [
  { year: 2017, cbtChange: 27.5, cbaChange: 25.0, ipcChange: 24.8 },
  { year: 2018, cbtChange: 49.0, cbaChange: 51.0, ipcChange: 47.6 },
  { year: 2019, cbtChange: 56.3, cbaChange: 57.0, ipcChange: 53.8 },
  { year: 2020, cbtChange: 39.5, cbaChange: 45.5, ipcChange: 36.1 },
  { year: 2021, cbtChange: 50.1, cbaChange: 49.8, ipcChange: 50.9 },
  { year: 2022, cbtChange: 100.3, cbaChange: 103.8, ipcChange: 94.8 },
  { year: 2023, cbtChange: 230.6, cbaChange: 251.3, ipcChange: 211.4 },
  { year: 2024, cbtChange: 110.5, cbaChange: 95.0, ipcChange: 117.8 },
  { year: 2025, cbtChange: 22.0, cbaChange: 20.5, ipcChange: 25.0 },
]
