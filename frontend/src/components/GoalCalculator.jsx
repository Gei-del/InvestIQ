import { useState, useMemo } from 'react'
import { formatCOP, formatPct } from '../utils/format'

const GOAL_PRESETS = [
  { name: 'Fondo de emergencia', valor: 20000000, plazo: 2 },
  { name: 'Cuota inicial vivienda', valor: 80000000, plazo: 5 },
  { name: 'Educacion hijos', valor: 150000000, plazo: 15 },
  { name: 'Retiro anticipado', valor: 500000000, plazo: 20 },
]

export default function GoalCalculator() {
  const [meta, setMeta] = useState({
    nombre: '',
    valorMeta: 50000000,
    plazoAnios: 5,
    tasaEsperada: 12,
    capitalInicial: 0,
    inflacion: 6
  })

  const [showPresets, setShowPresets] = useState(false)

  const calculations = useMemo(() => {
    const { valorMeta, plazoAnios, tasaEsperada, capitalInicial, inflacion } = meta
    const tasaMensual = tasaEsperada / 100 / 12
    const meses = plazoAnios * 12
    const tasaAnual = tasaEsperada / 100
    const inflacionAnual = inflacion / 100

    // Valor meta ajustado por inflacion futura
    const metaAjustada = valorMeta * Math.pow(1 + inflacionAnual, plazoAnios)

    // Valor futuro del capital inicial
    const valorFuturoInicial = capitalInicial * Math.pow(1 + tasaAnual, plazoAnios)

    // Monto faltante despues del capital inicial
    const montoFaltante = Math.max(0, metaAjustada - valorFuturoInicial)

    // Aporte mensual necesario (formula de anualidad)
    let aporteMensual = 0
    if (montoFaltante > 0 && tasaMensual > 0) {
      aporteMensual = montoFaltante * tasaMensual / (Math.pow(1 + tasaMensual, meses) - 1)
    } else if (montoFaltante > 0) {
      aporteMensual = montoFaltante / meses
    }

    // Total aportado
    const totalAportado = capitalInicial + (aporteMensual * meses)

    // Ganancia por interes
    const gananciaInteres = metaAjustada - totalAportado

    // Porcentaje de la meta que viene de aportes vs intereses
    const porcentajeAportes = totalAportado / metaAjustada * 100
    const porcentajeIntereses = gananciaInteres / metaAjustada * 100

    // Proyeccion anual
    const proyeccionAnual = []
    let acumulado = capitalInicial
    let aportadoAcumulado = capitalInicial

    for (let anio = 1; anio <= plazoAnios; anio++) {
      // Aportes del ano
      const aportesAnio = aporteMensual * 12
      aportadoAcumulado += aportesAnio

      // Valor al final del ano (capital acumulado + aportes del ano, con intereses)
      acumulado = (acumulado + aportesAnio) * (1 + tasaAnual)

      // Meta parcial para este ano (interpolacion lineal ajustada por inflacion)
      const metaParcial = valorMeta * Math.pow(1 + inflacionAnual, anio) * (anio / plazoAnios)

      proyeccionAnual.push({
        anio,
        valorAcumulado: Math.round(acumulado),
        aportadoTotal: Math.round(aportadoAcumulado),
        interesesGanados: Math.round(acumulado - aportadoAcumulado),
        metaParcial: Math.round(metaParcial),
        progreso: Math.min(100, (acumulado / metaAjustada) * 100)
      })
    }

    return {
      metaAjustada: Math.round(metaAjustada),
      aporteMensual: Math.round(aporteMensual),
      totalAportado: Math.round(totalAportado),
      gananciaInteres: Math.round(gananciaInteres),
      porcentajeAportes: Math.round(porcentajeAportes),
      porcentajeIntereses: Math.round(porcentajeIntereses),
      proyeccionAnual,
      esAlcanzable: aporteMensual < (valorMeta * 0.1) // Si el aporte mensual es menos del 10% de la meta
    }
  }, [meta])

  const handlePreset = (preset) => {
    setMeta(prev => ({
      ...prev,
      nombre: preset.name,
      valorMeta: preset.valor,
      plazoAnios: preset.plazo
    }))
    setShowPresets(false)
  }

  const handleChange = (field, value) => {
    setMeta(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Goal Form */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-white/50 text-xs font-mono mb-1.5 uppercase tracking-wider">
            Meta financiera
          </label>
          <div className="relative">
            <input
              type="text"
              value={meta.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Cuota inicial casa"
              className="input-field pr-10"
            />
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {showPresets && (
            <div className="absolute z-10 mt-1 w-64 card p-2 shadow-xl">
              {GOAL_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handlePreset(preset)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="text-white/80 text-sm">{preset.name}</div>
                  <div className="text-white/40 text-xs">
                    {formatCOP(preset.valor)} en {preset.plazo} anos
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-white/50 text-xs font-mono mb-1.5 uppercase tracking-wider">
            Valor meta (COP)
          </label>
          <input
            type="number"
            value={meta.valorMeta}
            onChange={(e) => handleChange('valorMeta', Number(e.target.value))}
            className="input-field"
            min="1000000"
            step="1000000"
          />
        </div>

        <div>
          <label className="block text-white/50 text-xs font-mono mb-1.5 uppercase tracking-wider">
            Plazo (anos)
          </label>
          <input
            type="number"
            value={meta.plazoAnios}
            onChange={(e) => handleChange('plazoAnios', Number(e.target.value))}
            className="input-field"
            min="1"
            max="40"
          />
        </div>

        <div>
          <label className="block text-white/50 text-xs font-mono mb-1.5 uppercase tracking-wider">
            Capital inicial (COP)
          </label>
          <input
            type="number"
            value={meta.capitalInicial}
            onChange={(e) => handleChange('capitalInicial', Number(e.target.value))}
            className="input-field"
            min="0"
            step="1000000"
          />
        </div>

        <div>
          <label className="block text-white/50 text-xs font-mono mb-1.5 uppercase tracking-wider">
            Tasa esperada (% anual)
          </label>
          <input
            type="number"
            value={meta.tasaEsperada}
            onChange={(e) => handleChange('tasaEsperada', Number(e.target.value))}
            className="input-field"
            min="0"
            max="30"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-white/50 text-xs font-mono mb-1.5 uppercase tracking-wider">
            Inflacion estimada (%)
          </label>
          <input
            type="number"
            value={meta.inflacion}
            onChange={(e) => handleChange('inflacion', Number(e.target.value))}
            className="input-field"
            min="0"
            max="20"
            step="0.5"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 border-brand-500/20 bg-brand-500/5">
          <p className="text-white/40 text-xs font-mono mb-1">APORTE MENSUAL NECESARIO</p>
          <p className="text-brand-400 font-display font-bold text-2xl">
            {formatCOP(calculations.aporteMensual)}
          </p>
          <p className="text-white/30 text-xs mt-1">para alcanzar tu meta</p>
        </div>

        <div className="card p-4">
          <p className="text-white/40 text-xs font-mono mb-1">META AJUSTADA (INFLACION)</p>
          <p className="text-white font-display font-bold text-xl">
            {formatCOP(calculations.metaAjustada)}
          </p>
          <p className="text-white/30 text-xs mt-1">valor futuro de {formatCOP(meta.valorMeta)}</p>
        </div>

        <div className="card p-4">
          <p className="text-white/40 text-xs font-mono mb-1">TOTAL A APORTAR</p>
          <p className="text-white font-display font-bold text-xl">
            {formatCOP(calculations.totalAportado)}
          </p>
          <p className="text-white/30 text-xs mt-1">{formatPct(calculations.porcentajeAportes, 0)} de la meta</p>
        </div>

        <div className="card p-4">
          <p className="text-white/40 text-xs font-mono mb-1">GANANCIA POR INTERESES</p>
          <p className="text-blue-400 font-display font-bold text-xl">
            {formatCOP(calculations.gananciaInteres)}
          </p>
          <p className="text-white/30 text-xs mt-1">{formatPct(calculations.porcentajeIntereses, 0)} de la meta</p>
        </div>
      </div>

      {/* Progress Bar Visual */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-sm">Composicion de tu meta</span>
          <span className="text-white/70 text-sm font-mono">{formatCOP(calculations.metaAjustada)}</span>
        </div>
        <div className="h-4 bg-surface rounded-full overflow-hidden flex">
          <div 
            className="bg-brand-500 transition-all duration-500"
            style={{ width: `${calculations.porcentajeAportes}%` }}
          />
          <div 
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${calculations.porcentajeIntereses}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-brand-500 rounded" />
            <span className="text-white/50">Tus aportes ({formatPct(calculations.porcentajeAportes, 0)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-white/50">Intereses ({formatPct(calculations.porcentajeIntereses, 0)})</span>
          </div>
        </div>
      </div>

      {/* Yearly Projection Table */}
      <div className="card p-4 overflow-x-auto">
        <h4 className="text-white font-medium mb-4">Proyeccion anual</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/30 font-mono text-xs uppercase border-b border-surface-border">
              <th className="text-left pb-2 pr-4">Ano</th>
              <th className="text-right pb-2 pr-4">Aportado</th>
              <th className="text-right pb-2 pr-4">Intereses</th>
              <th className="text-right pb-2 pr-4">Total</th>
              <th className="text-right pb-2 pr-4">Progreso</th>
            </tr>
          </thead>
          <tbody>
            {calculations.proyeccionAnual.map((row) => (
              <tr key={row.anio} className="border-b border-surface-border/50 hover:bg-white/2">
                <td className="py-2 pr-4 font-mono text-white/50">{row.anio}</td>
                <td className="py-2 pr-4 text-right text-white/70">{formatCOP(row.aportadoTotal)}</td>
                <td className="py-2 pr-4 text-right text-blue-400">{formatCOP(row.interesesGanados)}</td>
                <td className="py-2 pr-4 text-right text-brand-400 font-semibold">{formatCOP(row.valorAcumulado)}</td>
                <td className="py-2 pr-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-surface rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-500 transition-all"
                        style={{ width: `${row.progreso}%` }}
                      />
                    </div>
                    <span className="text-white/50 font-mono text-xs w-10 text-right">
                      {formatPct(row.progreso, 0)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className={`card p-4 ${calculations.esAlcanzable ? 'bg-brand-500/5 border-brand-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
        <h4 className={`text-sm font-medium mb-2 ${calculations.esAlcanzable ? 'text-brand-400' : 'text-amber-400'}`}>
          {calculations.esAlcanzable ? 'Meta alcanzable' : 'Meta ambiciosa'}
        </h4>
        <p className="text-white/60 text-sm">
          {calculations.esAlcanzable
            ? `Con un aporte mensual de ${formatCOP(calculations.aporteMensual)}, alcanzaras tu meta de ${formatCOP(meta.valorMeta)} (ajustada a ${formatCOP(calculations.metaAjustada)} por inflacion) en ${meta.plazoAnios} anos. El interes compuesto aportara ${formatCOP(calculations.gananciaInteres)} a tu meta.`
            : `Esta meta requiere un aporte mensual alto de ${formatCOP(calculations.aporteMensual)}. Considera aumentar el plazo, reducir la meta, o buscar inversiones con mayor rendimiento.`
          }
        </p>
      </div>
    </div>
  )
}
