// Tipos de cambio "a USD" a la fecha del CFDI (supplier_cfdi.usd_rates, calculado en el backend con
// ReportUsdConversionTrait). Es el mismo tipo de cambio con el que el profit de la referencia convierte
// el costo de la factura del proveedor, así lo que se muestra al capturar coincide con lo registrado.
const USD_ID = 2
const MXN_ID = 1

export const useCfdiUsdRates = (usdRates: MaybeRefOrGetter<{ date?: string; rates?: Record<string, number> } | null | undefined>) => {
  const exchangeRatesStore = useExchangeRatesStore()

  const rates = computed<Record<string, number>>(() => toValue(usdRates)?.rates || {})
  const rateDate = computed(() => toValue(usdRates)?.date || null)

  // Valor en USD de 1 unidad de la moneda; si el backend no lo mandó se usa el TC del día.
  const usdRate = (currencyId: number | null | undefined) => {
    if (!currencyId || Number(currencyId) === USD_ID) return 1
    const rate = Number(rates.value[currencyId] || 0)
    return rate > 0 ? rate : exchangeRatesStore.getExchangeRate(Number(currencyId), USD_ID)
  }

  const convert = (amount: number | string, fromCurrencyId: number, toCurrencyId: number) => {
    const value = Number(amount) || 0
    if (Number(fromCurrencyId) === Number(toCurrencyId)) return value
    const toRate = usdRate(toCurrencyId)
    return toRate > 0 ? (value * usdRate(fromCurrencyId)) / toRate : 0
  }

  const toUsd = (amount: number | string, currencyId: number) => convert(amount, currencyId, USD_ID)

  // MXN se expresa como "1 USD = x MXN" (como lo publica Banxico); el resto como "1 EUR = x USD".
  const rateLabel = (currencyId: number | null | undefined) => {
    if (!currencyId || Number(currencyId) === USD_ID) return ''
    const rate = usdRate(currencyId)
    if (!rate) return 'No exchange rate'
    return Number(currencyId) === MXN_ID
      ? `1 USD = ${(1 / rate).toFixed(4)} MXN`
      : `1 ${getCurrencyName(currencyId)} = ${rate.toFixed(4)} USD`
  }

  return { rateDate, usdRate, convert, toUsd, rateLabel }
}
