const STORAGE_KEY = "todos";
export interface TODO_TYPE {
  id: number;
  name: string;
  completed: boolean;
  deadline: string | null;
  createdById: number;
  createdByUsername: string;
}

const loadTodos = (): TODO_TYPE[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data) as TODO_TYPE[];
  }
  localStorage.setItem(STORAGE_KEY, "[]");
  return [];
};

const filterTodosByUser = (todos: TODO_TYPE[], userId?: number | null) => {
  if (!userId) return [];
  return todos.filter((todo) => todo.createdById === userId);
};

export const todoService = {
  getTodos: async (userId?: number | null) => {
    const todos = loadTodos();
    return filterTodosByUser(todos, userId);
  },

  addTodo: async (todo: TODO_TYPE, userId?: number | null) => {
    const todos = loadTodos();
    const newTodos = [...todos, todo];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
    return todo;
  },

  toggleTodo: async (id: number, userId?: number | null) => {
    const todos = loadTodos();
    const newTodos = todos.map((t: TODO_TYPE) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
    return filterTodosByUser(newTodos, userId);
  },

  updateTodo: async (updatedTodo: TODO_TYPE, userId?: number | null) => {
    const todos = loadTodos();
    const newTodos = todos.map((t: TODO_TYPE) =>
      t.id === updatedTodo.id ? updatedTodo : t,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
    return filterTodosByUser(newTodos, userId);
  },

  deleteTodo: async (id: number, userId?: number | null) => {
    const todos = loadTodos();
    const newTodos = todos.filter((t: TODO_TYPE) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
    return filterTodosByUser(newTodos, userId);
  },
};
