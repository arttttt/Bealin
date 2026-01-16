import { z } from 'zod';
import { labelIdSchema } from './label.js';

export const issueIdSchema = z.string().min(1);

export const issueStatusSchema = z.enum([
  'backlog',
  'todo',
  'in_progress',
  'done',
  'canceled',
]);

export const issuePrioritySchema = z.enum([
  'none',
  'low',
  'medium',
  'high',
  'urgent',
]);

export const issueSchema = z.object({
  id: issueIdSchema,
  title: z.string().min(1),
  description: z.string().optional().default(''),
  status: issueStatusSchema,
  priority: issuePrioritySchema,
  labels: z.array(labelIdSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  status: issueStatusSchema.optional().default('backlog'),
  priority: issuePrioritySchema.optional().default('none'),
  labels: z.array(labelIdSchema).optional().default([]),
});

export const updateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: issueStatusSchema.optional(),
  priority: issuePrioritySchema.optional(),
  labels: z.array(labelIdSchema).optional(),
});

export type IssueDto = z.infer<typeof issueSchema>;
export type CreateIssueDto = z.infer<typeof createIssueSchema>;
export type UpdateIssueDto = z.infer<typeof updateIssueSchema>;
