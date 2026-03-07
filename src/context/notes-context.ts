import { create } from "zustand";
import { SidebarNode, SidebarTree } from "@/types/sidebar-types";

const appendChildNode = (
  n: SidebarNode,
  parentId: string,
  child: SidebarNode
): SidebarNode => {
  if (n.id === parentId) {
    return { ...n, children: [...(n.children ?? []), child] };
  }
  if (n.children?.length) {
    return {
      ...n,
      children: n.children.map((c) => appendChildNode(c, parentId, child)),
    };
  }
  return n;
};

const walk = (
  tree: SidebarTree,
  visitor: (
    node: SidebarNode,
    depth: number,
    parent: SidebarNode | null
  ) => void,
  _depth = 0,
  _parent: SidebarNode | null = null
): void => {
  for (const n of tree) {
    visitor(n, _depth, _parent);
    if (n.children?.length) walk(n.children, visitor, _depth + 1, n);
  }
};

interface NotesState {
  tree: SidebarTree;

  selectedNodeId: string | null;

  editingNodeId: string | null;

  sidebarOpen: boolean;

  findById: (id: string) => SidebarNode | undefined;
  findByTitle: (title: string) => SidebarNode | undefined;
  flatten: () => SidebarNode[];

  setTree: (tree: SidebarTree) => void;
  setSelectedNodeId: (id: string | null) => void;
  setEditingNodeId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;

  addLeaf: (title: string, parentId?: string | null) => SidebarNode;

  addBranch: (
    title: string,
    children?: SidebarNode[],
    parentId?: string | null
  ) => SidebarNode;

  appendChild: (child: SidebarNode, parentId?: string | null) => void;

  removeById: (id: string) => void;

  renameNode: (id: string, newTitle: string) => void;

  moveNode: (nodeId: string, newParentId: string | null) => void;
}

const makeLeaf = (title: string, id?: string): SidebarNode => ({
  id: id ?? crypto.randomUUID(),
  title,
});

const makeBranch = (
  title: string,
  children: SidebarNode[],
  id?: string
): SidebarNode => ({
  id: id ?? crypto.randomUUID(),
  title,
  children,
});

const removeById = (tree: SidebarTree, id: string): SidebarTree =>
  tree
    .filter((n) => n.id !== id)
    .map((n) =>
      n.children ? { ...n, children: removeById(n.children, id) } : n
    );

const renameById = (
  tree: SidebarTree,
  id: string,
  newTitle: string
): SidebarTree =>
  tree.map((n) => {
    if (n.id === id) return { ...n, title: newTitle };
    if (n.children?.length)
      return { ...n, children: renameById(n.children, id, newTitle) };
    return n;
  });

export const useNotesStore = create<NotesState>((set, get) => ({
  tree: [],
  selectedNodeId: null,
  editingNodeId: null,
  sidebarOpen: true,

  findById: (id) => {
    let found: SidebarNode | undefined;
    walk(get().tree, (n) => {
      if (!found && n.id === id) found = n;
    });
    return found;
  },

  findByTitle: (title) => {
    let found: SidebarNode | undefined;
    walk(get().tree, (n) => {
      if (!found && n.title === title) found = n;
    });
    return found;
  },

  flatten: () => {
    const result: SidebarNode[] = [];
    walk(get().tree, (n) => result.push(n));
    return result;
  },

  setTree: (tree) => set({ tree }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setEditingNodeId: (id) => set({ editingNodeId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addLeaf: (title, parentId = null) => {
    const leaf = makeLeaf(title);
    const { tree } = get();
    set({
      tree: parentId
        ? tree.map((n) => appendChildNode(n, parentId, leaf))
        : [...tree, leaf],
    });
    return leaf;
  },

  addBranch: (title, children = [], parentId = null) => {
    const branch = makeBranch(title, children);
    const { tree } = get();
    set({
      tree: parentId
        ? tree.map((n) => appendChildNode(n, parentId, branch))
        : [...tree, branch],
    });
    return branch;
  },

  appendChild: (child, parentId = null) => {
    const { tree } = get();
    set({
      tree: parentId
        ? tree.map((n) => appendChildNode(n, parentId, child))
        : [...tree, child],
    });
  },

  removeById: (id) => {
    set((state) => ({ tree: removeById(state.tree, id) }));
  },

  renameNode: (id, newTitle) => {
    set((state) => ({ tree: renameById(state.tree, id, newTitle) }));
  },

  moveNode: (nodeId, newParentId) => {
    const node = get().findById(nodeId);
    if (!node) return;

    const pruned = removeById(get().tree, nodeId);

    const reinserted = newParentId
      ? pruned.map((n) => appendChildNode(n, newParentId, node))
      : [...pruned, node];

    set({ tree: reinserted });
  },
}));