import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveExportRequest } from './exportRange.js'

test('exports all transactions when no date range is selected', () => {
  const request = resolveExportRequest({ mode: 'range', startDate: '', endDate: '' })

  assert.equal(request.mode, 'all')
  assert.equal(request.startDate, null)
  assert.equal(request.endDate, null)
  assert.equal(request.filename, 'chi-tieu-tat-ca')
})

test('builds an inclusive local date range for export', () => {
  const request = resolveExportRequest({
    mode: 'range',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
  })

  assert.equal(request.mode, 'range')
  assert.equal(request.startDate.getFullYear(), 2026)
  assert.equal(request.startDate.getMonth(), 5)
  assert.equal(request.startDate.getDate(), 1)
  assert.equal(request.startDate.getHours(), 0)
  assert.equal(request.startDate.getMinutes(), 0)
  assert.equal(request.endDate.getFullYear(), 2026)
  assert.equal(request.endDate.getMonth(), 5)
  assert.equal(request.endDate.getDate(), 14)
  assert.equal(request.endDate.getHours(), 23)
  assert.equal(request.endDate.getMinutes(), 59)
  assert.equal(request.endDate.getSeconds(), 59)
  assert.equal(request.endDate.getMilliseconds(), 999)
  assert.equal(request.filename, 'chi-tieu-2026-06-01-den-2026-06-14')
})

test('rejects incomplete export date ranges', () => {
  assert.throws(
    () => resolveExportRequest({ mode: 'range', startDate: '2026-06-01', endDate: '' }),
    /Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc/
  )
})

test('rejects export ranges where the start date is after the end date', () => {
  assert.throws(
    () => resolveExportRequest({ mode: 'range', startDate: '2026-06-15', endDate: '2026-06-14' }),
    /Ngày bắt đầu không được sau ngày kết thúc/
  )
})
