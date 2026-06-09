<template>
  <div>
    <v-alert v-if="errorMsg" type="error" class="mb-3">{{ errorMsg }}</v-alert>

    <v-table density="compact">
      <thead>
        <tr>
          <th>ลำดับ</th>
          <th>รหัสข้อมูล</th>
          <th>ชื่อย่อ (TH)</th>
          <th>ชื่อย่อ (EN)</th>
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
        <tr v-for="(item, index) in pagedItems" :key="item.POSI_ID">
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
            <v-btn icon size="small" variant="outlined" color="warning" class="mr-1" @click="editDialog?.open(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="outlined" color="error" @click="deleteDialog?.open(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <div class="pagination-bar">
      <div class="page-size">
        แสดง
        <v-select
          v-model="pageSize"
          :items="[5, 10, 20]"
          density="compact"
          variant="outlined"
          hide-details
          style="width: 80px; display: inline-flex;"
          @update:modelValue="currentPage = 1"
        />
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

    <EditDialog ref="editDialog" @saved="emit('refresh')" />
    <DeleteDialog ref="deleteDialog" @deleted="emit('refresh')" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import EditDialog from './Edit.vue'
import DeleteDialog from './Delete.vue'

const props = defineProps<{
  items: any[]
  loading: boolean
  errorMsg: string
}>()

const emit = defineEmits<{ refresh: [] }>()

const editDialog = ref<InstanceType<typeof EditDialog>>()
const deleteDialog = ref<InstanceType<typeof DeleteDialog>>()

const currentPage = ref(1)
const pageSize = ref(5)

const totalPages = computed(() => Math.max(1, Math.ceil(props.items.length / pageSize.value)))
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return props.items.slice(start, start + pageSize.value)
})

watch(() => props.items, () => { currentPage.value = 1 })
</script>

<style scoped>
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  font-size: 14px;
}
.page-size {
  display: flex;
  align-items: center;
  gap: 8px;
}
.page-info {
  flex: 1;
  text-align: center;
}
.page-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
