<template>
  <div>
    <v-card>
      <v-card-title>Buy / sell charges</v-card-title>
      <v-card-text>
        <!-- Totales -->
        <div v-if="false" class="grid grid-cols-1">
          <div class="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-900 mb-2">
            <div class="col-span-3">
              <div class="font-bold text-center bg-slate-300 dark:bg-slate-700 p-2">Totales</div>
            </div>
            <div class="text-center">
              <div class="font-bold bg-slate-200 dark:bg-slate-600">Tasa de compra (USD) | PP</div>
              <div class="p-2">{{ formatToCurrency(chargesTotales.totalPrepaidBuy) }}</div>
              <div class="font-bold bg-slate-200 dark:bg-slate-600">Tasa de compra (USD) | CC</div>
              <div class="p-2">{{ formatToCurrency(chargesTotales.totalCollectBuy) }}</div>
            </div>
            <div class="text-center">
              <div class="font-bold bg-slate-200 dark:bg-slate-600">Tasa de venta (USD) | PP</div>
              <div class="p-2">{{ formatToCurrency(chargesTotales.totalPrepaid) }}</div>
              <div class="font-bold bg-slate-200 dark:bg-slate-600">Tasa de venta (USD) | CC</div>
              <div class="p-2">{{ formatToCurrency(chargesTotales.totalCollect) }}</div>
            </div>
            <div class="text-center">
              <div class="font-bold bg-slate-200 dark:bg-slate-600">Total Prepaid</div>
              <div class="p-2">{{ formatToCurrency(chargesTotales.profitPrepaid) }}</div>
              <div class="font-bold bg-slate-200 dark:bg-slate-600">Total Collect</div>
              <div class="p-2">{{ formatToCurrency(chargesTotales.profitCollect) }}</div>
            </div>
            <div class="col-span-2"></div>
            <div class="text-center">
              <div class="font-bold bg-slate-200 dark:bg-slate-600">Profit</div>
              <div class="p-2">{{ formatToCurrency(chargesTotales.totalPrepaid) }}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-2 dark:text-black">
            <div class="bg-red-100">
              <div class="grid grid-cols-2 gap-2">
                <div class="col-span-2">
                  <div class="font-bold text-center bg-red-200 p-2">Pay suppliers</div>
                </div>
                <div class="text-center">
                  <div class="font-bold">Compra (USD) | PP</div>
                  <div class="p-2">{{ formatToCurrency(buyChargesTotales.totalPrepaidBuy) }}</div>
                </div>
                <div class="text-center">
                  <div class="font-bold">Venta (USD) | PP</div>
                  <div class="p-2">{{ formatToCurrency(buyChargesTotales.totalPrepaidSell) }}</div>
                </div>
                <div class="text-center">
                  <div class="font-bold">Compra (USD) | CC</div>
                  <div class="p-2">{{ formatToCurrency(buyChargesTotales.totalCollectBuy) }}</div>
                </div>
                <div class="text-center">
                  <div class="font-bold">Venta (USD) | CC</div>
                  <div class="p-2">{{ formatToCurrency(buyChargesTotales.totalCollectSell) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <v-card color="blue">
            <v-card-title>Buy Rate</v-card-title>
            <v-card-text>
              <div
                v-for="(totals, currency) in chargesTotalesByCurrency.totalsByBuyCurrency"
                :key="`buy-${currency}`"
                class="mb-4"
              >
                <div class="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <v-text-field
                      v-model="totals.totalPrepaidBuy"
                      density="compact"
                      variant="plain"
                      :label="`Total buy rate (${getCurrencyName(currency)})`"
                      readonly
                      prepend-inner-icon="mdi-currency-usd"
                      hide-details
                    />
                  </div>
                  <div class="flex items-center">
                    <div class="font-bold text-base">Prepaid</div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <v-text-field
                      v-model="totals.totalCollectBuy"
                      density="compact"
                      variant="plain"
                      :label="`Total buy rate (${getCurrencyName(currency)})`"
                      readonly
                      prepend-inner-icon="mdi-currency-usd"
                      hide-details
                    />
                  </div>
                  <div class="flex items-center">
                    <div class="font-bold text-base">Collect</div>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <v-btn color="amber" size="small" @click="toggleBuyBreakdown">
                  <v-icon>mdi-calculator</v-icon> View breakdown
                </v-btn>
                <div class="w-full">
                  <v-autocomplete
                    v-model="buy_rate_type"
                    density="compact"
                    label="PPCC"
                    :items="[{ name: 'Prepaid' }, { name: 'Collect' }]"
                    item-title="name"
                    variant="solo-filled"
                    hide-details
                  />
                  <v-btn color="blue-darken-4" size="small" @click="savePPCC('buy')"> Save </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
          <v-card color="green">
            <v-card-title>Sell Rate</v-card-title>
            <v-card-text>
              <div
                v-for="(totals, currency) in chargesTotalesByCurrency.totalsBySellCurrency"
                :key="`buy-${currency}`"
                class="mb-4"
              >
                <div class="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <v-text-field
                      v-model="totals.totalPrepaid"
                      density="compact"
                      variant="plain"
                      :label="`Total sell rate (${getCurrencyName(currency)})`"
                      readonly
                      prepend-inner-icon="mdi-currency-usd"
                      hide-details
                    />
                  </div>
                  <div class="flex items-center">
                    <div class="font-bold text-base">Prepaid</div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <v-text-field
                      v-model="totals.totalCollect"
                      density="compact"
                      variant="plain"
                      :label="`Total sell rate (${getCurrencyName(currency)})`"
                      readonly
                      prepend-inner-icon="mdi-currency-usd"
                      hide-details
                    />
                  </div>
                  <div class="flex items-center">
                    <div class="font-bold text-base">Collect</div>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <v-btn color="amber" size="small" @click="toggleSellBreakdown">
                  <v-icon>mdi-calculator</v-icon> View breakdown
                </v-btn>
                <div class="w-full">
                  <v-autocomplete
                    v-model="sell_rate_type"
                    density="compact"
                    label="PPCC"
                    :items="[{ name: 'Prepaid' }, { name: 'Collect' }]"
                    item-title="name"
                    variant="solo-filled"
                    hide-details
                  />
                  <v-btn color="lime" size="small" @click="savePPCC('sell')"> Save </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Tabla de cargos -->
        <div class="mt-2">
          <div class="font-bold text-xl">Charge details</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="font-bold! w-32">Actions</th>
                <th class="font-bold!"></th>
                <th class="font-bold!">Charge</th>
                <th class="font-bold!">F/D AWB</th>
                <th class="font-bold! bg-slate-100">Buy amount</th>
                <th class="font-bold! bg-slate-100">Sell amout</th>
                <th class="font-bold!">Created at</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!hasCharges">
                <td colspan="7" class="text-center">No charges out AWB found</td>
              </tr>
              <tr v-if="hasCharges">
                <td colspan="4"></td>
                <td class="font-bold!">BUY</td>
                <td class="font-bold!">SELL</td>
                <td></td>
              </tr>

              <tr v-if="hasCharges" v-for="charge in fueraAwbCharges" :key="charge.id">
                <td>
                  <div v-if="!hasLinkInvoice(charge)" class="flex gap-2">
                    <v-btn
                      color="primary"
                      icon="mdi-pencil-outline"
                      size="x-small"
                      variant="outlined"
                      class="mr-2"
                      @click="editCharge(charge)"
                    >
                    </v-btn>
                    <v-btn
                      color="error"
                      icon="mdi-delete-outline"
                      size="x-small"
                      variant="outlined"
                      @click="deleteCharge(charge)"
                    >
                    </v-btn>
                  </div>
                </td>
                <td>
                  <div :class="boxColorBuyOwner(charge)"></div>
                  <div>
                    <v-chip size="small" color="primary">{{ charge.inv_type }}</v-chip>
                  </div>
                </td>
                <td>
                  <v-icon size="small">{{ linkedChargeToInvoice(charge) }}</v-icon>
                  {{ charge.charge?.name }}
                </td>
                <td>{{ charge.fuera_dentro_awb === 'F' ? 'Fuera de AWB' : 'Dentro de AWB' }}</td>

                <td>
                  <div v-if="charge.buy_total">
                    {{ formatToCurrency(charge.buy_total) }} {{ charge.buy_currency?.code }}
                  </div>
                </td>
                <td>
                  <div v-if="charge.sell_total">
                    {{ formatToCurrency(charge.sell_total) }} {{ charge.sell_currency?.code }}
                  </div>
                </td>
                <td class="whitespace-nowrap">
                  <UserInfoBadge :item="charge">
                    {{ formatDateString(charge.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
          
        </div>

        <div v-if="!props.canEdit">
          <v-alert color="orange" type="error" variant="outlined" density="compact">
            <div class="text-sm">You can not edit charges, reference is locked.</div>
          </v-alert>
        </div>
        <!-- Formulario para cargo -->
        <div class="py-4">
          <div class="flex flex-wrap gap-2">
            <v-btn color="secondary" size="small" @click="toggleChargeForm">{{ labelNewCharge }}</v-btn>

            <v-btn
              v-if="props.showProformaBtn"
              color="purple"
              size="small"
              class="cursor-pointer"
              @click="goToAirProformas"
              >View proformas</v-btn
            >
          </div>

          <div v-if="formCharge.show" class="py-4 px-2">
            <div class="font-bold text-lg">Charge form</div>
            <div class="grid grid-cols-4 gap-2">
              <div>
                <v-autocomplete
                  v-model="formCharge.charge.inv_type"
                  density="compact"
                  :items="customerInvTypes"
                  item-title="name"
                  item-value="value"
                  label="Type *"
                  @update:model-value="onInvoiceTypeChangeMain"
                />
              </div>
              <div class="col-span-2">
                <v-autocomplete
                  v-model="formCharge.charge.charge_id"
                  density="compact"
                  :items="filteredChargesMain"
                  item-title="name"
                  item-value="id"
                  label="Charge *"
                  :disabled="!formCharge.charge.inv_type"
                  :hint="chargeFilterHintMain"
                  persistent-hint
                />
              </div>
              <div>
                <v-autocomplete
                  v-model="formCharge.charge.fuera_dentro_awb"
                  density="compact"
                  :items="fueraDentroBls"
                  item-title="name"
                  item-value="value"
                  label="F/D AWB *"
                />
              </div>
            </div>
            <div class="">Select if has sell and buy rates</div>
            <div class="grid grid-cols-2 gap-4">
              <v-checkbox v-model="formCharge.charge.has_sell" density="compact" label="has sell" />
              <v-checkbox v-model="formCharge.charge.has_buy" density="compact" label="has buy" />
            </div>
            <div v-if="formCharge.charge.has_sell" class="grid grid-cols-3 gap-2">
              <div class="col-span-3 font-bold">Sell details</div>
              <v-text-field v-model="formCharge.charge.sell_amount" density="compact" label="Sell amount *" />
              <div class="flex gap-2">
                <v-checkbox v-model="formCharge.charge.is_sell_con_iva" density="compact" label="+ IVA" />
                <v-autocomplete
                  v-model="formCharge.charge.sell_currency_id"
                  density="compact"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                  label="Currency *"
                />
              </div>
              <v-autocomplete
                v-model="formCharge.charge.sell_ppcc"
                density="compact"
                :items="ppccs"
                item-title="name"
                item-value="value"
                label="PP/CC *"
              />
            </div>
            <div v-if="formCharge.charge.has_buy" class="grid grid-cols-3 gap-2">
              <div class="col-span-3 font-bold">Buy details</div>
              <v-text-field v-model="formCharge.charge.buy_amount" density="compact" label="Buy amount *" />
              <div class="flex gap-2">
                <v-checkbox v-model="formCharge.charge.is_buy_con_iva" density="compact" label="+ IVA" />
                <v-autocomplete
                  v-model="formCharge.charge.buy_currency_id"
                  density="compact"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                  label="Currency *"
                />
              </div>
              <v-autocomplete
                v-model="formCharge.charge.buy_ppcc"
                density="compact"
                :items="ppccs"
                item-title="name"
                item-value="value"
                label="PP/CC *"
              />
            </div>

            <v-btn color="primary" @click="saveCharge">{{ labelSaveCharge }}</v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="showBuyBreakdown" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="toggleBuyBreakdown">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Buy rate detail</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-title>
          <div class="flex justify-between">
            <div>Buy rate charge(s)</div>
          </div>
        </v-card-title>
        <v-card-text>
          <div v-if="!formBuyCharge.show">
            <v-btn color="primary" size="small" @click="newBuyChargeForm">New buy charge</v-btn>
          </div>
          <!-- Formulario para cargo -->
          <div v-if="formBuyCharge.show" class="py-4">
            <v-btn color="secondary" size="small" @click="closeBuyChargeForm">Cancel</v-btn>
            <div class="py-4 px-2">
              <div class="font-bold text-lg">Charge form</div>
              <div class="grid grid-cols-4 gap-2">
                <div class="col-span-2">
                  <v-autocomplete
                    v-model="formBuyCharge.charge.charge_id"
                    density="compact"
                    :items="catalogs.charges"
                    item-title="name"
                    item-value="id"
                    label="Charge *"
                  />
                </div>
                <div>
                  <v-autocomplete
                    v-model="formBuyCharge.charge.inv_type"
                    density="compact"
                    :items="customerInvTypes"
                    item-title="name"
                    item-value="value"
                    label="Type *"
                  />
                </div>
                <div>
                  <v-autocomplete
                    v-model="formBuyCharge.charge.fuera_dentro_awb"
                    density="compact"
                    :items="fueraDentroBls"
                    item-title="name"
                    item-value="value"
                    label="F/D AWB *"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div class="col-span-3 font-bold">Buy details</div>
                <v-text-field v-model="formBuyCharge.charge.buy_amount" density="compact" label="Buy amount *" />
                <div class="flex gap-2">
                  <v-checkbox v-model="formBuyCharge.charge.is_buy_con_iva" density="compact" label="+ IVA" />
                  <v-autocomplete
                    v-model="formBuyCharge.charge.buy_currency_id"
                    density="compact"
                    :items="currencies"
                    item-title="name"
                    item-value="id"
                    label="Currency *"
                  />
                </div>
                <v-autocomplete
                  v-model="formBuyCharge.charge.buy_ppcc"
                  density="compact"
                  :items="ppccs"
                  item-title="name"
                  item-value="value"
                  label="PP/CC *"
                />
              </div>

              <v-btn color="primary" @click="saveBuyCharge">{{ labelSaveCharge }}</v-btn>
            </div>
          </div>

          <div v-if="buyCharges.length <= 0">
            <div class="text-center">No buy rate charges added</div>
          </div>

          <v-table density="compact">
            <thead>
              <tr>
                <th></th>
                <th>Invoice type</th>
                <th>PP/CC</th>
                <th>Type</th>
                <th>Charge</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(charge, index) in buyCharges" :key="`buy-${index}`">
                <td>
                  <div v-if="!hasLinkInvoice(charge)" class="flex gap-2">
                    <v-btn
                      color="primary"
                      icon="mdi-pencil-outline"
                      size="x-small"
                      variant="outlined"
                      class="mr-2"
                      @click="editBuyChargeDAWB(charge)"
                    >
                    </v-btn>
                    <v-btn
                      color="error"
                      icon="mdi-delete-outline"
                      size="x-small"
                      variant="outlined"
                      @click="showConfirmDelete(charge)"
                    >
                    </v-btn>
                  </div>
                </td>
                <td class="whitespace-nowrap">{{ charge.inv_type }}</td>
                <td class="whitespace-nowrap">{{ charge.buy_ppcc === 'P' ? 'Prepaid' : 'Collect' }}</td>
                <td class="whitespace-nowrap">
                  {{ charge.fuera_dentro_awb === 'F' ? 'Fuera de AWB' : 'Dentro de AWB' }}
                </td>
                <td>
                  <v-icon size="small">{{ linkedChargeToInvoice(charge) }}</v-icon>
                  {{ charge.charge?.name }}
                </td>
                <td class="text-right whitespace-nowrap">
                  {{ getCurrencyName(charge.buy_currency_id) }} {{ formatToCurrency(charge.buy_amount) }}
                </td>
                <td class="text-right whitespace-nowrap">
                  {{ getCurrencyName(charge.buy_currency_id) }} {{ formatToCurrency(charge.buy_iva) }}
                </td>
                <td class="text-right whitespace-nowrap">
                  {{ getCurrencyName(charge.buy_currency_id) }} {{ formatToCurrency(charge.buy_total) }}
                </td>
                <td class="whitespace-nowrap">
                  <UserInfoBadge :item="charge">
                    {{ formatDateString(charge.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showSellBreakdown" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="toggleSellBreakdown">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Sell rate detail</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-title>
          <div class="flex justify-between">
            <div>Sell rate charge(s)</div>
          </div>
        </v-card-title>
        <v-card-text>
          <div v-if="!formSellCharge.show">
            <v-btn color="primary" size="small" @click="newSellChargeForm">New sell charge</v-btn>
          </div>
          <!-- Formulario para cargo -->
          <div v-if="formSellCharge.show" class="py-4">
            <v-btn color="secondary" size="small" @click="closeSellChargeForm">Cancel</v-btn>
            <div class="py-4 px-2">
              <div class="font-bold text-lg">Charge form</div>
              <div class="grid grid-cols-4 gap-2">
                <div class="col-span-2">
                  <v-autocomplete
                    v-model="formSellCharge.charge.charge_id"
                    density="compact"
                    :items="catalogs.charges"
                    item-title="name"
                    item-value="id"
                    label="Charge *"
                  />
                </div>
                <div>
                  <v-autocomplete
                    v-model="formSellCharge.charge.inv_type"
                    density="compact"
                    :items="customerInvTypes"
                    item-title="name"
                    item-value="value"
                    label="Type *"
                  />
                </div>
                <div>
                  <v-autocomplete
                    v-model="formSellCharge.charge.fuera_dentro_awb"
                    density="compact"
                    :items="fueraDentroBls"
                    item-title="name"
                    item-value="value"
                    label="F/D AWB *"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div class="col-span-3 font-bold">Sell details</div>
                <v-text-field v-model="formSellCharge.charge.sell_amount" density="compact" label="Sell amount *" />
                <div class="flex gap-2">
                  <v-checkbox v-model="formSellCharge.charge.is_sell_con_iva" density="compact" label="+ IVA" />
                  <v-autocomplete
                    v-model="formSellCharge.charge.sell_currency_id"
                    density="compact"
                    :items="currencies"
                    item-title="name"
                    item-value="id"
                    label="Currency *"
                  />
                </div>
                <v-autocomplete
                  v-model="formSellCharge.charge.sell_ppcc"
                  density="compact"
                  :items="ppccs"
                  item-title="name"
                  item-value="value"
                  label="PP/CC *"
                />
              </div>

              <v-btn color="primary" @click="saveSellCharge">{{ labelSaveCharge }}</v-btn>
            </div>
          </div>

          <div v-if="sellCharges.length <= 0">
            <div class="text-center">No sell rate charges added</div>
          </div>

          <v-table density="compact">
            <thead>
              <tr>
                <th></th>
                <th>Invoice type</th>
                <th>PP/CC</th>
                <th>F/D AWB</th>
                <th>Charge</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(charge, index) in sellCharges" :key="`sell-${index}`">
                <td>
                  <div v-if="!hasLinkInvoice(charge)" class="flex gap-2">
                    <v-btn
                      color="primary"
                      icon="mdi-pencil-outline"
                      size="x-small"
                      variant="outlined"
                      class="mr-2"
                      @click="editSellChargeDAWB(charge)"
                    >
                    </v-btn>
                    <v-btn
                      color="error"
                      icon="mdi-delete-outline"
                      size="x-small"
                      variant="outlined"
                      @click="showConfirmDelete(charge)"
                    >
                    </v-btn>
                  </div>
                </td>

                <td>{{ charge.inv_type }}</td>
                <td>{{ charge.sell_ppcc === 'P' ? 'Prepaid' : 'Collect' }}</td>
                <td class="whitespace-nowrap">
                  {{ charge.fuera_dentro_awb === 'F' ? 'Fuera de AWB' : 'Dentro de AWB' }}
                </td>
                <td class="whitespace-nowrap">
                  <v-icon size="small">{{ linkedChargeToInvoice(charge) }}</v-icon>
                  {{ charge.charge?.name }}
                </td>
                <td class="text-right whitespace-nowrap">
                  {{ getCurrencyName(charge.sell_currency_id) }} {{ formatToCurrency(charge.sell_amount) }}
                </td>
                <td class="text-right whitespace-nowrap">
                  {{ getCurrencyName(charge.sell_currency_id) }} {{ formatToCurrency(charge.sell_iva) }}
                </td>
                <td class="text-right whitespace-nowrap">
                  {{ getCurrencyName(charge.sell_currency_id) }} {{ formatToCurrency(charge.sell_total) }}
                </td>
                <td class="whitespace-nowrap">
                  <UserInfoBadge :item="charge">
                    {{ formatDateString(charge.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { currencies, customerInvTypes } from '@/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  referenciaId: {
    type: String,
    required: true,
  },
  airReference: {
    type: Object,
    required: true,
  },
  impoExpo: {
    type: String,
    required: true,
  },
  showProformaBtn: {
    type: Boolean,
    default: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
})

const formCharge = ref<any>({
  show: false,
  charge: {
    id: null,
    has_sell: false,
    has_buy: false,
    charge_id: null,
    inv_type: null,
    fuera_dentro_awb: null,
    charge_type: null,
    buy_amount: null,
    is_buy_con_iva: false,
    buy_currency_id: null,
    buy_ppcc: null,
    sell_amount: null,
    is_sell_con_iva: false,
    sell_currency_id: null,
    sell_ppcc: null,
    buy_owner: null,
  },
})

const formSellCharge = ref<any>({
  show: false,
  charge: {
    id: null,
    has_sell: false,
    has_buy: false,
    charge_id: null,
    inv_type: null,
    fuera_dentro_awb: null,
    charge_type: null,
    buy_amount: null,
    is_buy_con_iva: false,
    buy_currency_id: null,
    buy_ppcc: null,
    sell_amount: null,
    is_sell_con_iva: false,
    sell_currency_id: null,
    sell_ppcc: null,
    buy_owner: null,
  },
})

const formBuyCharge = ref<any>({
  show: false,
  charge: {
    id: null,
    has_sell: false,
    has_buy: false,
    charge_id: null,
    inv_type: null,
    fuera_dentro_awb: null,
    charge_type: null,
    buy_amount: null,
    is_buy_con_iva: false,
    buy_currency_id: null,
    buy_ppcc: null,
    sell_amount: null,
    is_sell_con_iva: false,
    sell_currency_id: null,
    sell_ppcc: null,
    buy_owner: null,
  },
})

const buy_rate_type = ref<any>(null)
const sell_rate_type = ref<any>(null)

const catalogs = ref<any>({
  charges: [],
})

const fueraDentroBls = [
  { value: 'F', name: 'Fuera AWB' },
  { value: 'D', name: 'Dentro AWB' },
]

const ppccs = [
  { value: 'P', name: 'Prepaid' },
  { value: 'C', name: 'Collect' },
]

const referencia = ref<any>(null)
const charges = ref<any[]>([])
const showBuyBreakdown = ref(false)
const showSellBreakdown = ref(false)

const hasCharges = computed(() => fueraAwbCharges.value.length > 0)
const fueraAwbCharges = computed(() => charges.value.filter((charge) => charge.fuera_dentro_awb === 'F'))

// Filtrar charges según el tipo de factura seleccionado (TM/WM)
// TM: solo charges con clave SAT (code no nulo)
// WM: todos los charges
const filteredChargesMain = computed(() => {
  if (!catalogs.value?.charges) return []
  
  if (formCharge.value.charge.inv_type === 'tm') {
    return catalogs.value.charges.filter((c: any) => c.code && c.code.trim() !== '')
  }
  return catalogs.value.charges
})

const chargeFilterHintMain = computed(() => {
  if (formCharge.value.charge.inv_type === 'tm') {
    return `Only charges with SAT key (${filteredChargesMain.value.length} available)`
  }
  return ''
})

const onInvoiceTypeChangeMain = (value: any) => {
  if (formCharge.value.charge.charge_id) {
    const chargeStillValid = filteredChargesMain.value.some((c: any) => c.id === formCharge.value.charge.charge_id)
    if (!chargeStillValid) {
      formCharge.value.charge.charge_id = null
    }
  }
}

const labelSaveCharge = computed(() => (formCharge.value.charge.id ? 'Update charge' : 'Save charge'))

const labelNewCharge = computed(() => (formCharge.value.show ? 'Close form' : 'New charge'))

const chargesTotales = computed(() => {
  const totalPrepaid = parseFloat(
    charges.value
      .reduce((acc, charge) => {
        return charge.sell_ppcc === 'P' ? acc + parseFloat(charge.sell_amount) : acc
      }, 0)
      .toFixed(2)
  )

  const totalCollect = parseFloat(
    charges.value
      .reduce((acc, charge) => {
        return charge.sell_ppcc === 'C' ? acc + parseFloat(charge.sell_amount) : acc
      }, 0)
      .toFixed(2)
  )

  // buy totals
  const totalPrepaidBuy = parseFloat(
    charges.value
      .reduce((acc, charge) => {
        return charge.buy_ppcc === 'P' ? acc + parseFloat(charge.buy_amount) : acc
      }, 0)
      .toFixed(2)
  )

  const totalCollectBuy = parseFloat(
    charges.value
      .reduce((acc, charge) => {
        return charge.buy_ppcc === 'C' ? acc + parseFloat(charge.buy_amount) : acc
      }, 0)
      .toFixed(2)
  )

  // diff between sell and buy
  const profitPrepaid = totalPrepaid - totalPrepaidBuy
  const profitCollect = totalCollect - totalCollectBuy

  return {
    totalPrepaid,
    totalCollect,
    totalPrepaidBuy,
    totalCollectBuy,
    profitPrepaid,
    profitCollect,
  }
})

const chargesTotalesByCurrency = computed(() => {
  // Group totals by sell_currency_id
  const totalsBySellCurrency = charges.value.reduce((acc, charge) => {
    if (charge.fuera_dentro_awb === 'F') return acc // Skip if fuera_dentro_awb is 'F'
    const sellCurrency = charge.sell_currency_id
    if (!sellCurrency) return acc // Skip if sell_currency_id is null or undefined

    if (!acc[sellCurrency]) {
      acc[sellCurrency] = {
        totalPrepaid: 0,
        totalCollect: 0,
      }
    }

    if (charge.sell_ppcc === 'P') {
      acc[sellCurrency].totalPrepaid += parseFloat(
        (parseFloat(charge.sell_amount) + parseFloat(charge.sell_iva || 0)).toFixed(2)
      )
    }
    if (charge.sell_ppcc === 'C') {
      acc[sellCurrency].totalCollect += parseFloat(
        (parseFloat(charge.sell_amount) + parseFloat(charge.sell_iva || 0)).toFixed(2)
      )
    }

    return acc
  }, {})

  // Group totals by buy_currency_id
  const totalsByBuyCurrency = charges.value.reduce((acc, charge) => {
    if (charge.fuera_dentro_awb === 'F') return acc // Skip if fuera_dentro_awb is 'F'
    const buyCurrency = charge.buy_currency_id
    if (!buyCurrency) return acc // Skip if buy_currency_id is null or undefined

    if (!acc[buyCurrency]) {
      acc[buyCurrency] = {
        totalPrepaidBuy: 0,
        totalCollectBuy: 0,
      }
    }

    if (charge.buy_ppcc === 'P') {
      acc[buyCurrency].totalPrepaidBuy += parseFloat(
        (parseFloat(charge.buy_amount) + parseFloat(charge.buy_iva || 0)).toFixed(2)
      )
    }
    if (charge.buy_ppcc === 'C') {
      acc[buyCurrency].totalCollectBuy += parseFloat(
        (parseFloat(charge.buy_amount) + parseFloat(charge.buy_iva || 0)).toFixed(2)
      )
    }

    return acc
  }, {})

  // Calculate profit by currency
  const profitsByCurrency = Object.keys(totalsBySellCurrency).reduce((acc: any, currencyId) => {
    acc[currencyId] = {
      profitPrepaid: parseFloat(
        (
          (totalsBySellCurrency[currencyId]?.totalPrepaid || 0) -
          (totalsByBuyCurrency[currencyId]?.totalPrepaidBuy || 0)
        ).toFixed(2)
      ),
      profitCollect: parseFloat(
        (
          (totalsBySellCurrency[currencyId]?.totalCollect || 0) -
          (totalsByBuyCurrency[currencyId]?.totalCollectBuy || 0)
        ).toFixed(2)
      ),
    }
    return acc
  }, {})

  return {
    totalsBySellCurrency,
    totalsByBuyCurrency,
    profitsByCurrency,
  }
})

const toggleBuyBreakdown = () => {
  showBuyBreakdown.value = !showBuyBreakdown.value
}
const toggleSellBreakdown = () => {
  showSellBreakdown.value = !showSellBreakdown.value
}

const buyChargesTotales = computed(() => {
  // buy totales
  const totalPrepaidBuy = charges.value.reduce((acc, charge) => {
    return charge.buy_ppcc === 'P' ? acc + charge.buy_amount : acc
  }, 0)
  const totalCollectBuy = charges.value.reduce((acc, charge) => {
    return charge.buy_ppcc === 'C' ? acc + charge.buy_amount : acc
  }, 0)

  // sell totales where buy owner is supplier
  const totalPrepaidSell = charges.value.reduce((acc, charge) => {
    return charge.is_sell === 1 && charge.sell_ppcc === 'P' ? acc + charge.sell_amount : acc
  }, 0)

  const totalCollectSell = charges.value.reduce((acc, charge) => {
    return charge.is_sell === 1 && charge.sell_ppcc === 'C' ? acc + charge.sell_amount : acc
  }, 0)

  return {
    totalPrepaidBuy,
    totalCollectBuy,
    totalPrepaidSell,
    totalCollectSell,
  }
})

const buyCharges = computed(() => {
  return charges.value.filter((charge) => charge.buy_amount != null && charge.fuera_dentro_awb === 'D')
})

const sellCharges = computed(() => {
  return charges.value.filter((charge) => charge.sell_amount != null && charge.fuera_dentro_awb === 'D')
})

const buyRateTotal = computed(() => {
  return chargesTotales.value.totalPrepaidBuy - chargesTotales.value.totalCollectBuy
})

const isValidForm = computed(() => {
  const { charge } = formCharge.value
  // if has not sell and but is invalid
  if (!charge.has_sell && !charge.has_buy) {
    return false
  }
  const isValid =
    charge.charge_id &&
    charge.inv_type &&
    charge.fuera_dentro_awb &&
    (charge.has_sell ? charge.sell_amount && charge.sell_ppcc : true) &&
    (charge.has_buy ? charge.buy_amount && charge.buy_ppcc : true)

  return isValid
})

const isValidBuyForm = computed(() => {
  const { charge } = formBuyCharge.value

  const isValid =
    charge.charge_id && charge.inv_type && charge.fuera_dentro_awb && charge.buy_amount > 0 && charge.buy_ppcc

  return isValid
})

const isValidSellForm = computed(() => {
  const { charge } = formSellCharge.value

  const isValid =
    charge.charge_id && charge.inv_type && charge.fuera_dentro_awb && charge.sell_amount > 0 && charge.sell_ppcc

  return isValid
})

const boxColorBuyOwner = (charge: any) => {
  return {
    'w-5 h-5 bg-yellow-300': charge.buy_owner_value === 'Freight line',
    'w-5 h-5 bg-red-200': charge.buy_owner_value === 'Supplier',
  }
}

const toggleChargeForm = () => {
  formCharge.value.show = !formCharge.value.show
  formCharge.value.charge = {
    id: null,
    has_sell: false,
    has_buy: false,
    charge_id: null,
    inv_type: null,
    fuera_dentro_awb: null,
    buy_amount: null,
    is_buy_con_iva: false,
    buy_currency_id: null,
    buy_ppcc: null,
    sell_amount: null,
    is_sell_con_iva: false,
    sell_currency_id: null,
    sell_ppcc: null,
  }
}

const editCharge = (charge: any) => {
  formCharge.value.show = true
  formCharge.value.charge = {
    id: charge.id,
    has_sell: charge.sell_amount ? true : false,
    has_buy: charge.buy_amount ? true : false,
    charge_id: charge.charge_id,
    inv_type: charge.inv_type,
    fuera_dentro_awb: charge.fuera_dentro_awb,
    buy_amount: charge.buy_amount,
    is_buy_con_iva: charge.buy_iva > 0,
    buy_currency_id: charge.buy_currency_id,
    buy_ppcc: charge.buy_ppcc,
    sell_amount: charge.sell_amount,
    is_sell_con_iva: charge.sell_iva > 0,
    sell_currency_id: charge.sell_currency_id,
    sell_ppcc: charge.sell_ppcc,
  }
}

const showConfirmDelete = async (airCharge: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete it.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.airReferences.deleteAirCharge(props.referenciaId, airCharge, !props.canEdit)
      await getAirCharges()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const editBuyChargeDAWB = (charge: any) => {
  formBuyCharge.value.show = true
  formBuyCharge.value.charge = {
    id: charge.id,
    has_sell: false,
    has_buy: true,
    charge_id: charge.charge_id,
    inv_type: charge.inv_type,
    fuera_dentro_awb: charge.fuera_dentro_awb,
    buy_amount: charge.buy_amount,
    is_buy_con_iva: charge.buy_iva > 0,
    buy_currency_id: charge.buy_currency_id,
    buy_ppcc: charge.buy_ppcc,
    sell_amount: charge.sell_amount,
    is_sell_con_iva: charge.sell_iva > 0,
    sell_currency_id: charge.sell_currency_id,
    sell_ppcc: charge.sell_ppcc,
  }
}

const closeBuyChargeForm = () => {
  formBuyCharge.value.show = false
  formBuyCharge.value.charge = {
    id: null,
    has_sell: false,
    has_buy: true,
    charge_id: null,
    inv_type: null,
    fuera_dentro_awb: null,
    buy_amount: null,
    is_buy_con_iva: false,
    buy_currency_id: null,
    buy_ppcc: null,
    sell_amount: null,
    is_sell_con_iva: false,
    sell_currency_id: null,
    sell_ppcc: null,
  }
}

const newBuyChargeForm = () => {
  formBuyCharge.value.charge = {
    id: null,
    has_sell: false,
    has_buy: true,
    charge_id: null,
    inv_type: null,
    fuera_dentro_awb: null,
    buy_amount: null,
    is_buy_con_iva: false,
    buy_currency_id: null,
    buy_ppcc: null,
    sell_amount: null,
    is_sell_con_iva: false,
    sell_currency_id: null,
    sell_ppcc: null,
  }
  formBuyCharge.value.show = true
}

const editSellChargeDAWB = (charge: any) => {
  formSellCharge.value.show = true
  formSellCharge.value.charge = {
    id: charge.id,
    has_sell: true,
    has_buy: false,
    charge_id: charge.charge_id,
    inv_type: charge.inv_type,
    fuera_dentro_awb: charge.fuera_dentro_awb,
    buy_amount: charge.buy_amount,
    is_buy_con_iva: charge.buy_iva > 0,
    buy_currency_id: charge.buy_currency_id,
    buy_ppcc: charge.buy_ppcc,
    sell_amount: charge.sell_amount,
    is_sell_con_iva: charge.sell_iva > 0,
    sell_currency_id: charge.sell_currency_id,
    sell_ppcc: charge.sell_ppcc,
  }
}

const closeSellChargeForm = () => {
  formSellCharge.value.show = false
  formSellCharge.value.charge = {
    id: null,
    has_sell: true,
    has_buy: false,
    charge_id: null,
    inv_type: null,
    fuera_dentro_awb: null,
    buy_amount: null,
    is_buy_con_iva: false,
    buy_currency_id: null,
    buy_ppcc: null,
    sell_amount: null,
    is_sell_con_iva: false,
    sell_currency_id: null,
    sell_ppcc: null,
  }
}

const newSellChargeForm = () => {
  formSellCharge.value.charge = {
    id: null,
    has_sell: true,
    has_buy: false,
    charge_id: null,
    inv_type: null,
    fuera_dentro_awb: null,
    buy_amount: null,
    is_buy_con_iva: false,
    buy_currency_id: null,
    buy_ppcc: null,
    sell_amount: null,
    is_sell_con_iva: false,
    sell_currency_id: null,
    sell_ppcc: null,
  }
  formSellCharge.value.show = true
}

const goToAirProformas = () => {
  const importExport = props.impoExpo === 'I' ? 'import' : 'export'
  router.push(`/air/${importExport}/proformas-${props.referenciaId}`)
}

const linkedChargeToInvoice = (charge: any) => {
  if (charge.invoice_charge != null) {
    return 'mdi-link'
  }
  return 'mdi-link-off'
}

const hasLinkInvoice = (charge: any) => {
  return charge.invoice_charge != null
}

const saveBuyCharge = async () => {
  try {
    if (!isValidBuyForm.value) {
      snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
      return
    }
    loadingStore.start()
    await $api.airReferences.saveCharge(props.referenciaId, formBuyCharge.value.charge, !props.canEdit)
    snackbar.add({ type: 'success', text: 'Air charge saved' })
    await getAirCharges()
    closeBuyChargeForm()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveSellCharge = async () => {
  try {
    if (!isValidSellForm.value) {
      snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
      return
    }
    loadingStore.start()
    await $api.airReferences.saveCharge(props.referenciaId, formSellCharge.value.charge, !props.canEdit)
    snackbar.add({ type: 'success', text: 'Air charge saved' })
    await getAirCharges()
    closeSellChargeForm()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveCharge = async () => {
  try {
    if (!isValidForm.value) {
      snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
      return
    }
    loadingStore.start()
    const response = await $api.airReferences.saveCharge(props.referenciaId, formCharge.value.charge, !props.canEdit)
    snackbar.add({ type: 'success', text: 'Air charge saved' })
    await getAirCharges()
    toggleChargeForm()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const deleteCharge = async (charge: any) => {
  try {
    loadingStore.loading = true

    const response = await $api.airReferences.deleteAirCharge(props.referenciaId, charge, !props.canEdit)
    await getAirCharges()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const savePPCC = async (type: string) => {
  try {
    loadingStore.loading = true
    const body = {
      type: type,
      sell_ppcc: sell_rate_type.value,
      buy_ppcc: buy_rate_type.value,
    }
    await $api.airReferences.updatePrepaidCollectByType(props.referenciaId, body, !props.canEdit)
    snackbar.add({ type: 'success', text: 'PP/CC saved' })
    await getAirCharges()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const mapExportCharges = (charges: any[]) => {
  return charges.map((charge) => {
    return {
      ...charge,
      fuera_dentro_awb_value: charge.fuera_dentro_awb === 'F' ? 'Fuera de BL' : 'Dentro de BL',
      sell_ppcc_value: charge.sell_ppcc === 'P' ? 'Prepaid' : 'Collect',
      buy_ppcc_value: charge.buy_ppcc === 'P' ? 'Prepaid' : 'Collect',
    }
  })
}

const getAirCharges = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.airReferences.getCharges(props.referenciaId)) as any
    referencia.value = response
    charges.value = mapExportCharges(response || [])
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.airReferences.getAllCharges()
    catalogs.value.charges = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getCatalogs()
await getAirCharges()

defineExpose({
  getAirCharges,
})

// watch prop airReference to update buy_rate_type and sell_rate_type
watch(
  () => props.airReference,
  (newValue) => {
    if (newValue) {
      buy_rate_type.value = newValue.buy_rate_type
      sell_rate_type.value = newValue.sell_rate_type
    }
  },
  { immediate: true }
)
</script>
