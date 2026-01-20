"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, UserPlus } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  assignedTo: z.string({
    required_error: "Please select a staff member.",
  }),
  dueDate: z.date({
    required_error: "A due date is required.",
  }),
  priority: z.enum(["Urgent", "High", "Medium", "Low"], {
    required_error: "Please select a priority level.",
  }),
})

// Mock staff data for selection - in a real app this would come from an API/Context
const staffMembers = ["Prof. Rajesh Patil", "Dr. Sunita Deshmukh", "Mr. Amit Kulkarni", "Prof. Vinod More"]

export function AssignTaskForm() {
  const [open, setOpen] = useState(false)
  const [staffOptions, setStaffOptions] = useState<any[]>([])
  const [fetchingStaff, setFetchingStaff] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: session } = useSession()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
    },
  })

  useEffect(() => {
    // Load staff when dialog opens
    if (!open) return

    let mounted = true
    async function loadStaff() {
      setFetchingStaff(true)
      setErrorMessage(null)
      try {
        const res = await fetch('/api/staff')
        if (!res.ok) {
          if (res.status === 401) throw new Error('Unauthorized. Please login.')
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.message || 'Failed to fetch staff')
        }
        const data = await res.json()
        if (!mounted) return
        setStaffOptions(data.staff || [])
      } catch (err: any) {
        console.error('Failed to load staff', err)
        setErrorMessage(err.message || 'Failed to load staff')
      } finally {
        if (mounted) setFetchingStaff(false)
      }
    }

    loadStaff()

    return () => {
      mounted = false
    }
  }, [open])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setAssigning(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!session || !session.user) {
      setErrorMessage('You must be signed in to assign tasks')
      setAssigning(false)
      return
    }

    const priorityMap: Record<string, string> = {
      Urgent: 'URGENT',
      High: 'HIGH',
      Medium: 'MEDIUM',
      Low: 'LOW',
    }

    const payload = {
      title: values.title,
      description: values.description,
      department: session.user.department,
      assignedTo: values.assignedTo,
      dueDate: values.dueDate.toISOString(),
      priority: priorityMap[values.priority] || 'MEDIUM',
    }

    try {
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(body?.message || 'Failed to assign task')
      }

      setSuccessMessage(body?.message || 'Task assigned successfully')
      form.reset()
      // close after short delay
      setTimeout(() => setOpen(false), 900)
    } catch (err: any) {
      console.error('Assign failed', err)
      setErrorMessage(err.message || 'Failed to assign task')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold shadow-md h-11 px-6 rounded-xl">
          <UserPlus className="mr-2 h-4 w-4" />
          Assign New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-primary text-primary-foreground">
          <DialogTitle className="text-xl font-bold">Assign New Academic Task</DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            Create and delegate a new task to department staff members.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. NAAC Criteria 4.2 Documentation" className="bg-muted/50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fetchingStaff ? (
                          <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading staff...
                          </div>
                        ) : staffOptions.length === 0 ? (
                          <div className="p-3 text-sm text-muted-foreground">No staff available</div>
                        ) : (
                          staffOptions.map((s: any) => (
                            <SelectItem key={s._id} value={s._id}>
                              {s.name} {s.empId ? `(${s.empId})` : ''}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-muted/50 border-input",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed instructions for the task..."
                      className="min-h-[100px] bg-muted/50 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Include specific requirements or reference links.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
            {successMessage && <div className="text-sm text-green-600">{successMessage}</div>}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                className="font-bold px-8 rounded-xl shadow-md hover:shadow-lg transition-all"
                disabled={assigning || fetchingStaff}
              >
                {assigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assigning...
                  </>
                ) : (
                  'Assign Task'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
