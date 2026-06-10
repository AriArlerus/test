<template>
  <div>
    <v-alert v-if="errorMsg" type="error" class="mb-3">{{ errorMsg }}</v-alert>

    <!-- ตาราง -->
    <v-table density="compact">
      <thead>
        <tr>
          <th>ลำดับ</th>
          <th>รหัสข้อมูล</th>
          <th>ชื่อ (TH)</th>
          <th>ชื่อ (EN)</th>
          <th>สายงาน (TH)</th>
          <th>สายงาน (EN)</th>
          <th>สถานะการใช้งาน</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="8" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" />
          </td>
        </tr>
        <tr v-else-if="pagedItems.length === 0">
          <td colspan="8" class="text-center py-4">ไม่พบข้อมูล</td>
        </tr>
        <tr v-else v-for="(item, index) in pagedItems" :key="item.POSI_ID">
          <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
          <td>{{ item.POSI_CODE }}</td>
          <td>{{ item.POSI_NAME_SHORT_TH }}</td>
          <td>{{ item.POSI_NAME_SHORT_EN }}</td>
          <td>{{ item.POSI_NAME_TH }}</td>
          <td>{{ item.POSI_NAME_EN }}</td>
          <td>
            <v-chip :color="item.RECORD_STATUS === 'A' ? 'success' : 'error'" variant="outlined" size="small">
              {{ item.RECORD_STATUS === 'A' ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
            </v-chip>
          </td>
          <td>
            <v-btn icon size="small" variant="outlined" color="warning" class="mr-1" @click="openEdit(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="outlined" color="error" @click="openDelete(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Pagination -->
    <div class="pagination-bar">
      <div class="page-size">
        แสดง
        <v-select v-model="pageSize" :items="[5, 10, 20]" density="compact" variant="outlined" hide-details
          style="width: 80px; display: inline-flex;" @update:modelValue="currentPage = 1" />
        รายการ
      </div>
      <div class="page-info">
        แสดงจำนวน {{ items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1 }}
        ถึง {{ Math.min(currentPage * pageSize, items.length) }}
        จาก {{ items.length }} รายการ
      </div>
      <div class="page-controls">
        <v-btn icon size="small" variant="text" :disabled="currentPage === 1" @click="currentPage = 1">
          <v-icon>mdi-page-first</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="text" :disabled="currentPage === 1" @click="currentPage--">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn size="small" color="primary">{{ currentPage }}</v-btn>
        <v-btn icon size="small" variant="text" :disabled="currentPage === totalPages" @click="currentPage++">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="text" :disabled="currentPage === totalPages" @click="currentPage = totalPages">
          <v-icon>mdi-page-last</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="edit-title">แก้ไขข้อมูลสายงาน</v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <v-form ref="editFormRef" v-model="isFormValid">
            <v-row>
              <v-col cols="12">
                <label class="field-label">รหัสข้อมูล <span class="required">*</span></label>
                <v-text-field v-model="editForm.POSI_CODE" placeholder="ระบุรหัสข้อมูล" density="compact" variant="outlined" hide-details="auto" :rules="[rules.required]" />
              </v-col>
              <v-col cols="6">
                <label class="field-label">ชื่อ (TH)</label>
                <v-text-field v-model="editForm.POSI_NAME_SHORT_TH" placeholder="ระบุชื่อ (TH)" density="compact" variant="outlined" hide-details />
              </v-col>
              <v-col cols="6">
                <label class="field-label">ชื่อ (EN)</label>
                <v-text-field v-model="editForm.POSI_NAME_SHORT_EN" placeholder="ระบุชื่อ (EN)" density="compact" variant="outlined" hide-details />
              </v-col>
              <v-col cols="6">
                <label class="field-label">สายงาน (TH) <span class="required">*</span></label>
                <v-text-field v-model="editForm.POSI_NAME_TH" placeholder="ระบุสายงาน (TH)" density="compact" variant="outlined" hide-details="auto" :rules="[rules.required]" />
              </v-col>
              <v-col cols="6">
                <label class="field-label">สายงาน (EN)</label>
                <v-text-field v-model="editForm.POSI_NAME_EN" placeholder="ระบุสายงาน (EN)" density="compact" variant="outlined" hide-details />
              </v-col>
              <v-col cols="6">
                <label class="field-label">สถานะการใช้งาน <span class="required">*</span></label>
                <v-select v-model="editForm.RECORD_STATUS" :items="statusOptions" item-title="label" item-value="value" density="compact" variant="outlined" hide-details="auto" :rules="[rules.required]" />
              </v-col>
              <v-col cols="6">
                <label class="field-label">วันที่เริ่มต้นใช้งาน</label>
                <v-text-field v-model="editForm.START_DATE" type="date" density="compact" variant="outlined" hide-details />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" color="grey" @click="closeEdit">ยกเลิก</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveEdit">บันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="delete-title">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          ยืนยันการลบข้อมูล
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          ต้องการลบ <strong>{{ deleteTarget?.POSI_NAME_TH }}</strong> ใช่หรือไม่?
          <br />
          <span class="text-grey text-caption">รหัส: {{ deleteTarget?.POSI_CODE }}</span>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" color="grey" @click="closeDelete">ยกเลิก</v-btn>
          <v-btn color="error" :loading="deleting" @click="confirmDelete">ลบ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, watch, reactive } from 'vue'

const API_URL = 'http://localhost:3000/api/mas-position'

// รับ props จาก parent: รายการข้อมูล, สถานะโหลด, และข้อความ error
const props = defineProps({
  items: Array,
  loading: Boolean,
  errorMsg: String,
})

// emit 'refresh' ให้ parent โหลดข้อมูลใหม่หลังแก้ไข/ลบ
const emit = defineEmits(['refresh'])

// ── Pagination ──────────────────────────────────────
const currentPage = ref(1)
const pageSize = ref(5) // จำนวนรายการต่อหน้า

// คำนวณจำนวนหน้าทั้งหมด (ขั้นต่ำ 1 หน้า)
const totalPages = computed(() => Math.max(1, Math.ceil(props.items.length / pageSize.value)))

// ตัดข้อมูลเฉพาะหน้าปัจจุบันมาแสดง
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return props.items.slice(start, start + pageSize.value)
})

