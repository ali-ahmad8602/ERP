import apiClient from './client'

export function getDepartments() {
  return apiClient.get('/departments')
}

export function getBoardsForDept(deptId) {
  return apiClient.get('/boards', { params: { deptId } })
}

export function getCompanyBoards() {
  return apiClient.get('/boards', { params: { companyBoards: true } })
}

/**
 * Fetch ALL boards across every department the user has access to.
 * The backend requires either deptId or companyBoards=true, so we
 * first fetch departments, then fan out board requests.
 */
export async function getAllBoards() {
  const { departments } = await getDepartments()

  // Build a lookup map so we can enrich boards with department icon/color
  const deptMap = {}
  for (const d of departments) {
    deptMap[d._id] = d
  }

  const results = await Promise.allSettled([
    ...departments.map((d) => getBoardsForDept(d._id)),
    getCompanyBoards(),
  ])

  const allBoards = []
  const seen = new Set()
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const b of r.value.boards) {
        if (!seen.has(b._id)) {
          seen.add(b._id)
          // Attach full department object for normalizeBoard
          if (b.department && typeof b.department === 'string') {
            b.department = deptMap[b.department] || null
          }
          allBoards.push(b)
        }
      }
    }
  }
  // Fetch card counts in parallel for each board
  const countResults = await Promise.allSettled(
    allBoards.map((b) =>
      apiClient.get('/cards', { params: { boardId: b._id } }).then((d) => d.cards.length)
    )
  )
  allBoards.forEach((b, i) => {
    b._cardCount = countResults[i].status === 'fulfilled' ? countResults[i].value : 0
  })

  return { boards: allBoards, departments }
}

export function getBoardById(id) {
  return apiClient.get(`/boards/${id}`)
}

export function getCards(boardId) {
  return apiClient.get('/cards', { params: { boardId } })
}

export function moveCard(cardId, columnId, order) {
  return apiClient.patch(`/cards/${cardId}/move`, { columnId, order })
}

export function createBoard(data) {
  return apiClient.post('/boards', data)
}
