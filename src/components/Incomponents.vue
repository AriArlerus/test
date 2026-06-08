<template>
  <v-container>
    <v-expansion-panels variant="accordion" multiple>
      <!-- Panel 1: ค้นหาข้อมูล -->
      <v-expansion-panel>
        <v-expansion-panel-title>
          ค้นหาข้อมูลสายงาน
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="input-row">
            <div class="search-wrapper">
              <label class="search-label">สายงาน (TH/EN)</label>
              <v-text-field
                v-model="searchText"
                placeholder="ระบุสายงาน (TH/EN)"
                density="compact"
                variant="outlined"
                hide-details
              />
            </div>
            <div class="search-wrapper">
              <label class="search-label">สถานะการใช้งาน</label>
              <v-select
                v-model="selectedStatus"
                :items="statusOptions"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
              />
            </div>
          </div>
          <div class="btn-row">
            <v-btn color="primary" :loading="loading" @click="fetchData">ค้นหาข้อมูล</v-btn>
            <v-btn color="warning" @click="clearSearch">เคลียร์ข้อมูล</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Panel 2: ตารางข้อมูล -->
      <v-expansion-panel>
        <v-expansion-panel-title>
          ข้อมูลสายงาน
        </v-expansion-panel-title>
        <v-expansion-panel-text>
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
                  <v-chip
                    :color="item.RECORD_STATUS === 'A' ? 'success' : 'error'"
                    variant="outlined"
                    size="small"
                  >
                    {{ item.RECORD_STATUS === 'A' ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                  </v-chip>
                </td>
                <td>
                  <v-btn icon size="small" variant="outlined" color="warning" class="mr-1" @click="openEdit(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" variant="outlined" color="error" @click="confirmDelete(item)">
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
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Edit Dialog -->
    <EditDialog ref="editDialog" @saved="fetchData" />

    <!-- Delete Confirmation Dialog -->
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
          <v-btn variant="outlined" color="grey" @click="deleteDialog = false">ยกเลิก</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteItem">ลบ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios'
import EditDialog from './Edit.vue'

const API_URL = 'http://localhost:3000/api/mas-position'

export default {
  name: 'InComponents',
  components: { EditDialog },
  data() {
    return {
      searchText: '',
      selectedStatus: '',
      statusOptions: [
        { label: 'ทั้งหมด', value: '' },
        { label: 'ใช้งาน', value: 'A' },
        { label: 'ไม่ใช้งาน', value: 'I' },
      ],
      items: [],
      loading: false,
      errorMsg: '',
      currentPage: 1,
      pageSize: 5,
      deleteDialog: false,
      deleteTarget: null,
      deleting: false,
    }
  },
  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.items.length / this.pageSize))
    },
    pagedItems() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.items.slice(start, start + this.pageSize)
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      this.errorMsg = ''
      try {
        const res = await axios.get(API_URL, {
          params: { keyword: this.searchText, status: this.selectedStatus }
        })
        this.items = res.data
        this.currentPage = 1
      } catch (err) {
        this.errorMsg = 'ไม่สามารถเชื่อมต่อ server ได้: ' + err.message
      } finally {
        this.loading = false
      }
    },
    clearSearch() {
      this.searchText = ''
      this.selectedStatus = ''
      this.fetchData()
    },
    openEdit(item) {
      this.$refs.editDialog.open(item)
    },
    confirmDelete(item) {
      this.deleteTarget = item
      this.deleteDialog = true
    },
    async deleteItem() {
      this.deleting = true
      try {
        await axios.delete(`${API_URL}/${this.deleteTarget.POSI_ID}`, {
          data: { UPDATED_BY: 'user' }
        })
        this.deleteDialog = false
        this.deleteTarget = null
        await this.fetchData()
      } catch (err) {
        alert('ลบไม่สำเร็จ: ' + err.message)
      } finally {
        this.deleting = false
      }
    },
  }
}
</script>

<style scoped>
.input-row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.search-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.search-label {
  text-align: left;
  font-size: 14px;
  font-weight: bold;
  color: #2c3e50;
}

.btn-row {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: center;
}

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

.delete-title {
  font-size: 16px;
  font-weight: bold;
  padding: 16px 20px;
}
</style>
