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

export const issueTypeSchema = z.enum([
  'bug',
  'feature',
  'task',
  'epic',
  'chore',
]);

export const issueDependencySchema = z.object({
  id: issueIdSchema,
  title: z.string(),
  status: issueStatusSchema,
  type: issueTypeSchema,
});

export const issueSchema = z.object({
  id: issueIdSchema,
  title: z.string().min(1),
  description: z.string().optional().default(''),
  status: issueStatusSchema,
  priority: issuePrioritySchema,
  type: issueTypeSchema,
  labels: z.array(labelIdSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  blocks: z.array(issueDependencySchema).optional().default([]),
  blockedBy: z.array(issueDependencySchema).optional().default([]),
});

export const createIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  status: issueStatusSchema.optional().default('backlog'),
  priority: issuePrioritySchema.optional().default('none'),
  type: issueTypeSchema.optional().default('task'),
  labels: z.array(labelIdSchema).optional().default([]),
});

export const updateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: issueStatusSchema.optional(),
  priority: issuePrioritySchema.optional(),
  type: issueTypeSchema.optional(),
  labels: z.array(labelIdSchema).optional(),
});

export type IssueDependencyDto = z.infer<typeof issueDependencySchema>;
export type IssueDto = z.infer<typeof issueSchema>;
export type CreateIssueDto = z.infer<typeof createIssueSchema>;
export type UpdateIssueDto = z.infer<typeof updateIssueSchema>;
