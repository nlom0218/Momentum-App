import { $ } from './libs/dom.js';
import {
  paintCompletedTodo,
  paintTodo,
  paintTodos,
  paintCompletedTodos,
  paintTodoDetail,
  updateTodolist,
} from './libs/paint.js';

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let completedTodos = JSON.parse(localStorage.getItem('completedTodos')) || [];

const $todoInput = $('#todo-form input');

function saveTodos(newTodo) {
  todos.push(newTodo);
  localStorage.setItem('todos', JSON.stringify(todos));
}

function handleSubmitTodo(event) {
  event.preventDefault();
  const newTodo = $todoInput.value;
  const id = String(Date.now());
  $todoInput.value = '';
  paintTodo({ todo: newTodo, id });
  saveTodos({ todo: newTodo, id, content: '' });
}

function handleClickCompleted({ target }) {
  if (!target.matches('#todo-list .complete-btn')) return;
  const todoId = target.parentElement.id;
  const todoState = target.parentElement.parentElement.className;
  const selectedTodos = todoState === 'progress-todos' ? todos : completedTodos;

  const todo = selectedTodos.filter(({ id }) => id === todoId)[0];

  if (todoState === 'progress-todos') {
    paintCompletedTodo(todo);
  } else {
    paintTodo(todo);
  }
  target.parentElement.remove(todoId);
  toggleTodoInLocalStorage(todoState, todo);
}

function toggleTodoInLocalStorage(todoState, todo) {
  const deleteKey = todoState === 'progress-todos' ? 'todos' : 'completedTodos';
  const addKey = todoState === 'progress-todos' ? 'completedTodos' : 'todos';

  const deletedTodos = JSON.parse(localStorage.getItem(deleteKey)).filter(
    ({ id }) => id !== todo.id
  );
  localStorage.setItem(deleteKey, JSON.stringify(deletedTodos));

  const addTodos = JSON.parse(localStorage.getItem(addKey)) || [];
  localStorage.setItem(addKey, JSON.stringify([...addTodos, todo]));

  if (todoState === 'progress-todos') {
    todos = deletedTodos;
    completedTodos = [...addTodos, todo];
  } else {
    completedTodos = deletedTodos;
    todos = [...addTodos, todo];
  }
}

function handleClickTodo({ target }) {
  if (!target.matches('#todo-list .todo-item')) return;

  const {
    parentElement: { id: todoId },
  } = target;

  const prevTodo = JSON.parse(localStorage.getItem('todoDetail'));
  const prevTodoId = prevTodo ? prevTodo.id : null;

  rePaintTodoDetail(todoId);
  showTodoDetail(todoId, prevTodoId);
}

function rePaintTodoDetail(todoId) {
  const todoDetail = [...todos, ...completedTodos].filter(
    ({ id }) => id === todoId
  )[0];

  localStorage.setItem('todoDetail', JSON.stringify(todoDetail));
  paintTodoDetail(todoDetail);
}

function showTodoDetail(todoId, prevTodoId) {
  if (prevTodoId)
    document.getElementById(prevTodoId).classList.remove('seleted');
  document.getElementById(todoId).classList.add('seleted');
  $('#todo-detail-info').classList.add('hidden');
  $('#todo-detail').classList.remove('hidden');
}

function handleClickDelete() {
  const { id: todoId } = JSON.parse(localStorage.getItem('todoDetail'));

  todos = todos.filter(({ id }) => id !== todoId);
  completedTodos = completedTodos.filter(({ id }) => id !== todoId);

  $('#todo-detail-info').classList.remove('hidden');
  $('#todo-detail').classList.add('hidden');

  localStorage.removeItem('todoDetail');
  updateTodos();
  rePaintTodos();
}

function rePaintTodos() {
  $('.progress-todos').innerHTML = '<div class="todo-state">🧑‍💻 진행 중</div>';
  $('.complete-todos').innerHTML = '<div class="todo-state">🎯 완료</div>';
  paintTodos(todos);
  paintCompletedTodos(completedTodos);
}

function updateTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
  localStorage.setItem('completedTodos', JSON.stringify(completedTodos));
}

function editTodo(event) {
  event.preventDefault();

  const { id: todoId } = JSON.parse(localStorage.getItem('todoDetail'));

  const newTodo = event.target[0].value;
  const newContent = event.target[1].value;

  todos = todos.map((todo) => {
    if (todo.id !== todoId) return todo;
    return { id: todoId, todo: newTodo, content: newContent };
  });
  completedTodos = completedTodos.map((todo) => {
    if (todo.id !== todoId) return todo;
    return { id: todoId, todo: newTodo, content: newContent };
  });

  updateTodolist(todoId, newTodo);
  updateTodos();
  rePaintTodoDetail(todoId);

  window.alert('할일이 수정되었습니다.🌳');
}

$('#todo-form').addEventListener('submit', handleSubmitTodo);
$('#todo-list').addEventListener('click', handleClickCompleted);
$('#todo-list').addEventListener('click', handleClickTodo);
$('.todo-detail-form-button').addEventListener('click', handleClickDelete);
$('#todo-detail-form').addEventListener('submit', editTodo);
