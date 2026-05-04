// Índice de salario real anual de Argentina, base diciembre 2016 = 100.
// Cálculo didáctico con fuentes oficiales INDEC:
//  - Índice total de salarios, base octubre 2016 = 100.
//  - IPC nacional, nivel general, base diciembre 2016 = 100.
//  - Fórmula: (IS_total / IPC_nacional) normalizado a diciembre de 2016 = 100.
// Valores de diciembre de cada año, redondeados.

export interface RealWagePoint {
  year: number
  realIndex: number // salario real, base 2016 = 100
}

export const realWageArgentina: RealWagePoint[] = [
  { year: 2016, realIndex: 100 },
  { year: 2017, realIndex: 102 },
  { year: 2018, realIndex: 90 },
  { year: 2019, realIndex: 82 },
  { year: 2020, realIndex: 80 },
  { year: 2021, realIndex: 82 },
  { year: 2022, realIndex: 80 },
  { year: 2023, realIndex: 65 },
  { year: 2024, realIndex: 73 },
  { year: 2025, realIndex: 77 },
]

// Hitos macroeconómicos relevantes para anotar en el gráfico.
export interface Milestone {
  year: number
  label: string
  description: string
}

export const wageMilestones: Milestone[] = [
  {
    year: 2018,
    label: 'Crisis cambiaria',
    description: 'La aceleración inflacionaria supera a los salarios: el índice cae cerca de 12 puntos en un año.',
  },
  {
    year: 2020,
    label: 'Pandemia',
    description: 'El salario real queda alrededor de 20 % por debajo de la base de diciembre de 2016.',
  },
  {
    year: 2023,
    label: 'Salto inflacionario',
    description: 'La inflación anual y la devaluación de diciembre llevan la serie al mínimo del período oficial.',
  },
  {
    year: 2025,
    label: 'Recuperación parcial',
    description: 'Hay mejora frente al piso de 2023, pero el cierre anual sigue muy por debajo de 2016.',
  },
]
