export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  created_at?: string;
  meeting_id?: string | null;
  description: string;
  owner: string;
  deadline: string;
  status: TaskStatus;
}

export interface Meeting {
  id: string;
  created_at?: string;
  title: string;
  raw_notes: string;
}

export interface StagedTask {
  id: string;
  description: string;
  owner: string;
  deadline: string;
  status: TaskStatus;
}

