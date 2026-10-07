export interface TreeNode {
  /** Different for every node in the tree. */
  id: string
  label: string
  /** Nodes inside this one. An empty array still counts as a folder; leave it out for a leaf. */
  children?: TreeNode[]
  disabled?: boolean
}
