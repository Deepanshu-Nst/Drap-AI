type JobStatus = 'starting' | 'processing' | 'succeeded' | 'failed';

interface Job {
  id: string;
  status: JobStatus;
  output?: string;
  error?: any;
}

const globalAny: any = global;
if (!globalAny.__jobs) {
  globalAny.__jobs = new Map<string, Job>();
}
const jobs = globalAny.__jobs as Map<string, Job>;

export function createJob(id: string) {
  jobs.set(id, { id, status: 'starting' });
}

export function updateJob(id: string, updates: Partial<Job>) {
  const job = jobs.get(id);
  if (job) {
    jobs.set(id, { ...job, ...updates });
  }
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}
