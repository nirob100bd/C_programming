const mockRequireUser = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: jest.requireActual("./helpers/mock-prisma").mockPrisma
}));
jest.mock("@/lib/auth", () => ({ requireUser: (...args: unknown[]) => mockRequireUser(...args) }));

import { GET as listNotes, POST as createNote } from "@/app/api/notes/route";
import { PATCH as updateNote, DELETE as deleteNote } from "@/app/api/notes/[id]/route";
import { GET as listBookmarks, POST as createBookmark, DELETE as deleteBookmark } from "@/app/api/bookmarks/route";
import { GET as listReference } from "@/app/api/reference/route";
import { GET as getReference } from "@/app/api/reference/[slug]/route";
import { GET as listProjects, POST as createProject } from "@/app/api/projects/route";
import { GET as getProject, PATCH as updateProject, DELETE as deleteProject } from "@/app/api/projects/[id]/route";
import { mockPrisma, resetPrismaMock } from "./helpers/mock-prisma";
import { request, responseJson } from "./helpers/requests";

describe("notes, bookmarks, reference, and project routes", () => {
  beforeEach(() => {
    resetPrismaMock();
    mockRequireUser.mockReset().mockResolvedValue("user-1");
  });

  it("lists and creates user-scoped notes", async () => {
    mockPrisma.note.findMany.mockResolvedValue([{ id: "note-1" }]);
    expect((await listNotes()).status).toBe(200);
    expect(mockPrisma.note.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "user-1" } }));

    mockPrisma.note.create.mockResolvedValue({ id: "note-2", title: "Pointers" });
    const response = await createNote(request("/api/notes", "POST", { title: "Pointers", body: "Address notes" }));
    expect(response.status).toBe(201);
    expect(mockPrisma.note.create).toHaveBeenCalledWith({
      data: { title: "Pointers", body: "Address notes", userId: "user-1" }
    });
  });

  it("updates and deletes only an owned note", async () => {
    mockPrisma.note.findFirst.mockResolvedValue({ id: "note-1", userId: "user-1" });
    mockPrisma.note.update.mockResolvedValue({ id: "note-1", title: "Updated" });
    const updated = await updateNote(request("/api/notes/note-1", "PATCH", { title: "Updated" }), { params: { id: "note-1" } });
    expect(updated.status).toBe(200);

    mockPrisma.note.findFirst.mockResolvedValue({ id: "note-1", userId: "user-1" });
    mockPrisma.note.delete.mockResolvedValue({ id: "note-1" });
    const deleted = await deleteNote(request("/api/notes/note-1", "DELETE"), { params: { id: "note-1" } });
    expect(await responseJson(deleted)).toEqual({ deleted: true });
    expect(mockPrisma.note.findFirst).toHaveBeenLastCalledWith({ where: { id: "note-1", userId: "user-1" } });
  });

  it("lists, upserts, and deletes user bookmarks", async () => {
    mockPrisma.bookmark.findMany.mockResolvedValue([]);
    expect((await listBookmarks()).status).toBe(200);

    mockPrisma.bookmark.upsert.mockResolvedValue({ id: "bookmark-1" });
    const created = await createBookmark(request("/api/bookmarks", "POST", { kind: "reference", refId: "malloc" }));
    expect(created.status).toBe(201);
    expect(mockPrisma.bookmark.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_kind_refId: { userId: "user-1", kind: "reference", refId: "malloc" } }
    }));

    mockPrisma.bookmark.deleteMany.mockResolvedValue({ count: 1 });
    const deleted = await deleteBookmark(request("/api/bookmarks", "DELETE", { kind: "reference", refId: "malloc" }));
    expect(await responseJson(deleted)).toEqual({ deleted: true });
  });

  it("searches reference entries and loads a detail", async () => {
    mockPrisma.referenceEntry.findMany.mockResolvedValue([{ slug: "malloc" }]);
    const list = await listReference(request("/api/reference?q=memory&category=stdlib"));
    expect(list.status).toBe(200);
    expect(mockPrisma.referenceEntry.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ category: "stdlib", OR: expect.any(Array) })
    }));

    mockPrisma.referenceEntry.findUnique.mockResolvedValue({ slug: "malloc", title: "malloc" });
    const detail = await getReference(request("/api/reference/malloc"), { params: { slug: "malloc" } });
    expect(detail.status).toBe(200);
  });

  it("lists and creates user projects with a real starter file", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);
    expect((await listProjects()).status).toBe(200);
    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "user-1" } }));

    mockPrisma.project.create.mockResolvedValue({ id: "project-1" });
    const response = await createProject(request("/api/projects", "POST", { name: "Sandbox" }));
    expect(response.status).toBe(201);
    const files = mockPrisma.project.create.mock.calls[0][0].data.files;
    expect(files[0]).toMatchObject({ name: "main.c" });
    expect(files[0].content).toContain("int main(void)");
  });

  it("reads, updates, and deletes only an owned project", async () => {
    const owned = {
      id: "project-1",
      userId: "user-1",
      files: [{ name: "main.c", content: "" }],
      activeFile: "main.c"
    };
    mockPrisma.project.findFirst.mockResolvedValue(owned);
    expect((await getProject(request("/api/projects/project-1"), { params: { id: "project-1" } })).status).toBe(200);

    mockPrisma.project.findFirst.mockResolvedValue(owned);
    mockPrisma.project.update.mockResolvedValue({ ...owned, name: "Renamed" });
    const patched = await updateProject(request("/api/projects/project-1", "PATCH", { name: "Renamed" }), { params: { id: "project-1" } });
    expect(patched.status).toBe(200);
    expect(mockPrisma.project.update).toHaveBeenCalledWith({ where: { id: "project-1" }, data: { name: "Renamed" } });

    mockPrisma.project.findFirst.mockResolvedValue(owned);
    mockPrisma.project.delete.mockResolvedValue(owned);
    const deleted = await deleteProject(request("/api/projects/project-1", "DELETE"), { params: { id: "project-1" } });
    expect(await responseJson(deleted)).toEqual({ deleted: true });
  });
});
