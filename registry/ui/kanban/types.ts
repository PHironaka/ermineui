export interface KanbanCard {
  /** Different for every card on the board. */
  id: string
  title: string
  /** Anything else you want to show through the #card slot. */
  [key: string]: unknown
}

export interface KanbanColumn {
  id: string
  title: string
  cards: KanbanCard[]
}
