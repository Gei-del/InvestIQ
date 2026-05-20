"""
simulation_service.py
Calcula interés compuesto, valor real ajustado por inflación y datos anuales.
"""
from app.schemas.schemas import SimulationInput, SimulationResponse, YearData


def run_simulation(data: SimulationInput) -> SimulationResponse:
    capital = data.capital_inicial
    tasa = data.tasa_anual / 100
    inflacion = data.inflacion / 100
    anios = data.anios

    datos_anuales: list[YearData] = []
    valor_nominal = capital
    valor_real = capital

    for anio in range(1, anios + 1):
        valor_nominal = valor_nominal * (1 + tasa)
        # Valor real: descontamos inflación compuesta
        valor_real_anio = capital * ((1 + tasa) / (1 + inflacion)) ** anio
        ganancia_acumulada = valor_nominal - capital
        inflacion_acumulada = capital * ((1 + inflacion) ** anio - 1)

        datos_anuales.append(
            YearData(
                anio=anio,
                valor_nominal=round(valor_nominal, 2),
                valor_real=round(valor_real_anio, 2),
                ganancia_acumulada=round(ganancia_acumulada, 2),
                inflacion_acumulada=round(inflacion_acumulada, 2),
            )
        )

    valor_futuro = round(valor_nominal, 2)
    valor_real_final = round(capital * ((1 + tasa) / (1 + inflacion)) ** anios, 2)
    crecimiento_porcentual = round((valor_futuro - capital) / capital * 100, 2)
    crecimiento_real = round((valor_real_final - capital) / capital * 100, 2)
    ganancia_total = round(valor_futuro - capital, 2)

    return SimulationResponse(
        capital_inicial=capital,
        tasa_anual=data.tasa_anual,
        anios=anios,
        inflacion=data.inflacion,
        valor_futuro=valor_futuro,
        valor_real=valor_real_final,
        crecimiento_porcentual=crecimiento_porcentual,
        crecimiento_real_porcentual=crecimiento_real,
        ganancia_total=ganancia_total,
        datos_anuales=datos_anuales,
    )
