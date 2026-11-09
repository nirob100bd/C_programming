"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowRight, Braces, Clock3, FileCode2, FolderOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

interface Project { id: string; name: string; description: string; files: unknown; activeFile: string; updatedAt: string; }

export default function ProjectsPage() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>("/api/projects", fetcher);
  return (
    <div className="container-page">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Persistent workspaces</p><h1 className="mt-2 text-4xl font-black tracking-tight">Projects</h1><p className="muted mt-3 max-w-2xl">Keep C and header files together, autosave every change, and compile the active translation unit with Judge0.</p></div><Link href="/ide" className="btn btn-primary"><Braces size={17} /> Open IDE</Link></section>
      <div className="mt-8">
        {isLoading && <LoadingState label="Opening projects" />}
        {error && <ErrorState message={error.message} retry={() => mutate()} />}
        {data?.length === 0 && <EmptyState icon={FolderOpen} title="No projects yet" description="Open the IDE, name a workspace, and CForge will create main.c for you." action={<Link href="/ide" className="btn btn-primary">Create in IDE</Link>} />}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data?.map((project) => { const fileCount = Array.isArray(project.files) ? project.files.length : 0; return <Link key={project.id} href={`/ide?project=${project.id}`} className="card group flex min-h-52 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))]/50"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]"><FolderOpen size={19} /></span><ArrowRight size={17} className="muted transition group-hover:translate-x-1 group-hover:text-[rgb(var(--accent))]" /></div><h2 className="mt-4 text-lg font-black group-hover:text-[rgb(var(--accent))]">{project.name}</h2><p className="muted mt-1 line-clamp-2 text-sm">{project.description || "C project workspace"}</p><div className="muted mt-auto flex flex-wrap gap-3 pt-5 text-xs"><span className="flex items-center gap-1"><FileCode2 size={13} /> {fileCount} file{fileCount === 1 ? "" : "s"}</span><span className="flex items-center gap-1"><Clock3 size={13} /> {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span></div></Link>; })}</div>
      </div>
    </div>
  );
}
