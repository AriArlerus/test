<template>
  <v-container fluid class="pa-4">
    <div class="top-bar">
      <v-btn color="primary" @click="$refs.addDialog.open()">+ เพิ่มข้อมูล</v-btn>
    </div>

    <v-expansion-panels variant="accordion" multiple>
      <!-- Panel 1: ค้นหาข้อมูล -->
      <v-expansion-panel>
        <v-expansion-panel-title class="panel-title">
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
        <v-expansion-panel-title class="panel-title">
          ข้อมูลสายงาน
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <DataTable
            :items="items"
            :loading="loading"
            :error-msg="errorMsg"
            @refresh="fetchData"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <AddDialog ref="addDialog" @saved="fetchData" />
  </v-container>
</template>

<script>
import axios from 'axios'
import DataTable from './Table.vue'
import AddDialog from './Add.vue'

const API_URL = 'http://localhost:3000/api/mas-position'

export default {
  name: 'SearchPanel',
  components: { DataTable, AddDialog },
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
  },
}
</script>

<style scoped>
.panel-title {
  background-color: #c6e2f0;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

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
</style>
