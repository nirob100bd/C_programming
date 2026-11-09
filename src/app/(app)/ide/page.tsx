"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";
import { useEffect, useMemo, useRef, useState } from "react";
import { Braces, FileCode2, FilePlus2, FolderPlus, Play, Save, Trash2, X } from "lucide-react";
import { apiFetch, fetcher } from "@/lib/http";
import { EmptyState } from "@/components/EmptyState";

const CodeEditor = dynamic(
  () => import("@/components/CodeEditor").then((module) => module.CodeEditor),
  { ssr: false }
);

type FileEntry = { name: string; content: string };
type Project = { id: string; name: string; description: string; files: unknown; activeFile: string; updatedAt: string };
type RunResult = { verdict?: string; stdout?: string; stderr?: string; compile?: string; error?: string; timeMs?: number | null; memoryKb?: number | null };

function validFiles(value: unknown): FileEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((file): file is FileEntry => (
    typeof file === "object" && file !== null &&
    "name" in file && typeof file.name === "string" &&
    "content" in file && typeof file.content === "string"
  ));
}

export default function IdePage() {
  const projectsQuery = useSWR<Project[]>("/api/projects", fetcher);
  const [activeId, setActiveId] = useState<string | null>(null);
  const projectQuery = useSWR<Project>(activeId ? `/api/projects/${activeId}` : null, fetcher);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [activeFile, setActiveFile] = useState("main.c");
  const [newProjectName, setNewProjectName] = useState("");
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const hydratedProject = useRef<string | null>(null);

  useEffect(() => {
    if (activeId || !projectsQuery.data?.length) return;
    const requested = new URLSearchParams(window.location.search).get("project");
    const project = projectsQuery.data.find((item) => item.id === requested) ?? projectsQuery.data[0];
    setActiveId(project.id);
  }, [activeId, projectsQuery.data]);

  useEffect(() => {
    const project = projectQuery.data;
    if (!project || hydratedProject.current === project.id) return;
    const nextFiles = validFiles(project.files);
    setFiles(nextFiles);
    setActiveFile(nextFiles.some((file) => file.name === project.activeFile) ? project.activeFile : nextFiles[0]?.name ?? "main.c");
    hydratedProject.current = project.id;
    setSaveState("saved");
  }, [projectQuery.data]);

  useEffect(() => {
    if (!activeId || hydratedProject.current !== activeId || files.length === 0) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      apiFetch(`/api/projects/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, activeFile })
      }).then(() => setSaveState("saved")).catch(() => setSaveState("error"));
    }, 800);
    return () => window.clearTimeout(timer);
  }, [activeFile, activeId, files]);

  const active = useMemo(() => files.find((file) => file.name === activeFile), [activeFile, files]);

  async function createProject(event: React.FormEvent) {
    event.preventDefault();
    if (!newProjectName.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const project = await apiFetch<Project>("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() })
      });
      setNewProjectName("");
      hydratedProject.current = null;
      await projectsQuery.mutate();
      setActiveId(project.id);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not create project.");
    } finally {
      setBusy(false);
    }
  }

  function addFile() {
    const name = window.prompt("File name (.c or .h)")?.trim();
    if (!name) return;
    if (!/^[a-zA-Z0-9_.-]+\.(c|h)$/.test(name)) {
      setMessage("Use a safe file name ending in .c or .h.");
      return;
    }
    if (files.some((file) => file.name === name)) {
      setMessage("That file already exists.");
      return;
    }
    if (files.length >= 20) {
      setMessage("A project can contain at most 20 files.");
      return;
    }
    setFiles((current) => [...current, { name, content: name.endsWith(".h") ? "#ifndef HEADER_H\n#define HEADER_H\n\n#endif\n" : "" }]);
    setActiveFile(name);
    setMessage(null);
  }

  function removeFile(name: string) {
    if (files.length === 1) {
      setMessage("A project must contain at least one file.");
      return;
    }
    if (!window.confirm(`Delete ${name}?`)) return;
    const next = files.filter((file) => file.name !== name);
    setFiles(next);
    if (activeFile === name) setActiveFile(next[0].name);
  }

  async function runActiveFile() {
    if (!active?.content.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const output = await apiFetch<RunResult>("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode: active.content, stdin, mode: "independent" })
      });
      setResult(output);
    } catch (caught) {
      setResult({ error: caught instanceof Error ? caught.message : "Run failed." });
    } finally {
      setBusy(false);
    }
  }

  async function deleteProject() {
    if (!activeId || !window.confirm("Delete this project and all of its files?")) return;
    await apiFetch(`/api/projects/${activeId}`, { method: "DELETE" });
    hydratedProject.current = null;
    setActiveId(null);
    setFiles([]);
    await projectsQuery.mutate();
  }

  return (
    <div className="mx-auto max-w-[1600px] p-3 sm:p-5">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <div className="mr-auto"><p className="eyebrow">Project workspace</p><h1 className="mt-1 text-2xl font-black">CForge IDE</h1></div>
        <form onSubmit={createProject} className="flex gap-2">
          <input aria-label="New project name" className="input w-48" placeholder="New project" maxLength={80} value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} />
          <button className="btn btn-primary" disabled={busy || !newProjectName.trim()}><FolderPlus size={16} /> Create</button>
        </form>
      </header>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {(projectsQuery.data ?? []).map((project) => (
          <button key={project.id} type="button" onClick={() => { hydratedProject.current = null; setActiveId(project.id); setResult(null); }} className={`btn shrink-0 ${project.id === activeId ? "btn-primary" : "btn-secondary"}`}>{project.name}</button>
        ))}
      </div>

      {message && <div className="mb-3 flex items-center justify-between rounded-xl bg-amber-500/10 px-3 py-2 text-sm font-semibold text-[rgb(var(--warning))]" role="alert">{message}<button type="button" onClick={() => setMessage(null)} aria-label="Dismiss"><X size={16} /></button></div>}

      {!activeId && !projectsQuery.isLoading ? (
        <EmptyState icon={Braces} title="Create your first workspace" description="Projects keep up to 20 C and header files with automatic persistence." action={<button type="button" className="btn btn-primary" onClick={() => document.querySelector<HTMLInputElement>("[aria-label='New project name']")?.focus()}>Name a project</button>} />
      ) : (
        <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] lg:grid-cols-[210px_minmax(0,1fr)_310px]">
          <aside className="border-b border-[rgb(var(--border))] p-3 lg:border-b-0 lg:border-r">
            <div className="mb-2 flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider">Files</span><button type="button" onClick={addFile} className="grid size-8 place-items-center rounded-lg hover:bg-[rgb(var(--card-strong))]" aria-label="Add file"><FilePlus2 size={16} /></button></div>
            <div className="flex gap-1 overflow-x-auto lg:block lg:space-y-1">
              {files.map((file) => (
                <div key={file.name} className={`group flex min-w-40 items-center rounded-lg ${file.name === activeFile ? "bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]" : "hover:bg-[rgb(var(--card-strong))]"}`}>
                  <button type="button" onClick={() => setActiveFile(file.name)} className="mono flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-xs font-bold"><FileCode2 size={14} className="shrink-0" /><span className="truncate">{file.name}</span></button>
                  <button type="button" onClick={() => removeFile(file.name)} className="mr-1 hidden p-1 text-[rgb(var(--danger))] group-hover:block" aria-label={`Delete ${file.name}`}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <div className={`mt-4 flex items-center gap-1.5 text-xs font-bold ${saveState === "error" ? "text-[rgb(var(--danger))]" : "muted"}`}><Save size={13} />{saveState === "saving" ? "Saving…" : saveState === "saved" ? "All changes saved" : saveState === "error" ? "Save failed" : ""}</div>
            <button type="button" onClick={deleteProject} className="btn btn-danger mt-6 w-full"><Trash2 size={15} /> Delete project</button>
          </aside>

          <section className="min-w-0 border-b border-[rgb(var(--border))] lg:border-b-0 lg:border-r">
            <div className="flex h-11 items-center border-b border-[rgb(var(--border))] px-4"><span className="mono text-xs font-bold">{active?.name ?? "No file"}</span></div>
            {active ? <CodeEditor value={active.content} onChange={(content) => setFiles((current) => current.map((file) => file.name === active.name ? { ...file, content } : file))} height="635px" /> : <div className="grid h-full place-items-center muted">Select a file.</div>}
          </section>

          <aside className="p-4">
            <h2 className="text-sm font-black">Run active translation unit</h2>
            <p className="muted mt-1 text-xs leading-5">Judge0 compiles the active .c file. Other project files remain persisted for organization.</p>
            <label htmlFor="ide-stdin" className="mt-4 block text-xs font-bold">Standard input</label>
            <textarea id="ide-stdin" className="input mono mt-1 resize-y text-xs" rows={4} value={stdin} onChange={(event) => setStdin(event.target.value)} />
            <button type="button" onClick={runActiveFile} disabled={busy || !active?.name.endsWith(".c") || !active.content.trim()} className="btn btn-primary mt-3 w-full"><Play size={16} fill="currentColor" /> {busy ? "Compiling…" : "Run with GCC"}</button>
            <div className="mt-4 border-t border-[rgb(var(--border))] pt-4" aria-live="polite">
              {!result && <p className="muted text-xs">Compiler output will appear here.</p>}
              {result?.error && <p className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-[rgb(var(--danger))]">{result.error}</p>}
              {result && !result.error && <div className="space-y-3 text-xs"><span className={`badge ${result.verdict === "Accepted" ? "text-[rgb(var(--success))]" : "text-[rgb(var(--danger))]"}`}>{result.verdict}</span>{result.stdout && <pre className="mono max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-3 text-slate-100">{result.stdout}</pre>}{result.compile && <pre className="mono max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-rose-950 p-3 text-rose-100">{result.compile}</pre>}{result.stderr && <pre className="mono max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-rose-950 p-3 text-rose-100">{result.stderr}</pre>}</div>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
