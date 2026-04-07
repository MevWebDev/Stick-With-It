const STORAGE_KEY = "todos";
export interface TODO_TYPE {
  id: number;
  name: string;
  completed: boolean;
  deadline: string | null;
}

export const todoService = {
  getTodos: async () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    } else {
      localStorage.setItem(STORAGE_KEY, "[]");
      return [];
    }
  },

  addTodo: async (todo: TODO_TYPE) => {
    const todos = await todoService.getTodos();
    const newTodos = [...todos, todo];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
    return todo;
  },

  toggleTodo: async (id: number) => {
    const todos = await todoService.getTodos();
    const newTodos = todos.map((t: TODO_TYPE) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
    return newTodos;
  },

  updateTodo: async (updatedTodo: TODO_TYPE) => {
    const todos = await todoService.getTodos();
    const newTodos = todos.map((t: TODO_TYPE) =>
      t.id === updatedTodo.id ? updatedTodo : t,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
    return newTodos;
  },

  deleteTodo: async (id: number) => {
    const todos = await todoService.getTodos();
    const newTodos = todos.filter((t: TODO_TYPE) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
    return newTodos;
  },
};
