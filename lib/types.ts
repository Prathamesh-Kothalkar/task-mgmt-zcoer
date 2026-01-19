export type TaskPriority = "Urgent" | "High" | "Medium" | "Low"
export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Overdue"

export interface Task {
  id: number
  title: string
  assignedTo: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  description?: string
}

export interface Staff {
  id: number
  name: string
  email: string
  empId: string
  type: string
  status: string
  designation: string
}
