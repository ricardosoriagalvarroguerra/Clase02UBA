// Inflación anual de Argentina (variación punta a punta del IPC, dic/dic, %).
// Fuentes: INDEC para los años oficiales y reconstrucciones académicas (FIEL,
// CEPAL, IPC-Provincias) para los años de datos cuestionados (2007-2015).
// Convención unificada: variación de diciembre contra diciembre del año previo.
// 2025: estimación preliminar.
export interface InflationPoint {
  year: number
  rate: number
}

export const argentinaInflation: InflationPoint[] = [
  { year: 1980, rate: 100.8 },
  { year: 1981, rate: 104.5 },
  { year: 1982, rate: 164.8 },
  { year: 1983, rate: 343.8 },
  { year: 1984, rate: 626.7 },
  { year: 1985, rate: 672.2 },
  { year: 1986, rate: 90.1 },
  { year: 1987, rate: 131.3 },
  { year: 1988, rate: 343.0 },
  { year: 1989, rate: 4923.6 },
  { year: 1990, rate: 1343.9 },
  { year: 1991, rate: 84.0 },
  { year: 1992, rate: 17.5 },
  { year: 1993, rate: 7.4 },
  { year: 1994, rate: 3.9 },
  { year: 1995, rate: 1.6 },
  { year: 1996, rate: 0.1 },
  { year: 1997, rate: 0.3 },
  { year: 1998, rate: 0.7 },
  { year: 1999, rate: -1.8 },
  { year: 2000, rate: -0.7 },
  { year: 2001, rate: -1.5 },
  { year: 2002, rate: 41.0 },
  { year: 2003, rate: 3.7 },
  { year: 2004, rate: 4.4 },
  { year: 2005, rate: 9.6 },
  { year: 2006, rate: 10.9 },
  { year: 2007, rate: 25.0 },
  { year: 2008, rate: 23.0 },
  { year: 2009, rate: 14.8 },
  { year: 2010, rate: 26.0 },
  { year: 2011, rate: 22.0 },
  { year: 2012, rate: 25.6 },
  { year: 2013, rate: 28.4 },
  { year: 2014, rate: 38.0 },
  { year: 2015, rate: 26.9 },
  { year: 2016, rate: 41.0 },
  { year: 2017, rate: 24.8 },
  { year: 2018, rate: 47.6 },
  { year: 2019, rate: 53.8 },
  { year: 2020, rate: 36.1 },
  { year: 2021, rate: 50.9 },
  { year: 2022, rate: 94.8 },
  { year: 2023, rate: 211.4 },
  { year: 2024, rate: 117.8 },
  { year: 2025, rate: 25.0 },
]
