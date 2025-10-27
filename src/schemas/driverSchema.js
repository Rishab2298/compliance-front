import { z } from "zod"

export const driverSchema = z.object({
  id: z.string(), // UUID from database
  name: z.string(),
  employeeId: z.string().optional(), // contact field
  email: z.string().optional(),
  phone: z.string().optional(),
  complianceStatus: z.string(),
  documents: z.array(z.any()).optional(),
})