// เมื่อข้อมูลเปลี่ยน (เช่น ค้นหาใหม่) ให้กลับไปหน้าที่ 1
watch(() => props.items, () => { currentPage.value = 1 })

// ── Edit ────────────────────────────────────────────
const editDialog = ref(false)
const isFormValid = ref(false)
const saving = ref(false)      // แสดง loading ขณะบันทึก
const editFormRef = ref()
const posiId = ref(null)       // เก็บ ID ของแถวที่กำลังแก้ไข

const editForm = reactive({
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

const rules = { required: (v) => !!v || 'กรุณากรอกข้อมูล' }

// เปิด dialog แก้ไข พร้อมนำข้อมูลของแถวนั้นมาเติมในฟอร์ม
// START_DATE ตัดเฉพาะ 10 ตัวแรก (yyyy-MM-dd) เพราะ API คืน ISO string
function openEdit(item) {
  posiId.value = item.POSI_ID
  editForm.POSI_CODE = item.POSI_CODE ?? ''
  editForm.POSI_NAME_SHORT_TH = item.POSI_NAME_SHORT_TH ?? ''
  editForm.POSI_NAME_SHORT_EN = item.POSI_NAME_SHORT_EN ?? ''
  editForm.POSI_NAME_TH = item.POSI_NAME_TH ?? ''
  editForm.POSI_NAME_EN = item.POSI_NAME_EN ?? ''
  editForm.RECORD_STATUS = item.RECORD_STATUS ?? 'A'
  editForm.START_DATE = item.START_DATE ? item.START_DATE.slice(0, 10) : ''
  editDialog.value = true
}

// ปิด dialog แก้ไขและล้างฟอร์ม
function closeEdit() {
  editDialog.value = false
  editFormRef.value?.reset()
}

// ตรวจสอบฟอร์มแล้วส่ง PUT ไปอัปเดตข้อมูล
async function saveEdit() {
  const { valid } = await editFormRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    await axios.put(`${API_URL}/${posiId.value}`, { ...editForm, UPDATED_BY: 'user' })
    emit('refresh')
    closeEdit()
  } catch (err) {
    alert('บันทึกไม่สำเร็จ: ' + err.message)
  } finally {
    saving.value = false
  }
}

// ── Delete ─────────────────────────────────────────
const deleteDialog = ref(false)
const deleting = ref(false)        // แสดง loading ขณะลบ
const deleteTarget = ref(null)     // เก็บข้อมูลแถวที่จะลบ เพื่อแสดงยืนยัน

// เปิด dialog ยืนยันการลบ
function openDelete(item) {
  deleteTarget.value = item
  deleteDialog.value = true
}

// ปิด dialog ลบและเคลียร์ target
function closeDelete() {
  deleteDialog.value = false
  deleteTarget.value = null
}

// ยืนยันลบ: ส่ง DELETE ไป API (Soft Delete ที่ backend)
async function confirmDelete() {
  deleting.value = true
  try {
    await axios.delete(`${API_URL}/${deleteTarget.value.POSI_ID}`, {
      data: { UPDATED_BY: 'user' }
    })
    emit('refresh')
    closeDelete()
  } catch (err) {
    alert('ลบไม่สำเร็จ: ' + err.message)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  font-size: 14px;
}
.page-size { display: flex; align-items: center; gap: 8px; }
.page-info { flex: 1; text-align: center; }
.page-controls { display: flex; align-items: center; gap: 4px; }

.edit-title {
  background-color: #fff3cd;
  font-size: 16px;
  font-weight: bold;
  padding: 16px 20px;
}
.delete-title {
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
