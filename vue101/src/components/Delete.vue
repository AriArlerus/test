<template>
  <v-dialog v-model="dialog" max-width="400" persistent>
    <v-card>
      <v-card-title class="delete-title">
        <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
        ยืนยันการลบข้อมูล
      </v-card-title>
      <v-divider />
      <v-card-text class="pt-4">
        ต้องการลบ <strong>{{ target?.POSI_NAME_TH }}</strong> ใช่หรือไม่?
        <br />
        <span class="text-grey text-caption">รหัส: {{ target?.POSI_CODE }}</span>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="outlined" color="grey" @click="close">ยกเลิก</v-btn>
        <v-btn color="error" :loading="deleting" @click="confirmDelete">ลบ</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios'

const API_URL = 'http://localhost:3000/api/mas-position'

export default {
  name: 'DeleteDialog',
  emits: ['deleted'],
  data() {
    return {
      dialog: false,
      deleting: false,
      target: null,
    }
  },
  methods: {
    open(item) {
      this.target = item
      this.dialog = true
    },
    close() {
      this.dialog = false
      this.target = null
    },
    async confirmDelete() {
      this.deleting = true
      try {
        await axios.delete(`${API_URL}/${this.target.POSI_ID}`, {
          data: { UPDATED_BY: 'user' }
        })
        this.$emit('deleted')
        this.close()
      } catch (err) {
        alert('ลบไม่สำเร็จ: ' + err.message)
      } finally {
        this.deleting = false
      }
    },
  },
}
</script>

<style scoped>
.delete-title {
  font-size: 16px;
  font-weight: bold;
  padding: 16px 20px;
}
</style>
