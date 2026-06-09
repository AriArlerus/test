<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card>
      <v-card-title class="dialog-title">แก้ไขข้อมูลสายงาน</v-card-title>
      <v-divider />
      <v-card-text class="pt-4">
        <v-form ref="formRef" v-model="isFormValid">
          <v-row>
            <v-col cols="12">
              <label class="field-label">รหัสข้อมูล <span class="required">*</span></label>
              <v-text-field v-model="form.POSI_CODE" placeholder="ระบุรหัสข้อมูล" density="compact" variant="outlined" hide-details="auto" :rules="[rules.required]" />
            </v-col>
            <v-col cols="6">
              <label class="field-label">ชื่อย่อ (TH)</label>
              <v-text-field v-model="form.POSI_NAME_SHORT_TH" placeholder="ระบุชื่อย่อ (TH)" density="compact" variant="outlined" hide-details />
            </v-col>
            <v-col cols="6">
              <label class="field-label">ชื่อย่อ (EN)</label>
              <v-text-field v-model="form.POSI_NAME_SHORT_EN" placeholder="ระบุชื่อย่อ (EN)" density="compact" variant="outlined" hide-details />
            </v-col>
            <v-col cols="6">
              <label class="field-label">สายงาน (TH) <span class="required">*</span></label>
              <v-text-field v-model="form.POSI_NAME_TH" placeholder="ระบุสายงาน (TH)" density="compact" variant="outlined" hide-details="auto" :rules="[rules.required]" />
            </v-col>
            <v-col cols="6">
              <label class="field-label">สายงาน (EN)</label>
              <v-text-field v-model="form.POSI_NAME_EN" placeholder="ระบุสายงาน (EN)" density="compact" variant="outlined" hide-details />
            </v-col>
            <v-col cols="6">
              <label class="field-label">สถานะการใช้งาน <span class="required">*</span></label>
              <v-select v-model="form.RECORD_STATUS" :items="statusOptions" item-title="label" item-value="value" density="compact" variant="outlined" hide-details="auto" :rules="[rules.required]" />
            </v-col>
            <v-col cols="6">
              <label class="field-label">วันที่เริ่มต้นใช้งาน</label>
              <v-text-field v-model="form.START_DATE" type="date" density="compact" variant="outlined" hide-details />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="outlined" color="grey" @click="close">ยกเลิก</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, reactive } from 'vue'

const API_URL = 'http://localhost:3000/api/mas-position'

const emit = defineEmits<{ saved: [] }>()

const dialog = ref(false)
const isFormValid = ref(false)
const saving = ref(false)
const formRef = ref()
const posiId = ref<number | null>(null)

const form = reactive({
  POSI_CODE: '',
  POSI_NAME_SHORT_TH: '',
  POSI_NAME_SHORT_EN: '',
  POSI_NAME_TH: '',
  POSI_NAME_EN: '',
  RECORD_STATUS: 'A',
  START_DATE: '',
})

const statusOptions = [
  { label: 'ใช้งาน', value: 'A' },
  { label: 'ไม่ใช้งาน', value: 'I' },
]

const rules = {
  required: (v: string) => !!v || 'กรุณากรอกข้อมูล',
}

function open(item: any) {
  posiId.value = item.POSI_ID
  form.POSI_CODE = item.POSI_CODE ?? ''
  form.POSI_NAME_SHORT_TH = item.POSI_NAME_SHORT_TH ?? ''
  form.POSI_NAME_SHORT_EN = item.POSI_NAME_SHORT_EN ?? ''
  form.POSI_NAME_TH = item.POSI_NAME_TH ?? ''
  form.POSI_NAME_EN = item.POSI_NAME_EN ?? ''
  form.RECORD_STATUS = item.RECORD_STATUS ?? 'A'
  form.START_DATE = item.START_DATE ? item.START_DATE.slice(0, 10) : ''
  dialog.value = true
}

function close() {
  dialog.value = false
  formRef.value?.reset()
}

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    await axios.put(`${API_URL}/${posiId.value}`, { ...form, UPDATED_BY: 'user' })
    emit('saved')
    close()
  } catch (err: any) {
    alert('บันทึกไม่สำเร็จ: ' + err.message)
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.dialog-title {
  background-color: #fff3cd;
  font-size: 16px;
  font-weight: bold;
  padding: 16px 20px;
}
.field-label {
  display: block;
  font-size: 13px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}
.required { color: #e74c3c; }
</style>
