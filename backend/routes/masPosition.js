const express = require('express')
const pool = require('../db/pool')
const router = express.Router()

// GET ทั้งหมด / ค้นหา
router.get('/', async (req, res) => {
  try {
    const { keyword = '', status = '' } = req.query
    let sql = `
      SELECT * FROM mas_position
      WHERE DELETE_FLAG IS NULL
        AND (POSI_NAME_TH LIKE ? OR POSI_NAME_EN LIKE ? OR POSI_CODE LIKE ?)
    `
    const params = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]

    if (status) {
      sql += ' AND RECORD_STATUS = ?'
      params.push(status)
    }

    sql += ' ORDER BY POSI_ID'

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST สร้างใหม่
router.post('/', async (req, res) => {
  try {
    const {
      POSI_CODE, POSI_NAME_SHORT_TH, POSI_NAME_SHORT_EN,
      POSI_NAME_TH, POSI_NAME_EN, JOB_BRAND_CODE,
      EDU_QUALIFICATION, CORE_POSI_CODE, RECORD_STATUS,
      START_DATE, END_DATE, CREATED_BY
    } = req.body

    const [result] = await pool.query(`
      INSERT INTO mas_position
        (POSI_CODE, POSI_NAME_SHORT_TH, POSI_NAME_SHORT_EN, POSI_NAME_TH, POSI_NAME_EN,
         JOB_BRAND_CODE, EDU_QUALIFICATION, CORE_POSI_CODE, RECORD_STATUS,
         START_DATE, END_DATE, CREATED_BY, UPDATED_BY)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      POSI_CODE, POSI_NAME_SHORT_TH, POSI_NAME_SHORT_EN, POSI_NAME_TH, POSI_NAME_EN,
      JOB_BRAND_CODE, EDU_QUALIFICATION, CORE_POSI_CODE, RECORD_STATUS ?? 'A',
      START_DATE, END_DATE, CREATED_BY, CREATED_BY
    ])

    res.json({ POSI_ID: result.insertId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT แก้ไข
router.put('/:id', async (req, res) => {
  try {
    const {
      POSI_CODE, POSI_NAME_SHORT_TH, POSI_NAME_SHORT_EN,
      POSI_NAME_TH, POSI_NAME_EN, JOB_BRAND_CODE,
      EDU_QUALIFICATION, CORE_POSI_CODE, RECORD_STATUS,
      START_DATE, END_DATE, UPDATED_BY
    } = req.body

    await pool.query(`
      UPDATE mas_position SET
        POSI_CODE=?, POSI_NAME_SHORT_TH=?, POSI_NAME_SHORT_EN=?,
        POSI_NAME_TH=?, POSI_NAME_EN=?, JOB_BRAND_CODE=?,
        EDU_QUALIFICATION=?, CORE_POSI_CODE=?, RECORD_STATUS=?,
        START_DATE=?, END_DATE=?, UPDATED_BY=?
      WHERE POSI_ID=?
    `, [
      POSI_CODE, POSI_NAME_SHORT_TH, POSI_NAME_SHORT_EN,
      POSI_NAME_TH, POSI_NAME_EN, JOB_BRAND_CODE,
      EDU_QUALIFICATION, CORE_POSI_CODE, RECORD_STATUS,
      START_DATE, END_DATE, UPDATED_BY, req.params.id
    ])

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE (soft delete ด้วย DELETE_FLAG)
router.delete('/:id', async (req, res) => {
  try {
    const { UPDATED_BY } = req.body
    await pool.query(
      `UPDATE mas_position SET DELETE_FLAG='D', UPDATED_BY=? WHERE POSI_ID=?`,
      [UPDATED_BY ?? 'system', req.params.id]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
