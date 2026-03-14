import { create } from "zustand";
import { SidebarNode, SidebarTree } from "@/types/sidebar-types";

const appendChildNode = (
  n: SidebarNode,
  parentId: string,
  child: SidebarNode,
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
    parent: SidebarNode | null,
  ) => void,
  _depth = 0,
  _parent: SidebarNode | null = null,
): void => {
  for (const n of tree) {
    visitor(n, _depth, _parent);
    if (n.children?.length) walk(n.children, visitor, _depth + 1, n);
  }
};

const findRouteRecursive = (
  tree: SidebarTree,
  id: string,
  path: string[] = [],
): string[] | null => {
  for (const node of tree) {
    const nextPath = [...path, node.title];

    if (node.id === id) {
      return nextPath;
    }

    if (node.children?.length) {
      const found = findRouteRecursive(node.children, id, nextPath);
      if (found) return found;
    }
  }

  return null;
};

const returnItemsFromRouteRecursive = (
  tree: SidebarTree,
  id: string,
  path: SidebarNode [] = [],
): SidebarNode[] | null => {
  for (const node of tree) {
    const nextPath = [...path, node];

    if (node.id === id) {
      return nextPath;
    }

    if (node.children?.length) {
      const found = returnItemsFromRouteRecursive(node.children, id, nextPath);
      if (found) return found;
    }
  }

  return null;
};


interface NotesState {
  tree: SidebarTree;

  sidebarOpen: boolean;

  selectedNoteId: string | null;

  reloadToken: number;

  findById: (id: string) => SidebarNode | undefined;
  findByTitle: (title: string) => SidebarNode | undefined;
  flatten: () => SidebarNode[];

  setTree: (tree: SidebarTree) => void;
  setSidebarOpen: (open: boolean) => void;
  bumpReloadToken: () => void;

  addLeaf: (title: string, parentId?: string | null) => SidebarNode;

  addBranch: (
    title: string,
    children?: SidebarNode[],
    parentId?: string | null,
  ) => SidebarNode;

  appendChild: (child: SidebarNode, parentId?: string | null) => void;

  removeById: (id: string) => void;

  renameNode: (id: string, newTitle: string) => void;

  moveNode: (nodeId: string, newParentId: string | null) => void;

  selectParent: (item: SidebarNode) => SidebarNode | undefined;

  isDescendantOrSelf: (nodeId: string, targetId: string) => boolean;

  setSelectedNoteId: (id: string | null) => void;

  getRoute: (id: string) => string | null;

  itemsFromRouteRecursive: () => SidebarNode[] | [] | null;
}

const makeLeaf = (title: string, id?: string): SidebarNode => ({
  id: id ?? crypto.randomUUID(),
  title,
});

const makeBranch = (
  title: string,
  children: SidebarNode[],
  id?: string,
): SidebarNode => ({
  id: id ?? crypto.randomUUID(),
  title,
  children,
});

const removeById = (tree: SidebarTree, id: string): SidebarTree =>
  tree
    .filter((n) => n.id !== id)
    .map((n) =>
      n.children ? { ...n, children: removeById(n.children, id) } : n,
    );

const renameById = (
  tree: SidebarTree,
  id: string,
  newTitle: string,
): SidebarTree =>
  tree.map((n) => {
    if (n.id === id) return { ...n, title: newTitle };
    if (n.children?.length)
      return { ...n, children: renameById(n.children, id, newTitle) };
    return n;
  });

export const useNotesStore = create<NotesState>((set, get) => ({
  tree: [],
  sidebarOpen: true,
  selectedNoteId: null,
  reloadToken: 0,

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
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  bumpReloadToken: () => set((state) => ({ reloadToken: state.reloadToken + 1 })),
  selectParent: (item: SidebarNode) => {
    let parentId: string | null = null;
    walk(get().tree, (n, _, parent) => {
      if (n.id === item.id && parent) parentId = parent.id;
    });
    return parentId ? get().findById(parentId) : item;
  },

  addLeaf: (title, parentId = null) => {
    const leaf = makeLeaf(title);
    set((state) => ({
      tree: parentId
        ? state.tree.map((n) => appendChildNode(n, parentId, leaf))
        : [...state.tree, leaf],
    }));
    return leaf;
  },

  addBranch: (title, children = [], parentId = null) => {
    const branch = makeBranch(title, children);
    set((state) => ({
      tree: parentId
        ? state.tree.map((n) => appendChildNode(n, parentId, branch))
        : [...state.tree, branch],
    }));
    return branch;
  },

  appendChild: (child, parentId = null) => {
    set((state) => ({
      tree: parentId
        ? state.tree.map((n) => appendChildNode(n, parentId, child))
        : [...state.tree, child],
    }));
  },

  isDescendantOrSelf: (nodeId, targetId) => {
    const node = get().findById(nodeId);
    if (!node) return false;

    let found = false;
    walk([node], (n) => {
      if (n.id === targetId) found = true;
    });
    return found;
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

  setSelectedNoteId: (id) => {
    set({ selectedNoteId: id })
  },

  getRoute: (id: string) => {
    const path = findRouteRecursive(get().tree, id);
    return path ? path.join("/") : null;
  },

  itemsFromRouteRecursive: () => {
    const current = get().selectedNoteId;
    return current ? returnItemsFromRouteRecursive(get().tree, current) ?? [] : [];
  },
}));
